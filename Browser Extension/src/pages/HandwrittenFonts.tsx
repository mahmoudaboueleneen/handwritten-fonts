import { useState } from "react";
import Upload from "./Upload";

const HandwrittenFonts = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      name: "Tab 1",
      content: <Upload />
    },
    {
      name: "Tab 2",
      content: "Tab content 2"
    },
    {
      name: "Tab 3",
      content: "Tab content 3"
    }
  ];

  return (
    <div role="tablist" className="flex tabs tabs-boxed">
      <div role="tablist" className="tabs tabs-boxed">
        <a role="tab" className={`tab ${activeTab === 0 ? "tab-active" : ""}`} onClick={() => setActiveTab(0)}>
          Tab 1
        </a>
        <a role="tab" className={`tab ${activeTab === 1 ? "tab-active" : ""}`} onClick={() => setActiveTab(1)}>
          Tab 2
        </a>
        <a role="tab" className={`tab ${activeTab === 2 ? "tab-active" : ""}`} onClick={() => setActiveTab(2)}>
          Tab 3
        </a>
      </div>
    </div>
  );
};

export default HandwrittenFonts;
