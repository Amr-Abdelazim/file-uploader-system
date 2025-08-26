import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import CustomError from '../utils/CustomError.js';
import fileService from '../services/fileService.js';

cloudinary.config();


async function upload(req, res, next) {

    req.body.paths = Array.isArray(req.body.paths) ? req.body.paths : [req.body.paths];
    if (!(req.body.paths.every(item => typeof item === "string")) || req.body.paths.length !== req.files.length)
        return next(new CustomError("Invalid paths format", 400));
    console.log("hi");
    const uploadResults = [];
    for (const file of req.files) {
        if (file.size === 0) {
            continue;
        }
        const result = cloudinary.uploader.upload(file.path, {
            public_id: file.filename.split('.')[0],
            resource_type: 'raw',
            type: "authenticated",
            access_mode: "authenticated",
            sign_url: true,
        }).then(result => {
            fs.unlink(file.path, () => { });
            result.originalname = file.originalname;
            result.mimetype = file.mimetype;

        });
        uploadResults.push(result);

    }

    const results = await Promise.all(uploadResults);
    console.log(results);
    const filesData = results.map(result => {
        return {
            name: result.originalname,
            url: result.secure_url,
            resourceType: result.resource_type,
            mimetype: result.mimetype,
            size: result.bytes,
            ownerId: req.user.userId
        }
    });
    await fileService.createFiles(req.params.folderId, filesData, req.body.paths);

    res.json("done");


}
/*
[
  {
    fieldname: 'files',
    originalname: 'test.png',
    encoding: '7bit',
    mimetype: 'image/png',
    destination: 'D:\\vscode\\nodejs\\express\\file-uploader-app\\backend\\tempUploads',
    filename: 'a429c216-9f42-47be-b99f-f01bf53127e9.png',
    path: 'D:\\vscode\\nodejs\\express\\file-uploader-app\\backend\\tempUploads\\a429c216-9f42-47be-b99f-f01bf53127e9.png',
    size: 98622
  }
]
[ 'test.png' ]
[ 'test.png' ]
[
  {
    asset_id: 'fd44a3f3f4e4e602262c6400f567d239',
    public_id: 'a429c216-9f42-47be-b99f-f01bf53127e9.png',
    version: 1756214270,
    version_id: 'a189c6f5c3bac3979cd95e8ff31676cc',
    signature: 'ccf8ce99c00fe70adfbd4b8d6c72295340b1f4bf',
    resource_type: 'raw',
    created_at: '2025-08-26T13:17:50Z',
    tags: [],
    bytes: 98622,
    type: 'upload',
    etag: '221350c0846d42f4200c7e743b51b708',
    placeholder: false,
    url: 'http://res.cloudinary.com/dd5rxacvu/raw/upload/v1756214270/a429c216-9f42-47be-b99f-f01bf53127e9.png',
    secure_url: 'https://res.cloudinary.com/dd5rxacvu/raw/upload/v1756214270/a429c216-9f42-47be-b99f-f01bf53127e9.png',
    asset_folder: '',
    display_name: 'a429c216-9f42-47be-b99f-f01bf53127e9.png',
    original_filename: 'a429c216-9f42-47be-b99f-f01bf53127e9',
    api_key: '897356236488558',
    originalname: 'test.png'
  }
]


*/
export default { upload };