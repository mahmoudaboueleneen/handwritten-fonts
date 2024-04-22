import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: string, ...args: any) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: string, func: (...args: any) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: string, func: (...args: any) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    runJava: (args: string[]) => ipcRenderer.send('run-java', args),
    runFontForge: (args: string[]) => ipcRenderer.send('run-fontforge', args),
    openFileDialog: (path: string) => {
      ipcRenderer.send('open-file-dialog', path);
    },
    processImage: async (imagePath: string) => {
      return await ipcRenderer.invoke('process-image', imagePath);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
