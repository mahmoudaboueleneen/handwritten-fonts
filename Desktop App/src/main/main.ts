/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { spawn } from 'child_process';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { homedir } from 'os';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('run-java', (_event, arg) => {
  let javaCmd = 'java';
  let javaArgs = [
    '-jar',
    'src/java/target/handwritten-fonts-1.0-SNAPSHOT-jar-with-dependencies.jar',
    ...arg,
  ];

  let javaProcess = spawn(javaCmd, javaArgs);

  javaProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    _event.sender.send('java-output', data.toString());
  });

  javaProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  javaProcess.on('close', (code) => {
    console.log(`Java process exited with code ${code}`);
  });
});

ipcMain.on('run-fontforge', (_event, arg) => {
  const scriptPath = 'src/scripts/interpolate_fonts.ff';

  arg = arg.map((a: string) => a.trim()); // Remove leading/trailing whitespace or newlines

  const handwrittenFontPath = arg[0];
  const referenceFontPath = arg[1];
  const emotion = arg[2];

  const outputFontPath = homedir() + `MyHandwrittenFonts/${emotion}.ttf`;

  const command = `fontforge -script "${scriptPath}" "${handwrittenFontPath}" "${referenceFontPath}" "${outputFontPath}"`;

  const fontForgeProcess = spawn(command, { shell: true });
  console.log('Running FontForge with command:', command);

  fontForgeProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  fontForgeProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    _event.sender.send('fontforge-output', data.toString());
  });

  fontForgeProcess.on('close', (code) => {
    console.log(`FontForge process exited with code ${code}`);
  });
});

ipcMain.on('open-file-dialog', (event, path) => {
  dialog
    .showOpenDialog({
      defaultPath: path,
      properties: ['openDirectory'],
    })
    .then((result) => {
      if (!result.canceled) {
        event.sender.send('selected-directory', result.filePaths);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.maximize();

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
  menuBuilder.hideMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
