const app = require("electron").app;
const BrowserWindow = require("electron").BrowserWindow;
const ipcMain = require("electron").ipcMain;
const dialog = require("electron").dialog;
const path = require("path");
const { spawn } = require("child_process");

let win;

const createWindow = () => {
  win = new BrowserWindow({
    show: false,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "frontend", "js", "preload.js"),
      contextIsolation: true, // This should be true for security reasons
      enableRemoteModule: false, // This should be false for security reasons
    },
  });

  win.loadFile("frontend/index.html");
  win.maximize();
  win.show();
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("run-java", (event, arg) => {
  let javaCmd = "java";
  let javaArgs = ["-jar", "backend/target/handwritten-fonts-1.0-SNAPSHOT.jar", ...arg];

  let javaProcess = spawn(javaCmd, javaArgs);

  javaProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  javaProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  javaProcess.on("close", (code) => {
    console.log(`Java process exited with code ${code}`);
  });
});

ipcMain.on("open-file-dialog", (event) => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["jpg", "png"] }],
    })
    .then((result) => {
      if (!result.canceled) {
        win.loadFile("frontend/edit.html");
        win.webContents.on("did-finish-load", () => {
          win.webContents.send("selected-file", result.filePaths[0]);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});