
import { useState, useEffect } from "react";
import FoldersApi from "../apiController/FoldersApi";

import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import { useAlert } from "../contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import FileApi from "../apiController/FileApi";
export function Folder({ folderId }) {
    const [folderData, setFolderData] = useState([]);
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        async function getFolderPreview() {
            if (!folderId) return null;
            const res = await FoldersApi.getFolderPreview(folderId);
            if (res.error) {
                showAlert(res.error, 'error');
                navigate('/', { replace: true });
            }
            else setFolderData(res);
        }
        getFolderPreview();
    }, [showAlert, folderId, navigate]);

    function selectFolder(folderId) {
        navigate('/folder/' + folderId);
    }
    async function selectFile(fileId, fileName) {
        const res = await FileApi.downloadFile(fileId);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // document.body.appendChild(a);
        a.download = fileName;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }
    function createObjectLayout(obj) {
        return (

            <div className="objectContainer" key={obj.id}>
                {
                    obj.isFile ?
                        <button onClick={() => selectFile(obj.id, obj.name)}>
                            <FileIcon />
                            <p>{obj.name}</p>
                        </button>
                        :
                        <button onClick={() => selectFolder(obj.id)}>
                            <FolderIcon />
                            <p>{obj.name}</p>
                        </button>
                }

            </div>

        )
    }

    return (
        <>
            <div className="folderContainer">
                {folderData.map(createObjectLayout)}
            </div>
        </>
    )
}