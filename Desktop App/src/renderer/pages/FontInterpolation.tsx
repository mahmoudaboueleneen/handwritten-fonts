import { useState, useEffect } from 'react';

const FontInterpolation = () => {
  const generateFontVariants = () => {
    //window.electron.ipcRenderer.runFontForge();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1>Your font has been generated at:</h1>

      <h2>Available variants of your font:</h2>

      <button>Generate Variants</button>
    </div>
  );
};

export default FontInterpolation;
