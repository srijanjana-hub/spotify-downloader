const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  downloadPlaylist: (data) => ipcRenderer.invoke('download-playlist', data),
  onProgressUpdate: (callback) => ipcRenderer.on('progress-update', (event, data) => callback(data)),
  removeProgressListener: () => ipcRenderer.removeAllListeners('progress-update')
});
