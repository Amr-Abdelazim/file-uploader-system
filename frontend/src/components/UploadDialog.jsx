import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Typography,
    Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRef, useState } from 'react';
import UploadApi from '../api/UploadApi';
import { useAlert } from '../contexts/AlertContext.jsx';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export function UploadDialog({ open, onClose, folderId, onUploadComplete }) {
    const fileInputRef = useRef();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const { showAlert } = useAlert();

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setFileName(file.name);

        try {
            // 1. Create upload session
            const session = await UploadApi.createSession(
                folderId,
                file.name,
                file.size,
                file.type
            );

            if (!session.sessionId || !session.fileId) {
                throw new Error('Failed to create upload session');
            }

            const { sessionId, fileId } = session;
            const chunks = Math.ceil(file.size / CHUNK_SIZE);

            // 2. Upload chunks
            for (let i = 0; i < chunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);
                const chunkSize = end - start;

                const success = await UploadApi.uploadChunk(
                    sessionId,
                    fileId,
                    i,
                    chunk,
                    chunkSize
                );

                if (!success) {
                    throw new Error(`Failed to upload chunk ${i}`);
                }

                setProgress(Math.round(((i + 1) / chunks) * 100));
            }

            // 3. Finalize upload
            await UploadApi.finalizeUpload(sessionId, fileId);

            showAlert(`File ${file.name} uploaded successfully!`, 'success');
            onUploadComplete?.();
        } catch (err) {
            showAlert(err.message || 'Upload failed', 'error');
        } finally {
            setUploading(false);
            setProgress(0);
            setFileName('');
            fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Upload File</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={2}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />

                    {!uploading ? (
                        <Button
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            fullWidth
                            size="large"
                        >
                            Select File
                        </Button>
                    ) : (
                        <>
                            <Typography variant="body2" color="textSecondary">
                                Uploading: {fileName}
                            </Typography>
                            <LinearProgress variant="determinate" value={progress} />
                            <Typography variant="caption" align="center">
                                {progress}%
                            </Typography>
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={uploading}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
