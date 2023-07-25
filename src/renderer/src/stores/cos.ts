import { onMounted, ref } from 'vue'
import { defineStore } from 'pinia'

import QcCloud from '@renderer/utils/qcloud-cos'

import Storage from '@renderer/utils/storage'

import AppConfig from '@renderer/appconfig'

import type { CosSettingType, ZipDirectoryReturnType } from '@renderer/interface/index'

const TenXunYunSession = AppConfig.session.tenxunyun

export const useCosStore = defineStore('cos', () => {
  const DefaultCosConfig: CosSettingType = {
    Bucket: '',
    Region: '',
    SecretId: '',
    SecretKey: ''
  }

  /* 保存腾讯云数据到本地 */
  const SetCosConfigInSession = async (
    config: CosSettingType,
    IsUseYun: boolean,
    FileMkdir: string
  ) => {
    Storage.set(TenXunYunSession.tenxunyunConfig, config)
    Storage.set(TenXunYunSession.IsUseYun, IsUseYun)
    Storage.set(TenXunYunSession.FileMkdir, FileMkdir)
  }

  /* 从本地拿数据 */
  const GetCosConfigInSession = () => {
    const storageData: any = Storage.get(TenXunYunSession.tenxunyunConfig)
    return storageData ? storageData : DefaultCosConfig
  }

  /* 上传数据到腾讯云 */
  const UploadFileToYun = (file: ZipDirectoryReturnType) => {
    if (file) {
      QcCloud.uploadFile(file.file)
    }
  }

  // config of tenxunyun
  const CosConfig = ref<CosSettingType>(DefaultCosConfig)

  // 是否使用腾讯云
  const IsUseYun = ref<boolean>(false)

  // 保存文件夹
  const FileMkdir = ref<string>('')

  onMounted(() => {
    CosConfig.value = GetCosConfigInSession()
    const IsUseYunSession = Storage.get(TenXunYunSession.IsUseYun)
    const FileMkdirSession = Storage.get(TenXunYunSession.FileMkdir)
    IsUseYun.value = typeof IsUseYunSession === 'boolean' ? IsUseYunSession : false
    FileMkdir.value = FileMkdirSession || ''
  })

  return { CosConfig, IsUseYun, FileMkdir, UploadFileToYun, SetCosConfigInSession }
})
