
import { useEffect, useState } from "react";
import FoldersApi from "../apiController/FoldersApi";
import { useAlert } from "../contexts/AlertContext";
import '../styles/FolderPath.css';
import { useNavigate } from "react-router-dom";
export function FolderPath({ folderId, maxPathLength = 5 }) {
    const [folderPath, setFolderPath] = useState(null);
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    useEffect(() => {
        async function getFolderPath() {
            const res = await FoldersApi.getFolderPath(folderId, maxPathLength);
            if (res.error) {
                showAlert(res.error, 'error');
            } else setFolderPath(res);
        }
        getFolderPath();
    }, [folderId, maxPathLength, showAlert]);
    if (!folderPath) return <p>...</p>;
    function selectFolder(folderId) {
        navigate('/folder/' + folderId);
    }
    return (
        <>
            <div className="folderPath">
                <ul>
                    {folderPath.map(folder => (
                        <li key={folder.folderId} onClick={() => selectFolder(folder.folderId)}>{folder.name}</li>
                    ))}
                </ul>
            </div>
        </>
    )
}