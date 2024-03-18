import { useState } from "react";

const Upload = () => {
  const [fileUrl, updateFileUrl] = useState(``);
  const [uploading, setUploading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setUploading(true);

    const file = e.target.files[0];
    const fileName = file.name;
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch("https://api.nft.storage/upload", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEE4NTdjNTU4OTBDMTE4Qzc2MWI0MTk4NjQ4YUZhZjJFRTRlQzI3YWYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDM2NzU3MDcyOSwibmFtZSI6IkhhbmR3cml0dGVuIEZvbnRzIEtleSJ9.nP7wm0V3bM8Nut5Ihxfdhwr4avdSSCLmtd6hIcPlOW8"
        },
        body: data
      });

      const { ok, value } = await response.json();

      if (ok) {
        const url = `https://nftstorage.link/ipfs/${value.cid}/${fileName}`;
        updateFileUrl(url);
        console.log("IPFS URL: ", url);
      } else {
        console.log("Error uploading file: ", value.error.message);
      }
    } catch (error) {
      console.log("Error uploading file: ", error);
    } finally {
      setUploading(false);
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
    <div className="flex flex-col items-center justify-center h-screen p-5 my-2 gap-y-5 min-w-80">
      <h1 className="text-3xl font-bold">Handwritten Fonts</h1>
      <p>Upload your generated TTF file.</p>

      <label className="w-full max-w-xs form-control">
        <input type="file" onChange={onFileChange} className="w-full max-w-xs file-input file-input-bordered" />
      </label>

      {uploading && <span className="loading loading-dots loading-lg"></span>}

      <hr />

      <button className="btn btn-active btn-primary" onClick={onChangePageFont}>
        Change Font
      </button>

      {fileUrl && (
        <div role="alert" className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 stroke-current shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="break-all">
            Your font file has been uploaded to the IPFS at <span className="font-medium">{fileUrl}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Upload;
