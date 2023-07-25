<template>
  <div class="game-container">
    <div class="toBack" @click="GoToBack">
      <el-icon><ArrowLeftBold /></el-icon>
    </div>
    <div class="game-info">
      <el-image :src="GameInfo.post || NS" fit="fill" />

      <div class="button-box">
        <div class="name">{{ GameInfo.name }}</div>
        <div class="btn" @click="CountDownHandleClick">
          <el-button type="primary" v-if="CountDown.go">停止运行</el-button>
          <el-button type="success" v-else>开始运行</el-button>
        </div>
      </div>
    </div>
    <div class="record-list">
      <div class="timeChose">
        <el-button type="primary" size="small" @click="ChangeTime(60)">01:00</el-button>
        <el-button type="primary" size="small" @click="ChangeTime(60 * 2)">02:00</el-button>
        <el-button type="primary" size="small" @click="ChangeTime(60 * 3)">03:00</el-button>
        <el-button type="primary" size="small" @click="ChangeTime(60 * 5)">05:00</el-button>
        <el-button type="primary" size="small" @click="ChangeTime(60 * 10)">10:00</el-button>
      </div>
      <div class="timeset">
        <CountDownDom ref="CountDownDomRef" :time.async="CountDown.passTime" :go.sync="CountDown.go" @downZero="DownZero" />
        <div class="reset" @click="ResetCountDown">
          <el-icon><Refresh /></el-icon>
        </div>
      </div>
      <div class="record-box">
        <div
          v-for="(t, index) in RecordList"
          :key="`record-list-${index}`"
          class="record">
          <div
            class="word"
            @click="OpenDirectory(t)">
            <p>
              <!-- <span class="span-index">{{ index + 1 }}:</span> -->
              <span>{{ t.name }}</span>
              <span>-</span>
              <span>{{ t.id }}</span>
            </p>
            <!-- <p>{{ t.time }}</p> -->
          </div>
          <div class="btn">
            <p class="btn-time">{{ t.time }}</p>
            <el-button size="small" :icon="Delete" @click="DeleteFileFoo(t, index)" circle></el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'GameContainer'
  }
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { GameListType, RecordListType, RecordSessionType, ZipDirectoryReturnType } from '@renderer/interface/index';

import CountDownDom from '@renderer/components/CountDown/index.vue'

import NS from '@renderer/assets/ns.png';

import { ElNotification } from 'element-plus';
import { Delete } from '@element-plus/icons-vue'
import { TimeSet, Delay } from '@renderer/utils/index';

import AppConfig from '@renderer/appconfig';
import Storage from '@renderer/utils/storage';

import { useCosStore } from '@renderer/stores/cos';

const Store = useCosStore();

const props = defineProps(['info', 'closeHandler']);
const CountDownDomRef = ref<{ Reset: () => void, Reload: () => void } | null>(null);

/* 游戏信息 */
const GameInfo = ref<GameListType>(props.info);
const GameRecordNumber = reactive<{number: number}>({ number: 3 });
/* 存档列表 */
const RecordList = ref<RecordListType[]>([]);
/* 新存档倒计时 */
const CountDown = ref({
  go: false,
  passTime: 3 * 1000,
});
/* 是否上传至云 */
const IsUseYun = computed(() => Store.IsUseYun || false)

onMounted(() => {
  GetRecordSession(props.info.id);
})

/* 获取本地存储存档 */
const GetRecordSession = (set_id: number) => {
  const List: RecordSessionType[] = Storage.get(AppConfig.session.RecordList) || [];
  RecordList.value = List?.find((t: RecordSessionType) => t.id === set_id)?.list || [];
}

/* 设置本地存储存档 */
const SetRecordSession = async (set_id: number, new_record: RecordListType, is_delete: boolean = false) => {
  const List: RecordSessionType[] = Storage.get(AppConfig.session.RecordList) || [];
  
  const ListFlag: RecordSessionType | undefined = List.find((t: RecordSessionType) => t.id === set_id);

  // 为true则是删除
  if (is_delete) {
    const ListIndex: number = ListFlag!.list.findIndex((t: RecordListType) => t.id === new_record.id);
    ListFlag!.list.splice(ListIndex, 1);
  } else {
    if (ListFlag) {
      // 若是有存档，添加到list
      ListFlag.list.unshift(new_record);

    } else {
      // 若是没存档，新建存档
      List.push({ id: set_id, list: [new_record] });
    }
  }

  // 清除存档
  if (ListFlag && ListFlag!.list.length >= GameRecordNumber.number + 1) {
    const delete_path: string = ListFlag!.list.slice(-1)[0].path;
    await window.api.DeleteFile(delete_path);

    // 删除云存储
    if (IsUseYun) {
      Store.DeleteFileOnYun(delete_path.split(/[\\/]/).slice(-1)[0])
    }
    ListFlag.list = ListFlag.list.slice(0, GameRecordNumber.number);
  }

  // 保存数据
  await Storage.set(AppConfig.session.RecordList, List);

  return true;
}

/* 时间归零 */
const DownZero = async () => {
  // 保存数据
  await SetNewRecord();
}

/* 修改存档时间 */
const ChangeTime = async (second: number) => {
  CountDown.value.go = false;
  await Delay(300);
  CountDown.value.passTime = second * 1000;
  // CountDown.value.go = true;
}

/* 重置时间 */
const ResetCountDown = () => {
  CountDownDomRef.value!.Reload();
}

/* 开始/关闭计时存档 */
const CountDownHandleClick = () => {
  CountDown.value.go = !CountDown.value.go;
}

/* 添加新的存档 */
const SetNewRecord = async () => {
  const RecordListArr: RecordListType[] = [...RecordList.value];

  const GameFilePath: string = props.info.gameSaveMenu[0].path;
  const RandomNumber: number = Number(`${parseInt(JSON.stringify(Math.random() * 10 ** 8))}`)
  const DateNumber: string = TimeSet(new Date()).replace(/[:]/g, '-').replace(/[\s]/g, '');
  const FileName: string = `${GameFilePath.split(/[\\/]/).slice(-1)[0]}`;
  const SavePath: string = `${props.info.saveMenu[0].path}/${FileName}_${DateNumber}.zip`;

  // 保存文件
  const response: ZipDirectoryReturnType = await window.api.ZipDirectory(GameFilePath, SavePath);

  if (IsUseYun) {
    Store.UploadFileToYun(response);
  }

  const new_record = {
    id: RandomNumber,
    game_id: RandomNumber,
    time: TimeSet(new Date()),
    name: FileName,
    path: SavePath
  }

  RecordListArr.unshift(new_record)
  RecordList.value = RecordListArr.slice(0, GameRecordNumber.number)

  await SetRecordSession(props.info.id, new_record);
  return true;
}

/* 删除存档 */
const DeleteFileFoo = async (record: RecordListType, index: number) => {
  // 删除存档
  RecordList.value.splice(index, 1);

  const response: string = await window.api.DeleteFile(record.path);
  if (response === 'success') {
    await SetRecordSession(props.info.id, { ...record, index }, true);
  } else {
    ElNotification({
      title: '删除存档',
      message: '删除存档失败',
      type: 'error',
    })
  }
}

/* 打开文件所在文件夹 */
const OpenDirectory = async (record: RecordListType) => {
  const str: string = record.path.match(/^(.*[\\\/])/)![0];
  const response: string | boolean = await window.api.OpenDirectoryByPath(str);

  if (typeof response === 'string') {
    ElNotification({
      title: '打开文件夹',
      message: '打开文件夹失败',
      type: 'error',
    })
  }

}

/* 关闭弹窗 */
const GoToBack = () => {
  if (CountDown.value.go === false) {
    props.closeHandler();
  } else {
    ElNotification({
      title: '关闭弹窗',
      message: '请停止存档后，关闭弹窗',
      type: 'error',
    })
  }
}
</script>

<style lang="scss" scoped>
.game-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  padding: 10vh 0%;
  position: relative;

  .toBack {
    position: absolute;
    top: rem(0px);
    left: rem(0px);
  }

  .game-info {
    width: 32%;
    height: 80vh;
    .el-image {
      width: 100%;
      height: calc(80vh - 40px);
      border-radius: rem(10px);
    }
    .button-box {
      display: flex;
      justify-content: space-around;
    }
  }

  .record-list {
    width: 60%;
    height: calc(80vh - 40px);
    background-color: $bgColor-b-70;
    border-radius: rem(10px);
    padding: rem(10px);
    overflow: hidden;

    .timeset {
      height: rem(100px);
      text-align: center;
      position: relative;
    }

    .reset {
      position: absolute;
      right: rem(20px);
      top: rem(5px);
      color: $color-w;
      cursor: pointer;
    }

    .record-box {
      @include scrollbar();
      height: calc(80vh - 40px - 30px - #{rem(100px)});
      overflow-x: hidden;
      overflow-y: auto;
    }

    .record {
      display: flex;
      justify-content: space-between;
      font-size: FS(40);
      border-bottom: 1px solid $bdColor-w;
      padding: rem(5px) 0;
      cursor: pointer;
      color: $color-w;

      .word {
        display: flex;
        justify-content: space-between;
        span {
          margin-right: rem(5px);
          &.span-index {
            display: inline-block;
            width: rem(40px);
          }
        }

        &:hover {
          color: $auxiliary-color-3;
        }
      }

      .btn {
        display: flex;
        padding: 0 rem(10px);

        .btn-time {
          margin-right: rem(10px);
        }
      }
    }
  }
}
</style>