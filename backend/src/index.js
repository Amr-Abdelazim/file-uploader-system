import express from 'express';
import AuthRouter from './routes/AuthRouter.js';
import UploadRouter from './routes/UploadRouter.js';

import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import AuthMiddleware from './middlewares/AuthMiddleware.js';
import path from 'node:path';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/test', (req, res, next) => {
    res.sendFile(path.resolve('src', 'test.html'));
})

app.use('/api/', AuthRouter);
app.use('/api/', UploadRouter);

app.use((err, req, res, next) => {
    console.log(err);
    if (err.code === 'LIMIT_FILE_SIZE')
        err.statusCode = 413;
    res.status(err.statusCode || 500).json({ error: err.message });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server runing on port ${PORT}`);
})