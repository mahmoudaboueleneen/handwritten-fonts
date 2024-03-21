import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SelectAccountPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<string[]>([]);
  const { selectedAccount, setSelectedAccount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (window.ethereum) {
        console.log("Ethereum is available!", window.ethereum);
        try {
          const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
          console.log("Accounts: ", accounts);
          setAccounts(accounts);
          if (accounts.length > 0) {
            setSelectedAccount(accounts[0]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
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

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <span className="loading loading-dots loading-lg"></span>
        <p>Starting up Handwritten Fonts...</p>
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
      <h1 className="self-center text-lg font-bold">
        Select your MetaMask Account{" "}
        <div
          className="mb-3 tooltip"
          data-tip="Handwritten Fonts uses MetaMask accounts instead of its own accounts. Each MetaMask account you link to our app can be considered as a Handwritten Fonts account!"
        >
          <span className="text-sm text-teal-500">(Learn More)</span>
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
      <button className="self-center btn btn-primary" onClick={handleProceedClick}>
        Proceed
      </button>
    </div>
  );
};

export default SelectAccountPage;
