/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

import { useAuth } from "../../../hooks/useAuth";
import { clearFontsFromLocalStorage, getFontsFromLocalStorage } from "../../../utils/storage/LocalStorage";
import { EmotionToFont } from "../../../types/EmotionToFont.type";

const MyFonts = () => {
  const [fonts, setFonts] = useState<EmotionToFont | null>(null);
  const [noFontsFound, setNoFontsFound] = useState<boolean>(false);
  const { selectedAccount } = useAuth();

  useEffect(() => {
    const fonts = getFontsFromLocalStorage(selectedAccount);

    if (Object.keys(fonts).length === 0) {
      setNoFontsFound(true);
      return;
    }

    setFonts(fonts);
  }, []);

  const onClearFonts = async () => {
    await clearFontsFromIPFS();
    clearFontsFromLocalStorage(selectedAccount);
  };

  // TODO: Implement this by calling the IPFS pinning service (examine its API reference)
  const clearFontsFromIPFS = async () => {};

  if (noFontsFound)
    return (
      <div className="flex flex-col items-center justify-center h-screen px-5">
        <h1 className="text-2xl font-bold text-center">No fonts found on your device</h1>
        <p className="text-center">Please upload a font file or backup your fonts.</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen px-5 space-y-5">
      <h1 className="text-2xl font-bold text-center">Your Fonts</h1>
      <ul className="space-y-5">
        {fonts &&
          Object.keys(fonts).map((emotion) => (
            <li key={emotion}>
              <span>{emotion}</span>
            </li>
          ))}
      </ul>
      <button className="btn btn-error" onClick={onClearFonts}>
        Clear Fonts
      </button>
    </div>
  );
};

export default MyFonts;
