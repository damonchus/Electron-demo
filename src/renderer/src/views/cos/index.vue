<template>
  <div class="cos-setting-container">
    <div class="title">腾讯云存档设置</div>
    <el-form
      :inline="false"
      ref="ruleFormRef"
      :model="FormData"
      :rules="FormSet.rules" 
      label-width="150px" class="cos-form">
      <el-form-item label="SecretId" prop="SecretId">
        <el-input v-model="FormData.SecretId" placeholder="" />
      </el-form-item>

      <el-form-item label="SecretKey" prop="SecretKey">
        <el-input v-model="FormData.SecretKey" placeholder="" />
      </el-form-item>

      <el-form-item label="Bucket" prop="Bucket">
        <el-input v-model="FormData.Bucket" placeholder="" />
      </el-form-item>

      <el-form-item label="Region" prop="Region">
        <el-input v-model="FormData.Region" placeholder="" />
      </el-form-item>
      
      <el-form-item label="保存文件夹" prop="FileMkdir">
        <el-input v-model="FormData.FileMkdir" placeholder="" />
      </el-form-item>
      
      <el-form-item label="是否使用云服务" prop="Region">
        <el-radio-group v-model="FormData.IsUseYun">
          <el-radio-button :label="true">使用</el-radio-button>
          <el-radio-button :label="false">不使用</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="SubmitForm(ruleFormRef)">提交</el-button>
        <el-button type="danger" @click="props.closeHandler()">关闭</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CosSetting'
}
</script>

<script setup lang="ts">
import { ref, defineProps, reactive, onMounted } from 'vue';

import type { FormInstance } from 'element-plus';

import type { CosSettingType } from '@renderer/interface/index';

import { useCosStore } from '@renderer/stores/cos';

const Store = useCosStore();

const props = defineProps(['closeHandler'])

const ruleFormRef = ref<FormInstance>();

const FormData = ref<CosSettingType>({
  Bucket: '',
  Region: '',
  SecretId: '',
  SecretKey: '',
  FileMkdir: '',
  IsUseYun: false
})

const FormSet = reactive({
  rules: {
    Bucket: [{ required: true, message: '请填入', trigger: 'change' }],
    Region: [{ required: true, message: '请填入', trigger: 'change' }],
    SecretId: [{ required: true, message: '请填入', trigger: 'change' }],
    SecretKey: [{ required: true, message: '请填入', trigger: 'change' }],
    FileMkdir: [{ required: true, message: '请填入', trigger: 'change' }],
  }
})

onMounted(() => {
  FormData.value = { ...Store.CosConfig, IsUseYun: Store.IsUseYun, FileMkdir: Store.FileMkdir };
})

/* 表单提交 */
const SubmitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      // 更新store数据
      const { Bucket, Region, SecretId, SecretKey, IsUseYun, FileMkdir } = FormData.value;
      Store.$patch({ key: 'CosConfig', value: { Bucket, Region, SecretId, SecretKey } });
      Store.$patch({ key: 'IsUseYun', value: IsUseYun });
      Store.$patch({ key: 'fileMkdir', value: FileMkdir });
      // 保存信息到本地
      Store.SetCosConfigInSession({ Bucket, Region, SecretId, SecretKey }, IsUseYun, FileMkdir);

      props.closeHandler();
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<style lang="scss" scoped>
.cos-setting-container {
  .title {
    font-size: rem(30px);
    margin-bottom: rem(30px);
  }
}
</style>