<template>
  <div class="list-container">
    <div class="title"> 存档列表 </div>
    <div class="list">
      <div class="save-list" v-for="(t, index) in SaveList" :key="`save-list-${index}`">
        <div class="image-box" @click="() => OpenRecordDrawer(t)">
          <el-image :src="NS || t.post"></el-image>
          <!-- <div class="button-box">
            <p>as</p>
            <p>as</p>
          </div> -->
        </div>
        <p>{{ t.name }}</p>
      </div>
      <div class="save-list save-add" @click="drawer = true">
        <el-icon><Plus /></el-icon>
      </div>
    </div>

    <div class="btn">
      <el-button type="primary" :icon="Setting" @click="TenXunYunSetting"></el-button>
    </div>

    <el-drawer
      v-model="drawer"
      direction="rtl"
      size="90%"
      :before-close="handleDrawerClose"
    >
      <SaveForm :closeHandler="handleDrawerClose" />
    </el-drawer>

    <el-drawer
      v-model="RecordDrawer"
      direction="rtl"
      size="100%"
      :with-header="false"
      :before-close="handleDrawerClose"
    >
      <GameRecord :info="RecordDrawerValue" :closeHandler="handleDrawerClose" />
    </el-drawer>

    <el-drawer
      v-model="TenXunYunDrawer"
      direction="rtl"
      size="100%"
      :with-header="false"
      :before-close="handleDrawerClose"
    >
      <CosSetting :closeHandler="handleDrawerClose" />
    </el-drawer>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HomeList'
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// import { ElNotification } from 'element-plus';
import { Setting } from '@element-plus/icons-vue'

import SaveForm from '@renderer/views/save/index.vue';
import GameRecord from '@renderer/views/game/index.vue';
import CosSetting from '@renderer/views/cos/index.vue';

import AppConfig from '@renderer/appconfig';
import Storage from '@renderer/utils/storage';

import NS from '@renderer/assets/ns.png';

import { GameListType } from '@renderer/interface/index';

// 弹窗
const drawer = ref<boolean>(false);
const RecordDrawer = ref<boolean>(false);
const RecordDrawerValue = ref<GameListType | null>(null);
const TenXunYunDrawer = ref<boolean>(false);
const TenXunYunDrawerValue = ref<GameListType | null>(null);

// 存档列表
const SaveList = ref<GameListType[]>([]);

onMounted(async () => {
  GetNewList();
})

/** 获取更新数据列表 */
const GetNewList = () => {
  const List: GameListType[] = Storage.get(AppConfig.session.SaveList) || [];
  SaveList.value = List;
}

/* 打开弹窗 */
const OpenRecordDrawer = (info: GameListType) => {
  RecordDrawerValue.value = info;
  RecordDrawer.value = true;
}

/* 监听弹窗关闭事件 */
const handleDrawerClose = () => {
  drawer.value = false;
  RecordDrawer.value = false;
  RecordDrawerValue.value = null;
  TenXunYunDrawer.value = false;
  TenXunYunDrawerValue.value = null;
  GetNewList();
}

/* 打开腾讯云设置窗口 */
const TenXunYunSetting = () => {
  TenXunYunDrawer.value = true;
}
</script>

<style lang="scss" scoped>
.list-container {
  width: 100%;
  .title {
    width: 100%;
    height: rem(80px);
    line-height: rem(80px);
    text-align: center;
    background-color: $bgColor-w;
  }
  .list {
    display: flex;
    flex-wrap: wrap;
    padding: rem(20px);
    .save-list {
      $SaveHeight: rem(360px);

      width: rem(200px);
      height: $SaveHeight;
      text-align: center;
      margin-right: rem(30px);
      border-radius: rem(5px);
      cursor: pointer;

      .image-box {
        width: rem(200px);
        height: rem(310px);
        border-radius: rem(5px);
        position: relative;
        overflow: hidden;

        .el-image {
          width: rem(200px);
          height: rem(310px);
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .button-box {
          width: rem(200px);
          height: rem(100px);
          position: absolute;
          bottom: 0;
          left: 0;
          z-index: 2;
          color: $color-3;
          display: flex;
          justify-content: space-around;
        }
      }

      p {
        text-align: center;
        line-height: rem(36px);
        font-size: FS(30);
      }

      &.save-add {
        text-align: center;
        line-height: $SaveHeight;
        background-color: $bgColor-0;
        color: $color-3;
        font-size: FS(70);
        transition: font-size .5s;

        &:hover {
          font-size: FS(120);
        }
      }
    }
  }

  .btn {
    width: max-content;
    position: fixed;
    right: rem(-5px);
    bottom: rem(20px);
  }
}
</style>