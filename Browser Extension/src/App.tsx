import { useState } from "react";
import { create } from "ipfs-http-client";

const App = () => {
  const [fileUrl, updateFileUrl] = useState(``);

  const projectId = "YOUR_PROJECT_ID";
  const projectSecret = "YOUR_PROJECT_SECRET";
  const auth = `Basic ${btoa(`${projectId}:${projectSecret}`)}`;

  const client = create({ host: "ipfs.infura.io", port: 5001, protocol: "https", headers: { authorization: auth } });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];
    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      updateFileUrl(url);
      console.log("IPFS URL: ", url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const onChangePageFont = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript<string[], void>({
      target: { tabId: tab.id! },
      func: () => {
        const elements = document.querySelectorAll("*");
        for (let i = 0; i < elements.length; i++) {
          (elements[i] as HTMLElement).style.setProperty("font-family", "serif", "important");
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-y-5">
      <h1 className="text-3xl font-bold">Handwritten Fonts</h1>

      <label className="w-full max-w-xs form-control">
        <input type="file" onChange={onFileChange} className="w-full max-w-xs file-input file-input-bordered" />
      </label>

      {fileUrl && <img src={fileUrl} alt="preview" />}

      <hr />

      <button className="btn btn-active btn-primary" onClick={onChangePageFont}>
        Change Font
      </button>
    </div>
  );
};

export default App;
