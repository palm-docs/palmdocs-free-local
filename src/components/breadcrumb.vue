<template>
  <div class="breadcrumb flex items-center text-sm">
    <template v-if="items.length > 0">
      <template v-for="(item, index) in items" :key="item.id">
        <!-- 面包屑项 -->
        <span
          class="breadcrumb-item cursor-pointer hover:text-blue-500 transition-colors"
          @click="handleClick(item)"
        >
          {{ item.name }}
        </span>

        <!-- 分隔符 -->
        <span v-if="index < items.length - 1" class="mx-1 text-gray-400">/</span>
      </template>
    </template>
    <template v-else>
      <span class="text-gray-500">{{ defaultText }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
// import { defineProps, defineEmits } from 'vue';

interface BreadcrumbItem {
  id: string;
  name: string;
  type: 'directory' | 'file';
}

defineProps<{
  items: BreadcrumbItem[];
  defaultText?: string;
}>()

const emit = defineEmits<{
  (e: 'itemClick', item: BreadcrumbItem): void;
}>();

const handleClick = (item: BreadcrumbItem) => {
  emit('itemClick', item);
};
</script>

<style scoped>
.breadcrumb {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumb-item {
  max-width: 150px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
