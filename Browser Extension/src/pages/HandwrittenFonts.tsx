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
    <div role="tablist" className="tabs tabs-bordered">
      {tabs.map((tab, index) => (
        <>
          <input
            key={index}
            type="radio"
            name="my_tabs_1"
            role="tab"
            className="tab"
            aria-label={tab.name}
            checked={activeTab === index}
            onChange={() => setActiveTab(index)}
          />
          <div role="tabpanel" className="p-10 tab-content">
            {tab.content}
          </div>
        </>
      ))}
    </div>
  );
};

export default HandwrittenFonts;
