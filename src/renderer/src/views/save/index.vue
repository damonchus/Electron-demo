<template>
  <div class="save-container">
    <el-form :inline="false" :model="FormData" class="demo-form">
      <el-form-item label="游戏名">
        <el-input v-model="FormData.name" placeholder="" />
      </el-form-item>
      <el-form-item label="游戏封面">
        <div class="selectImage">
          <!-- <el-input
            v-if="FormData.post == ''"
            v-model="FormData.post"
            type="file"
            placeholder=""
          /> -->
          <el-image :src="FormData.post" fit="fill" />
        </div>
      </el-form-item>
      <el-form-item label="游戏存档地址">
        <!-- <el-input v-model="FormData.gameSaveMenu" type="file" placeholder="" /> -->
        <div class="file-menu-select">
          <el-button type="primary" @click="chooseLocation('before')">选择游戏存档地址</el-button>

          <div class="GameSaveList">
            <div v-for="(t, index) in FormData.gameSaveMenu" :key="`game-save-list-${index}`">
              <span>{{ index + 1 }}.</span>
              <span>{{ t.path }}</span>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="游戏保存地址">
        <div class="file-menu-select">
          <el-button type="primary" @click="chooseLocation('after')">选择游戏存档保存地址</el-button>

          <div class="GameSaveList">
            <div v-for="(t, index) in FormData.saveMenu" :key="`game-save-${index}`">
              <span>{{ t.path }}</span>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SaveForm'
}
</script>

<script setup lang="ts">
import AppConfig from '@renderer/appconfig';
import Storage from '@renderer/utils/storage';

// import { fa } from 'element-plus/es/locale';
import { ElNotification } from 'element-plus';

import NS from '@renderer/assets/ns.png';

import { GameListType, DialogResultType } from '@renderer/interface/index';

import { ref } from 'vue';
const props = defineProps(['closeHandler']);

const FormData = ref<GameListType>({
  name: '',
  post: NS,
  gameSaveMenu: [],
  saveMenu: []
});

/* 表单提交 */
const onSubmit = async () => {
  try {
    const check: string = await FormCheck(FormData.value);
    if (check !== 'pass') {
      throw Error(check);
    }
    // 获取之前保存记录，加入新的记录
    const Past: GameListType[] = Storage.get(AppConfig.session.SaveList) || [];
    Past.push({ ...FormData.value, id: new Date().getTime() })
    Storage.set(AppConfig.session.SaveList, Past);

    // 关闭弹窗
    props.closeHandler();
  } catch (err) {
    ElNotification({
      title: '保存文档',
      message: '' + err,
      type: 'error',
    })
  }
}

/* 表单验证 */
const FormCheck = async (form: GameListType) => {
  if (form.name === '') {
    return '请填入游戏名称'
  }
  if (JSON.stringify(form.gameSaveMenu) === '[]') {
    return '请输入游戏存档地址'
  }
  if (JSON.stringify(form.saveMenu) === '[]') {
    return '请输入游戏存档保存'
  }
  return 'pass';
}

/**
 * 选择游戏存档地址
 * @param {string} type    before:选择文件,
 */
const chooseLocation = async (type: String) => {
  try {
    const response: DialogResultType[] = await window.api.dialogChoose(type);

    switch (type) {
      case 'before':
        FormData.value.gameSaveMenu = response;
        break;
      case 'after':
        FormData.value.saveMenu = response;
        break;
    }
  } catch (err) {
    console.error('Error:', err);
  }
}
</script>

<style scoped lang="scss">
.save-container {
  .el-image {
    width: rem(80px);
    height: rem(80px);
  }
}
</style>