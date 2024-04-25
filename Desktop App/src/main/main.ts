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
import Jimp from 'jimp';
import sharp from 'sharp';
import log from 'electron-log';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { spawn } from 'child_process';
import { autoUpdater } from 'electron-updater';
import { homedir } from 'os';

import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { Emotion } from '../renderer/enums/Emotion.enum';
import {
  TEMPLATE_IMAGE_HEIGHT,
  TEMPLATE_IMAGE_WIDTH,
} from '../constants/TemplateImageDimensions';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('run-fontforge', (_event, arg) => {
  const handwrittenFontPath = arg[0].trim();
  const referenceFontPath = arg[1];
  const emotion = arg[2];

  // Different scripts were created for each emotion due to problems
  // with passing the interpolation percentage to the script as an argument,
  // which needs to be different for each emotion.
  const scriptPath = `src/scripts/${emotion}_interpolate_fonts.ff`;

  const outputFontPath = path.join(
    homedir(),
    'MyHandwrittenFonts',
    `${emotion}.ttf`,
  );

  if (emotion === Emotion.NEUTRAL) {
    fs.copySync(handwrittenFontPath, outputFontPath);
    return;
  }

  const command = `fontforge -script "${scriptPath}" "${handwrittenFontPath}" "${referenceFontPath}" "${outputFontPath}"`;

  const fontForgeProcess = spawn(command, { shell: true });
  console.log('Running FontForge with command:', command);

  fontForgeProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    _event.sender.send('fontforge-output', data.toString());
  });

  fontForgeProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    _event.sender.send('fontforge-error', data.toString());
  });

  fontForgeProcess.on('close', (code) => {
    console.log(`FontForge process exited with code ${code}`);
  });
});

ipcMain.handle('process-image', async (_event, imagePath) => {
  const generatedDirPath = path.resolve('temp', 'generated');
  fs.removeSync(generatedDirPath);
  fs.ensureDirSync(generatedDirPath);

  const adjustedImagePath = path.resolve(
    'temp',
    'generated',
    'adjustedImage.png',
  );

  await sharp(imagePath)
    .greyscale() // Convert to grayscale to minimize color saturation
    .normalize() // Maximize contrast
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // Make the background white
    .threshold(200) // Binarize the image
    .toFile(adjustedImagePath);
  imagePath = adjustedImagePath;

  const imageMetadata = await sharp(imagePath).metadata();

  if (
    imageMetadata.width !== TEMPLATE_IMAGE_WIDTH ||
    imageMetadata.height !== TEMPLATE_IMAGE_HEIGHT
  ) {
    const resizedImagePath = path.resolve(
      'temp',
      'generated',
      'resizedImage.png',
    );
    await sharp(imagePath)
      .resize(TEMPLATE_IMAGE_WIDTH, TEMPLATE_IMAGE_HEIGHT)
      .toFile(resizedImagePath);
    imagePath = resizedImagePath;
  }

  /**
   * A list of regions in the image where we expect to find characters.
   * This assumes that the selected image has no space around the actual
   * grid containing the characters. Any additional whitespace around the
   * grid will make the coordinates of the regions incorrect.
   */
  const characterRegions = [
    // Top row (big cells)
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

    // Second row (big cells)
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

    // Third row (big cells)
    { top: 230, left: 10, width: 60, height: 60, expectedChar: 'w' },
    { top: 230, left: 80, width: 60, height: 60, expectedChar: 'x' },
    { top: 230, left: 160, width: 60, height: 60, expectedChar: 'y' },
    { top: 230, left: 230, width: 60, height: 60, expectedChar: 'z' },
  ];

  let xOffset = 0;
  let fontasticData = '';
  // TODO: Find a better way to define the image width and height
  let newImage = new Jimp(2000, 400, 0xffffffff); // Create a big enough new empty image with white background to add the cropped characters to

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

    const image = await Jimp.read(croppedImageBuffer);
    image.autocrop(); // Autocrop the image to remove any whitespace around the character

    newImage.composite(image, xOffset, 0);

    const croppedImagePath = path.resolve(
      generatedDirPath,
      `${region.expectedChar}.png`,
    );
    image.write(croppedImagePath);

    fontasticData += `${region.expectedChar},${xOffset},0,${image.bitmap.width},${image.bitmap.height}/`;

    xOffset += image.bitmap.width;
  }

  const newImagePath = path.resolve('temp', 'generated', 'newImage.png');

  newImage.write(newImagePath);

  let javaCmd = 'java';
  let javaArgs = [
    '-jar',
    'src/java/target/handwritten-fonts-1.0-SNAPSHOT-jar-with-dependencies.jar',
    fontasticData,
    newImagePath,
  ];

  let javaProcess = spawn(javaCmd, javaArgs);

  javaProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    _event.sender.send('java-output', data.toString());
  });

  javaProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    _event.sender.send('java-error', data.toString());
  });

  javaProcess.on('close', (code) => {
    console.log(`Java process exited with code ${code}`);
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
