const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { startBackendServer } = require('./backend/server');

let mainWindow;
let backendServer;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Handle folder selection dialog
ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return null;

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Download Folder',
      buttonLabel: 'Select'
    });

    return result.canceled ? null : result.filePaths[0];
  } catch (error) {
    console.error('Folder selection error:', error);
    return null;
  }
});

// Handle playlist download request
ipcMain.handle('download-playlist', async (event, { playlistUrl, downloadPath, spotifyToken }) => {
  try {
    const response = await fetch('http://localhost:3001/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playlistUrl,
        downloadPath,
        spotifyToken
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
});

// Handle progress updates
ipcMain.on('download-progress', (event, data) => {
  if (mainWindow) {
    mainWindow.webContents.send('progress-update', data);
  }
});

// App lifecycle
app.on('ready', async () => {
  // Start backend server
  backendServer = await startBackendServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app termination
process.on('SIGINT', () => {
  if (backendServer) {
    backendServer.close();
  }
  app.quit();
});

module.exports = { mainWindow };
