<template>
  <div
    class="tree-item"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="handleDrop"
  >
    <!-- 目录项 -->
    <div
      class="flex items-center justify-between p-2 rounded-md hover:bg-gray-200 cursor-pointer"
      @mouseenter="showActions = true"
      @mouseleave="handleMouseLeave"
      @click="handleSelect"
    >
      <div class="flex">
        <icon-caret-right
          v-if="item.children && item.children.length > 0"
          class="mr-1 transition-transform flex-shrink-0"
          :class="{ 'rotate-90': isOpen }"
          @click.stop="toggleFolder"
        />

        <template v-if="isFolder">
          <folder-open v-show="isOpen" class="mr-2 text-gray-400 flex-shrink-0"/>
          <folder-closed v-show="!isOpen" class="mr-2 text-gray-400 flex-shrink-0"/>
        </template>
        <template v-else>
          <icon-doc class="mr-2  flex-shrink-0"/>
        </template>
      </div>

      <div class="flex items-center flex-1 truncate">
        <span class="truncate"
      :class="{ 'text-blue-500': currentId === item.id }">{{ item.name }}</span>
      </div>
      <div
        class="actions-wrapper text-gray-500"
        @mouseenter="inActionsArea = true"
        @mouseleave="inActionsArea = false" @click.stop
      >
        <a-dropdown
          :popup-visible="moreDropdownVisible"
          @popup-visible-change="handleMoreDropdownVisibleChange"
          trigger="manual"
          position="br">
          <icon-more
            class="cursor-pointer transition-opacity duration-200 p-1 w-6 h-6 hover:bg-gray-300 rounded"
            :class="[(showActions || inActionsArea )? 'opacity-100' : 'opacity-0']"
            @click="toggleMoreDropdown"
          />
          <template #content>
            <a-doption @click.stop="copyLink">
              <icon-link class="mr-2" />复制链接
            </a-doption>
            <a-doption @click.stop="renameItem">
              <icon-edit class="mr-2" />重命名
            </a-doption>
            <a-doption @click.stop="$emit('delete-document', item.id!)">
              <icon-delete class="mr-2"/>删除
            </a-doption>
          </template>
        </a-dropdown>

        <a-dropdown
          :popup-visible="plusDropdownVisible"
          @popup-visible-change="handlePlusDropdownVisibleChange"
          trigger="manual"
          position="br">
          <icon-plus @click.stop="togglePlusDropdown"
            class="cursor-pointer transition-opacity duration-200 w-6 h-6 p-1 hover:bg-gray-300 rounded"
            :class="[(showActions || inActionsArea )? 'opacity-100' : 'opacity-0']"
          />

          <template #content>
            <a-doption @click.stop="addNewFile">
              <template #icon><icon-doc class=""/></template>
              文档
            </a-doption>
            <a-doption @click.stop="addNewDirectory">
              <template #icon ><folder-closed /></template>
              目录
            </a-doption>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 子项容器 -->
    <div v-if="item.children && isOpen && item.children?.length"
         class="ml-4 pl-4 border-l border-gray-200">
      <doc-tree-item
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :current-id="currentId"
        @delete-document="$emit('delete-document', $event)"
        @select-item="$emit('select-item', $event)"
        @refresh-tree="$emit('refresh-tree')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DocumentService, type IDocTreeItem } from '../services/IndexedDBService';
import {
  IconCaretRight,
  IconDelete,
  IconMore,
  IconLink,
  IconPlus,
  IconEdit
} from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';

import FolderOpen from './icons/folder-open.vue';
import FolderClosed from './icons/folder-closed.vue';
import IconDoc from './icons/icon-doc.vue';

interface Props {
  item: IDocTreeItem;
  currentId?: string|null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'delete-document': [id: string];
  'select-item': [item: Props['item']];
  'refresh-tree': [];
}>();

const isOpen = ref(true);
const isFolder = computed(() => props.item.type === 'directory');

const toggleFolder = () => {
  isOpen.value = !isOpen.value;
};

const showActions = ref(false);
const inActionsArea = ref(false);
const moreDropdownVisible = ref(false);
const plusDropdownVisible = ref(false);

const handleMouseLeave = () => {
  // 延迟处理，给用户时间移动到下拉菜单
  setTimeout(() => {
    if (!inActionsArea.value && !moreDropdownVisible.value && !plusDropdownVisible.value) {
      showActions.value = false;
    }
  }, 200);
};

const toggleMoreDropdown = () => {
  moreDropdownVisible.value = !moreDropdownVisible.value;
};
const togglePlusDropdown = () => {
  plusDropdownVisible.value = !plusDropdownVisible.value;
};

const handleMoreDropdownVisibleChange = (visible: boolean) => {
  moreDropdownVisible.value = visible;
  if (!visible) {
    // 菜单关闭后，检查是否需要隐藏操作按钮
    if (!inActionsArea.value) {
      showActions.value = false;
    }
  }
};
const handlePlusDropdownVisibleChange = (visible: boolean) => {
  plusDropdownVisible.value = visible;
  if (!visible) {
    // 菜单关闭后，检查是否需要隐藏操作按钮
    if (!inActionsArea.value) {
      showActions.value = false;
    }
  }
};

// 复制文档链接到剪贴板
const copyLink = () => {
  // 构建文档链接
  const baseUrl = window.location.origin;
  const docLink = `${baseUrl}/${isFolder.value ? 'folder' : 'editor'}/${props.item.id}`;

  // 复制到剪贴板
  navigator.clipboard.writeText(docLink)
    .then(() => {
      Message.success('链接已复制到剪贴板');
    })
    .catch(err => {
      console.error('复制失败:', err);
      Message.error(`复制失败: ${err}`);
    });
}

const renameItem = async () => {
  const newName = prompt('请输入新名称', props.item.name)?.trim();
  if (!newName || newName === props.item.name) return;

  try {
    await DocumentService.renameDocument(props.item.id, newName);
    emit('refresh-tree');
    Message.success('重命名成功');
  } catch (error) {
    console.error('重命名失败:', error);
    Message.error(`重命名失败: ${error}`);
  }
}
const addNewFile = async () => {
  const fileName = prompt('请输入文件名称');
  if (!fileName) return;

  try {
    await DocumentService.createDocument(fileName, 'file', props.item.id, '');
    emit('refresh-tree');
  } catch (error) {
    console.error('创建文件失败:', error);
    alert('创建失败: ' + error);
  }
};

const addNewDirectory = async () => {
  const dirName = prompt('请输入目录名称');
  if (!dirName) return;

  try {
    await DocumentService.createDocument(dirName, 'directory', props.item.id, '');
    emit('refresh-tree');
  } catch (error) {
    console.error('创建目录失败:', error);
    alert('创建失败: ' + error);
  }
};

const handleSelect = () => {
  emit('select-item', props.item);
};

// 拖拽相关
const handleDragStart = (e: DragEvent) => {
  e.dataTransfer?.setData('text/plain', JSON.stringify(props.item));
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  const draggedItem = JSON.parse(e.dataTransfer?.getData('text/plain') || '{}');
  if (props.item.type === 'directory' && draggedItem.id !== props.item.id) {
    try {
      await DocumentService.moveDocument(draggedItem.id, props.item.id);
      emit('refresh-tree');
    } catch (error) {
      console.error('移动失败:', error);
      alert('移动失败: ' + error);
    }
  }
};
</script>
