import { useState, useEffect } from 'react';

import { useGeneratedFontFilePath } from '../hooks/useGeneratedFontFilePath';
import { Emotion } from '../enums/Emotion.enum';
import { IpcRendererEvent } from 'electron';

const FontInterpolation = () => {
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const { generatedFontFilePath } = useGeneratedFontFilePath();

  const generateFontVariant = (emotion: Emotion) => {
    const args = [
      generatedFontFilePath,
      `assets/reference_fonts/${emotion}.ttf`,
      emotion,
    ];

    window.electron.ipcRenderer.runFontForge(args);
  };

  useEffect(() => {
    const handleFontForgeOutput = (event: IpcRendererEvent, _data: string) => {
      if (event) {
        const newInterpolatedFontPath = event;
        setToastMessage(`New font generated at: ${newInterpolatedFontPath}`);
        setShowToast(true);

        const timeoutId = setTimeout(() => {
          setShowToast(false);
        }, 2000);

        return () => {
          clearTimeout(timeoutId);
        };
      }
    };

    const removeListener = window.electron.ipcRenderer.on(
      'fontforge-output',
      handleFontForgeOutput,
    );

    return () => {
      removeListener();
      setShowToast(false);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-5">
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

      <h2>You can now generate variants of your font for each emotion.</h2>

      <div className="flex space-x-4">
        {Object.values(Emotion).map((emotion) => (
          <button
            key={emotion}
            className="w-32 btn btn-primary"
            onClick={() => generateFontVariant(emotion)}
          >
            {emotion}
          </button>
        ))}
      </div>

      {showToast && (
        <div className="toast toast-end">
          <div className="alert alert-success">
            <span className="break-all">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontInterpolation;
