import { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import templateImg from 'assets/template.png';

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

      containerElement.current.style.width = `${imageElement.current.naturalWidth}px`;
      containerElement.current.style.height = `${imageElement.current.naturalHeight}px`;

      cropperRef.current = new Cropper(imageElement.current, {
        zoomable: false,
        rotatable: false,
        autoCropArea: 0.1,
        ready: function () {
          console.log('Cropper initialized');
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

    setSelectedImage(URL.createObjectURL(event.target.files[0]));
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
    const dataString = `${letter},${Math.round(cropBoxData.left)},${Math.round(
      cropBoxData.top,
    )},${Math.round(cropBoxData.width)},${Math.round(cropBoxData.height)}`;

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

  const generateFont = () => {
    /**
     * Convert the items array to the desired string format for the Java program
     * Format: "letter,x,y,w,h/letter,x,y,w,h/letter,x,y,w,h/"
     * e.g. "a,10,20,30,40/b,50,60,70,80/"
     */
    const filePath = selectedImage;

    if (!filePath) {
      return;
    }

    console.log('FILEPATH: ', filePath);

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

      <button className="btn btn-lg btn-primary" onClick={generateFont}>
        Generate Font
      </button>
    </div>
  );
};

export default FontCreation;
