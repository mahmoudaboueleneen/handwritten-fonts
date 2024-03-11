const characters = {
  a: {},
  b: {},
  c: {},
  d: {},
  e: {},
  f: {},
  g: {},
  h: {},
  i: {},
  j: {},
  k: {},
  l: {},
  m: {},
  n: {},
  o: {},
  p: {},
  q: {},
  r: {},
  s: {},
  t: {},
  u: {},
  v: {},
  w: {},
  x: {},
  y: {},
  z: {},
};

document.addEventListener("DOMContentLoaded", (event) => {
  window.electron.on("selected-file", (event, path) => {
    const image = document.getElementById("selected-image");
    image.src = "file://" + path;

    // Initialize Cropper.js on the image after it's loaded
    image.onload = () => {
      const cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        zoomable: false,
        rotatable: false,
        autoCropArea: 0.1,
        viewMode: 1,
      });
    };

    cropper.on("cropend", () => {
      const cropBoxData = cropper.getCropBoxData();
      const contextMenu = document.getElementById("contextMenu");
      contextMenu.style.position = "absolute";
      contextMenu.style.left = `${cropBoxData.left + cropBoxData.width}px`;
      contextMenu.style.top = `${cropBoxData.top + cropBoxData.height}px`;
      var dropdownMenuButton = new bootstrap.Dropdown(contextMenu);
      dropdownMenuButton.show();
    });
  });

  // Save the user's selection when a dropdown item is clicked
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", function () {
      const cropBoxData = cropper.getCropBoxData();
      const letter = this.textContent;
      const dataString = `${letter},${cropBoxData.left},${cropBoxData.top},${cropBoxData.width},${cropBoxData.height}`;
      characters[letter] = dataString;
    });
  });
});

// Convert the items array to the desired string format
// e.g. "a,10,20,30,40/b,50,60,70,80/"
// var fontData = items
//   .map((item) => `${item.letter},${item.x},${item.y},${item.w},${item.h}`)
//   .join("/");

// Add a trailing slash
fontData += "/";

document.getElementById("runJavaButton").addEventListener("click", () => {
  let args = ["arg1", "arg2", "arg3"];
  window.electron.runJava(args);
});
