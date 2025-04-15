<template>
  <footer class="app-footer bg-gray-100 border-t border-gray-200 py-3 px-4">
    <div class="container mx-auto flex flex-wrap justify-center items-center text-sm text-gray-600 space-x-6">
      <div class="copyright">
        © {{ new Date().getFullYear() }} Palm Docs. 保留所有权利。
      </div>
      <div class="links flex gap-4 relative">
        <a href="#" class="hover:text-gray-900 hover:underline">关于我们</a>
        <a href="#" class="hover:text-gray-900 hover:underline">使用条款</a>
        <a href="#" class="hover:text-gray-900 hover:underline">隐私政策</a>
        <div class="contact-link relative">
          <a href="#" class="hover:text-gray-900 hover:underline">联系我们</a>
          <div class="qrcode-popup w-64 absolute bottom-full left-1/2 transform -translate-x-1/2 p-2 bg-white rounded shadow-lg opacity-1 transition-opacity duration-200">
            <img src="../assets/qrcode_qq.jpg" alt="QQ二维码" class="w-64">
          </div>
        </div>
      </div>
      <a href="https://github.com/palm-docs/palmdocs-free-local.git" target="_blank" class="text-gray-600 hover:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.087.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .267.18.577.688.479C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd"/>
        </svg>
      </a>
    </div>
  </footer>
</template>

<style scoped>
.contact-link:hover .qrcode-popup {
  opacity: 1;
}

.qrcode-popup {
  pointer-events: none;
}
</style>
