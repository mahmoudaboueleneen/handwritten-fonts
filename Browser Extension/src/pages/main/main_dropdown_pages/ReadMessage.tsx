const ReadMessage = () => {
  const onChangePageFont = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript<string[], void>({
      target: { tabId: tab.id! },
      func: () => {
        const elements = document.querySelectorAll("*");
        for (let i = 0; i < elements.length; i++) {
          (elements[i] as HTMLElement).style.setProperty("font-family", "serif", "important");
        }
      }
    });
  };

  return (
    <button className="btn btn-active btn-primary" onClick={onChangePageFont}>
      Change Font
    </button>
  );
};

export default ReadMessage;
