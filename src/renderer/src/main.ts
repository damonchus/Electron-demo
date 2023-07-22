import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

/* 引入默认样式 */
import './styles/index.scss'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/* 自适应大小 */
import 'amfe-flexible'

const app = createApp(App)
app.use(createPinia())

app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
