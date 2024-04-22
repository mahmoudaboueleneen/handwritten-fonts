import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tesseract from 'tesseract.js';
import * as opentype from 'opentype.js';
import * as potrace from 'potrace';
import svgpath from 'svgpath';
import Jimp from 'jimp';
import { Glyph, Font } from 'opentype.js';
import { ChangeEvent } from 'react';
import fs from 'fs';
import templateImg from 'assets/template.png';
import { useGeneratedFontFilePath } from '../hooks/useGeneratedFontFilePath';

const FontCreation = () => {
  const [downloadedTemplate, setDownloadedTemplate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const navigate = useNavigate();
  const { setGeneratedFontFilePath } = useGeneratedFontFilePath();

  // Define a function to create a glyph (character shape) for a given character
  function createGlyph(char: string, pathData: string): Glyph {
    // Parse the SVG path data
    const parsedPathData = svgpath(pathData).abs();

    // Create a new opentype Path
    const path = new opentype.Path();

    // Iterate over the segments in the parsed path data
    parsedPathData.iterate((segment, index, x, y) => {
      const [command, ...args] = segment;

      switch (command) {
        case 'M':
          path.moveTo(args[0]!, args[1]!);
          break;
        case 'L':
          path.lineTo(args[0]!, args[1]!);
          break;
        case 'C':
          path.curveTo(
            args[0]!,
            args[1]!,
            args[2]!,
            args[3]!,
            args[4]!,
            args[5]!,
          );
          break;
        case 'Q':
          path.quadraticCurveTo(args[0]!, args[1]!, args[2]!, args[3]!);
          break;
        case 'Z':
          path.close();
          break;
      }
    });

    return new opentype.Glyph({
      name: char,
      unicode: char.charCodeAt(0),
      advanceWidth: 600,
      path: path,
    });
  }

  // Define a function to create a font from an array of glyphs
  function createFont(glyphs: Glyph[]): Font {
    return new opentype.Font({
      familyName: 'MyFont',
      styleName: 'Medium',
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs: glyphs,
    });
  }

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

    const generatedFont: Font =
      await window.electron.ipcRenderer.processImage(filePath);
    console.log('Generated font:', generatedFont);
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
