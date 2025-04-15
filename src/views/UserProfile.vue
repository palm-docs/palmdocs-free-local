<template>
  <div class="user-profile-container p-6">
    <div class="mb-4">
      <a-button type="text" @click="router.back()">
        <template #icon><icon-left /></template>
        返回
      </a-button>
    </div>
    <a-card title="个人信息" :bordered="false">
      <div class="flex gap-6">
        <div class="avatar-section">
          <div class="avatar-wrapper w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
            <img v-if="currentUser?.avatar" :src="currentUser.avatar" class="w-full h-full object-cover" />
            <icon-user v-else class="w-full h-full text-gray-400 p-4" />
          </div>
          <div class="mt-4 text-center">
            <a-button type="outline" @click="showAvatarSelector = true">更换头像</a-button>
          </div>
        </div>

        <a-form
          class="flex-1"
          :model="userForm"
          :label-col-props="{ span: 6 }"
          :wrapper-col-props="{ span: 18 }"
        >
          <!-- 只读账号信息 -->
          <a-form-item label="账号">
            <a-input v-model="userForm.account" readonly />
          </a-form-item>

          <!-- 可编辑昵称 -->
          <a-form-item label="昵称">
            <a-input v-model="userForm.nickname" placeholder="请输入昵称" />
          </a-form-item>

          <!-- 保存按钮 -->
          <a-form-item :wrapper-col-props="{ offset: 6 }">
            <a-button type="primary" @click="saveUserInfo">保存</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <!-- 头像选择器对话框 -->
    <a-modal
      v-model:visible="showAvatarSelector"
      title="选择头像"
      @cancel="showAvatarSelector = false"
      :footer="false"
      width="700px"
    >
      <div class="avatar-grid grid grid-cols-4 gap-4">
        <div
          v-for="avatar in avatarList"
          :key="avatar"
          class="avatar-item cursor-pointer p-2 rounded-lg transition-all"
          :class="{'border-2 border-blue-500': selectedAvatar === avatar}"
          @click="selectedAvatar = avatar"
        >
          <img :src="avatar" class="w-full h-auto rounded-lg" />
        </div>
      </div>
      <div class="flex justify-end mt-4 gap-2">
        <a-button @click="showAvatarSelector = false">取消</a-button>
        <a-button type="primary" @click="updateAvatar">确认</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser } from '../utils/userUtils';
import { IconLeft } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { DocumentService } from '../services/IndexedDBService';
import { getAllAvatarPaths } from '../utils/avatarUtils';

const router = useRouter();
const currentUser = ref<any>(null);
const userForm = reactive({
  account: '',
  nickname: ''
});

// 头像选择器相关
const showAvatarSelector = ref(false);
const avatarList = ref<string[]>([]);
const selectedAvatar = ref('');

onMounted(async () => {
  currentUser.value = getCurrentUser();
  // currentUser.value = await DocumentService.getCurrentUser();
  if (currentUser.value) {
    userForm.account = currentUser.value.account;
    userForm.nickname = currentUser.value.nickname;

    // 加载所有预置头像
    const paths = getAllAvatarPaths();
    console.log('Current user avatar:', currentUser.value.avatar);
    console.log('Available avatar paths:', paths);
    avatarList.value = paths;
  }
});

const saveUserInfo = async () => {
  if (!userForm.nickname.trim()) {
    Message.error('昵称不能为空');
    return;
  }

  try {
    // 更新用户信息
    const updatedUser = await DocumentService.updateUser(currentUser.value.id, {
      nickname: userForm.nickname
    });

    if (updatedUser) {
      currentUser.value = updatedUser;
      // 更新 localStorage 中的用户信息
      const userProfile = {
        account: updatedUser.account,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        name: updatedUser.nickname,
        avatar: updatedUser.avatar,
        id: updatedUser.id
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      Message.success('保存成功');
    }
  } catch (error) {
    console.error('保存用户信息失败:', error);
    Message.error('保存失败');
  }
};

// 更新头像
const updateAvatar = async () => {
  if (!selectedAvatar.value || !currentUser.value) return;

  try {
    console.log('Selected avatar path:', selectedAvatar.value);
    // 更新用户头像
    const updatedUser = await DocumentService.updateUser(currentUser.value.id, {
      avatar: selectedAvatar.value
    });

    if (updatedUser) {
      currentUser.value = updatedUser;
      console.log('Updated user avatar:', updatedUser.avatar);
      // 更新 localStorage 中的用户信息
      const userProfile = {
        account: updatedUser.account,
        nickname: updatedUser.nickname,
        name: updatedUser.nickname,
        avatar: updatedUser.avatar,
        id: updatedUser.id
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      showAvatarSelector.value = false;
      Message.success('头像更新成功');
    }
  } catch (error) {
    console.error('更新头像失败:', error);
    Message.error('更新头像失败');
  }
};
</script>

<style scoped>
.user-profile-container {
  max-width: 800px;
  margin: 20px auto;
}

.avatar-wrapper {
  transition: border-color 0.3s;
}

.avatar-wrapper:hover {
  border-color: rgb(var(--primary-6));
}
</style>
