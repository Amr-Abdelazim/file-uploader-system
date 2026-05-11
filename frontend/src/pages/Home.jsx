
import { useState, useEffect } from "react";
import { FullPageSpinner } from "../components/FullPageSpinner";
import FoldersApi from "../apiController/FoldersApi";
import { UploadButton } from "../components/UploadButton";
import { LogoutButton } from "../components/LogoutButton";
import { Folder } from "../components/Folder";
import '../styles/Home.css';
export function Home() {
    const [rootFolder, setRootFolder] = useState(undefined);



    useEffect(() => {
        async function fetchData() {
            const res = await FoldersApi.getRoot();
            setRootFolder(res);
        }
        fetchData();
    }, []);

    if (rootFolder === undefined) return <FullPageSpinner />;
    if (rootFolder === null) return <p>Sorry we cant fetch root folder!!!!</p>

    return (
        <>
            <div className="mainContainer">
                <nav><UploadButton rootFolder={rootFolder} />
                    <LogoutButton />
                </nav>
                <div className="folderWrapper">
                    <Folder folderId={rootFolder} />

                </div>


            </div>
        </>
    )
}