import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack
} from '@mui/material';
import { useState } from 'react';

export function CreateFolderDialog({ open, onClose, onCreate, loading }) {
    const [name, setName] = useState('');

    const handleCreate = () => {
        if (name.trim()) {
            onCreate(name);
            setName('');
        }
    };

    const handleClose = () => {
        setName('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <TextField
                    autoFocus
                    fullWidth
                    label="Folder Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleCreate();
                    }}
                    disabled={loading}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    disabled={!name.trim() || loading}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
