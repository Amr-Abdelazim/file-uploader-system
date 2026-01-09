import { UploadButton } from "../components/UploadButton";
import { LogoutButton } from "../components/LogoutButton";
import { Folder } from "../components/Folder";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FullPageSpinner } from "../components/FullPageSpinner";
import FoldersApi from "../apiController/FoldersApi";
import { FolderPath } from "../components/FolderPath";
export function FolderPage() {
    const { folderId } = useParams();
    const [isValid, setIsValid] = useState(undefined);
    useEffect(() => {
        async function checkFolder() {
            const res = await FoldersApi.checkFolder(folderId);
            setIsValid(res);
        }
        checkFolder();
    }, [folderId]);

    if (isValid === undefined) {
        return <FullPageSpinner />
    }
    if (!isValid) return <p>Url not found</p>;

    return (
        <>
            <div className="mainContainer">
                <nav><UploadButton rootFolder={folderId} />
                    <LogoutButton />
                </nav>
                <FolderPath folderId={folderId} maxPathLength={2} />
                <Folder folderId={folderId} />
            </div>
        </>
    )
}