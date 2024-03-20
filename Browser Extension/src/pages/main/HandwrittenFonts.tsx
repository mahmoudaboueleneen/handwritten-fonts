import { useState } from "react";
import SendPage from "./SendPage";

const HandwrittenFonts = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <div role="tablist" className="flex justify-center tabs tabs-boxed">
        <div role="tablist" className="tabs tabs-boxed">
          <a role="tab" className={`tab ${activeTab === 0 ? "tab-active" : ""}`} onClick={() => setActiveTab(0)}>
            Send
          </a>
          <a role="tab" className={`tab ${activeTab === 1 ? "tab-active" : ""}`} onClick={() => setActiveTab(1)}>
            Receive
          </a>
        </div>
      </div>

      {activeTab === 0 && <SendPage />}
    </>
  );
};

export default HandwrittenFonts;
