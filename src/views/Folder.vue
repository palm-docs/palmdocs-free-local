<template>
  <div class="folder-view flex flex-col h-full">
    <top-bar>
      <template #left>
        <breadcrumb
          :items="breadcrumbItems"
          @item-click="navigateToBreadcrumb"
          default-text=""
        />
      </template>
    </top-bar>

    <div class="folder-content h-full p-4">
      <div v-if="loading" class="loading-state">
        <a-spin />
      </div>
      <div v-else-if="!items.length" class="empty-folder h-full flex items-center">
        <a-empty class=""/>
      </div>
      <!-- <div v-else class="items-list">
        <div v-for="item in items"
             :key="item.id"
             class="item"
             @click="openItem(item)">
          <span class="item-icon">{{ item.type === 'directory' ? '📁' : '📄' }}</span>
          <span class="item-name">{{ item.name }}</span>
          <span class="item-date">{{ formatDate(item.lastModified) }}</span>
        </div>
      </div> -->
      <a-table
        v-else
        :data="items"
        :pagination="false"
        :bordered="false"
        @row-click="openItem"
      >
        <template #columns>
          <a-table-column title="名称">
            <template #cell="{ record }">
              <div class="flex items-center gap-2">
                <span class="item-icon">{{ record.type === 'directory' ? '📁' : '📄' }}</span>
                <span>{{ record.name }}</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="保存时间" align="right">
            <template #cell="{ record }">
              {{ formatDate(record.lastSaved) }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DocumentService, type IDocTreeItem } from '../services/IndexedDBService';
import TopBar from '../components/top-bar.vue';
import Breadcrumb from '../components/breadcrumb.vue';

const route = useRoute();
const router = useRouter();
const currentFolder = ref<IDocTreeItem | null | undefined>(null);
const items = ref<IDocTreeItem[]>([]);
const loading = ref(true);
const breadcrumbItems = ref<Array<{id: string; name: string; type: 'directory' | 'file'}>>([]);

onMounted(async () => {
  await loadFolderContent(route.params.id as string);
  loading.value = false;
});

// 加载目录内容
const loadFolderContent = async (folderId: string) => {
  try {
    // 获取当前目录信息
    currentFolder.value = await DocumentService.getDocument(folderId);

    // 获取所有文档
    const allDocs = await DocumentService.getAllDocuments();

    // 过滤出当前目录的直属子元素
    items.value = allDocs.filter(doc => doc.parentId === folderId);

    // 构建面包屑导航路径
    await buildBreadcrumbPath(folderId);
  } catch (error) {
    console.error('加载目录内容失败:', error);
  }
};

// 构建面包屑导航路径
const buildBreadcrumbPath = async (folderId: string) => {
  const path: Array<{id: string; name: string; type: 'directory' | 'file'}> = [];
  let currentId = folderId;

  // 从当前目录开始，向上查找所有父级目录
  while (currentId) {
    const folder = await DocumentService.getDocument(currentId);
    if (folder) {
      // 将当前目录添加到路径开头
      path.unshift({
        id: folder.id,
        name: folder.name,
        type: folder.type as 'directory' | 'file'
      });

      // 继续查找父级目录
      currentId = folder.parentId || '';
    } else {
      break;
    }
  }

  // 添加根目录（如果当前不是根目录）
  if (path.length === 0 || path[0].id !== 'root') {
    path.unshift({
      id: 'root',
      name: '根目录',
      type: 'directory'
    });
  }

  breadcrumbItems.value = path;
};

// 面包屑导航点击处理
const navigateToBreadcrumb = (item: {id: string; name: string; type: 'directory' | 'file'}) => {
  if (item.type === 'directory') {
    router.push(`/folder/${item.id}`);
  }
};

// 打开项目
const openItem = (item: IDocTreeItem) => {
  if (item.type === 'file') {
    router.push(`/editor/${item.id}`);
  } else {
    router.push(`/folder/${item.id}`);
  }
};

// 格式化日期
const formatDate = (date?: Date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadFolderContent(newId as string);
  }
}, { immediate: true });
</script>

<style scoped>


.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.item {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.item:hover {
  background-color: #f5f5f5;
}

.item-icon {
  font-size: 20px;
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  font-size: 12px;
  color: #666;
}

.empty-folder {
  text-align: center;
  color: #666;
  padding: 40px;
}
</style>
