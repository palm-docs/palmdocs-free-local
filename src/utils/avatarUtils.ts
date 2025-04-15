// 头像工具函数

// 使用 import.meta.glob 动态导入所有头像文件
// const avatarModules = import.meta.glob('@/assets/images/avatars/*.{png,svg,jpg,jpeg,webp}', { eager: true });

// 获取所有预置头像路径
export const getAllAvatarPaths = (): string[] => {debugger
  // const paths = Object.values(avatarModules).map(module => {
  //   // 确保返回的是字符串类型的路径
  //   if (typeof module === 'string') {
  //     return module;
  //   }
  //   // 如果是模块对象，返回其默认导出
  //   return (module as any).default;
  // });
  // console.log('Available avatar paths:', paths); // 添加调试日志
  // return paths;
  return [
    '/images/avatars/babyriki.png',
    '/images/avatars/dingding.webp',
    '/images/avatars/dixi.webp',
    '/images/avatars/hmbb.png',
    '/images/avatars/lala.webp',
    '/images/avatars/paidaxing.webp',
    '/images/avatars/xiaobo.webp',
    '/images/avatars/xielaoban.webp',
    '/images/avatars/zhangyuge.webp',
  ]
};

// 获取随机头像路径
export const getRandomAvatarPath = (): string => {
  const avatars = getAllAvatarPaths();
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// 从路径中提取文件名
export const getAvatarFilenameFromPath = (path: string): string => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

// 检查是否是预置头像
export const isPresetAvatar = (avatarPath: string): boolean => {
  if (!avatarPath) return false;
  const filename = getAvatarFilenameFromPath(avatarPath);
  return getAllAvatarPaths().some(path => path.endsWith(filename));
};
