/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import { Contact } from "../../../types/Contact.interface";
import { getContactsFromLocalStorage, addContactToLocalStorage } from "../../../utils/storage/LocalStorage";
import { useAuth } from "../../../hooks/useAuth";

const Contacts = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState<string>("");
  const [newContactAddress, setNewContactAddress] = useState<string>("");
  const { selectedAccount } = useAuth();

  useEffect(() => {
    setLoadingMessage("Fetching contacts...");

    const fetchedContacts = getContactsFromLocalStorage(selectedAccount);
    console.log("Accounts: ", fetchedContacts);
    setContacts(fetchedContacts);

    setLoadingMessage("");
    setLoading(false);
  }, []);

  const onCreateContact = () => {
    if (!newContactName || !newContactAddress) {
      setErrorMessage("Please enter the contact name and address to continue");
      console.error("Please enter the contact name and address to continue");
      return;
    }

    addContactToLocalStorage(newContactName, newContactAddress, selectedAccount);
    setContacts([...contacts, { name: newContactName, address: newContactAddress }]);
    setNewContactName("");
    setNewContactAddress("");
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-5">
        <span className="loading loading-dots loading-lg"></span>
        <p className="text-center">{loadingMessage}</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-full px-10">
      {contacts.length > 0 ? (
        <>
          <h1 className="text-2xl font-bold">Your Contacts</h1>
          <div>
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-start gap-3 p-5 bg-base-100 rounded-box">
                <div className="avatar placeholder">
                  <div className="w-12 rounded-full bg-neutral text-neutral-content">
                    <span>{getInitials(contact.name)}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold">{contact.name}</h2>
                  <p className="text-sm break-all text-neutral-content">{contact.address}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <h1 className="mb-6 text-2xl font-bold">No Contacts Found</h1>
      )}

      <div className="mb-6 divider"></div>

      <label className="flex items-center w-full gap-2 mb-3 input input-bordered">
        <input
          type="text"
          className="grow"
          placeholder="Contact Name"
          value={newContactName}
          onChange={(e) => setNewContactName(e.target.value)}
        />
      </label>

      <label className="flex items-center w-full gap-2 input input-bordered">
        <input
          type="text"
          className="grow"
          placeholder="Account Address"
          value={newContactAddress}
          onChange={(e) => setNewContactAddress(e.target.value)}
        />
      </label>

      <button
        onClick={onCreateContact}
        className="w-full mt-5 btn btn-primary"
        disabled={!newContactName || !newContactAddress}
      >
        Add New Contact
      </button>

      {errorMessage && <span className="mt-2 text-error">{errorMessage}</span>}
    </div>
  );
};

function getInitials(name: string) {
  const initials = name.match(/\b\w/g) || [];
  return ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
}

export default Contacts;
