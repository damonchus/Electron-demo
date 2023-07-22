import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: any
  }
}

export interface DialogResultType {
  path: String
  mkdir: Boolean
}
