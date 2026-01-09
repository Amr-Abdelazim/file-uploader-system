import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import path from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function uploadFiles(fieldName) {
    const storage = multer.diskStorage({
        destination: (req, file, cp) => {
            cp(null, path.join(__dirname, '..', '..', 'tempUploads'));
        },
        filename: (req, file, cp) => {
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const ext = path.extname(file.originalname);
            const publicId = uuidv4();
            cp(null, publicId + ext);
        }
    });
    const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });
    return upload.array(fieldName);
}

export default { uploadFiles }