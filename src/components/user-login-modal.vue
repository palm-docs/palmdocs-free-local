<template>
  <a-modal
    :visible="visible"
    :closable="false"
    :mask-closable="false"
    :footer="false"
    width="400px"
    draggable
    unmount-on-close
  >
    <template #title>
      <div class="flex items-center">
        <img :src="logoImg" width="24" class="mr-2" />
        <span>欢迎使用 Palm Docs</span>
      </div>
    </template>

    <div class="login-container p-4">
      <div v-if="loginMode === 'select'">
        <p class="text-gray-600 mb-4">请选择一个用户账号登录，或创建新账号</p>

        <!-- 用户列表 -->
        <div class="user-list mb-4">
          <div
            v-for="user in userList"
            :key="user.id"
            class="user-item flex items-center p-2 mb-2 border rounded hover:bg-gray-50 cursor-pointer"
            @click="selectUser(user)"
          >
            <div class="avatar-preview w-10 h-10 rounded-full overflow-hidden mr-3">
              <img v-if="user.avatar" :src="user.avatar" class="w-full h-full object-cover" />
              <icon-user v-else class="w-full h-full text-gray-400 p-2" />
            </div>
            <div class="flex-1">
              <div class="font-medium">{{ user.nickname }}</div>
              <div class="text-xs text-gray-500">{{ user.account_type === 'default' ? '默认账号' : '自定义账号' }}</div>
            </div>
          </div>
        </div>

        <!-- 创建新账号按钮 -->
        <a-button type="outline" long @click="switchToCreateMode">创建新账号</a-button>
      </div>

      <!-- 密码登录模式 -->
      <div v-else-if="loginMode === 'password'">
        <div class="flex items-center mb-4">
          <div class="avatar-preview w-12 h-12 rounded-full overflow-hidden mr-3">
            <img v-if="selectedUser?.avatar" :src="selectedUser.avatar" class="w-full h-full object-cover" />
            <icon-user v-else class="w-full h-full text-gray-400 p-2" />
          </div>
          <div>
            <div class="font-medium">{{ selectedUser?.nickname }}</div>
            <div class="text-xs text-gray-500">{{ selectedUser?.account_type === 'default' ? '默认账号（密码: 1234）' : '自定义账号' }}</div>
          </div>
        </div>

        <a-form :model="loginForm" class="mb-4">
          <a-form-item>
            <a-input-password
              v-model="loginForm.password"
              placeholder="请输入密码"
              allow-clear
              @keyup.enter="handleLogin"
            />
          </a-form-item>
          <div v-if="passwordError" class="text-red-500 text-sm mb-2">{{ passwordError }}</div>
        </a-form>

        <div class="flex justify-between">
          <a-button @click="backToUserSelect">返回</a-button>
          <a-button type="primary" @click="handleLogin">登录</a-button>
        </div>
      </div>

      <!-- 创建新账号模式 -->
      <div v-else-if="loginMode === 'create'">
        <p class="text-gray-600 mb-4">创建新账号</p>

        <a-form :model="newUserForm" class="mb-4">
          <a-form-item>
            <template #label>
              <div class="flex items-center">
                <span class="mr-1">昵称</span>
              </div>
            </template>
            <a-input
              v-model="newUserForm.nickname"
              placeholder="请输入昵称"
              allow-clear
              maxlength="10"
            />
            <div v-if="formErrors.nickname" class="text-red-500 text-sm mt-1">{{ formErrors.nickname }}</div>
          </a-form-item>

          <a-form-item>
            <template #label>
              <div class="flex items-center">
                <span class="mr-1">密码</span>
              </div>
            </template>
            <a-input-password
              v-model="newUserForm.password"
              placeholder="请输入密码"
              allow-clear
            />
            <div v-if="formErrors.password" class="text-red-500 text-sm mt-1">{{ formErrors.password }}</div>
          </a-form-item>

          <a-form-item>
            <template #label>
              <div class="flex items-center">
                <span class="mr-1">确认密码</span>
              </div>
            </template>
            <a-input-password
              v-model="newUserForm.confirmPassword"
              placeholder="请再次输入密码"
              allow-clear
            />
            <div v-if="formErrors.confirmPassword" class="text-red-500 text-sm mt-1">{{ formErrors.confirmPassword }}</div>
          </a-form-item>
        </a-form>

        <div class="flex justify-between">
          <a-button @click="backToUserSelect">返回</a-button>
          <a-button type="primary" @click="createNewUser">创建并登录</a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, reactive, watch } from 'vue';
import { DocumentService, type IUserInfo } from '../services/IndexedDBService';
import { getRandomAvatarPath } from '../utils/avatarUtils';
import logoImg from "@/assets/logo.png";
import { Message } from '@arco-design/web-vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'login']);

// 登录模式：select(选择用户)、password(输入密码)、create(创建新用户)
const loginMode = ref('select');
const userList = ref<IUserInfo[]>([]);
const selectedUser = ref<IUserInfo | null>(null);
const passwordError = ref('');

// 登录表单
const loginForm = reactive({
  password: ''
});

// 新用户表单
const newUserForm = reactive({
  nickname: '',
  password: '',
  confirmPassword: ''
});

// 表单错误信息
const formErrors = reactive({
  nickname: '',
  password: '',
  confirmPassword: ''
});

// 加载用户列表
const loadUserList = async () => {
  try {
    userList.value = await DocumentService.getAllUsers();
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
};

// 组件挂载时加载用户列表
onMounted(() => {
  loadUserList();
});

// 监听模态框显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadUserList();
  }
});

// 选择用户
const selectUser = (user: IUserInfo) => {
  selectedUser.value = user;
  loginMode.value = 'password';
  passwordError.value = '';
  loginForm.password = user.account_type === 'default' ? '1234' : '';
};

// 返回用户选择
const backToUserSelect = () => {
  loginMode.value = 'select';
  selectedUser.value = null;
  passwordError.value = '';
  loginForm.password = '';

  // 清空新用户表单
  newUserForm.nickname = '';
  newUserForm.password = '';
  newUserForm.confirmPassword = '';
  formErrors.nickname = '';
  formErrors.password = '';
  formErrors.confirmPassword = '';
};

// 切换到创建用户模式
const switchToCreateMode = () => {
  loginMode.value = 'create';
};

// 验证新用户表单
const validateNewUserForm = () => {
  let isValid = true;

  // 验证昵称
  if (!newUserForm.nickname.trim()) {
    formErrors.nickname = '请输入昵称';
    isValid = false;
  } else if (newUserForm.nickname.length > 10) {
    formErrors.nickname = '昵称不能超过10个字符';
    isValid = false;
  } else {
    formErrors.nickname = '';
  }

  // 验证密码
  if (!newUserForm.password) {
    formErrors.password = '请输入密码';
    isValid = false;
  } else if (newUserForm.password.length < 4) {
    formErrors.password = '密码不能少于4个字符';
    isValid = false;
  } else {
    formErrors.password = '';
  }

  // 验证确认密码
  if (!newUserForm.confirmPassword) {
    formErrors.confirmPassword = '请确认密码';
    isValid = false;
  } else if (newUserForm.confirmPassword !== newUserForm.password) {
    formErrors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  } else {
    formErrors.confirmPassword = '';
  }

  return isValid;
};

// 创建新用户
const createNewUser = async () => {
  if (!validateNewUserForm()) return;

  try {
    // 生成随机账号
    const account = `user_${Date.now().toString(36)}`;
    // 使用预置头像
    const avatar = getRandomAvatarPath();

    // 创建用户
    const newUser = await DocumentService.createUser({
      account,
      email: '',
      nickname: newUserForm.nickname,
      password: newUserForm.password,
      avatar,
      account_type: 'custom'
    });

    // 设置为当前用户并登录
    await DocumentService.setCurrentUser(newUser.id);
    completeLogin(newUser);
  } catch (error) {
    console.error('创建用户失败:', error);
  }
};

// 处理登录
const handleLogin = async () => {
  if (!selectedUser.value) {
    Message.error('请先选择用户');
    return;
  }

  if (!loginForm.password) {
    passwordError.value = '请输入密码';
    return;
  }

  try {
    const isValid = await DocumentService.verifyUserLogin(
      selectedUser.value.id,
      loginForm.password
    );

    if (isValid) {
      await DocumentService.setCurrentUser(selectedUser.value.id);
      completeLogin(selectedUser.value);
    } else {
      passwordError.value = '密码错误';
      Message.error('密码错误，请重试');
    }
  } catch (error) {
    console.error('登录验证失败:', error);
    passwordError.value = '登录失败，请重试';
    Message.error('登录失败，请重试');
  }
};

// 完成登录流程
const completeLogin = (user: IUserInfo) => {
  // 保存用户信息到localStorage
  const userProfile = {
    account: user.account,
    nickname: user.nickname,
    name: user.nickname,
    avatar: user.avatar,
    avatarUrl: user.avatarUrl,
    id: user.id
  };

  localStorage.setItem('userProfile', JSON.stringify(userProfile));

  // 关闭模态框并触发登录事件
  emit('update:visible', false);
  emit('login');

  // 触发用户登录事件
  window.dispatchEvent(new CustomEvent('user-login', {
    detail: { userId: user.id }
  }));

  // 显示登录成功消息
  Message.success('登录成功');
};
</script>

<style scoped>
.avatar-preview {
  background-color: #f5f5f5;
}

.user-item {
  transition: all 0.2s;
}

.user-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
