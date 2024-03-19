/**
 * @dev The user can enter their password to log in if they have already
 *      created a password linked to their chosen MetaMask account.
 *      If they haven't, they can create a new password.
 */
import { useState, useEffect } from "react";

import { useAuth } from "../../hooks/useAuth";

const PasswordPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [passwordCreated, setPasswordCreated] = useState<boolean>(false);
  const { selectedAccount } = useAuth();

  useEffect(() => {
    const checkPassword = async () => {
      // Add your logic here to check if the user has already created a password
      // linked to their chosen MetaMask account
      setLoading(false);
    };

    checkPassword();
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
        <h1>Your selected MetaMask account hasn't created a password for Handwritten Fonts yet</h1>
        <h1 className="text-xl font-bold">Create a Password</h1>
        <p>Enter a password to link to your MetaMask account.</p>
        <p>{selectedAccount}</p>
        {/* Add your password creation form here */}
      </div>
    );

  return <div>PasswordPage</div>;
};

export default PasswordPage;
