import { createApp } from 'vue'
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';

import router from './router'
import './styles/main.css'
import '../aieditor/dist/style.css'

// 引入bootstrap初始化数据库
import { Bootstrap } from './utils/bootstrap';

// 初始化数据库环境
const bootstrap = new Bootstrap();
const app = createApp(App).use(router).use(ArcoVue).use(ArcoVueIcon);
bootstrap.initialize().then(() => {
  console.log('数据库环境初始化完成，开始创建应用...');
  bootstrap.autoDefaultLogin();
  app.mount('#app');
}).catch(error => {
  console.error('数据库环境初始化失败:', error);
});
