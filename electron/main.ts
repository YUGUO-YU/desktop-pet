import { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 禁用 GPU 加速
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-gpu-sandbox')

console.log('🚀 应用启动中...')

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged
console.log('🔧 开发模式:', isDev)

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

  // 浮窗尺寸
  const winWidth = 220
  const winHeight = 280

  // 默认位置：右下角
  const defaultX = screenWidth - winWidth - 30
  const defaultY = screenHeight - winHeight - 80

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
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
    },
  })

  // 尝试加载页面
  async function loadPage() {
    const devUrl = 'http://localhost:5173'
    const prodPath = path.join(__dirname, '../dist/index.html')
    
    if (isDev) {
      console.log('📡 尝试加载开发服务器:', devUrl)
      
      try {
        await mainWindow!.loadURL(devUrl, {
          timeout: 10000, // 10秒超时
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        console.log('✅ 开发服务器加载成功')
      } catch (err) {
        console.error('❌ 开发服务器加载失败，尝试加载生产版本:', err)
        // 如果开发服务器失败，尝试加载生产版本
        try {
          await mainWindow!.loadFile(prodPath)
          console.log('✅ 生产版本加载成功')
        } catch (err2) {
          console.error('❌ 生产版本也加载失败:', err2)
        }
      }
    } else {
      console.log('📡 加载生产版本:', prodPath)
      await mainWindow!.loadFile(prodPath)
      console.log('✅ 生产版本加载成功')
    }
  }

  loadPage()

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

  // JS 错误
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('❌ 渲染进程崩溃:', details)
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