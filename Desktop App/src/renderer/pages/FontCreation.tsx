import { useState, useRef, useEffect } from 'react';
import { IpcRendererEvent } from 'electron';
import { useNavigate } from 'react-router-dom';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import templateImg from 'assets/template.png';
import { useGeneratedFontFilePath } from '../hooks/useGeneratedFontFilePath';

const FontCreation = () => {
  const [characters, setCharacters] = useState<Record<string, string | null>>({
    a: null,
    b: null,
    c: null,
    d: null,
    e: null,
    f: null,
    g: null,
    h: null,
    i: null,
    j: null,
    k: null,
    l: null,
    m: null,
    n: null,
    o: null,
    p: null,
    q: null,
    r: null,
    s: null,
    t: null,
    u: null,
    v: null,
    w: null,
    x: null,
    y: null,
    z: null,
  });
  const [downloadedTemplate, setDownloadedTemplate] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImagePath, setSelectedImagePath] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [scaleFactorWidth, setScaleFactorWidth] = useState<number>(1);
  const [scaleFactorHeight, setScaleFactorHeight] = useState<number>(1);
  const navigate = useNavigate();
  const { setGeneratedFontFilePath } = useGeneratedFontFilePath();

  const imageElement = useRef<HTMLImageElement | null>(null);
  const containerElement = useRef<HTMLDivElement | null>(null);
  const dropdownElement = useRef<HTMLDivElement | null>(null);
  const dropdownContentElement = useRef<HTMLUListElement | null>(null);

  const cropperRef = useRef<Cropper | null>(null);

  useEffect(() => {
    if (!imageElement.current || !containerElement.current || !selectedImage) {
      return;
    }

    imageElement.current.onload = () => {
      if (!imageElement.current || !containerElement.current) {
        return;
      }

      // Calculate the aspect ratio of the image
      const aspectRatio =
        imageElement.current.naturalWidth / imageElement.current.naturalHeight;

      // Determine the maximum size for the image
      const maxWidth = 1000;
      const maxHeight = 800;

      let width, height;

      // Adjust the width and height based on the aspect ratio
      if (aspectRatio > 1) {
        // If the image is wider than it is tall
        width =
          imageElement.current.naturalWidth > maxWidth
            ? maxWidth
            : imageElement.current.naturalWidth;
        height = width / aspectRatio;
      } else {
        // If the image is taller than it is wide
        height =
          imageElement.current.naturalHeight > maxHeight
            ? maxHeight
            : imageElement.current.naturalHeight;
        width = height * aspectRatio;
      }

      // Set the size of the image and the container
      imageElement.current.style.width = `${width}px`;
      imageElement.current.style.height = `${height}px`;
      containerElement.current.style.width = `${width}px`;
      containerElement.current.style.height = `${height}px`;

      // Calculate the scale factor for the image based on the original size and the displayed size
      // so that the coordinates of the crop box can be converted to coordinates based on the original image size
      setScaleFactorWidth(imageElement.current.naturalWidth / width);
      setScaleFactorHeight(imageElement.current.naturalHeight / height);

      cropperRef.current = new Cropper(imageElement.current, {
        zoomable: false,
        rotatable: false,
        autoCropArea: 0.05,
        ready: function () {
          console.log('Cropper initialized');
          const cropBox = document.querySelector('.cropper-crop-box');
          if (cropBox) {
            cropBox.classList.add('baseline-indicator', 'meanline-indicator');
          }
        },
        cropmove: function () {
          if (!cropperRef.current) {
            return;
          }
          console.log(cropperRef.current.getCropBoxData());
        },
        crop: function () {
          if (!cropperRef.current) {
            return;
          }
          handleCrop(cropperRef.current);
        },
      });
    };
  }, [selectedImage]);

  useEffect(() => {
    const handleJavaOutput = (event: IpcRendererEvent, data: string) => {
      console.log('EVENT', event);
      console.log('DATA', data);
      if (
        event &&
        event.toString().includes('TTF file created successfully:')
      ) {
        const path = event.toString().split(': ')[1];
        setGeneratedFontFilePath(path);
        console.log('Font file path:', path);

        setLoading(false);
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

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = templateImg;
    link.download = 'template.png';
    link.click();
    setDownloadedTemplate(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    const filePath = file.path;
    setSelectedImagePath(filePath);
  };

  const handleCrop = (cropper: Cropper) => {
    if (
      !cropper ||
      !dropdownElement.current ||
      !dropdownContentElement.current
    ) {
      return;
    }

    const cropBoxData = cropper.getCropBoxData();

    dropdownElement.current.style.position = 'absolute';
    dropdownElement.current.style.left = `${
      cropBoxData.left + cropBoxData.width
    }px`;
    dropdownElement.current.style.top = `${
      cropBoxData.top + cropBoxData.height
    }px`;

    dropdownContentElement.current.style.opacity = '1';
    dropdownContentElement.current.style.visibility = 'visible';
  };

  const handleLetterSelection = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (
      !cropperRef.current ||
      !dropdownElement.current ||
      !dropdownContentElement.current
    ) {
      return;
    }

    const cropBoxData = cropperRef.current.getCropBoxData();
    const letter = event.currentTarget.innerText;

    // Adjust the coordinates using the scale factors
    const dataString = `${letter},${Math.round(
      cropBoxData.left * scaleFactorWidth,
    )},${Math.round(cropBoxData.top * scaleFactorHeight)},${Math.round(
      cropBoxData.width * scaleFactorWidth,
    )},${Math.round(cropBoxData.height * scaleFactorHeight)}`;

    setCharacters((prevState) => ({
      ...prevState,
      [letter]: dataString,
    }));

    dropdownContentElement.current.style.opacity = '0';
    dropdownContentElement.current.style.visibility = 'hidden';
  };

  useEffect(() => {
    console.log(characters);
  }, [characters]);

  const generateHandwrittenFont = () => {
    setLoading(true);

    /**
     * Convert the items array to the desired string format for the Java program
     * Format: "letter,x,y,w,h/letter,x,y,w,h/letter,x,y,w,h/"
     * e.g. "a,10,20,30,40/b,50,60,70,80/"
     */

    if (!selectedImage) {
      return;
    }

    const filePath = selectedImagePath;

    if (!filePath) {
      return;
    }

    let fontData =
      Object.values(characters)
        .filter((value) => value !== null)
        .join('/') + '/';

    const args = [fontData, filePath];
    window.electron.ipcRenderer.runJava(args);
  };

  if (!downloadedTemplate)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <img className="mb-10" src={templateImg} alt="Template" />
        <button className="btn btn-lg btn-success" onClick={downloadTemplate}>
          Download Template
        </button>
      </div>
    );

  if (!selectedImage)
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

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-10">
      {selectedImage && (
        <div ref={containerElement} className="relative">
          <img
            ref={imageElement}
            src={selectedImage}
            alt="Font Template Image"
          />

          <div ref={dropdownElement} className="dropdown">
            <ul
              ref={dropdownContentElement}
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {Object.keys(characters).map((letter) => (
                <li key={letter}>
                  <a
                    className="flex items-center"
                    onClick={handleLetterSelection}
                  >
                    {letter}

                    {characters[letter] && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                      </svg>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button
        className="btn btn-lg btn-primary"
        onClick={generateHandwrittenFont}
        disabled={loading}
      >
        {loading ? 'Generating Font...' : 'Generate Font'}
      </button>
    </div>
  );
};

export default FontCreation;
