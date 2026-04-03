import { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 禁用 GPU 加速
app.disableHardwareAcceleration()

console.log('🚀 应用启动中...')

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const isDev = !app.isPackaged

// 创建托盘
function createTray() {
  try {
    const size = 16
    const iconBuffer = Buffer.alloc(size * size * 4)
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const dx = x - size / 2
        const dy = y - size / 2
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < size / 2 - 1) {
          iconBuffer[idx] = 99
          iconBuffer[idx + 1] = 102
          iconBuffer[idx + 2] = 241
          iconBuffer[idx + 3] = 255
        } else {
          iconBuffer[idx + 3] = 0
        }
      }
    }
    
    const icon = nativeImage.createFromBuffer(iconBuffer, { width: size, height: size })
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
    console.error('❌ 托盘创建失败:', error)
  }
}

function createWindow() {
  console.log('📦 正在创建窗口...')
  
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  const winWidth = 220
  const winHeight = 280
  const defaultX = screenWidth - winWidth - 30
  const defaultY = screenHeight - winHeight - 80

  // 获取 preload 路径
  const preloadPath = path.join(__dirname, 'preload.mjs')
  console.log('📍 Preload 路径:', preloadPath)

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
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 始终加载本地文件（生产模式）
  // 不管开发还是生产都用本地文件
  const htmlPath = path.join(__dirname, '../dist/index.html')
  console.log('📍 HTML 路径:', htmlPath)

  // 加载开发服务器（Vite 启动后）
  mainWindow.loadURL('http://localhost:5173').then(() => {
    console.log('✅ 开发服务器加载成功')
  }).catch((err) => {
    console.error('❌ 加载失败，尝试本地文件:', err)
    // 失败则尝试本地文件
    mainWindow.loadFile(htmlPath).catch(e => console.error('❌ 本地文件也失败:', e))
  })

  // 窗口就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    console.log('🧚 桌面精灵窗口已显示')
  })

  // 页面加载完成
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ 页面渲染完成')
  })

  // 页面加载失败
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ 页面加载失败:', errorCode, errorDescription)
  })

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })
}

app.whenReady().then(() => {
  console.log('✨ 应用准备就绪')
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // 不退出
})

// IPC
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