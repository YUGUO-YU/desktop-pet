const { app, BrowserWindow, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('🚀 应用启动中...');

let mainWindow = null;
let tray = null;

// 创建托盘
function createTray() {
  try {
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dx = x - size / 2;
        const dy = y - size / 2;
        if (Math.sqrt(dx*dx + dy*dy) < size / 2 - 1) {
          buffer[idx] = 99; buffer[idx+1] = 102; buffer[idx+2] = 241; buffer[idx+3] = 255;
        } else {
          buffer[idx+3] = 0;
        }
      }
    }
    const icon = nativeImage.createFromBuffer(buffer, { width: size, height: size });
    tray = new Tray(icon);
    tray.setToolTip('桌面精灵');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '显示', click: () => mainWindow?.show() },
      { label: '隐藏', click: () => mainWindow?.hide() },
      { label: '退出', click: () => app.quit() },
    ]));
    tray.on('click', () => mainWindow?.isVisible() ? mainWindow.hide() : mainWindow?.show());
    console.log('✅ 托盘创建成功');
  } catch (e) { console.error('❌ 托盘失败:', e); }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const winW = 240, winH = 310;
  
  mainWindow = new BrowserWindow({
    width: winW, height: winH,
    x: width - winW - 30, y: height - winH - 80,
    frame: false, transparent: true, alwaysOnTop: true,
    resizable: false, skipTaskbar: true, show: false,
    backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  // 直接加载当前目录的 index.html
  const htmlPath = path.join(__dirname, 'index.html');
  console.log('📍 加载:', htmlPath);
  
  if (fs.existsSync(htmlPath)) {
    mainWindow.loadFile(htmlPath).then(() => console.log('✅ 加载成功')).catch(e => console.error('❌ 加载失败:', e));
  } else {
    console.error('❌ 文件不存在:', htmlPath);
  }

  mainWindow.once('ready-to-show', () => { mainWindow?.show(); console.log('🧚 窗口已显示'); });
  mainWindow.on('close', e => { e.preventDefault(); mainWindow?.hide(); });
}

app.whenReady().then(() => { createWindow(); createTray(); });
app.on('window-all-closed', () => {});
ipc = require('electron').ipcMain;
ipc.on('hide-window', () => mainWindow?.hide());
ipc.on('show-window', () => mainWindow?.show());
ipc.on('quit-app', () => app.quit());