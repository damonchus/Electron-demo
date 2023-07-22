<template>
  <div class="countdown-container">
    <p>{{ TimeTranslate }}</p>
  </div>
</template>

<script lang="ts">
export default {
  name: "CountDown"
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps(['time', 'go']);
const Emit = defineEmits(['downZero']);

const TimeNumber = ref<number>(props.time / 1000);
const TimeNum = computed(() => props.time);
const Timeinterrupt = computed(() => props.go);

watch(TimeNum, (n) => {
  TimeNumber.value = n / 1000;
})
watch(Timeinterrupt, (n) => {
  if (n) {
    if (TimeNumber.value === 0) TimeNumber.value = 1;
    Timer();
  };
})

const TimeTranslate = computed(() => {
  const min: number = Math.floor(TimeNumber.value / 60);
  const sec: number = TimeNumber.value % 60;
  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}` 
})

// onMounted(() => {
//   if (Timeinterrupt.value) Timer();
// })

/* 倒计时 */
const Timer = () => {
  const tir = setTimeout(() => {
    clearTimeout(tir);
    // 定时器 开始计时 && 时间大于零
    if (Timeinterrupt.value && TimeNumber.value > 0) {
      TimeNumber.value--;

      if (TimeNumber.value > 0) {
        if (Timeinterrupt.value) Timer();
      } else {
        // 清零回
        if (Timeinterrupt.value) {
          Emit('downZero', true);

          setTimeout(() => Reload(), 1000);
        }
      }
    }
  }, 1000)
}

/* 重启定时器 */
const Reload = () => {
  TimeNumber.value = props.time / 1000;
  Timer();
}

/* 重置定时器 */
const Reset = () => {
  TimeNumber.value = props.time / 1000;
}

defineExpose({
  Reload,
  Reset
})
</script>

<style lang="scss" scoped>
.countdown-container {
  font-size: rem(36px);
}
</style>