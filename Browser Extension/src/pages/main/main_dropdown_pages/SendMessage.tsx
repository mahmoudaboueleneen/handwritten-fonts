/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";

import { getContactsFromLocalStorage, getFontsFromLocalStorage } from "../../../utils/storage/LocalStorage";
import { useAuth } from "../../../hooks/useAuth";
import { hashMessage } from "../../../utils/cryptography/Hashing";
import useEthereum from "../../../hooks/useEthereum";
import { Font } from "../../../types/Font.interface";
import { decryptMessageSymmetric } from "../../../utils/cryptography/SymmetricEncryption";
import { SymmetricDecryptionError } from "../../../utils/errors/SymmetricDecryptionError";
import { Contact } from "../../../types/Contact.interface";
import { encryptMessageAsymmetric } from "../../../utils/cryptography/AsymmetricEncryption";
import { signMessage } from "../../../utils/signature/SignMessage";

const SendMessage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [privateKeyNotFound, setPrivateKeyNotFound] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [enteredMessage, setEnteredMessage] = useState<string>("");
  const [outputMessage, setOutputMessage] = useState<string>("");
  const [noFontsFound, setNoFontsFount] = useState<boolean>(false);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [selectedFont, setSelectedFont] = useState<Font | null>(null);

  const [password, setPassword] = useState<string>("");
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string>("");

  const [isCopied, setIsCopied] = useState(false);

  const { selectedAccount } = useAuth();
  const ethereum = useEthereum();

  useEffect(() => {
    const fonts = getFontsFromLocalStorage(selectedAccount);
    console.log(fonts);

    if (fonts.length === 0) {
      setNoFontsFount(true);
      return;
    } else {
      setFonts(fonts);
    }

    const contacts = getContactsFromLocalStorage(selectedAccount);
    setContacts(contacts);
  }, []);

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

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFontFilename = event.target.value;
    const selectedFont = fonts.find((font) => font.fileName === selectedFontFilename);

    if (!selectedFont) {
      console.error("Selected font not found");
      return;
    }

    setSelectedFont(selectedFont);
    console.log("Selected Font: ", event.target.value);
  };

  const onSendMessage = async () => {
    setErrorMessage("");
    setModalErrorMessage("");
    setOutputMessage("");

    if (!password) {
      setErrorMessage("Please enter your password to continue");
      return;
    }

    const encryptedPrivateKey = localStorage.getItem(`HandwrittenFonts_${selectedAccount}_pk`);

    if (!encryptedPrivateKey) {
      setPrivateKeyNotFound(true);
      return;
    }

    try {
      decryptMessageSymmetric(password, encryptedPrivateKey);

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

    let { cid, fileName, symmetricKey } = selectedFont as Font;

    try {
      cid = decryptMessageSymmetric(password, cid);
      fileName = decryptMessageSymmetric(password, fileName);
      symmetricKey = decryptMessageSymmetric(password, symmetricKey);
    } catch (error) {
      setErrorMessage("Error decrypting font data");
      console.error("Error decrypting font data", error);
      return;
    }

    setLoadingMessage("Fetching recipient's public key...");
    setLoading(true);

    const recipientPublicKey = await ethereum.contractCall(
      "addressToPublicKey",
      [recipientAddress],
      [{ from: selectedAccount }]
    );

    if (!recipientPublicKey) {
      setErrorMessage(
        "Recipient's public key not found. Make sure the recipient has created a Handwritten Fonts account."
      );
      setLoading(false);
      return;
    }

    setLoadingMessage("Encrypting data and encoding font into message...");

    const uuid = uuidv4();

    const combinedMessage = `${enteredMessage}${uuid}`;
    const messageHash = hashMessage(combinedMessage);

    const encryptedSymmetricKey = encryptMessageAsymmetric(recipientPublicKey, symmetricKey);
    const encryptedCidOfEncryptedFontFile = encryptMessageAsymmetric(recipientPublicKey, cid);
    const encryptedFileNameOfEncryptedFontFile = encryptMessageAsymmetric(recipientPublicKey, fileName);

    setLoadingMessage("Storing message hash on ethereum...");

    try {
      await ethereum.contractSend(
        "storeEncryptedData",
        [messageHash, encryptedSymmetricKey, encryptedCidOfEncryptedFontFile, encryptedFileNameOfEncryptedFontFile],
        [{ from: selectedAccount }]
      );

      setOutputMessage(signMessage(enteredMessage, uuid));
    } catch (error) {
      setErrorMessage("Error storing message hash on ethereum");
      console.error("Error storing message hash on ethereum", error);
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

  if (noFontsFound)
    return (
      <div className="flex flex-col items-center justify-center px-5">
        <h1 className="text-2xl font-bold text-center">No fonts found on your device</h1>
        <p className="text-center">Please upload a font file or backup your fonts.</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-full px-10 space-y-5">
      <h1 className="text-2xl font-bold text-start">Send a message in one of your fonts.</h1>

      <select className="w-full max-w-xs select select-bordered" onChange={(e) => setRecipientAddress(e.target.value)}>
        <option disabled selected>
          Select recipient
        </option>
        {contacts.map((contact, index) => (
          <option key={index} value={contact.address}>
            <span className="font-semibold">{contact.name}: </span> {contact.address}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Message"
        className="w-full max-w-xs textarea textarea-bordered"
        rows={5}
        value={enteredMessage}
        onChange={(e) => setEnteredMessage(e.target.value)}
      ></textarea>

      <select className="w-full max-w-xs select select-bordered" onChange={handleFontChange}>
        <option disabled selected>
          Select your font
        </option>
        {fonts.map((font, index) => (
          <option key={index} value={font.fileName}>
            {font.fileName}
          </option>
        ))}
      </select>

      <button className="w-full btn btn-primary" onClick={openModal}>
        Send Message
      </button>

      {errorMessage && <span className="text-error">{errorMessage}</span>}

      {privateKeyNotFound && (
        <div>
          Private Key not found, please upload a backup or, as a last resort, generate new public and private keys.
        </div>
      )}

      {outputMessage && (
        <>
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

            <CopyToClipboard text={outputMessage} onCopy={handleCopy}>
              <button>
                <FontAwesomeIcon icon={faClipboard} />
              </button>
            </CopyToClipboard>

            <span>{outputMessage}</span>

            {isCopied && <span>Copied!</span>}
          </div>

          <p>
            You can now copy this message and send it as it is via any messaging platform to your recipient. Only your
            selected recipient will be able to view it in your font, but they must be running both MetaMask and
            Handwritten Fonts.
          </p>
        </>
      )}

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
            <button className="btn btn-success" onClick={onSendMessage}>
              Enter
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default SendMessage;
