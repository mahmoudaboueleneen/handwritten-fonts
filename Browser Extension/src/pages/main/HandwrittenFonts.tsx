import { useState } from "react";
import NewFontTab from "../../components/NewFontTab";
import MyFontsTab from "../../components/MyFontsTab";
import SendTab from "../../components/SendTab";
import ReadTab from "../../components/ReadTab";

const tabs = [
  { name: "Read", component: ReadTab },
  { name: "Send", component: SendTab },
  { name: "My Fonts", component: MyFontsTab },
  { name: "New Font", component: NewFontTab }
];

const HandwrittenFonts = () => {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = tabs[activeTab].component;

  return (
    <>
      <div role="tablist" className="sticky top-0 flex justify-center tabs tabs-boxed">
        <div role="tablist" className="tabs tabs-boxed">
          {tabs.map((tab, index) => (
            <a
              key={index}
              role="tab"
              className={`tab ${activeTab === index ? "tab-active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.name}
            </a>
          ))}
        </div>
      </div>

      <ActiveComponent />
    </>
  );
};

export default HandwrittenFonts;