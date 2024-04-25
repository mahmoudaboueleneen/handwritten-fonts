import { useState, useEffect } from 'react';

import templateImg from 'assets/template.png';
import { useNavigate } from 'react-router-dom';
import { useGeneratedFontFilePath } from '../hooks/useGeneratedFontFilePath';
import {
  TEMPLATE_IMAGE_HEIGHT,
  TEMPLATE_IMAGE_WIDTH,
} from '../../constants/TemplateImageDimensions';

const FontCreation = () => {
  const [downloadedTemplate, setDownloadedTemplate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastStatus, setToastStatus] = useState<string>('');
  const navigate = useNavigate();
  const { setGeneratedFontFilePath } = useGeneratedFontFilePath();

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = templateImg;
    link.download = 'template.png';
    link.click();
    setDownloadedTemplate(true);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];
    const filePath = file.path;

    setLoading(true);
    setLoadingMessage('Processing image...');

    window.electron.ipcRenderer.processImage(filePath);
  };

  useEffect(() => {
    const handleJavaOutput = (event: string, message: string) => {
      if (event.includes('TTF file created successfully: ')) {
        console.log(event);

        setGeneratedFontFilePath(
          event.split('TTF file created successfully: ')[1],
        );
        console.log(event.split('TTF file created successfully: ')[1]);

        navigate('/font-interpolation');
      }
    };

    const removeListener = window.electron.ipcRenderer.on(
      'java-output',
      handleJavaOutput,
    );

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    const handleJavaError = (event: string, message: string) => {
      if (event) {
        console.error(event);

        setLoading(false);
        setLoadingMessage(event);

        setToastMessage(event);
        setToastStatus('error');
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
      'java-error',
      handleJavaError,
    );

    return () => {
      removeListener();
    };
  }, []);

  if (!downloadedTemplate)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <img className="mb-10" src={templateImg} alt="Template" />
        <button className="btn btn-lg btn-success" onClick={downloadTemplate}>
          Download Template
        </button>
      </div>
    );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>{loadingMessage}</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-10">
      <div role="alert" className="shadow-lg alert w-[60%]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="w-6 h-6 stroke-info shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div className="space-y-2">
          <h1 className="mb-1 text-lg font-bold">Image format</h1>
          <p>
            Please print out the downloaded template and fill it with your
            handwriting, then scan it with a scanner or a scanning app like
            PhotoScan.
          </p>
          <div>
            <ul>
              <li>
                * Image dimensions should be{' '}
                <span className='className="text-lg font-medium text-neutral-600"'>
                  {TEMPLATE_IMAGE_WIDTH}x{TEMPLATE_IMAGE_HEIGHT}
                </span>{' '}
                pixels
              </li>
              <li>* Image should be in PNG format</li>
              <li>* Image should be cropped to the edges of the template</li>
              <li>* Image should not be skewed or rotated</li>
              <li>
                * Image should have a high contrast with clear white background
                and deep black characters (Use a black pen to fill the template
                and edit the image by increasing the contrast and decreasing
                color saturation if needed)
              </li>
            </ul>
          </div>
        </div>
      </div>

      <label className="w-full max-w-xs drop-shadow-lg form-control">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full max-w-xs file-input file-input-bordered"
        />
      </label>

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

export default FontCreation;
