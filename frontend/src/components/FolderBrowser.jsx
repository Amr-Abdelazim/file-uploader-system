import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MenuItem,
    Menu
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import FileApi from '../api/FileApi';
import FolderApi from '../api/FolderApi';
import { useAlert } from '../contexts/AlertContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function FileRow({ file, onDelete, onRename, onShare, onDownload }) {
    const [anchorEl, setAnchorEl] = useState(null);

    return (
        <>
            <TableRow hover>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InsertDriveFileIcon fontSize="small" />
                        {file.name}
                    </Box>
                </TableCell>
                <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                    <IconButton
                        size="small"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </TableCell>
            </TableRow>
            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        onDownload(file.id);
                        setAnchorEl(null);
                    }}
                >
                    <DownloadIcon sx={{ mr: 1 }} fontSize="small" /> Download
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        onShare(file.id, 'file');
                        setAnchorEl(null);
                    }}
                >
                    <ShareIcon sx={{ mr: 1 }} fontSize="small" /> Share
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        onRename(file.id, file.name);
                        setAnchorEl(null);
                    }}
                >
                    <EditIcon sx={{ mr: 1 }} fontSize="small" /> Rename
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        onDelete(file.id);
                        setAnchorEl(null);
                    }}
                >
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" /> Delete
                </MenuItem>
            </Menu>
        </>
    );
}

function FolderRow({ folder, onNavigate, onDelete, onRename, onShare }) {
    const [anchorEl, setAnchorEl] = useState(null);

    return (
        <>
            <TableRow
                hover
                onClick={() => onNavigate(folder.id)}
                sx={{ cursor: 'pointer' }}
            >
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FolderIcon fontSize="small" color="primary" />
                        {folder.name}
                    </Box>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>{new Date(folder.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(e.currentTarget);
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </TableCell>
            </TableRow>
            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    onClick={() => {
                        onShare(folder.id, 'folder');
                        setAnchorEl(null);
                    }}
                >
                    <ShareIcon sx={{ mr: 1 }} fontSize="small" /> Share
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        onRename(folder.id, folder.name);
                        setAnchorEl(null);
                    }}
                >
                    <EditIcon sx={{ mr: 1 }} fontSize="small" /> Rename
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        onDelete(folder.id);
                        setAnchorEl(null);
                    }}
                >
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" /> Delete
                </MenuItem>
            </Menu>
        </>
    );
}

export function FolderBrowser({
    items = { folders: [], files: [] },
    onFolderNavigate,
    onRefresh
}) {
    const { showAlert } = useAlert();
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemType, setSelectedItemType] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [renameOpen, setRenameOpen] = useState(false);

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                if (selectedItemType === 'file') {
                    await FileApi.deleteFile(itemId);
                } else {
                    await FolderApi.deleteFolder(itemId);
                }
                showAlert('Deleted successfully', 'success');
                onRefresh?.();
            } catch (err) {
                showAlert(err.message || 'Delete failed', 'error');
            }
        }
    };

    const handleRename = (itemId, currentName) => {
        setSelectedItem(itemId);
        setRenameValue(currentName);
        setRenameOpen(true);
    };

    const handleRenameSubmit = async () => {
        try {
            if (selectedItemType === 'file') {
                await FileApi.renameFile(selectedItem, renameValue);
            } else {
                await FolderApi.updateFolder(selectedItem, renameValue);
            }
            showAlert('Renamed successfully', 'success');
            onRefresh?.();
        } catch (err) {
            showAlert(err.message || 'Rename failed', 'error');
        } finally {
            setRenameOpen(false);
        }
    };

    const handleShare = (itemId, type) => {
        // Will be implemented in main app with permission dialog
        console.log('Share:', itemId, type);
    };

    const handleDownload = async (fileId) => {
        try {
            const res = await FileApi.downloadFile(fileId);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'file';
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                showAlert('Download failed', 'error');
            }
        } catch (err) {
            showAlert(err.message || 'Download error', 'error');
        }
    };

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Name</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.folders?.map((folder) => (
                            <FolderRow
                                key={folder.id}
                                folder={folder}
                                onNavigate={onFolderNavigate}
                                onDelete={() => {
                                    setSelectedItemType('folder');
                                    handleDelete(folder.id);
                                }}
                                onRename={() => {
                                    setSelectedItemType('folder');
                                    handleRename(folder.id, folder.name);
                                }}
                                onShare={handleShare}
                            />
                        ))}
                        {items.files?.map((file) => (
                            <FileRow
                                key={file.id}
                                file={file}
                                onDelete={() => {
                                    setSelectedItemType('file');
                                    handleDelete(file.id);
                                }}
                                onRename={() => {
                                    setSelectedItemType('file');
                                    handleRename(file.id, file.name);
                                }}
                                onShare={handleShare}
                                onDownload={handleDownload}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
                <DialogTitle>Rename</DialogTitle>
                <DialogContent sx={{ pt: 2, minWidth: 300 }}>
                    <Box
                        component="input"
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit();
                        }}
                        autoFocus
                        sx={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
                    <Button onClick={handleRenameSubmit} variant="contained">
                        Rename
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
