<template>
  <div class="settings-container p-6">
    <div class="mb-4">
      <a-button type="text" @click="router.back()">
        <template #icon><icon-left /></template>
        返回
      </a-button>
    </div>

    <a-card title="设置" :bordered="false">
      <a-form :model="settings" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
        <a-divider>大模型设置</a-divider>

        <a-form-item label="模型选择">
          <a-radio-group v-model="settings.modelType">
            <a-radio value="builtin">使用内置</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="内置模型" v-if="settings.modelType === 'builtin'">
          <a-select v-model="settings.builtinModel">
            <a-option v-for="model in presetModels" :key="model.id" :value="model.id">{{ model.name }}</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="自定义配置" v-if="settings.modelType === 'custom'">
          <a-alert type="info" class="mb-4">
            自定义模型配置功能正在开发中，敬请期待...
          </a-alert>
        </a-form-item>

        <div class="flex justify-end gap-3 mt-6">
          <a-button @click="resetSettings">重置</a-button>
          <a-button type="primary" @click="saveSettings">保存</a-button>
        </div>
      </a-form>
    </a-card>

    <a-card title="系统设置" :bordered="false">
      <div class="settings-section">
        <h3 class="text-lg font-medium mb-4">数据管理</h3>
        <div class="mb-4">
          <p class="text-gray-600 mb-2">重置系统数据将删除所有文档和用户信息，此操作不可恢复。</p>
          <a-button type="primary" status="danger" @click="showResetConfirm = true">
            重置系统数据
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 重置确认对话框 -->
    <a-modal
      v-model:visible="showResetConfirm"
      title="确认重置"
      @ok="handleReset"
      @cancel="showResetConfirm = false"
    >
      <p>确定要重置系统数据吗？此操作将删除所有文档和用户信息，且不可恢复。</p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import { IconLeft } from '@arco-design/web-vue/es/icon';
import { presetModels } from '../utils/ai';
import { resetDatabase } from '../utils/dbUtils';

interface SettingsForm {
  modelType: 'builtin' | 'custom';
  builtinModel: string;
}

const router = useRouter();

const settings = reactive<SettingsForm>({
  modelType: 'builtin',
  builtinModel: presetModels[0].id!
});

const showResetConfirm = ref(false);

const handleReset = async () => {
  try {
    await resetDatabase();
    Message.success('系统数据已重置');
    // 跳转到主页
    router.push('/');
  } catch (error) {
    console.error('重置失败:', error);
    Message.error('重置失败，请重试');
  }
};


onMounted(() => {
  // 从本地存储加载设置
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      settings.modelType = parsedSettings.modelType || 'builtin';
      settings.builtinModel = parsedSettings.builtinModel || 'spark';
    } catch (e) {
      console.error('解析设置信息失败', e);
    }
  }
});

const saveSettings = () => {
  // 保存设置到本地存储
  localStorage.setItem('appSettings', JSON.stringify(settings));
  Message.success('设置已保存');
};

const resetSettings = () => {
  // 重置为默认设置
  settings.modelType = 'builtin';
  settings.builtinModel = 'spark';
};
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 20px auto;
}

.settings-section {
  margin-bottom: 24px;
}
</style>
