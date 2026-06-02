import Busboy from "busboy";
import fs from "fs";
import path from "path";

function generatePath(fileId, chunkIndex) {
    return path.join(
        "Storage",
        "temp",
        "uploads",
        fileId,
        `${chunkIndex}.chunk`
    );
}
function multipartParser(req, res, next) {
    const busboy = Busboy({ headers: req.headers });

    req.body = {};

    busboy.on("field", (name, value) => {
        req.body[name] = value;
    });

    busboy.on("file", (name, file) => {

        const fileId = req.body.fileId;
        const chunkIndex = req.body.chunkIndex;

        const filePath = generatePath(fileId, chunkIndex);

        // ensure folder exists
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        const writeStream = fs.createWriteStream(filePath);

        file.pipe(writeStream);

        req.body["tempPath"] = filePath;

        writeStream.on("error", (err) => {
            file.resume();
            next(err);
        });
    });

    busboy.on("finish", () => {
        console.log("finish");
        next();
    });

    req.pipe(busboy);
}



export default { multipartParser };