
import { useEffect, useState } from "react";
import FoldersApi from "../apiController/FoldersApi";
import { useAlert } from "../contexts/AlertContext";
export function FolderPath({ folderId, maxPathLength = 5 }) {
    const [folderPath, setFolderPath] = useState(null);
    const { showAlert } = useAlert();
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
    return (
        <>
            <ul>
                {
                    folderPath.map(folder => {
                        return <li key={folder.folderId} >{folder.name}</li>
                    })
                }
            </ul>
        </>
    )
}