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
import fs from 'fs-extra';
import svgtofont from 'svgtofont';
import Jimp from 'jimp';
import { parseSVG } from 'svg-path-parser';
import svgPathBounds from 'svg-path-bounds';
import { createWorker } from 'tesseract.js';
import { PSM } from 'tesseract.js';
import sharp from 'sharp';
import potrace from 'potrace';
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

  const outputFontPath = path.join(
    homedir(),
    'MyHandwrittenFonts',
    `${emotion}.ttf`,
  );

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

ipcMain.handle('process-image', async (_event, imagePath) => {
  // Preprocess the image
  // const preprocessedImagePath = './temp/preprocessed/preprocessed.png';
  // await sharp(imagePath).toFile(preprocessedImagePath);

  const characterData: Record<string, any> = {};

  /**
   * A list of regions in the image where we expect to find characters.
   * This assumes that the selected image has no space around the actual
   * grid containing the characters. Any additional whitespace around the
   * grid will make the coordinates of the regions incorrect.
   */
  const characterRegions = [
    // Top row (big boxes)
    { top: 30, left: 10, width: 60, height: 60, expectedChar: 'a' },
    { top: 30, left: 80, width: 60, height: 60, expectedChar: 'b' },
    { top: 30, left: 160, width: 60, height: 60, expectedChar: 'c' },
    { top: 30, left: 230, width: 60, height: 60, expectedChar: 'd' },
    { top: 30, left: 310, width: 60, height: 60, expectedChar: 'e' },
    { top: 30, left: 390, width: 60, height: 60, expectedChar: 'f' },
    { top: 30, left: 460, width: 60, height: 60, expectedChar: 'g' },
    { top: 30, left: 540, width: 60, height: 60, expectedChar: 'h' },
    { top: 30, left: 610, width: 60, height: 60, expectedChar: 'i' },
    { top: 30, left: 690, width: 60, height: 60, expectedChar: 'j' },
    { top: 30, left: 770, width: 60, height: 60, expectedChar: 'k' },

    // Second row (big box)
    { top: 130, left: 10, width: 60, height: 60, expectedChar: 'l' },
    { top: 130, left: 80, width: 60, height: 60, expectedChar: 'm' },
    { top: 130, left: 160, width: 60, height: 60, expectedChar: 'n' },
    { top: 130, left: 230, width: 60, height: 60, expectedChar: 'o' },
    { top: 130, left: 310, width: 60, height: 60, expectedChar: 'p' },
    { top: 130, left: 390, width: 60, height: 60, expectedChar: 'q' },
    { top: 130, left: 460, width: 60, height: 60, expectedChar: 'r' },
    { top: 130, left: 540, width: 60, height: 60, expectedChar: 's' },
    { top: 130, left: 610, width: 60, height: 60, expectedChar: 't' },
    { top: 130, left: 690, width: 60, height: 60, expectedChar: 'u' },
    { top: 130, left: 770, width: 60, height: 60, expectedChar: 'v' },

    // Fourth row (big box)
    { top: 230, left: 10, width: 60, height: 60, expectedChar: 'w' },
    { top: 230, left: 80, width: 60, height: 60, expectedChar: 'x' },
    { top: 230, left: 160, width: 60, height: 60, expectedChar: 'y' },
    { top: 230, left: 230, width: 60, height: 60, expectedChar: 'z' },
  ];

  // Use Tesseract to recognize text from preprocessed image
  // await (async () => {
  //   const worker = await createWorker('eng', 1);

  //   const processCharacter = (result: any) => {
  //     result.data.words.forEach((word: any) => {
  //       word.symbols.forEach((symbol: any) => {
  //         if (/[a-z]/i.test(symbol.text)) {
  //           // Only process alphabetic characters
  //           characterData[symbol.text.toLowerCase()] = symbol.bbox; // Store the bounding box data for each character
  //         }
  //       });
  //     });
  //   };

  //   await worker.setParameters({
  //     tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyz',
  //   });

  //   for (const region of characterRegions) {
  //     await worker.setParameters({
  //       tessedit_char_whitelist: region.expectedChar,
  //       tessedit_pageseg_mode: PSM.SINGLE_CHAR,
  //     });

  //     const result = await worker.recognize(preprocessedImagePath, {
  //       rectangle: region,
  //     });

  //     console.log('Recognized text:', result.data.text);

  //     processCharacter(result);
  //   }
  // })();

  console.log('Character data:', characterData);

  const svgsDirPath = path.resolve('temp', 'svgs');
  fs.removeSync(svgsDirPath);
  fs.ensureDirSync(svgsDirPath);

  const generatedDirPath = path.resolve('temp', 'generated');
  fs.removeSync(generatedDirPath);
  fs.ensureDirSync(generatedDirPath);

  // const preprocessedDirPath = path.resolve('temp', 'preprocessed');
  // fs.removeSync(preprocessedDirPath);
  // fs.ensureDirSync(preprocessedDirPath);

  // Create SVGs for each character
  for (const region of characterRegions) {
    const croppedImageBuffer = await sharp(imagePath)
      .extract({
        left: region.left,
        top: region.top,
        width: region.width,
        height: region.height,
      })
      .png()
      .toBuffer();

    // Load the image with Jimp
    const image = await Jimp.read(croppedImageBuffer);

    // Autocrop the image
    image.autocrop();

    // Get the buffer of the cropped image
    const croppedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

    potrace.trace(croppedBuffer, (error, svgContent) => {
      if (error) {
        console.error('Error tracing image:', error);
        return;
      }

      characterData[region.expectedChar] = svgContent;
    });
  }

  for (const [char, svgContent] of Object.entries(characterData)) {
    fs.writeFileSync(`${svgsDirPath}/${char}.svg`, svgContent);
  }

  svgtofont({
    src: path.resolve(process.cwd(), 'temp/svgs'),
    dist: path.resolve(process.cwd(), 'temp/generated'),
    fontName: 'MyFont',
    css: false,
    startUnicode: 0x61, // start character mapping at 'a'
    svgicons2svgfont: {
      fontHeight: 1000,
      // normalize: true,
    },
  }).then(() => {
    console.log('done!');
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
