import { useState } from "react";

function App() {
  const [color, setColor] = useState("");

  const onButtonClick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript<string[], void>({
      target: { tabId: tab.id! },
      args: [color],
      func: (color) => {
        console.log(color);
        const elements = document.querySelectorAll("*");
        for (let i = 0; i < elements.length; i++) {
          (elements[i] as HTMLElement).style.setProperty("font-family", "serif", "important");
        }
      },
    });
  };

  return (
    <>
      <div className="shadow-xl card w-96 bg-base-100">
        <figure>
          <img
            src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
            alt="Shoes"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">Shoes!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="justify-end card-actions">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-bold underline">Handwritten Fonts</h1>
      <div className="card">
        <input type="color" onChange={(e) => setColor(e.target.value)} />

        <button onClick={onButtonClick}>Click Me</button>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
