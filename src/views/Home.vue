<template>
  <div class="app-container flex w-screen h-screen overflow-hidden flex-col">
    <!-- 登录模态框 -->
    <user-login-modal v-model:visible="showLoginModal" @login="handleLogin" />
    <div class="flex flex-1 overflow-hidden">
      <!-- 区域1: 左侧文档列表 -->
      <div
        class="sidebar"
        :class="[
          'bg-gray-50',
          sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded',
        ]"
      >
        <!-- 侧边栏已折叠 -->
        <div
          v-show="sidebarCollapsed"
          class="w-full h-full flex justify-center items-center relative">
          <span class="absolute top-4 logo">
            <img :src="logoImg" width="32" class="logo-palm cursor-pointer" @click="goHome" />
          </span>

          <span
            class="rounded text-gray-500 cursor-pointer p-1 hover:bg-gray-200"
            @click="toggleSidebar"
          >
            <icon-menu-unfold size="24" />
          </span>
        </div>

        <!-- 侧边栏已显示 -->
        <div v-show="!sidebarCollapsed" class="sidebar-content flex flex-col">
          <div
            class="sidebar-header px-2 py-3 flex justify-between"
          >
            <div class="text-lg flex items-center logo-box">
              <img :src="logoImg" width="32" class="logo-palm cursor-pointer" @click="goHome"/>
              <span class="ml-2 cursor-pointer" @click="goHome">Palm Docs
                <span class="text-sm bg-gradient-to-r from-purple-400 to-blue-500 rounded-full px-2 py-0.5 text-white transition-colors duration-300 hover:from-purple-500 hover:to-blue-600">free local</span>
              </span>
            </div>
            <div
              class="toggle-action rounded text-gray-500 cursor-pointer p-1 hover:bg-gray-200"
              @click="toggleSidebar"
            >
              <icon-menu-fold v-show="!sidebarCollapsed" size="24" />
            </div>
          </div>

          <div class="w-full p-2 flex justify-between items-center text-gray-500">
            <span>目录</span>
            <!-- <a-button>Click Me</a-button> -->

            <!-- 添加按钮 -->
            <a-dropdown position="br" @select="createNewItem">
              <span class="p-1 hover:bg-gray-200 rounded cursor-pointer" >
                <icon-plus size="16" />
              </span>
              <template #content>
                <a-doption value="file">
                  <div class="flex items-center">
                    <icon-doc class="mr-2" />文档
                  </div>
                </a-doption>
                <a-doption value="directory">
                  <div class="flex items-center">
                    <folder-closed class="mr-2" />文件夹
                  </div>
                </a-doption>
              </template>
            </a-dropdown>
          </div>

          <div class="document-list flex-1 overflow-y-auto p-3">
            <!-- 使用递归组件渲染树形结构 -->
            <doc-tree-item
              v-for="item in documentTree"
              :key="item.id"
              :item="item"
              :current-id="currentDocumentId"
              @open-document="openDocument"
              @select-item="handleItemSelect"
              @delete-document="deleteDocument"
              @refresh-tree="loadDocumentTree"
            />
          </div>
        </div>
      </div>

      <div class="main-content flex-1" :class="[]">
        <router-view
          ref="currentView"
          @content-change="handleContentChange"
        ></router-view>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
// import LoginModal from "../components/login-modal.vue";
import userLoginModal from "@/components/user-login-modal.vue";
import { useRoute, useRouter } from "vue-router";
import {
  DocumentService,
  type IDocTreeItem,
} from "../services/IndexedDBService";
import DocTreeItem from "../components/doc-tree-item.vue";
import FolderClosed from '../components/icons/folder-closed.vue';
import IconDoc from '../components/icons/icon-doc.vue';
import AppFooter from '../components/AppFooter.vue';
import { Message } from "@arco-design/web-vue";

const route = useRoute();
const router = useRouter();

const logoImg = ref("");

// 状态管理
const sidebarCollapsed = ref(false);
const currentDocument = ref<IDocTreeItem | null>(null);
const currentView = ref<any>(null);
const documentTree = ref<IDocTreeItem[]>([]);

// 获取当前文档ID
const currentDocumentId = computed(() => {
  if (route.name === "Editor") {
    return route.params.id as string;
  }
  return null;
});

// 从 DocumentService 加载文档树
const loadDocumentTree = async () => {
  try {
    documentTree.value = await DocumentService.getDocumentTree();
  } catch (error) {
    console.error("加载文档树失败:", error);
  }
};

// 侧边栏折叠/展开
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// 打开文档或目录
const openDocument = (doc: IDocTreeItem) => {
  // currentDocumentId.value = doc.id;  // 更新当前文档ID
  router.push(`/editor/${doc.id}`);
};
// 添加内容变更处理函数
const handleContentChange = async (doc: IDocTreeItem) => {
  if (!currentDocument.value) return;

  // contentCache.value = content;
  // hasUnsavedChanges.value = true;

  // selectedItem.value = doc;
  // TODO
};

// 添加删除文档的方法
const deleteDocument = async (id: string) => {
  try {
    if (confirm("确定要删除此文档吗？此操作不可恢复。")) {
      await DocumentService.deleteDocument(id);

      // 如果删除的是当前文档，返回首页
      if (currentDocumentId.value === id) {
        router.push("/");
      }

      // 刷新文档树
      await loadDocumentTree();

      alert("文档已删除");
    }
  } catch (error) {
    console.error("删除文档失败:", error);
    alert("删除失败: " + error);
  }
};

const goHome = () => {
  router.push("/");
};

// 监听路由变化，加载当前文档信息
watch(
  () => route.params.id,
  async (newId) => {
    if (newId && route.name === "Editor") {
      try {
        const doc = await DocumentService.getDocument(newId as string);
        currentDocument.value = doc || null;
      } catch (error) {
        console.error("加载文档信息失败:", error);
        Message.error("加载文档信息失败");
      }
    }
  },
  { immediate: true }
);

// 添加新的状态
const showAddMenu = ref(false);
const selectedItem = ref<IDocTreeItem | null>(null);

// 处理文档项选择
const handleItemSelect = (item: IDocTreeItem) => {
  selectedItem.value = item;
  if (item.type === "file") {
    router.push(`/editor/${item.id}`);
  } else {
    router.push(`/folder/${item.id}`);
  }
};

// 创建新项目（文档或目录）
const createNewItem = async (type: "file" | "directory") => {
  const itemName = prompt(`请输入${type === "file" ? "文档" : "目录"}名称`);
  if (!itemName) return;

  try {
    let parentId: string | null = null;

    // if (selectedItem.value) {
    //   if (selectedItem.value.type === "directory") {
    //     // 如果选中的是目录，创建为子项
    //     parentId = selectedItem.value.id;
    //   } else {
    //     // 如果选中的是文件，创建为同级项
    //     parentId = selectedItem.value.parentId;
    //   }
    // }

    const newItem = await DocumentService.createDocument(
      itemName,
      type,
      parentId
    );
    await loadDocumentTree();

    if (type === "file") {
      router.push(`/editor/${newItem.id}`);
    }

    showAddMenu.value = false;
  } catch (error) {
    console.error("创建失败:", error);
    alert("创建失败: " + error);
  }
};

// 登录模态框状态
const showLoginModal = ref(false);

// 处理登录成功
const handleLogin = async () => {
  // 登录成功后刷新文档树
  await loadDocumentTree();
  // 关闭登录模态框
  showLoginModal.value = false;
};
const handleLogout = () => {
  documentTree.value = [];
  showLoginModal.value = true;
  router.replace('/');
}

onMounted(async () => {
  try {
    // 检查用户是否已登录
    const userProfile = localStorage.getItem('userProfile');

    if (!userProfile) {
      // 如果未登录，显示登录模态框
      showLoginModal.value = true;
    } else {
      // 如果已登录，加载文档树
      await loadDocumentTree();
    }

    // 加载 logo
    const logo = await import("../assets/logo.png");
    logoImg.value = logo.default;

    // 监听登出事件
    window.addEventListener('user-logout', handleLogout);
  } catch (error) {
    console.error('Failed to initialize application:', error);
    Message.error('应用初始化失败，请刷新页面重试');
  }
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('user-logout', handleLogout);
});

</script>

<style scoped lang="scss">
.app-container {
  position: fixed;
  top: 0;
  left: 0;
}

.logo-box:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

/* 侧边栏样式 */
.sidebar {
  position: relative;
  width: 280px;
  /* min-width: 280px; */
  height: 100%;
  /* background-color: #f5f5f5; */
  /* border-right: 1px solid #e0e0e0; */
  transition: transform 0.3s ease, min-width 0.3s ease;
  z-index: 100;
}

.sidebar.sidebar-collapsed {
  width: 40px;
}

.sidebar-content {
  /* width: 280px; */
  height: 100%;
  overflow-y: auto;
}

.sidebar-collapsed {
  /* transform: translateX(-240px); */
  min-width: 40;
}

.sidebar-collapsed .sidebar-content {
  visibility: collapse;
}

/* .sidebar-collapsed:hover {
  transform: translateX(0);
}
.sidebar-collapsed:hover .sidebar-content{
  visibility: visible;
}
.sidebar-collapsed:hover .sidebar-toggle .btn-open{
  right: 16px;
} */

.sidebar-toggle .btn-collapse {
  position: absolute;
  right: 20px;
  top: 16px;
  width: 30px;
  height: 30px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  border-radius: 0 4px 4px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle .btn-open {
  position: absolute;
  right: 4px;
  top: 20px;
  width: 30px;
  height: 30px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  border-radius: 0 4px 4px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle {
}

/* 文档列表样式 */
.document-list {
  height: 100%;
}

.folder {
  margin-bottom: 15px;
}

.folder-name {
  font-weight: bold;
  margin-bottom: 8px;
  padding: 5px;
  background-color: #e9e9e9;
  border-radius: 4px;
}

.file {
  padding: 8px 10px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.file:hover {
  background-color: #e0e0e0;
}

.file.active {
  background-color: #d0d0d0;
  font-weight: bold;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  transition: margin-left 0.3s ease;
}

.main-expanded {
  margin-left: -240px;
}

/* .document-info, */
.search-bar {
  display: flex;
  gap: 20px;
  flex: 1;
}

.search-bar input {
  width: 300px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 5px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}

.save-btn:hover {
  background-color: #45a049;
}

.new-btn {
  background-color: #2196f3;
  color: white;
}

.new-btn:hover {
  background-color: #0b7dda;
}

.home-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.home-btn:hover {
  background-color: #e0e0e0;
}

.logout-btn {
  background-color: #f44336;
  color: white;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

/* 添加树形结构样式 */
.tree-item {
  margin-bottom: 5px;
}

.folder-name {
  font-weight: bold;
  margin-bottom: 8px;
  padding: 5px;
  background-color: #e9e9e9;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.folder-icon,
.file-icon {
  margin-right: 5px;
}

.file {
  padding: 8px 10px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.children-container {
  margin-left: 15px;
  border-left: 1px dashed #ccc;
  padding-left: 10px;
}

/* 添加保存通知样式 */
.save-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slide-in 0.3s ease-out;
}

.fade-out {
  opacity: 0;
  transition: opacity 0.5s;
}

@keyframes slide-in {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
