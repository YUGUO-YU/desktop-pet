import { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// 获取桌面路径
function getDesktopPath(): string {
  return app.getPath('desktop')
}

// 读取目录
function readDir(dirPath: string): { success: boolean; files?: any[]; error?: string } {
  try {
    const files = fs.readdirSync(dirPath)
    const result = files.map(file => {
      const fullPath = path.join(dirPath, file)
      const stats = fs.statSync(fullPath)
      return {
        name: file,
        path: fullPath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime.toISOString()
      }
    })
    return { success: true, files: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 移动文件
function moveFile(src: string, dest: string): { success: boolean; error?: string } {
  try {
    const destDir = path.dirname(dest)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }
    fs.renameSync(src, dest)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 创建文件夹
function createFolder(folderPath: string): { success: boolean; error?: string } {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 打开路径
function openPath(filePath: string): { success: boolean; error?: string } {
  try {
    shell.openPath(filePath)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 在文件夹中显示
function showItemInFolder(filePath: string): { success: boolean; error?: string } {
  try {
    shell.showItemInFolder(filePath)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 打开外部链接
function openExternal(url: string): { success: boolean; error?: string } {
  try {
    shell.openExternal(url)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// HTTP 请求工具
function httpRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const req = protocol.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    
    req.on('error', reject)
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

// 获取 IP 地址
function fetchIP(): Promise<{ success: boolean; ip?: string; city?: string; error?: string }> {
  return new Promise(async (resolve) => {
    try {
      const data = await httpRequest('https://ipapi.co/json/')
      const json = JSON.parse(data)
      resolve({ 
        success: true, 
        ip: json.ip, 
        city: json.city || json.region 
      })
    } catch (error: any) {
      resolve({ success: false, error: error.message })
    }
  })
}

// 获取天气
function fetchWeather(city: string): Promise<{ success: boolean; data?: any; error?: string }> {
  return new Promise(async (resolve) => {
    try {
      const data = await httpRequest(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
      const json = JSON.parse(data)
      const current = json.current_condition[0]
      resolve({ 
        success: true, 
        data: {
          temp: current.temp_C,
          condition: current.weatherDesc[0].value,
          humidity: current.humidity,
          wind: current.windspeedKmph
        }
      })
    } catch (error: any) {
      resolve({ success: false, error: error.message })
    }
  })
}

function createWindow() {
  console.log('📦 正在创建窗口...')
  
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  const winWidth = 200
  const winHeight = 280
  const defaultX = screenWidth - winWidth - 30
  const defaultY = screenHeight - winHeight - 80

  // 开发环境用 .ts，发布用 .mjs
  const preloadPath = isDev 
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, 'preload.mjs')
  
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

  const htmlPath = isDev 
    ? path.join(__dirname, '../../index.html')
    : path.join(__dirname, '../dist/index.html')
  
  console.log('📍 HTML 路径:', htmlPath)

  mainWindow.loadFile(htmlPath).then(() => {
    console.log('✅ 页面加载成功')
  }).catch((err) => {
    console.error('❌ 页面加载失败:', err)
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    console.log('🧚 桌面精灵窗口已显示')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ 页面渲染完成')
  })

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

// IPC 处理程序
ipcMain.handle('get-desktop-path', () => {
  return getDesktopPath()
})

ipcMain.handle('read-dir', (_, dirPath: string) => {
  return readDir(dirPath)
})

ipcMain.handle('move-file', (_, src: string, dest: string) => {
  return moveFile(src, dest)
})

ipcMain.handle('create-folder', (_, folderPath: string) => {
  return createFolder(folderPath)
})

ipcMain.handle('open-path', (_, filePath: string) => {
  return openPath(filePath)
})

ipcMain.handle('show-item-in-folder', (_, filePath: string) => {
  return showItemInFolder(filePath)
})

ipcMain.handle('open-external', (_, url: string) => {
  return openExternal(url)
})

ipcMain.handle('fetch-ip', async () => {
  return await fetchIP()
})

ipcMain.handle('fetch-weather', async (_, city: string) => {
  return await fetchWeather(city)
})

// 窗口控制
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