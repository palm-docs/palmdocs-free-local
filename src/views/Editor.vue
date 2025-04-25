<template>
  <div class="editor-container w-full h-full flex flex-col">
    <!-- 顶部信息栏 -->
    <top-bar>
      <template #left>
        <div v-if="currentDocument" class="document-info">
          <div class="mb-1">
            {{ currentDocument.name }}
          </div>
          <div class="text-gray-500 flex items-center">
            <breadcrumb
              :items="breadcrumbItems"
              @item-click="navigateToBreadcrumb"
              class="mr-5"
              default-text="Root"
            />
            <span v-if="currentDocument && currentDocument.lastModified">
              最后修改: {{ formatDate(currentDocument.lastModified) }}</span
            >
            <span class="ml-2">{{
              currentDocument.lastSaved && currentDocument.lastModified &&
              currentDocument.lastSaved >= currentDocument.lastModified
                ? "已保存"
                : "未保存"
            }}</span>
          </div>
        </div>
      </template>
    </top-bar>

    <!-- <div class="top-bar flex items-center justify-between p-4 shadow-xl h-16 border-b border-b-gray-200">
      <div class="user-actions">
        <user-avatar-menu @user-info="showUserInfo" @settings="openSettings" />
      </div>
    </div> -->

    <div v-show="docId" ref="editorRef" class="editor-area flex-1"></div>
    <div v-show="!docId" class="editor-area flex-1 flex items-center justify-center">
      <div class="text-center p-8 max-w-2xl">
        <h2 class="text-2xl font-bold mb-4">欢迎使用 Palm Docs</h2>
        <p class="text-gray-600">这是一个极简的本地文档编辑器和文档管理工具，<br>您可以从左侧目录选择文档或创建新文档开始使用。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AiEditor } from "aieditor";
// import "../../lib/style.css";
import { DocumentService, type IDocTreeItem } from "../services/IndexedDBService";
import { Message } from "@arco-design/web-vue";
import TopBar from "../components/top-bar.vue";
import Breadcrumb from "../components/breadcrumb.vue";
import { formatDate, throttle } from "../utils/utils";
import { getCurrentModel } from "@/utils/ai";

const route = useRoute();
const router = useRouter();
const emit = defineEmits(["content-change", 'saved']);
const editorRef = ref<HTMLElement | null>(null);
let aiEditor: AiEditor | null = null;

const documentContent = ref<string>("");
const currentDocument = ref<IDocTreeItem | null>(null);
// 添加自动保存的定时器引用
const autoSaveInterval = ref<number | null>(null);
// 面包屑导航路径
const breadcrumbItems = ref<Array<{id: string; name: string; type: 'directory' | 'file'}>>([]);

watch(
  () => route.params.id,
  async (newId) => {
    init();
  }
);

// 保存文档
const saveDocument = async (isAutoSave = false) => {
  if (!aiEditor || !docId.value) return "";

  try {
    // 获取编辑器当前内容
    const content = aiEditor.getHtml();
    documentContent.value = content;

    // 更新文档内容
    const updatedDoc = {
      ...currentDocument.value,
      content: content,
    } as IDocTreeItem;

    // 保存到数据库
    await DocumentService.saveDocument(updatedDoc);
    currentDocument.value = await DocumentService.getDocument(docId.value as string) as IDocTreeItem;

    // 只在手动保存时显示通知
    if (!isAutoSave) {
      Message.success("文档已保存");
    }

    emit("saved");
  } catch (error) {
    console.error("保存文档失败:", error);
    return "";
  }
};

// 监听键盘快捷键
const handleKeyDown = (e: KeyboardEvent) => {
  // Ctrl+S 保存文档
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveDocument();
  }
};
const throttledChangeHandler = throttle((content: string) => {
  // currentDocument.value = {
  //   ...currentDocument.value,
  //   content: content,
  //   lastModified: new Date(),
  // };
  currentDocument.value!.content = content;
  currentDocument.value!.lastModified = new Date();

  console.log("throttledChangeHandler", currentDocument.value!.lastModified);
  emit("content-change", currentDocument.value);
}, 1000);

const docId = computed(() => route.params.id);
// 构建面包屑导航路径
const buildBreadcrumbPath = async (documentId: string) => {
  const path: Array<{id: string; name: string; type: 'directory' | 'file'}> = [];
  let currentId = documentId;
  let currentDoc = await DocumentService.getDocument(currentId);

  // 如果当前是文档，先添加文档本身
  if (currentDoc && currentDoc.type === 'file') {
    currentId = currentDoc.parentId || '';
  }

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
  } else if (item.type === 'file' && item.id !== docId.value) {
    router.push(`/editor/${item.id}`);
  }
};

const init = async () => {
  if (!docId.value) {
    if (autoSaveInterval.value) {
      clearInterval(autoSaveInterval.value);
      autoSaveInterval.value = null;
    }
    currentDocument.value = null;
    return;
  }

  try {
    const doc = await DocumentService.getDocument(docId.value as string);
    currentDocument.value = doc!;
    if (doc) {
      documentContent.value = doc.content || "";

      if (!aiEditor && editorRef.value) {
        const modelConfig = getCurrentModel();
        aiEditor = new AiEditor({
          draggable: false,
          element: editorRef.value,
          placeholder: "/ 唤起快捷命令，Ctrl + / 唤起智能创作助手",
          content: "",
          documentName: doc.name,
          onChange(editor) {
            throttledChangeHandler(editor.getHtml());
          },
          toolbarExcludeKeys: ['ai'],
          ai: {
            // @ts-ignore
            models: {
              [modelConfig.nameKey as unknown as string]: modelConfig,
            }
          },
          poweredBy: '',
        });
      }

      // aiEditor!.setDocName(doc.name);
      aiEditor!.setContent(documentContent.value);

      // 构建面包屑导航
      await buildBreadcrumbPath(docId.value as string);

      if (!autoSaveInterval.value) {
        // 设置自动保存 - 每30秒自动保存一次
        autoSaveInterval.value = window.setInterval(() => {
          saveDocument(true); // 传入参数表示这是自动保存
        }, 2000);

      }
    } else {
      Message.error("文档不存在");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  } catch (error: any) {
    Message.error("加载文档失败:", error);
  }
};

onMounted(async () => {
  await init();

  // 添加键盘快捷键监听
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  aiEditor && aiEditor.destroy();
  // 移除键盘快捷键监听
  window.removeEventListener("keydown", handleKeyDown);
  // 清除自动保存定时器
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value);
    autoSaveInterval.value = null;
  }
});

// 暴露保存方法给父组件
defineExpose({
  saveDocument,
});
</script>

<style scoped lang="scss">

.editor-area {
  height: 100%;
  overflow: auto;
}
</style>
