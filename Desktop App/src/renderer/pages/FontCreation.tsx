import { useState, useEffect } from 'react';

import templateImg from 'assets/template.png';
import { useNavigate } from 'react-router-dom';
import { useGeneratedFontFilePath } from '../hooks/useGeneratedFontFilePath';

const FontCreation = () => {
  const [downloadedTemplate, setDownloadedTemplate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
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

        setLoading(false);
        setLoadingMessage('');
      }
    };
    window.electron.ipcRenderer.on('java-output', handleJavaOutput);
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
    <div className="flex flex-col items-center justify-center h-full">
      <label className="w-full max-w-xs form-control">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full max-w-xs file-input file-input-bordered"
        />
      </label>
    </div>
  );
};

export default FontCreation;
