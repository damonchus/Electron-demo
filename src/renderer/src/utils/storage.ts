import JSZip from 'JSZip'

import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'

/* 本地存储数据 */
const setStorage = (key: string, value: any) => {
  // 转变value格式 => string
  const val: string = typeof value === 'string' ? value : JSON.stringify(value)
  localStorage.setItem(key, AES.encrypt(val, key).toString())
}

/* 获取本地存储数据 */
const getStorage = (key: string) => {
  let Session: any = localStorage.getItem(key)
  if (Session) {
    const bytes = AES.decrypt(Session, key)
    const text = bytes.toString(Utf8)
    try {
      Session = JSON.parse(text)
    } catch (error) {
      Session = text || ''
    }
  }
  return Session
}

/* 压缩打包数据 */
const setZip = async (files) => {
  const zip = new JSZip()
  files.forEach((item) => {
    zip.file(item.name, item.blob, { binary: true })
  })
  const content = await zip.generateAsync({ type: 'blob' })
  const currentDate = new Date().getTime()
  const fileName = `zipped-${currentDate}.zip`
  return { content, fileName }
}

export default {
  set: setStorage,
  get: getStorage,
  zip: setZip
}
