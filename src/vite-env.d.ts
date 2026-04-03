export interface ElectronAPI {
  moveWindow: (x: number, y: number) => void
  getWindowPosition: () => Promise<{ x: number; y: number }>
  hideWindow: () => void
  showWindow: () => void
  quitApp: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}