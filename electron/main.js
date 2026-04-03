const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

console.log('🚀 应用启动中...');

let mainWindow = null;
let tray = null;

// 创建托盘图标
function createTray() {
  try {
    const size = 16;
    const iconBuffer = Buffer.alloc(size * size * 4);
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dx = x - size / 2;
        const dy = y - size / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < size / 2 - 1) {
          iconBuffer[idx] = 99;     // R
          iconBuffer[idx + 1] = 102; // G
          iconBuffer[idx + 2] = 241; // B
          iconBuffer[idx + 3] = 255; // A
        } else {
          iconBuffer[idx + 3] = 0;
        }
      }
    }
    
    const icon = nativeImage.createFromBuffer(iconBuffer, { width: size, height: size });
    tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      { label: '显示', click: () => mainWindow?.show() },
      { label: '隐藏', click: () => mainWindow?.hide() },
      { type: 'separator' },
      { label: '退出', click: () => app.quit() },
    ]);
    
    tray.setToolTip('桌面精灵');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      if (mainWindow?.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow?.show();
      }
    });
    
    console.log('✅ 托盘创建成功');
  } catch (error) {
    console.error('❌ 托盘创建失败:', error);
  }
}

function createWindow() {
  console.log('📦 正在创建窗口...');
  
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const winWidth = 240;
  const winHeight = 300;
  const defaultX = screenWidth - winWidth - 30;
  const defaultY = screenHeight - winHeight - 80;

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: defaultX,
    y: defaultY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 加载本地 HTML
  const htmlPath = path.join(__dirname, 'dist', 'index.html');
  console.log('📍 加载:', htmlPath);

  mainWindow.loadFile(htmlPath).then(() => {
    console.log('✅ 页面加载成功');
  }).catch((err) => {
    console.error('❌ 页面加载失败:', err);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    console.log('🧚 桌面精灵已显示');
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
}

app.whenReady().then(() => {
  console.log('✨ 应用准备就绪');
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // 不退出
});

// IPC
ipcMain.on('hide-window', () => mainWindow?.hide());
ipcMain.on('show-window', () => mainWindow?.show());
ipcMain.on('quit-app', () => app.quit());