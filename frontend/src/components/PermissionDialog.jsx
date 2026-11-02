import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import PermissionApi from '../api/PermissionApi';
import { useAlert } from '../contexts/AlertContext.jsx';

export function PermissionDialog({ open, onClose, objectId, objectType }) {
    const [permissions, setPermissions] = useState([]);
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('viewer');
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        if (open && objectId && objectType) {
            fetchPermissions();
        }
    }, [open, objectId, objectType]);

    const fetchPermissions = async () => {
        try {
            const res = await PermissionApi.listPermissions(objectType, objectId);
            setPermissions(res.permissions || []);
        } catch (err) {
            showAlert(err.message || 'Failed to fetch permissions', 'error');
        }
    };

    const handleAssign = async () => {
        if (!userId.trim()) {
            showAlert('Please enter a user ID', 'warning');
            return;
        }

        setLoading(true);
        try {
            await PermissionApi.assignPermission(userId, objectType, objectId, role);
            showAlert('Permission assigned', 'success');
            setUserId('');
            setRole('viewer');
            fetchPermissions();
        } catch (err) {
            showAlert(err.message || 'Failed to assign permission', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (permissionUserId) => {
        if (!window.confirm('Remove this permission?')) return;

        setLoading(true);
        try {
            await PermissionApi.revokePermission(permissionUserId, objectType, objectId);
            showAlert('Permission revoked', 'success');
            fetchPermissions();
        } catch (err) {
            showAlert(err.message || 'Failed to revoke permission', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Grant Access
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <TextField
                                size="small"
                                label="User ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                disabled={loading}
                                flex={1}
                            />
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    label="Role"
                                    disabled={loading}
                                >
                                    <MenuItem value="viewer">Viewer</MenuItem>
                                    <MenuItem value="editor">Editor</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                onClick={handleAssign}
                                disabled={loading}
                            >
                                Add
                            </Button>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Current Permissions
                        </Typography>
                        <List sx={{ border: '1px solid #eee', borderRadius: 1 }}>
                            {permissions.length === 0 ? (
                                <ListItem>
                                    <ListItemText primary="No shared permissions yet" />
                                </ListItem>
                            ) : (
                                permissions.map((perm) => (
                                    <ListItem
                                        key={perm.id}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleRevoke(perm.userId)}
                                                disabled={loading}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={perm.userId}
                                            secondary={`Role: ${perm.role}`}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
