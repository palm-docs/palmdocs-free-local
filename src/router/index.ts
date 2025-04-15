import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Folder from '../views/Folder.vue'
import Editor from '../views/Editor.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: { name: 'Editor' },
    meta: { requiresAuth: true },
    children: [
      {
        path: 'editor/:id?',
        name: 'Editor',
        component: () => import('../views/Editor.vue'),
        meta: { title: '编辑文档' }
      },
      {
        path: 'folder/:id',
        name: 'Folder',
        component: Folder
      }
    ]
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true, title: '个人信息' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true, title: '设置' }
  },
  // 捕获所有不存在的路由并重定向到主页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },

  // {
  //   path: '/oauth/callback/github',
  //   name: 'GithubCallback',
  //   component: () => import('../views/callback/GithubCallback.vue'),
  //   meta: { title: 'Github登录中..' }
  // }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Palm Docs` : 'Palm Docs';

  // 检查用户是否已登录
  const storedUser = localStorage.getItem('userProfile');
  const userInfo = storedUser ? JSON.parse(storedUser) : null;

  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !userInfo) {
    // 如果是其他需要权限的路由，也需要权限检查
    if (to.path !== '/editor') {
      next('/editor');
      // 触发登录模态框
      window.dispatchEvent(new CustomEvent('show-login-modal'));
      return;
    }
  }

  next();
});

export default router;
