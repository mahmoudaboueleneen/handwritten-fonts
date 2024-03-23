/**
 * @dev The user can enter their password to log in if they have already
 *      created a password linked to their chosen MetaMask account.
 *      If they haven't, they can create a new password.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { generateKeyPair } from "../../utils/cryptography/AsymmetricEncryption";
import { encryptMessageSymmetric, decryptMessageSymmetric } from "../../utils/cryptography/SymmetricEncryption";
import { SymmetricDecryptionError } from "../../utils/errors/SymmetricDecryptionError";
import useEthereum from "../../hooks/useEthereum";

const PasswordPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [privateKeyNotFound, setPrivateKeyNotFound] = useState<boolean>(false);
  const [passwordCreated, setPasswordCreated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const { selectedAccount } = useAuth();
  const navigate = useNavigate();
  const ethereum = useEthereum();

  useEffect(() => {
    const checkPasswordCreation = async () => {
      setLoadingMessage("Checking MetaMask Account linking status...");
      setLoading(true);

      try {
        const response = (await ethereum.contractCall(
          "checkPasswordStatus",
          [],
          [{ from: selectedAccount }]
        )) as boolean;
        setLoadingMessage("Response: " + response);
        setPasswordCreated(response);
      } catch (err) {
        setLoadingMessage("Response: " + err);

        console.error(err);
      } finally {
        setLoadingMessage("");
        setLoading(false);
      }
    };

    checkPasswordCreation();
  }, []);

  const onSubmitCreatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoadingMessage("Generating public and private key pair...");
    setLoading(true);

    // TODO: Add strong password regex validation. If strong enough, proceed.

    const { publicKey, privateKey } = generateKeyPair();
    console.log("publicKey:", publicKey);
    console.log("privateKey:", privateKey);

    try {
      setLoadingMessage("Storing your public key on Ethereum...");
      await ethereum.contractSend("storePublicKey", [publicKey], [{ from: selectedAccount }]);

      const encryptedPrivateKey = encryptMessageSymmetric(password, privateKey);
      console.log("encryptedPrivateKey:", encryptedPrivateKey);
      localStorage.setItem(`HandwrittenFonts_${selectedAccount}_pk`, encryptedPrivateKey);

      const decryptedPrivateKey = decryptMessageSymmetric(password, encryptedPrivateKey);
      console.log("decryptedPrivateKey:", decryptedPrivateKey);

      setLoadingMessage("Updating MetaMask account linking status, hang tight...");
      await ethereum.contractSend("updatePasswordStatus", [true], [{ from: selectedAccount }]);

      setLoadingMessage("Rechecking password status...");
      const response = (await ethereum.contractSend("checkPasswordStatus", [], [{ from: selectedAccount }])) as boolean;

      setPasswordCreated(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const onSubmitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    setLoadingMessage("Validating password...");
    setLoading(true);

    const encryptedPrivateKey = localStorage.getItem(`HandwrittenFonts_${selectedAccount}_pk`);

    if (!encryptedPrivateKey) {
      setPrivateKeyNotFound(true);
      return;
    }

    try {
      decryptMessageSymmetric(password, encryptedPrivateKey);

      navigate("/handwritten-fonts");
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof SymmetricDecryptionError) {
          setErrorMessage("Incorrect password.");
        } else {
          setErrorMessage("Incorrect password.");
        }
      }
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

  if (!passwordCreated)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-10 space-y-5">
        <h1 className="text-2xl font-bold text-start">Create a Password</h1>
        <p className="pb-5">Your selected MetaMask account hasn't created a password for Handwritten Fonts yet.</p>

        <div role="alert" className="alert alert-info">
          <div className="flex items-start gap-2">
            <span className="font-semibold">Account:</span>
            <span className="break-all">{selectedAccount}</span>
          </div>
        </div>

        <form onSubmit={onSubmitCreatePassword} className="w-full mx-auto space-y-2">
          <input
            type="password"
            className="w-full input input-bordered join-item"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full btn btn-primary">
            Create Password
          </button>
        </form>
      </div>
    );

  if (privateKeyNotFound)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-10">
        <h1 className="mb-3 text-2xl font-bold text-start">Private Key not found on your local storage</h1>
        <div className="flex flex-col w-full border-opacity-50">
          <div className="btn btn-primary">Upload Backup</div>
          <div className="divider">OR</div>
          <div className="btn btn-accent">Generate New Public & Private Keys</div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen px-10">
      <h1 className="mb-3 text-2xl font-bold text-start">Welcome back</h1>

      <div role="alert" className="mb-12 alert alert-success">
        <div className="flex items-start gap-2">
          <span className="font-semibold">Account:</span>
          <span className="break-all">{selectedAccount}</span>
        </div>
      </div>

      {errorMessage && <span className="mb-3 text-error">{errorMessage}</span>}

      <form onSubmit={onSubmitLogin} className="w-full mx-auto space-y-2">
        <input
          type="password"
          className="w-full input input-bordered join-item"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default PasswordPage;
