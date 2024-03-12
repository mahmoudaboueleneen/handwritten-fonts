const characters = {
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
};

let cropper;
let filePath;

document.addEventListener("DOMContentLoaded", (event) => {
  window.electron.on("selected-file", (event, path) => {
    const image = document.getElementById("selected-image");
    image.src = "file://" + path;

    filePath = path;

    // Initialize Cropper.js on the image after it's loaded
    image.onload = () => {
      console.log("Image loaded");
      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        zoomable: false,
        rotatable: false,
        autoCropArea: 0.1,
        viewMode: 1,
        ready: function () {
          console.log("Cropper initialized");
        },
        cropend: function () {
          handleCropEnd(cropper);
        },
      });
    };
  });
});

const contextMenu = document.getElementById("contextMenu");
const dropdownMenuButton = new bootstrap.Dropdown(contextMenu);

function handleCropEnd(passedCropper) {
  console.log(passedCropper);

  const cropBoxData = passedCropper.getCropBoxData();

  contextMenu.style.position = "absolute";
  contextMenu.style.left = `${cropBoxData.left + cropBoxData.width}px`;
  contextMenu.style.top = `${cropBoxData.top + cropBoxData.height}px`;

  dropdownMenuButton.show();

  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", function () {
      const cropBoxData = passedCropper.getCropBoxData();
      const letter = this.textContent;
      const dataString = `${letter},${Math.round(cropBoxData.left)},${Math.round(
        cropBoxData.top
      )},${Math.round(cropBoxData.width)},${Math.round(cropBoxData.height)}`;
      characters[letter] = dataString;
      console.log(characters);
      dropdownMenuButton.hide();
    });
  });
}

document.getElementById("runJavaButton").addEventListener("click", () => {
  /**
   * Convert the items array to the desired string format for the Java program
   * Format: "letter,x,y,w,h/letter,x,y,w,h/letter,x,y,w,h/"
   * e.g. "a,10,20,30,40/b,50,60,70,80/"
   */
  let fontData =
    Object.values(characters)
      .filter((value) => value !== null)
      .join("/") + "/";

  const args = [fontData, filePath];
  window.electron.runJava(args);
});
