<template>
  <div class="top-bar p-4 h-16 border-b border-b-gray-200 flex items-center justify-between">
    <div class="top-bar-main flex-1 flex justify-between items-center pr-2">
      <div class="top-bar-left">
        <slot name="left" />
      </div>
      <div class="top-bar-right">
        <slot name="right" />
      </div>
    </div>

    <div class="user-actions">
      <user-avatar-menu @user-info="showUserInfo" />
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatarMenu from './user-avatar-menu.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const showUserInfo = () => {
  router.push('/profile');
};
</script>
