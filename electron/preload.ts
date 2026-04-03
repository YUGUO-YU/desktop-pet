import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件系统
  readDir: (dirPath: string) => ipcRenderer.invoke('read-dir', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  getDesktopPath: () => ipcRenderer.invoke('get-desktop-path'),
  
  // 文件操作
  moveFile: (src: string, dest: string) => ipcRenderer.invoke('move-file', src, dest),
  createFolder: (folderPath: string) => ipcRenderer.invoke('create-folder', folderPath),
  
  // 系统操作
  openPath: (filePath: string) => ipcRenderer.invoke('open-path', filePath),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  showItemInFolder: (filePath: string) => ipcRenderer.invoke('show-item-in-folder', filePath),
  
  // 网络
  fetchIP: () => ipcRenderer.invoke('fetch-ip'),
  fetchWeather: (city: string) => ipcRenderer.invoke('fetch-weather', city),
  
  // 日志
  log: (message: string) => console.log('[Renderer]', message)
})

console.log('✅ Preload 脚本已加载')