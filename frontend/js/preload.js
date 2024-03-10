const contextBridge = require("electron").contextBridge;
const ipcRenderer = require("electron").ipcRenderer;

contextBridge.exposeInMainWorld("electron", {
  runJava: (args) => ipcRenderer.send("run-java", args),
  selectImage: () => ipcRenderer.send("open-file-dialog"),
  on: (channel, func) => ipcRenderer.on(channel, func),
});
