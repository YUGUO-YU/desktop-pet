const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getDesktopPath: () => ipcRenderer.invoke('get-desktop-path'),
  readDir: (p) => ipcRenderer.invoke('read-dir', p),
  moveFile: (s, d) => ipcRenderer.invoke('move-file', s, d),
  createFolder: (p) => ipcRenderer.invoke('create-folder', p),
  openPath: (p) => ipcRenderer.invoke('open-path', p),
  showItemInFolder: (p) => ipcRenderer.invoke('show-item-in-folder', p),
  openExternal: (u) => ipcRenderer.invoke('open-external', u),
  fetchIP: () => ipcRenderer.invoke('fetch-ip'),
  fetchWeather: (c) => ipcRenderer.invoke('fetch-weather', c),
  hideWindow: () => ipcRenderer.send('hide-window'),
  showWindow: () => ipcRenderer.send('show-window'),
  quitApp: () => ipcRenderer.send('quit-app'),
});