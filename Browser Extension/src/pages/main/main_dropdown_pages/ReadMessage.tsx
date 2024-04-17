import { useRef, useState } from "react";

import { useDetectedMessages } from "../../../hooks/useDetectedMessages";
import { DetectedMessage } from "../../../types/DetectedMessage.interface";
import { useAuth } from "../../../hooks/useAuth";
import { decryptFileSymmetric, decryptMessageSymmetric } from "../../../utils/cryptography/SymmetricEncryption";
import { SymmetricDecryptionError } from "../../../utils/errors/SymmetricDecryptionError";
import { hashMessage } from "../../../utils/cryptography/Hashing";
import { decryptMessageAsymmetric } from "../../../utils/cryptography/AsymmetricEncryption";
import { fetchFromIPFS } from "../../../services/FetchFromIPFS";
import useEthereum from "../../../hooks/useEthereum";

const ReadMessage = () => {
  const { detectedMessages } = useDetectedMessages();
  const [selectedMessage, setSelectedMessage] = useState<DetectedMessage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [modalErrorMessage, setModalErrorMessage] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [privateKeyNotFound, setPrivateKeyNotFound] = useState<boolean>(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const { selectedAccount } = useAuth();
  const ethereum = useEthereum();

  const checkCurrentNodesForMessages = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].id !== undefined) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: function () {
            const messageRegex = /(.*)##\|\|tag:HandwrittenFontsExt<1\.0\.0>\|\|uuid:([a-f0-9-]{36})\|\|##/;
            const elements = document.querySelectorAll("[data-original-content]");
            elements.forEach((element) => {
              const originalContent = element.getAttribute("data-original-content");
              if (!originalContent) return;
              const match = originalContent.match(messageRegex);
              if (match) {
                console.log("Message detected with [data-original-content] attribute:", originalContent);
                console.log("Message detected with match[1]:", match[1]);
                chrome.runtime.sendMessage({ type: "DETECTED_MESSAGE", message: match[1], uuid: match[2] });
              }
            });
          }
        });
      }
    });
  };

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

  const handleDisplayClick = (message: DetectedMessage) => {
    setSelectedMessage(message);
    openModal();
  };

  const onDisplayMessageInHandwrittenFont = async () => {
    setErrorMessage("");
    setModalErrorMessage("");

    if (!selectedMessage) {
      setErrorMessage("No message selected");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password to continue");
      return;
    }

    const encryptedPrivateKey = localStorage.getItem(`HandwrittenFonts_${selectedAccount}_pk`);

    if (!encryptedPrivateKey) {
      setPrivateKeyNotFound(true);
      return;
    }

    let privateKey;

    try {
      privateKey = decryptMessageSymmetric(password, encryptedPrivateKey);

      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof SymmetricDecryptionError) {
          setModalErrorMessage("Incorrect password.");
        } else {
          setModalErrorMessage("Incorrect password.");
        }
        return;
      }
    }

    try {
      if (!privateKey) {
        setPrivateKeyNotFound(true);
        return;
      }

      setLoadingMessage("Fetching message data..");
      setLoading(true);

      const message = selectedMessage.message;
      const uuid = selectedMessage.uuid;

      const combinedMessage = `${message}${uuid}`;
      const messageHash = hashMessage(combinedMessage);

      const encryptedData = await ethereum.contractCall("messageHashToEncryptedData", [messageHash], []);

      const symmetricKey = decryptMessageAsymmetric(privateKey, encryptedData.encryptedSymmetricKey);
      const cidOfEncryptedFontFile = decryptMessageAsymmetric(
        privateKey,
        encryptedData.encryptedCidOfEncryptedFontFile
      );
      const filenameOfEncryptedFontFile = decryptMessageAsymmetric(
        privateKey,
        encryptedData.encryptedFilenameOfEncryptedFontFile
      );

      const encryptedFileObject = await fetchFromIPFS(cidOfEncryptedFontFile, filenameOfEncryptedFontFile);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const encryptedFileString = reader.result as string;

        try {
          setLoadingMessage("Decrypting your file...");

          const decryptedFileString = await decryptFileSymmetric(symmetricKey, encryptedFileString);

          const charList = decryptedFileString.split("");
          const uint8Array = new Uint8Array(charList.map((ch) => ch.charCodeAt(0)));

          const decryptedBlob = new Blob([uint8Array.buffer], { type: "font/ttf" });

          const dataURLReader = new FileReader();
          dataURLReader.onloadend = async () => {
            const decryptedFileDataURL = dataURLReader.result as string;

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.scripting.executeScript({
              target: { tabId: tab.id! },
              args: [decryptedFileDataURL, uuid],
              func: (fontFileDataURL, uuid) => {
                const style = document.createElement("style");
                style.textContent = `
                  @font-face {
                    font-family: 'CustomFont';
                    src: url(${fontFileDataURL});
                  }
                  [data-uuid="${uuid}"] {
                    font-family: 'CustomFont';
                  }
                `;
                document.head.appendChild(style);

                const element = document.querySelector(`[data-uuid="${uuid}"]`);
                if (element) {
                  (element as HTMLElement).style.fontFamily = "CustomFont";
                }
              }
            });
          };
          dataURLReader.onerror = () => {
            setErrorMessage("Failed to read the decrypted file as a data URL");
          };
          dataURLReader.readAsDataURL(decryptedBlob);
        } catch (error) {
          if (error instanceof Error) {
            setErrorMessage("Decryption failed: " + error.message);
          }
        }
      };
      reader.onerror = () => {
        setErrorMessage("Failed to read the encrypted file");
      };
      reader.readAsBinaryString(encryptedFileObject);
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while trying to display the message in a handwritten font: " + error);
    } finally {
      setLoadingMessage("");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-5">
        <span className="loading loading-dots loading-lg"></span>
        <p className="text-center">{loadingMessage}</p>
      </div>
    );

  if (privateKeyNotFound)
    return (
      <div>
        Private Key not found, please upload a backup or, as a last resort, generate new public and private keys.
      </div>
    );

  return (
    <div className="h-full px-10 pt-5">
      <h1 className="text-2xl font-bold text-center">Read Messages</h1>

      <button onClick={checkCurrentNodesForMessages} className="my-5 btn btn-primary">
        Manually Check for messages on current webpage
      </button>

      {errorMessage && <span className="mt-3 text-error">{errorMessage}</span>}

      {detectedMessages.map((detectedMessage, index) => (
        <div key={index}>
          <p>{detectedMessage.message}</p>
          <button className="btn btn-active btn-primary" onClick={() => handleDisplayClick(detectedMessage)}>
            Display in Handwritten Font
          </button>
        </div>
      ))}

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold mb-7">Enter your password to continue</h3>

          {modalErrorMessage && <span className="my-5 text-center text-error">{modalErrorMessage}</span>}

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
            <button className="btn btn-success" onClick={onDisplayMessageInHandwrittenFont} disabled={!password}>
              Enter
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ReadMessage;
