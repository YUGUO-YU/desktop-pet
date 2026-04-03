const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

console.log('🚀 应用启动中...');

let mainWindow = null;
let tray = null;
const isDev = !app.isPackaged;

// 创建托盘
function createTray() {
  try {
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dist = Math.sqrt(Math.pow(x - size/2, 2) + Math.pow(y - size/2, 2));
        if (dist < size/2 - 1) {
          buffer[idx] = 99; buffer[idx+1] = 102; buffer[idx+2] = 241; buffer[idx+3] = 255;
        } else { buffer[idx+3] = 0; }
      }
    }
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    tray = new Tray(icon);
    tray.setToolTip('桌面精灵');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '显示', click: () => mainWindow?.show() },
      { label: '隐藏', click: () => mainWindow?.hide() },
      { label: '退出', click: () => app.quit() }
    ]));
    tray.on('click', () => mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show());
    console.log('✅ 托盘创建成功');
  } catch (e) { console.error('❌ 托盘失败:', e); }
}

// 获取桌面路径
function getDesktopPath() { 
  return app.getPath('desktop'); 
}

// 读取目录
function readDir(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    const result = files.map(function(f) {
      const full = path.join(dirPath, f);
      const st = fs.statSync(full);
      return { name: f, path: full, isDirectory: st.isDirectory(), size: st.size, modified: st.mtime.toISOString() };
    });
    return { success: true, files: result };
  } catch (e) { 
    return { success: false, error: e.message }; 
  }
}

// 移动文件
function moveFile(src, dest) {
  try {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.renameSync(src, dest);
    return { success: true };
  } catch (e) { 
    return { success: false, error: e.message }; 
  }
}

// 创建文件夹
function createFolder(folderPath) {
  try { 
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    return { success: true };
  } catch (e) { 
    return { success: false, error: e.message }; 
  }
}

// 打开路径
function openPath(filePath) { 
  try { 
    shell.openPath(filePath); 
    return { success: true }; 
  } catch (e) { 
    return { success: false, error: e.message }; 
  }
}

// 在文件夹中显示
function showItemInFolder(filePath) { 
  try { 
    shell.showItemInFolder(filePath); 
    return { success: true }; 
  } catch (e) { 
    return { success: false, error: e.message }; 
  }
}

// 打开外部链接
function openExternal(url) { 
  try { 
    shell.openExternal(url); 
    return { success: true }; 
  } catch (e) { 
    return { success: false, error: e.message }; 
  }
}

// HTTP 请求
function httpRequest(url) {
  return new Promise(function(resolve, reject) {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, function(res) {
      let d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() { resolve(d); });
    });
    req.on('error', reject);
    req.setTimeout(10000, function() { req.destroy(); reject(new Error('timeout')); });
  });
}

// 获取 IP
async function fetchIP() {
  try { 
    const data = await httpRequest('https://ipapi.co/json/'); 
    const j = JSON.parse(data); 
    return { success: true, ip: j.ip, city: j.city || j.region }; 
  } catch (e) { 
    return { success: false, error: e.message }; 
  }
}

// 获取天气
async function fetchWeather(city) {
  try { 
    const data = await httpRequest('https://wttr.in/' + encodeURIComponent(city) + '?format=j1'); 
    const j = JSON.parse(data); 
    const c = j.current_condition[0]; 
    return { success: true, data: { temp: c.temp_C, condition: c.weatherDesc[0].value, humidity: c.humidity, wind: c.windspeedKmph } }; 
  } catch (e) { 
    return { success: false, error: e.message }; 
  }
}

// 创建窗口
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const w = primaryDisplay.workAreaSize;
  const winW = 200, winH = 280;
  
  mainWindow = new BrowserWindow({
    width: winW, height: winH,
    x: w.width - winW - 30, y: w.height - winH - 80,
    frame: false, transparent: true, alwaysOnTop: true,
    resizable: false, skipTaskbar: true, show: false,
    backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), nodeIntegration: false, contextIsolation: true }
  });

  const htmlPath = isDev ? path.join(__dirname, '../index.html') : path.join(__dirname, '../dist/index.html');
  console.log('📍 加载:', htmlPath);
  mainWindow.loadFile(htmlPath).then(function() { console.log('✅ 加载成功'); }).catch(function(e) { console.error('❌ 加载失败:', e); });
  mainWindow.once('ready-to-show', function() { mainWindow?.show(); console.log('🧚 已显示'); });
  mainWindow.on('close', function(e) { e.preventDefault(); mainWindow?.hide(); });
}

app.whenReady().then(function() { createWindow(); createTray(); });
app.on('window-all-closed', function() {});

// IPC
ipcMain.handle('get-desktop-path', function() { return getDesktopPath(); });
ipcMain.handle('read-dir', function(_, p) { return readDir(p); });
ipcMain.handle('move-file', function(_, s, d) { return moveFile(s, d); });
ipcMain.handle('create-folder', function(_, p) { return createFolder(p); });
ipcMain.handle('open-path', function(_, p) { return openPath(p); });
ipcMain.handle('show-item-in-folder', function(_, p) { return showItemInFolder(p); });
ipcMain.handle('open-external', function(_, u) { return openExternal(u); });
ipcMain.handle('fetch-ip', async function() { return await fetchIP(); });
ipcMain.handle('fetch-weather', async function(_, c) { return await fetchWeather(c); });
ipcMain.on('hide-window', function() { mainWindow?.hide(); });
ipcMain.on('show-window', function() { mainWindow?.show(); });
ipcMain.on('quit-app', function() { app.quit(); });