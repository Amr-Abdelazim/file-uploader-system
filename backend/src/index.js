import 'dotenv/config';
import express from 'express';
import AuthRouter from './routes/AuthRouter.js';
import UploadRouter from './routes/UploadRouter.js';
import PreviewRouter from './routes/PreviewRouter.js';
import FoldersRouter from './routes/FoldersRouter.js';
import FilesRouter from './routes/FilesRouter.js';
import PermissionRouter from './routes/PermissionRouter.js';


import cookieParser from 'cookie-parser';
import AuthMiddleware from './middlewares/AuthMiddleware.js';
import path from 'node:path';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware: make res.json BigInt-safe (Prisma may return BigInt)
app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
        try {
            const body = JSON.stringify(data, (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            );
            res.set('Content-Type', 'application/json');
            return res.send(body);
        } catch (err) {
            return originalJson(data);
        }
    };
    next();
});

app.get('/api/test', (req, res, next) => {
    res.sendFile(path.resolve('src', 'test.html'));
})

app.use('/api/', AuthRouter);
app.use('/api/', UploadRouter);
app.use('/api/', PreviewRouter);
app.use('/api/', FoldersRouter);
app.use('/api/', FilesRouter);
app.use('/api/', PermissionRouter);

app.use((err, req, res, next) => {
    console.log(err);
    if (err.code === 'LIMIT_FILE_SIZE')
        err.statusCode = 413;
    res.status(err.statusCode || 500).json({ error: err.message });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`server runing on port ${PORT}`);
})