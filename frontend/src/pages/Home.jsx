
import { useEffect, useState } from 'react';
import {
    Box,
    Container,
    AppBar,
    Toolbar,
    Button,
    Typography,
    Breadcrumbs,
    Link,
    Paper,
    CircularProgress,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAlert } from '../contexts/AlertContext.jsx';
import FolderApi from '../api/FolderApi';
import { FolderBrowser } from '../components/FolderBrowser';
import { CreateFolderDialog } from '../components/CreateFolderDialog';
import { UploadDialog } from '../components/UploadDialog';
import { PermissionDialog } from '../components/PermissionDialog';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LogoutIcon from '@mui/icons-material/Logout';

export function Home() {
    const [folderId, setFolderId] = useState(null);
    const [items, setItems] = useState({ folders: [], files: [] });
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [creatingFolder, setCreatingFolder] = useState(false);

    const { logout, user } = useAuth();
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        initializeRoot();
    }, []);

    const initializeRoot = async () => {
        setLoading(true);
        try {
            const root = await FolderApi.getRoot();
            setFolderId(root.id);
            await loadFolderContents(root.id);
            setPath([{ id: root.id, name: 'My Files' }]);
        } catch (err) {
            showAlert(err.message || 'Failed to load root folder', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadFolderContents = async (id) => {
        try {
            const preview = await FolderApi.getFolderPreview(id);
            const folders = preview.filter(item => !item.mimetype);
            const files = preview.filter(item => item.mimetype);
            setItems({ folders, files });
        } catch (err) {
            showAlert(err.message || 'Failed to load folder contents', 'error');
        }
    };

    const handleNavigate = async (newFolderId) => {
        setLoading(true);
        try {
            setFolderId(newFolderId);
            await loadFolderContents(newFolderId);
            const folderPath = await FolderApi.getFolderPath(newFolderId);
            setPath([{ id: newFolderId, name: 'My Files' }, ...folderPath]);
        } catch (err) {
            showAlert(err.message || 'Failed to navigate folder', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (name) => {
        if (!folderId) return;
        setCreatingFolder(true);
        try {
            await FolderApi.createFolder(folderId, name);
            showAlert(`Folder "${name}" created`, 'success');
            setCreateFolderOpen(false);
            await loadFolderContents(folderId);
        } catch (err) {
            showAlert(err.message || 'Failed to create folder', 'error');
        } finally {
            setCreatingFolder(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        File Uploader
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 3 }}>
                        {user?.username || 'User'}
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Stack spacing={2}>
                    {/* Breadcrumb Navigation */}
                    {path.length > 0 && (
                        <Paper sx={{ p: 2 }}>
                            <Breadcrumbs>
                                {path.map((item) => (
                                    <Link
                                        key={item.id}
                                        onClick={() => handleNavigate(item.id)}
                                        sx={{ cursor: 'pointer', color: 'primary.main' }}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </Breadcrumbs>
                        </Paper>
                    )}

                    {/* Action Buttons */}
                    <Paper sx={{ p: 2 }}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateFolderOpen(true)}
                            >
                                New Folder
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => setUploadOpen(true)}
                            >
                                Upload File
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Folder Browser */}
                    <FolderBrowser
                        items={items}
                        onFolderNavigate={handleNavigate}
                        onRefresh={() => folderId && loadFolderContents(folderId)}
                    />
                </Stack>
            </Container>

            {/* Dialogs */}
            <CreateFolderDialog
                open={createFolderOpen}
                onClose={() => setCreateFolderOpen(false)}
                onCreate={handleCreateFolder}
                loading={creatingFolder}
            />

            <UploadDialog
                open={uploadOpen}
                onClose={() => setUploadOpen(false)}
                folderId={folderId}
                onUploadComplete={() => folderId && loadFolderContents(folderId)}
            />

            <PermissionDialog
                open={permissionOpen}
                onClose={() => setPermissionOpen(false)}
                objectId={selectedItem?.id}
                objectType={selectedItem?.type}
            />
        </Box>
    );
}