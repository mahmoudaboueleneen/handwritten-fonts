// import { useState } from "react";

// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";

// function App() {
//   const [color, setColor] = useState("");

//   const onButtonClick = async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     chrome.scripting.executeScript<string[], void>({
//       target: { tabId: tab.id! },
//       args: [color],
//       func: (color) => {
//         console.log(color);
//         var elements = document.querySelectorAll("*");
//         for (var i = 0; i < elements.length; i++) {
//           (elements[i] as HTMLElement).style.setProperty("font-family", "serif", "important");
//         }
//       },
//     });
//   };

//   return (
//     <>
//       <div className="shadow-xl card w-96 bg-base-100">
//         <figure>
//           <img
//             src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
//             alt="Shoes"
//           />
//         </figure>
//         <div className="card-body">
//           <h2 className="card-title">Shoes!</h2>
//           <p>If a dog chews shoes whose shoes does he choose?</p>
//           <div className="justify-end card-actions">
//             <button className="btn btn-primary">Buy Now</button>
//           </div>
//         </div>
//       </div>
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1 className="text-3xl font-bold underline">Handwritten Fonts</h1>
//       <div className="card">
//         <input type="color" onChange={(e) => setColor(e.target.value)} />

//         <button onClick={onButtonClick}>Click Me</button>

//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
//     </>
//   );
// }

// export default App;

// ---------------------------------------------------

import { useState, useRef, ChangeEvent } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import opentype from "opentype.js";
import ImageTracer from "imagetracerjs";
import svgpath from "svgpath";

interface Letter {
  svg: string;
  imageUrl: string;
  letter: string;
}

function App() {
  const [templateImageUrl, setTemplateImageUrl] = useState<string | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [letter, setLetter] = useState<string>("");
  const cropperRef = useRef(null);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    setTemplateImageUrl(URL.createObjectURL(event.target.files[0]));
  };

  const cropImage = async () => {
    const imageElement = cropperRef?.current;
    const cropper = imageElement?.cropper;
    const croppedImage = cropper.getCroppedCanvas().toDataURL();
    ImageTracer.imageToSVG(croppedImage, (svgString: string) => {
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      setLetters([...letters, { svg: svgString, imageUrl: url, letter }]);
      setLetter("");
      cropper.reset();
    });
  };

  const svgToOpentypePath = (svgData: string) => {
    // Create a new DOM parser
    const parser = new DOMParser();

    // Parse the SVG data
    const doc = parser.parseFromString(svgData, "image/svg+xml");

    // Get the path elements
    const paths = doc.querySelectorAll("path");
    let path = new opentype.Path();
    let x = 0;
    let y = 0;

    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;

    // Scale factor (adjust this as needed)
    const scale = 1000;

    // Iterate over each path element and process its data
    paths.forEach((pathElem, i) => {
      // Get the path data
      const pathData = pathElem.getAttribute("d");

      if (!pathData) {
        return;
      }

      // Process the path data...
      let normalizedPath = svgpath(pathData).abs().toString();
      let commands = normalizedPath.match(/([a-zA-Z]|-?[0-9]+\.?[0-9]*(?:e-?[0-9]*)?)/g);
      console.log(`Commands ${i}:`, commands);

      if (!commands) {
        return;
      }

      for (let i = 0; i < commands.length; i++) {
        let command = commands[i];
        if (command === "M" || command === "L" || command === "H") {
          x = scale * +commands[++i];
          y = -scale * +commands[++i]; // Flip and scale the y-coordinate
          xMin = Math.min(xMin, x);
          xMax = Math.max(xMax, x);
          yMin = Math.min(yMin, y);
          yMax = Math.max(yMax, y);
          if (command === "M") {
            path.moveTo(x, y);
          } else {
            path.lineTo(x, y);
          }
        } else if (command === "V") {
          y = -scale * +commands[++i]; // Flip and scale the y-coordinate
          yMin = Math.min(yMin, y);
          yMax = Math.max(yMax, y);
          path.lineTo(x, y);
        } else if (command === "C") {
          let x1 = scale * +commands[++i];
          let y1 = -scale * +commands[++i]; // Flip and scale the y-coordinate
          let x2 = scale * +commands[++i];
          let y2 = -scale * +commands[++i]; // Flip and scale the y-coordinate
          x = scale * +commands[++i];
          y = -scale * +commands[++i]; // Flip and scale the y-coordinate
          xMin = Math.min(xMin, x1, x2, x);
          xMax = Math.max(xMax, x1, x2, x);
          yMin = Math.min(yMin, y1, y2, y);
          yMax = Math.max(yMax, y1, y2, y);
          path.curveTo(x1, y1, x2, y2, x, y);
        } else if (command === "Q") {
          let x1 = scale * +commands[++i];
          let y1 = -scale * +commands[++i]; // Flip and scale the y-coordinate
          x = scale * +commands[++i];
          y = -scale * +commands[++i]; // Flip and scale the y-coordinate
          xMin = Math.min(xMin, x1, x);
          xMax = Math.max(xMax, x1, x);
          yMin = Math.min(yMin, y1, y);
          yMax = Math.max(yMax, y1, y);
          path.quadraticCurveTo(x1, y1, x, y);
        } else if (command === "Z") {
          path.close();
        }
      }
    });

    return { path, xMin, xMax, yMin, yMax };
  };

  const createFont = () => {
    const glyphs = letters.map((letter, i) => {
      const pathData = letter.svg; // this is your SVG data
      // console.log(`Path Data ${i}:`, pathData); // Add this line
      const { path, xMin, xMax, yMin, yMax } = svgToOpentypePath(letter.svg);
      // console.log(`Path ${i}:`, path); // Add this line
      console.log(`xMin ${i}:`, xMin);
      console.log(`xMax ${i}:`, xMax);
      console.log(`yMin ${i}:`, yMin);
      console.log(`yMax ${i}:`, yMax);
      const glyph = new opentype.Glyph({
        name: letter.letter,
        unicode: letter.letter.charCodeAt(0),
        advanceWidth: 600,
        path: path,
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax,
      });

      console.log(`Glyph ${i}:`, glyph); // Add this line

      return glyph;
    });

    const font = new opentype.Font({
      familyName: "Handwritten",
      styleName: "Medium",
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs: glyphs,
    });

    console.log("Font:", font); // Add this line

    font.download();
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {templateImageUrl && (
        <div>
          <Cropper
            src={templateImageUrl}
            ref={cropperRef}
            style={{ height: 400, width: "100%" }}
            aspectRatio={1 / 1}
            // cropend={cropImage}
          />
          <input type="text" value={letter} onChange={(e) => setLetter(e.target.value)} />
          <button onClick={cropImage}>Assign Letter</button>
        </div>
      )}
      {letters.length > 0 &&
        letters.map((item, index) => (
          <div key={index}>
            <img src={item.imageUrl} alt={item.letter} />
            <p>{item.letter}</p>
          </div>
        ))}
      {/*letters.length === 26 &&*/ <button onClick={createFont}>Create Font</button>}
    </div>
  );
}

export default App;
