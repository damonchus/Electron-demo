import JSZip from 'JSZip'

/* 本地存储数据 */
const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

/* 获取本地存储数据 */
const getStorage = (key: string) => {
  return JSON.parse(localStorage.getItem(key) || 'null')
}

// 先封装一个方法，请求返回文件blob
/* async function fetchBlob(fetchUrl, method = 'POST', body = null) {
  const response = await window.fetch(fetchUrl, {
    method,
    body: body ? JSON.stringify(body) : null,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  const blob = await response.blob()
  return blob
} */

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
