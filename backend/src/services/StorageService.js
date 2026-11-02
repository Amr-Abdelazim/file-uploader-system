import CustomError from "../utils/CustomError.js";
import prisma from "../utils/prisma.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { once } from 'events';

function generatePath(fileId, chunkIndex) {
    return path.join(
        "Storage",
        "saved",
        "uploads",
        fileId,
        `${chunkIndex}.chunk`
    );
}

async function verifyChunkHash(filePath, hash) {
    if (!hash) return true; // No hash to verify

    const hashBuffer = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
        stream.on('error', (err) => reject(err));
        stream.on('data', (chunk) => hashBuffer.update(chunk));
        stream.on('end', () => {
            const computedHash = hashBuffer.digest('hex');
            resolve(computedHash === hash);
        });
    });
}

async function saveChunk(metaData) {
    let { fileId, chunkIndex, chunkHash, chunkSize, tempPath } = metaData;
    chunkSize = Number(chunkSize);


    // Validate inputs
    if (!fileId || typeof chunkIndex !== 'number' || !tempPath) {
        throw new CustomError("Invalid metadata: fileId, chunkIndex (number), and tempPath are required", 400);
    }
    const session = await prisma.uploadSession.findFirst({
        where: { fileId }
    });

    if (!session) {
        throw new CustomError("Upload session not found", 404);
    }

    if (session.status === "done") {
        return {
            message: "Upload already completed"
        };
    }

    if (session.status !== "uploading") {
        throw new CustomError(
            `Cannot upload chunk while session is ${session.status}`,
            409
        );
    }
    // Check if the temp file exists
    try {
        await fs.promises.access(tempPath, fs.constants.R_OK);
    } catch (err) {
        throw new CustomError(`Temp file not accessible: ${tempPath}`, 400);
    }

    let chunkFile = await prisma.chunkFile.findFirst({
        where: {
            fileId,
            index: chunkIndex
        }
    });

    if (chunkFile?.uploaded) {
        // Clean up the temp file if the chunk is already uploaded
        try {
            await fs.promises.unlink(tempPath);
        } catch (unlinkErr) {
            console.warn(`Failed to remove temp file ${tempPath}:`, unlinkErr);
        }
        throw new CustomError(`Chunk ${chunkIndex} already exists`, 409);
    }

    if (!chunkFile) {
        chunkFile = await prisma.chunkFile.create({
            data: {
                fileId,
                index: chunkIndex,
                size: chunkSize,
                path: generatePath(fileId, chunkIndex),
                ...(chunkHash && { hash: chunkHash })
            }
        });
    }

    const finalPath = chunkFile.path;

    // Ensure destination folder exists
    try {
        await fs.promises.mkdir(path.dirname(finalPath), { recursive: true });
    } catch (mkdirErr) {
        // Clean up temp file and throw error
        try {
            await fs.promises.unlink(tempPath);
        } catch (unlinkErr) {
            console.warn(`Failed to remove temp file ${tempPath}:`, unlinkErr);
        }
        throw new CustomError(`Failed to create destination directory: ${mkdirErr.message}`, 500);
    }

    // Verify hash if provided
    if (chunkHash) {
        const isValid = await verifyChunkHash(tempPath, chunkHash);
        if (!isValid) {
            // Clean up temp file on hash mismatch
            try {
                await fs.promises.unlink(tempPath);
            } catch (unlinkErr) {
                console.warn(`Failed to remove temp file ${tempPath} after hash mismatch:`, unlinkErr);
            }
            throw new CustomError(`Chunk ${chunkIndex} hash verification failed`, 400);
        }
    }

    try {
        // MOVE temp file → final location (atomic if same disk)
        await fs.promises.rename(tempPath, finalPath);
    } catch (renameErr) {
        // Clean up temp file if move fails
        try {
            await fs.promises.unlink(tempPath);
        } catch (unlinkErr) {
            console.warn(`Failed to remove temp file ${tempPath} after rename error:`, unlinkErr);
        }
        throw new CustomError(`Failed to save chunk file: ${renameErr.message}`, 500);
    }

    // Update chunk file record and increment uploadedChunks on the file
    try {
        await prisma.$transaction([
            prisma.chunkFile.update({
                where: { id: chunkFile.id },
                data: {
                    uploaded: true,
                    uploadedAt: new Date()
                }
            }),
            prisma.file.update({
                where: { id: fileId },
                data: { uploadedChunks: { increment: 1 } }
            })
        ]);
    } catch (dbErr) {
        // If DB update fails, we have an orphaned file on disk. We could try to clean it up,
        // but for now, we'll throw the error and note that manual cleanup might be needed.
        // Optionally, we could attempt to delete the finalPath file here.
        try {
            await fs.promises.unlink(finalPath);
        } catch (unlinkErr) {
            console.warn(`Failed to remove orphaned file ${finalPath} after DB error:`, unlinkErr);
        }
        throw new CustomError(`Database error: ${dbErr.message}`, 500);
    }

    return chunkFile;
}

async function mergeChunks(fileId) {

    const session = await prisma.uploadSession.findUnique({
        where: { fileId }
    });

    if (!session) {
        throw new CustomError("Upload session not found", 404);
    }

    if (session.status === "done") {
        return {
            message: "File already merged"
        };
    }

    if (session.status === "merging") {
        throw new CustomError(
            "Merge already in progress",
            409
        );
    }

    const file = await prisma.file.findUnique({
        where: { id: fileId }
    });

    if (!file) {
        throw new CustomError("File not found", 404);
    }

    const chunks = await prisma.chunkFile.findMany({
        where: {
            fileId,
            uploaded: true
        },
        orderBy: {
            index: "asc"
        }
    });

    if (chunks.length !== file.totalChunks) {
        throw new CustomError("Missing chunks", 400);
    }
    await prisma.uploadSession.update({
        where: { fileId },
        data: {
            status: "merging"
        }
    });
    const mergedDir = path.join("Storage", "merged");
    await fs.promises.mkdir(mergedDir, { recursive: true });

    const mergedFilePath = path.join(
        mergedDir,
        `${file.id}${path.extname(file.name)}`
    );

    const writeStream = fs.createWriteStream(mergedFilePath);

    try {
        for (const chunk of chunks) {
            const readStream = fs.createReadStream(chunk.path);

            for await (const data of readStream) {
                if (!writeStream.write(data)) {
                    await once(writeStream, "drain");

                }
            }
        }

        writeStream.end();
        await once(writeStream, "finish");

        await prisma.$transaction([
            prisma.file.update({
                where: { id: fileId },
                data: {
                    isComplete: true,
                    path: mergedFilePath
                }
            }),
            prisma.uploadSession.update({
                where: { fileId },
                data: {
                    status: "done"
                }
            })
        ]);
        return {
            mergedFilePath
        };
    } catch (err) {
        await fs.promises
            .unlink(mergedFilePath)
            .catch(() => { });
        await prisma.uploadSession.update({
            where: { fileId },
            data: {
                status: "uploading"
            }
        });
        throw new CustomError(
            `Merge failed: ${err.message}`,
            500
        );
    }
}

export default { saveChunk, mergeChunks }