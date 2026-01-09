import fileService from '../services/fileService.js';
import { v2 as cloudinary } from 'cloudinary';
import CustomError from "../utils/CustomError.js";
import { pipeline } from 'stream';
import { promisify } from 'util';
const streamPipeline = promisify(pipeline);
cloudinary.config();

async function downloadFile(req, res, next) {

    const fileMetaData = await fileService.getFile(req.params.fileId);
    const url = cloudinary.url(fileMetaData.public_id, {
        resource_type: fileMetaData.resourceType,
        type: 'authenticated',
        sign_url: true
    });
    console.log(url);
    const response = await fetch(url);
    if (!response.ok) throw new CustomError("Faild to fetch the file!!", 500);
    res.setHeader('Content-Disposition', `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(fileMetaData.name)}`);
    res.setHeader('Content-Type', response.headers.get('content-type'));
    await streamPipeline(response.body, res);

}

export default { downloadFile }