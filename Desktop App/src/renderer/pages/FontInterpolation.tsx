import { useState, useEffect } from 'react';

import { useGeneratedFontFilePath } from '../hooks/useGeneratedFontFilePath';
import { Emotion } from '../enums/Emotion.enum';

type ButtonStatus = { [key in Emotion]: string };

const FontInterpolation = () => {
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastStatus, setToastStatus] = useState<string>('');
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>(
    Object.values(Emotion).reduce(
      (acc, curr) => ({ ...acc, [curr]: 'idle' }),
      {} as ButtonStatus,
    ),
  );

  const { generatedFontFilePath } = useGeneratedFontFilePath();

  const generateFontVariant = (emotion: Emotion) => {
    setButtonStatus((prev) => ({ ...prev, [emotion]: 'generating' }));

    const args = [
      generatedFontFilePath,
      `assets/reference_fonts/${emotion}.ttf`,
      emotion,
    ];

    window.electron.ipcRenderer.runFontForge(args);
  };

  useEffect(() => {
    const handleFontForgeOutput = (event: string, message: string) => {
      if (event.includes('Interpolated font file generated: ')) {
        console.log(event);

        const newInterpolatedFontPath = event.split(
          'Interpolated font file generated: ',
        )[1];
        setToastMessage(`New font generated at: ${newInterpolatedFontPath}`);
        setToastStatus('success');
        setShowToast(true);

        let emotion: Emotion;

        if (newInterpolatedFontPath.includes('\\')) {
          emotion = newInterpolatedFontPath
            .split('\\')
            .pop()
            ?.split('.ttf')[0] as Emotion;
        } else if (newInterpolatedFontPath.includes('/')) {
          emotion = newInterpolatedFontPath
            .split('/')
            .pop()
            ?.split('.ttf')[0] as Emotion;
        }

        setButtonStatus((prev) => ({ ...prev, [emotion]: 'done' }));

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
          We have successfully processed your font file. Now you can choose the
          flavors of your font that you want to generate.
        </span>
      </div>

      <h2>You can now generate variants of your font for each emotion.</h2>

      <div className="flex space-x-4">
        {Object.values(Emotion).map((emotion) => (
          <button
            key={emotion}
            className="w-32 btn btn-primary"
            onClick={() => generateFontVariant(emotion)}
            // disabled={buttonStatus[emotion] !== 'idle'}
          >
            {emotion}
            {buttonStatus[emotion] === 'generating' && ' - Generating...'}
            {buttonStatus[emotion] === 'done' && ' - Done'}
          </button>
        ))}
      </div>

      {showToast && (
        <div className="toast toast-end">
          <div className={`alert alert-${toastStatus}`}>
            <span className="break-all">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontInterpolation;
