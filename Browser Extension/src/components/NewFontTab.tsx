import { useState, useRef } from "react";

import { uploadToIPFS } from "../services/UploadToIPFS";
import {
  decryptFileSymmetric,
  encryptFileSymmetric,
  generateSymmetricKey
} from "../utils/cryptography/SymmetricEncryption";

const NewFontTab = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [uploadedFileCid, setUploadedFileCid] = useState<string>("");
  const [uploadedFilename, setUploadedFilename] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [privateKeyNotFound, setPrivateKeyNotFound] = useState<boolean>(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.showModal();
    }
  };

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setSelectedFile(e.target.files[0]);
  };

  const onSubmitUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    setLoadingMessage("Generating symmetric key...");
    setLoading(true);

    try {
      const key = generateSymmetricKey();

      setLoadingMessage("Encrypting your file...");

      const encryptedFileString = await encryptFileSymmetric(key, selectedFile);
      console.log("Encrypted file string: ", encryptedFileString);

      const encryptedBlob = new Blob([encryptedFileString], { type: "font/ttf" });
      const encryptedFileObject = new File([encryptedBlob], selectedFile.name);

      setLoadingMessage("Encrypting your file and uploading to the IPFS Network...");

      const { url, cid } = await uploadToIPFS(encryptedFileObject);
      setUploadedFileUrl(url);
      setUploadedFileCid(cid);
      setUploadedFilename(selectedFile.name);

      console.log("IPFS URL: ", url);
      console.log("IPFS CID: ", cid);
      console.log("Filename: ", selectedFile.name);

      openModal();

      const encryptedPrivateKey = localStorage.getItem("HandwrittenFonts_pk");

      if (!encryptedPrivateKey) {
        setPrivateKeyNotFound(true);
        return;
      }

      setLoadingMessage("Encrypting your file data and storing it locally...");

      // Decrypt the file to verify it's the same
      const decryptedFileString = await decryptFileSymmetric(key, encryptedFileString);
      console.log("Decrypted file string: ", decryptedFileString);
    } catch (error) {
      setErrorMessage(`Error uploading file: ${error}`);
      console.error("Error uploading file: ", error);
    } finally {
      setLoadingMessage("");
      setLoading(false);
      setSelectedFile(null);
    }
  };

  const handleValidatePassword = () => {};

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-5">
        <span className="loading loading-dots loading-lg"></span>
        <p className="text-center">{loadingMessage}</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen px-10">
      <h1 className="mb-5 text-2xl font-bold text-center">Upload a new font file (TTF Files only)</h1>

      <form onSubmit={onSubmitUpload}>
        <label className="w-full max-w-xs mb-2 form-control">
          <input type="file" onChange={onFileChange} className="w-full max-w-xs file-input file-input-bordered" />
        </label>

        <button className="w-full btn btn-primary" disabled={!selectedFile}>
          Upload File
        </button>

        {errorMessage && <span className="mt-3 text-error">{errorMessage}</span>}
      </form>

      {privateKeyNotFound && (
        <div>
          Private Key not found, please upload a backup or, as a last resort, generate new public and private keys.
        </div>
      )}

      <hr />

      {uploadedFileUrl && uploadedFileCid && (
        <div role="alert" className="mt-3 alert alert-success">
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
            Your font file has been uploaded to the IPFS at <span className="font-medium">{uploadedFileUrl}</span> with
            a CID: <span className="font-medium">{uploadedFileCid}</span> and file name:{" "}
            <span className="font-medium">{uploadedFilename}</span>
          </p>
        </div>
      )}

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Enter your password to continue</h3>
          <p className="py-4">Press ESC key or click the button below to close</p>
          <input
            type="password"
            className="w-full input input-bordered join-item"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="modal-action">
            <button className="btn" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn" onClick={handleValidatePassword}>
              Enter
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default NewFontTab;
