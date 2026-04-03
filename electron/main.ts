import { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 禁用 GPU 加速（解决某些环境下的兼容性问题）
app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const isDev = !app.isPackaged

// 创建托盘图标 - 使用系统默认图标或创建一个简单的图标
function createTray() {
  try {
    // 尝试创建一个 16x16 的简单图标
    const size = 16
    const iconBuffer = Buffer.alloc(size * size * 4)
    
    // 创建一个简单的粉色圆点图标
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const dx = x - size / 2
        const dy = y - size / 2
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < size / 2 - 1) {
          // 粉色 (RGBA)
          iconBuffer[idx] = 99      // R
          iconBuffer[idx + 1] = 102 // G
          iconBuffer[idx + 2] = 241 // B
          iconBuffer[idx + 3] = 255 // A
        } else {
          // 透明
          iconBuffer[idx + 3] = 0
        }
      }
    }
    
    const icon = nativeImage.createFromBuffer(iconBuffer, {
      width: size,
      height: size,
    })
    
    tray = new Tray(icon)
    
    const contextMenu = Menu.buildFromTemplate([
      { label: '显示', click: () => mainWindow?.show() },
      { label: '隐藏', click: () => mainWindow?.hide() },
      { type: 'separator' },
      { label: '退出', click: () => app.quit() },
    ])
    
    tray.setToolTip('桌面精灵')
    tray.setContextMenu(contextMenu)
    
    tray.on('click', () => {
      if (mainWindow?.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow?.show()
      }
    })
    
    console.log('✅ 托盘创建成功')
  } catch (error) {
    console.error('托盘创建失败:', error)
  }
}

function createWindow() {
  // 确保窗口创建在托盘之前
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  // 浮窗尺寸
  const winWidth = 200
  const winHeight = 260

  // 默认位置：右下角
  const defaultX = screenWidth - winWidth - 30
  const defaultY = screenHeight - winHeight - 80

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: defaultX,
    y: defaultY,
    frame: false,           // 无边框
    transparent: true,      // 透明背景
    alwaysOnTop: true,     // 置顶
    resizable: false,       // 禁止调整大小
    skipTaskbar: true,      // 不显示在任务栏
    show: false,           // 启动时隐藏
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    console.log('🧚 桌面精灵窗口已显示')
  })

  // 窗口关闭时隐藏而非退出
  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })

  // 页面加载失败时记录错误
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('页面加载失败:', errorCode, errorDescription)
  })
}

app.whenReady().then(() => {
  console.log('🚀 应用准备就绪...')
  
  // 先创建窗口
  createWindow()
  
  // 然后创建托盘
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // 不退出，保持后台运行
})

// ============ IPC 通信 ============

ipcMain.on('move-window', (_, x: number, y: number) => {
  mainWindow?.setPosition(x, y)
})

ipcMain.handle('get-window-position', () => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition()
    return { x, y }
  }
  return { x: 0, y: 0 }
})

ipcMain.on('hide-window', () => mainWindow?.hide())
ipcMain.on('show-window', () => mainWindow?.show())
ipcMain.on('quit-app', () => app.quit())