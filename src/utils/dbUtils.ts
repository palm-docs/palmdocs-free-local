import { DocumentService } from '../services/IndexedDBService';
import { logout } from './userUtils';

// 重置数据库
export const resetDatabase = async (): Promise<void> => {
  try {
    // 清除本地存储的用户信息并退出登录
    logout();

    // 删除数据库
    await DocumentService.deleteDatabase();

    // 重新初始化数据库（这会自动创建默认用户）
    await DocumentService.initializeDatabase();
  } catch (error) {
    console.error('重置数据库失败:', error);
    throw error;
  }
};
