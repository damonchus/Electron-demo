import COS from 'cos-js-sdk-v5'
import AppConfig from '@renderer/appconfig'
import Storage from '@renderer/utils/storage'

let cos: any = null
let Config = {
  FileMkdir: '',
  Bucket: '',
  Region: '',
  SecretId: '',
  SecretKey: ''
}

/* 获取本地数据生成对象 */
const GetCosObject = async () => {
  if (cos === null) {
    const key: string = AppConfig.session.tenxunyun.tenxunyunConfig
    const FileMkdir: any = Storage.get(AppConfig.session.tenxunyun.FileMkdir)
    const config: any = Storage.get(key)

    if (config) {
      const { SecretId, SecretKey } = config
      // 配置数据
      cos = new COS({
        SecretId,
        SecretKey
      })
      Config = { ...config, FileMkdir }
    }
  }
  return cos
}

// 上传文件 files: 文件
const uploadFile = async (files: any) => {
  const Cos = (await GetCosObject()) || new COS(Config)
  const { Bucket, Region, FileMkdir } = Config
  return new Promise((resolve, reject) => {
    Cos.putObject(
      {
        Bucket,
        Region,
        Key: FileMkdir + files.name,
        Body: files, // 上传文件对象
        onTaskReady: (info: any) => {
          console.error('onTaskReady', info, cos)
        },
        onTaskStart: (info: any) => {
          console.error('onTaskStart', info)
        },
        onProgress: (onProgress: any) => {
          console.error('onProgress' + JSON.stringify(onProgress))
        }
      },
      function (err: any, data: any) {
        if (err) {
          reject(err)
        }
        if (data) {
          resolve(data)
        }
      }
    )
  })
}

/**
 * 获取文件夹下所有文件
 * @param {string} folder                文件夹名（可以为空，获取根目录）
 */
const getFolderFile = async (folder: any) => {
  const Cos = (await GetCosObject()) || new COS(Config)
  const { Bucket, Region } = Config
  return new Promise((resolve, reject) => {
    Cos.putObject(
      {
        Bucket,
        Region,
        Prefix: folder
      },
      function (err: any, data: any) {
        if (err) {
          reject(err)
        } else {
          resolve(data.Contents)
        }
      }
    )
  })
}

const getFiles = async () => {
  const Cos = (await GetCosObject()) || new COS(Config)
  const { Bucket, Region, FileMkdir } = Config
  Cos.getBucket(
    {
      Bucket,
      Region,
      Prefix: FileMkdir
    },
    function (err: any, data: any) {
      console.error(err, data, '-------')
    }
  )
}

const DeleteFiles = async (FilePath: string) => {
  const Cos = (await GetCosObject()) || new COS(Config)
  const { Bucket, Region } = Config
  Cos.deleteObject(
    {
      Bucket,
      Region,
      Key: FilePath // 文件路径
    },
    function (err: any, data: any) {
      console.error(err, '-------', data)
    }
  )
}

const headBucket = async () => {
  const Cos = (await GetCosObject()) || new COS(Config)
  const { Bucket, Region } = Config
  Cos.getBucket(
    {
      Bucket,
      Region
    },
    function (err: any, data: any) {
      console.error(err || data, cos)
    }
  )
}

export default {
  uploadFile,
  getFiles,
  getFolderFile,
  headBucket,
  DeleteFiles,
  cos
}
