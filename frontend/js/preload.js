const contextBridge = require("electron").contextBridge;
const ipcRenderer = require("electron").ipcRenderer;

contextBridge.exposeInMainWorld("electron", {
  runJava: (args) => ipcRenderer.send("run-java", args),
});
