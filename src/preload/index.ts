import { shell, contextBridge, ipcRenderer } from 'electron'
import remote from '@electron/remote'
import { electronAPI } from '@electron-toolkit/preload'

import { DialogResultType } from './index.d'

import * as fs from 'fs'
import archiver from 'archiver'

/* 判断是否是文件夹还是文件 */
const IsMkdirOrFile = (name: String) => {
  return name.split('/').slice(-1)[0].indexOf('.') >= 0
}

/* 选择文件或者文件夹 */
export const dialogChoose = async (type: String) => {
  const result: DialogResultType[] = []

  try {
    /*
    const data = {
      title: '请选择你喜欢的照片', //默认路径,默认选择的文件
      defaultPath: __dirname, //过滤文件后缀
      properties: ['openFile', 'multiSelections'],
      //打开按钮
      buttonLabel: '选择' //回调结果渲染到img标签上
    }
      */
    const properties: (
      | 'openFile'
      | 'openDirectory'
      | 'multiSelections'
      | 'showHiddenFiles'
      | 'createDirectory'
      | 'promptToCreate'
      | 'noResolveAliases'
      | 'treatPackageAsDirectory'
      | 'dontAddToRecent'
    )[] = ['openDirectory']

    if (type === 'before') {
      properties.push('openFile')
      properties.push('multiSelections')
      properties.push('showHiddenFiles')
    }

    const repose: any = await remote.dialog.showOpenDialog({ properties: properties })

    const { filePaths } = repose

    filePaths.forEach((t: String) => {
      result.push({
        path: t,
        mkdir: IsMkdirOrFile(t)
      })
    })
  } catch (err) {
    console.error(err)
  } finally {
    return result
  }
}

/**
 * 打包文件夹
 * @param {string} source 源文件地址
 * @param {string} out    导出
 * @returns
 * @param {File}   file  文件对象
 */
export const ZipDirectory = async (source, out) => {
  if (process.platform === 'win32') {
    // 若是windows
    // source.replace(/\//g, '/')
    // out.replace(/\//g, '/')
  } else {
    // 若是mac
    source.replace(/\/]/g, '/')
    out.replace(/[\/]/g, '/')
  }

  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = fs.createWriteStream(out)

  const fu: string = process.platform === 'win32' ? `\\` : '/'
  const directory_path: string = source.split(fu).slice(-1)[0]

  return new Promise((resolve, reject) => {
    archive
      .directory(source, directory_path)
      .on('error', (err) => reject(err))
      .pipe(stream)

    stream.on('close', () => {
      const path: string = out
      const data = fs.readFileSync(path)
      const fileName: string = path.split(/[\\/]/).slice(-1)[0]
      const file = new File([data], fileName, { type: 'application/zip' })
      // 返回File对象
      resolve({ path, file })
    })
    archive.finalize()
  })
}

/**
 * 按照路径打开文件夹
 * @param {string} path   文件夹路径
 */
const OpenDirectoryByPath = async (path: string) => {
  if (process.platform === 'win32') {
    // 若是windows
  } else {
    // 若是mac
    path.replace(/\//g, '\\')
  }

  try {
    const response = await shell.openPath(path)
    if (response === '') {
      return true
    } else {
      return `打开文件夹失败 ${response}`
    }
  } catch (error) {
    return `打开文件夹失败: ${error}`
  }
}

/**
 * 按照指定路径删除文件
 * @param {string} path   文件夹路径
 */
const DeleteFile = (path: string) => {
  if (process.platform === 'win32') {
    // 若是windows
  } else {
    // 若是mac
    path.replace(/\//g, '\\')
  }

  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject('An error occurred:' + err)
      } else {
        resolve('success')
      }
    })
  })
}

ipcRenderer.on('get-app-path', (event, path) => {
  console.log(event, '---', path)
})

// 获取系统应用列表
export const SystemAppList = async () => {
  try {
    await ipcRenderer.send('get-app-path')
    return 'end'
  } catch (err) {
    return err
  }
}

export const processPlatform = process.platform

// 定时器
export const setTimeoutInElectron = (callback: () => void, delay: number) => {
  const timer = setTimeout(() => {
    callback()
    clearTimeout(timer)
  }, delay)
}

// Custom APIs for renderer
const api = {
  dialogChoose,
  SystemAppList,
  ZipDirectory,
  OpenDirectoryByPath,
  processPlatform,
  DeleteFile,
  setTimeoutInElectron
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
