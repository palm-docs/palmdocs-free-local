<template>
  <a-modal
    :visible="visible"
    :closable="false"
    :mask-closable="false"
    :footer="false"
    width="400px"
    unmount-on-close
  >
    <template #title>
      <div class="flex items-center">
        <img :src="logoImg" width="24" class="mr-2" />
        <span>欢迎使用 Palm Docs</span>
      </div>
    </template>

    <div class="login-container p-4">
      <p class="text-gray-600 mb-4">请确认您的用户信息，或修改后点击登录按钮继续使用。</p>

      <div class="user-info mb-6">
        <div class="flex items-center mb-4">
          <div class="avatar-preview w-16 h-16 rounded-full overflow-hidden mr-4">
            <div v-html="userInfo.avatar" class="w-full h-full"></div>
          </div>
          <div class="flex-1">
            <a-input
              v-model="userInfo.nickname"
              placeholder="请输入昵称"
              class="mb-2"
              allow-clear
              maxlength="10"
              :status="nicknameError ? 'error' : ''"
            />
            <div v-if="nicknameError" class="text-red-500 text-sm mb-2">{{ nicknameError }}</div>
            <div class="text-gray-500 text-sm">昵称可以在个人设置中随时修改</div>
          </div>
        </div>
      </div>

      <a-button type="primary" long @click="handleLogin">登录</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';
import { generateUserInfo } from '../utils/userUtils';
import logoImg from "@/assets/logo.png";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'login']);

// 用户信息
const userInfo = ref(generateUserInfo());
const nicknameError = ref('');

// 确保用户信息包含必要字段
const ensureUserInfo = (info: any) => {
  return {
    ...info,
    id: info.id,
    nickname: info.nickname
  };
};

// 处理登录
const handleLogin = () => {
  // 验证昵称
  if (!userInfo.value.nickname?.trim()) {
    nicknameError.value = '请输入昵称';
    return;
  }
  if (userInfo.value.nickname.length > 10) {
    nicknameError.value = '昵称不能超过10个字符';
    return;
  }
  nicknameError.value = '';

  // 保存用户信息到本地存储
  const completeUserInfo = ensureUserInfo(userInfo.value);
  localStorage.setItem('userProfile', JSON.stringify(completeUserInfo));

  // 关闭模态框并触发登录事件
  emit('update:visible', false);
  emit('login');

  // 触发用户登录事件，通知数据库服务初始化
  window.dispatchEvent(new CustomEvent('user-login'));
};
</script>

<style scoped>
.avatar-preview {
  background-color: #f5f5f5;
}
</style>
