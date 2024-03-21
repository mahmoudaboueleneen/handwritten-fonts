/**
 * @dev The user can enter their password to log in if they have already
 *      created a password linked to their chosen MetaMask account.
 *      If they haven't, they can create a new password.
 */
import { useState, useEffect } from "react";

import { getContractInstance } from "../../ethereum/ContractInstance";
import { useAuth } from "../../hooks/useAuth";
import { config } from "../../config/config";
import { web3Instance } from "../../ethereum/Web3Instance";

const PasswordPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");
  const [passwordCreated, setPasswordCreated] = useState<boolean>(false);
  const { selectedAccount } = useAuth();

  useEffect(() => {
    const checkPasswordCreation = async () => {
      setLoading(true);
      setLoadingMessage("Checking MetaMask Account linking status...");

      try {
        const accounts = await web3Instance.eth.getAccounts();
        const contractInstance = getContractInstance(config.deployedContractAddress);
        const response = (await contractInstance.methods.checkPasswordStatus().call({ from: accounts[0] })) as boolean;
        setPasswordCreated(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMessage("");
      }
    };

    checkPasswordCreation();
  }, []);

  const onSubmitCreatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setLoadingMessage("Updating MetaMask account linking status...");

    // TODO: Add strong password regex validation

    // TODO: If new password is strong enough then do the following key generation . . .

    try {
      const accounts = await web3Instance.eth.getAccounts();
      const contractInstance = getContractInstance(config.deployedContractAddress);
      const response = (await contractInstance.methods.checkPasswordStatus().call({ from: accounts[0] })) as boolean;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <span className="loading loading-dots loading-lg"></span>
        <p>{loadingMessage}</p>
      </div>
    );

  if (!passwordCreated)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-10 space-y-5">
        <h1 className="text-xl font-bold text-start">Create a Password</h1>
        <p className="pb-5">Your selected MetaMask account hasn't created a password for Handwritten Fonts yet.</p>

        <div role="alert" className="alert alert-info">
          <div className="flex items-start gap-2">
            <span className="font-semibold">Account:</span>
            <span className="break-all">{selectedAccount}</span>
          </div>
        </div>

        <form onSubmit={onSubmitCreatePassword} className="w-full mx-auto space-y-2">
          <input className="w-full input input-bordered join-item" placeholder="Password" />
          <button type="submit" className="w-full btn btn-primary">
            Create Password
          </button>
        </form>
      </div>
    );

  return <div>Welcome back, enter your password</div>;
};

export default PasswordPage;
