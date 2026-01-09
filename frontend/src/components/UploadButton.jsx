import { useRef, useState } from "react";
import TransfereApi from "../apiController/TransfereApi";
export function UploadButton({ rootFolder }) {
    const folderSelection = useRef(null);
    const fileSelection = useRef(null);
    const [message, setMessage] = useState(null);


    function selectFolder() {
        folderSelection.current.click();
    }
    function selectFiles() {
        fileSelection.current.click();
    }
    async function upload(e) {
        const input = e.target;
        const formData = new FormData();
        for (const file of input.files) {
            formData.append("files", file);
            formData.append("paths[]", file.webkitRelativePath || file.name);
        }
        const res = await TransfereApi.upload(rootFolder, formData);
        setMessage(res);
    }
    return (
        <>
            <p>welcome to home</p>
            <button onClick={selectFiles}>Uplaod Files</button>
            <button onClick={selectFolder}>Upload Folder</button>
            <input type="file"
                ref={fileSelection}
                style={{ display: "none" }}
                onChange={upload}
                multiple
            />
            <input
                type="file"
                ref={folderSelection}
                style={{ display: "none" }}
                onChange={upload}
                webkitdirectory="true"
                directory="true"
                multiple
            />
            {message ? <p>{message}</p> : ""}

        </>
    )
}