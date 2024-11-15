/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import useEthereum from "../../hooks/useEthereum";

const SelectAccountPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Starting up Handwritten Fonts...");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [ethereumObjectNotFound, setEthereumObjectNotFound] = useState<boolean>(false);
  const { selectedAccount, setSelectedAccount } = useAuth();
  const navigate = useNavigate();
  const ethereum = useEthereum();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (ethereum) {
        setLoadingMessage("Ethereum is available!" + ethereum);
        try {
          setLoadingMessage("Requesting accounts...");
          const addresses = await ethereum.request({ method: "eth_requestAccounts" });
          setLoadingMessage("Accounts: " + addresses);
          setAccounts(addresses);
          if (addresses.length > 0) {
            setSelectedAccount(addresses[0]);
          }
        } catch (err) {
          setLoadingMessage("Error fetching accounts: " + err);
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("Ethereum object not found!");
        setEthereumObjectNotFound(true);
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(event.target.value);
    console.log("Selected Account: ", event.target.value);
  };

  const handleProceedClick = () => {
    console.log("Proceeding with account: ", selectedAccount);
    navigate("/password-page");
  };

  if (ethereumObjectNotFound)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-10">
        <h1 className="pb-3 text-xl font-bold">MetaMask Not Found..</h1>
        <p>Please install MetaMask to use Handwritten Fonts.</p>
      </div>
    );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <span className="loading loading-dots loading-lg"></span>
        <p>{loadingMessage}</p>
      </div>
    );

  if (accounts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-10">
        <h1 className="pb-3 text-xl font-bold">No MetaMask Account Found..</h1>
        <p>Please install and login to MetaMask and connect at least one MetaMask account to use Handwritten Fonts.</p>
      </div>
    );

  return (
    <div className="flex flex-col items-start justify-center h-screen px-10">
      <h1 className="self-center mb-3 text-lg font-bold">
        Select a MetaMask Account{" "}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-xs text-info">
            <svg
              tabIndex={0}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-4 h-4 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div tabIndex={0} className="card compact dropdown-content z-[1] shadow bg-base-100 rounded-box w-64">
            <div tabIndex={0} className="card-body">
              <p className="text-xs font-normal text-muted">
                Handwritten Fonts uses MetaMask accounts instead of its own accounts. Each MetaMask account you link to
                our app can be considered as a Handwritten Fonts account!
              </p>
            </div>
          </div>
        </div>
      </h1>
      <select
        className="w-full max-w-xs mb-5 select select-bordered"
        value={selectedAccount}
        onChange={handleAccountChange}
      >
        {accounts.map((account, index) => (
          <option key={index} value={account}>
            {account}
          </option>
        ))}
      </select>
      <span className="mb-5 text-sm">
        (If you can't see your MetaMask account in the dropdown, open MetaMask and connect the account to Handwritten
        Fonts)
      </span>
      <button className="self-center w-full btn btn-primary" onClick={handleProceedClick}>
        Proceed
      </button>
    </div>
  );
};

export default SelectAccountPage;
