import { app, BrowserWindow } from "electron";

const createWindow = () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
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
