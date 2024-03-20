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
  const [passwordCreated, setPasswordCreated] = useState<boolean>(false);
  const { selectedAccount } = useAuth();

  useEffect(() => {
    const checkPasswordCreation = async () => {
      try {
        const accounts = await web3Instance.eth.getAccounts();
        console.log("Using account", accounts[0]);

        const contractInstance = getContractInstance(config.deployedContractAddress);

        const response = (await contractInstance.methods.checkPasswordStatus().call({ from: accounts[0] })) as boolean;
        console.log("Password Status: ", response);

        setPasswordCreated(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkPasswordCreation();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <span className="loading loading-dots loading-lg"></span>
        <p>Checking MetaMask Account linking status...</p>
      </div>
    );

  if (!passwordCreated)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-10">
        <h1 className="text-xl font-bold">Create a Password</h1>
        <p className="pb-5">Your selected MetaMask account hasn't created a password for Handwritten Fonts yet.</p>

        <span className="break-all">{selectedAccount}</span>
        <div className="gap-2 badge badge-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-4 h-4 stroke-current"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          info
        </div>
        {/* Add your password creation form here */}
      </div>
    );

  return <div>PasswordPage</div>;
};

export default PasswordPage;
