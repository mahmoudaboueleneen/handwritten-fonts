import { useState, useEffect } from 'react';

import { useGeneratedFontFilePath } from '../hooks/useGeneratedFontFilePath';

const FontInterpolation = () => {
  const { generatedFontFilePath } = useGeneratedFontFilePath();

  const generateFontVariants = () => {
    const args = [
      generatedFontFilePath,
      'assets/fonts/Begok.ttf',
      'assets/output_fonts/my_interpolated_font.ttf',
    ];

    window.electron.ipcRenderer.runFontForge(args);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl">Success!</h1>

      <div role="alert" className="alert alert-success max-w-96">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 stroke-current shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          Your font file has been generated at:{' '}
          <span className="break-all">{generatedFontFilePath}</span>
        </span>
      </div>

      <h2>Available variants of your font:</h2>

      <button className="btn btn-primary" onClick={generateFontVariants}>
        Generate Variants
      </button>
    </div>
  );
};

export default FontInterpolation;
