<template>
  <footer class="app-footer bg-gray-100 border-t border-gray-200 py-3 px-4">
    <div class="container mx-auto flex flex-wrap justify-between items-center text-sm text-gray-600">
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
