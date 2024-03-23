/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faCircleUser,
  faDownload,
  faUpload,
  faPaperPlane,
  faBookOpen,
  faFont,
  faPenFancy
} from "@fortawesome/free-solid-svg-icons";

import NewFont from "./main_dropdown_pages/NewFont";
import MyFonts from "./main_dropdown_pages/MyFonts";
import SendMessage from "./main_dropdown_pages/SendMessage";
import ReadMessage from "./main_dropdown_pages/ReadMessage";
import Contacts from "./avatar_dropdown_pages/Contacts";
import RestoreData from "./avatar_dropdown_pages/RestoreData";
import ExportData from "./avatar_dropdown_pages/ExportData";
import MyAccount from "./avatar_dropdown_pages/MyAccount";

const mainDropdownItems = [
  { name: "Read Messages", component: ReadMessage, icon: <FontAwesomeIcon icon={faBookOpen} /> },
  { name: "Send Message", component: SendMessage, icon: <FontAwesomeIcon icon={faPaperPlane} /> },
  { name: "My Fonts", component: MyFonts, icon: <FontAwesomeIcon icon={faFont} /> },
  { name: "Upload New Font", component: NewFont, icon: <FontAwesomeIcon icon={faPenFancy} /> }
];

const avatarDropdownItems = [
  { name: "My Account", component: MyAccount, icon: <FontAwesomeIcon icon={faCircleUser} /> },
  { name: "Contacts", component: Contacts, icon: <FontAwesomeIcon icon={faAddressBook} /> },
  { name: "Restore my Data", component: RestoreData, icon: <FontAwesomeIcon icon={faUpload} /> },
  { name: "Export my Data", component: ExportData, icon: <FontAwesomeIcon icon={faDownload} /> }
];

const dropdownItems = [...mainDropdownItems, ...avatarDropdownItems];

const HandwrittenFonts = () => {
  const [activeItem, setActiveItem] = useState<string>("Read");
  const ActiveComponent = dropdownItems.find((item) => item.name === activeItem)?.component || ReadMessage;

  return (
    <>
      <div className="shadow-2xl navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              {mainDropdownItems.map((item, index) => (
                <li key={index}>
                  <a onClick={() => setActiveItem(item.name)} className={activeItem === item.name ? "active" : ""}>
                    {item.icon && item.icon}
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="navbar-center">
          <a className="text-xl btn btn-ghost">Handwritten Fonts</a>
        </div>

        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle">
              <div className="avatar online placeholder">
                <div className="w-10 rounded-full bg-neutral text-neutral-content">
                  <span className="text-md">Me</span>
                </div>
              </div>
            </button>

            <ul
              tabIndex={1}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              {avatarDropdownItems.map((item, index) => (
                <li key={index}>
                  <a onClick={() => setActiveItem(item.name)} className={activeItem === item.name ? "active" : ""}>
                    {item.icon && item.icon}
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ActiveComponent />
    </>
  );
};

export default HandwrittenFonts;
