<template>
  <a-dropdown trigger="click" position="br">
    <div
      class="cursor-pointer ml-2 rounded-full border border-solid border-gray-300 hover:border-blue-300"
    >
      <img
        v-if="currentUser?.avatarUrl"
        :src="currentUser?.avatarUrl"
        alt="用户头像"
        class="w-8 h-8 rounded-full object-cover"
      />
      <icon-user v-else class="w-8 h-8" />
    </div>
    <template #content>
      <a-doption @click="handleUserInfo">
        <div class="flex items-center"><icon-user class="mr-2" />个人信息</div>
      </a-doption>
      <a-doption @click="handleSettings">
        <div class="flex items-center"><icon-settings class="mr-2" />设置</div>
      </a-doption>
      <a-doption @click="handleLogout">
        <div class="flex items-center">
          <icon-export class="mr-2" />退出登录
        </div>
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { logout as userLogout } from "../utils/userUtils";
import { ref, onMounted, onUnmounted } from 'vue';

const router = useRouter();
const emit = defineEmits(["userInfo", "settings", "logout"]);

const currentUser = ref<any>(null);

// 从 localStorage 获取用户信息
const getCurrentUser = () => {
  const userProfile = localStorage.getItem("userProfile");
  if (!userProfile) return null;

  try {
    return JSON.parse(userProfile);
  } catch (e) {
    console.error('解析用户信息失败', e);
    return null;
  }
};

// 更新当前用户信息
const updateCurrentUser = () => {
  currentUser.value = getCurrentUser();
};

// 监听用户登录事件
const handleUserLogin = () => {
  updateCurrentUser();
};

// 初始化时获取当前用户
onMounted(() => {
  updateCurrentUser();
  // 添加用户登录事件监听
  window.addEventListener('user-login', handleUserLogin);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('user-login', handleUserLogin);
});

const handleUserInfo = () => {
  emit("userInfo");
};

const handleSettings = () => {
  router.push('/settings');
};

const handleLogout = () => {
  userLogout();
  currentUser.value = null;
  const event = new CustomEvent('user-logout', {
    detail: { message: '用户已登出' }
  });
  window.dispatchEvent(event);
};
</script>
