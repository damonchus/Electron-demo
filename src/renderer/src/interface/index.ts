export interface DialogResultType {
  path: String
  mkdir: Boolean
}

export interface GameListType {
  id?: number | string
  name: string
  post: string
  gameSaveMenu: DialogResultType[]
  saveMenu: DialogResultType[]
  RecordList?: string[]
}

export interface RecordListType {
  id: number | string
  index?: number
  game_id: number | string
  time: string
  name: string
  path: string
}

export interface RecordSessionType {
  id: number
  list: RecordListType[]
}

export interface CosSettingType {
  SecretId: string
  SecretKey: string
  Bucket: string
  Region: string
  IsUseYun?: boolean
  fileMkdir?: string
}

export interface ZipDirectoryReturnType {
  path: string
  file: File
}
