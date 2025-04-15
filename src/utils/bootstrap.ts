import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { IDocTreeItem, IUserInfo } from '../services/IndexedDBService';

/**
 * Bootstrap类负责处理数据库初始化相关的功能
 * 包括：初始化数据库、创建Store、创建默认用户和初始化默认文档数据
 * 这样设计可以将数据库初始化逻辑从服务层分离出来，使服务层专注于数据操作
 * 同时为未来的数据库迁移提供便利
 */
/**
 * 数据库模式定义
 */
interface PalmDocsDBSchema {
  documents: {
    key: string;
    value: IDocTreeItem;
    indexes: {
      parentId: string | null;
      type: 'file' | 'directory';
      name: string;
    };
  };
  users: {
    key: string;
    value: IUserInfo;
    indexes: {
      nickname: string;
      account: string;
      account_type: 'default' | 'custom';
    };
  };
}

export class Bootstrap {
  /**
   * 自动登录默认用户
   */
  public autoDefaultLogin(): void {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return;
    }
    const defaultUser = {
      id: 'default',
      account: 'default',
      email: '',
      nickname: '默认用户',
      password: btoa('1234'),
      avatar: '/images/avatars/hmbb.png',
      avatarUrl: '/images/avatars/hmbb.png',
      // avatarUrl: new URL('/images/avatars/hmbb.png', window.location.origin).href,
      account_type: 'default',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    localStorage.setItem('userProfile', JSON.stringify(defaultUser));
  }
  private readonly DB_NAME = 'palm-docs-free-local';
  private readonly DB_VERSION = 1;
  private readonly DB_STORE_DOCUMENTS = 'documents';
  private readonly DB_STORE_USERS = 'users';
  private dbPromise?: Promise<IDBPDatabase<PalmDocsDBSchema>>;

  /**
   * 初始化数据库环境
   * 包括：初始化数据库、创建Store、创建默认用户和初始化默认文档数据
   */
  public async initialize(): Promise<void> {
    try {
      console.log('开始初始化数据库环境...');
      // 1. 初始化DB，没有则创建
      await this.initializeDatabase();

      // 2. 自动登录默认用户
      await this.autoDefaultLogin();

      // 2. 初始化Store，没有则创建 (在initDB中处理)

      // 3. 初始化default用户，没有则创建
      await this.initializeDefaultUser();

      // 4. 初始化文档默认数据，两个目录下各有一个文档
      await this.initializeDefaultDocuments();

      console.log('数据库环境初始化完成');
    } catch (error) {
      console.error('数据库环境初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化数据库
   */
  private async initializeDatabase(): Promise<void> {
    try {
      console.log('初始化数据库...');
      this.dbPromise = this.initDB();
      await this.getDB(); // 确保数据库已成功打开
      console.log('数据库初始化成功');
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化数据库连接
   */
  private initDB(): Promise<IDBPDatabase<PalmDocsDBSchema>> {
    console.log(`打开数据库: ${this.DB_NAME}, 版本: ${this.DB_VERSION}`);
    return openDB<PalmDocsDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade: (db, oldVersion, newVersion, transaction) => {
        console.log('数据库升级中:', { oldVersion, newVersion });

        // 创建用户表
        if (!db.objectStoreNames.contains(this.DB_STORE_USERS)) {
          console.log('创建用户表...');
          const userStore = db.createObjectStore(this.DB_STORE_USERS, { keyPath: 'id' });
          userStore.createIndex('account', 'account', { unique: true });
          userStore.createIndex('account_type', 'account_type');
          userStore.createIndex('nickname', 'nickname');
          console.log('用户表创建成功');
        }

        // 创建文档表
        if (!db.objectStoreNames.contains(this.DB_STORE_DOCUMENTS)) {
          console.log('创建文档表...');
          const docStore = db.createObjectStore(this.DB_STORE_DOCUMENTS, { keyPath: 'id' });
          docStore.createIndex('parentId', 'parentId');
          docStore.createIndex('type', 'type');
          docStore.createIndex('name', 'name');
          console.log('文档表创建成功');
        }
      },
    });
  }

  /**
   * 获取数据库连接
   */
  private async getDB(): Promise<IDBPDatabase<PalmDocsDBSchema>> {
    if (!this.dbPromise) {
      throw new Error('数据库未初始化');
    }
    const db = await this.dbPromise;
    if (!db) {
      throw new Error('数据库连接失败');
    }
    return db;
  }

  /**
   * 初始化默认用户
   */
  private async initializeDefaultUser(): Promise<void> {
    try {
      console.log('检查默认用户...');
      const db = await this.getDB();

      // 检查默认用户是否已存在
      const userCount = await db.count(this.DB_STORE_USERS);
      console.log('当前用户数量:', userCount);

      if (userCount === 0) {
        console.log('创建默认用户...');
        // 创建默认用户
        await this.createDefaultUser();
      } else {
        console.log('默认用户已存在，跳过创建');
      }
    } catch (error) {
      console.error('初始化默认用户失败:', error);
      throw error;
    }
  }

  /**
   * 创建默认用户
   */
  private async createDefaultUser(): Promise<void> {
    try {
      console.log('创建默认用户...');
      const db = await this.getDB();

      // 首先检查默认用户是否已存在
      const existingUser = await db.get(this.DB_STORE_USERS, 'default');
      if (existingUser) {
        console.log('默认用户已存在，跳过创建');
        return;
      }

      // 使用 base64 加密密码
      const encryptPassword = (password: string): string => {
        return btoa(password);
      };

      const avatarPath = '/images/avatars/hmbb.png';
      const defaultUser: IUserInfo = {
        id: 'default',
        account: 'default',
        email: '',
        nickname: '默认用户',
        password: encryptPassword('1234'),
        avatar: avatarPath,
        avatarUrl: new URL(avatarPath, window.location.origin).href, // 转换为完整URL
        account_type: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('默认用户数据:', defaultUser);
      await db.add(this.DB_STORE_USERS, defaultUser);
      console.log('默认用户创建成功');
    } catch (error) {
      console.error('创建默认用户失败:', error);
      throw error;
    }
  }

  /**
   * 初始化默认文档
   */
  private async initializeDefaultDocuments(): Promise<void> {
    try {
      console.log('检查默认文档...');
      const db = await this.getDB();

      // 检查文档表是否有数据
      const docCount = await db.count(this.DB_STORE_DOCUMENTS);
      console.log('当前文档数量:', docCount);

      if (docCount === 0) {
        console.log('创建默认文档...');
        // 获取默认用户
        const defaultUser = await db.get(this.DB_STORE_USERS, 'default');
        if (!defaultUser) {
          throw new Error('默认用户不存在，无法创建默认文档');
        }

        // 创建默认文档
        await this.createDefaultDocuments(defaultUser);
      } else {
        console.log('默认文档已存在，跳过创建');
      }
    } catch (error) {
      console.error('初始化默认文档失败:', error);
      throw error;
    }
  }

  /**
   * 创建默认文档
   */
  private async createDefaultDocuments(defaultUser: IUserInfo): Promise<void> {
    try {
      const db = await this.getDB();

      // 创建默认目录
      const myDocsDir = await this.createDocument(
        "我的文档",
        "directory",
        null,
        defaultUser
      );

      const workDocsDir = await this.createDocument(
        "工作文档",
        "directory",
        null,
        defaultUser
      );

      // 在目录中创建默认文件
      await this.createDocument(
        "个人笔记",
        "file",
        myDocsDir.id,
        defaultUser,
        `<h1>${new Date().getFullYear()} 个人笔记</h1>`
      );

      await this.createDocument(
        "工作计划",
        "file",
        workDocsDir.id,
        defaultUser,
        `<h1>${new Date().getFullYear()} 工作计划</h1>`
      );

      console.log('默认文档创建成功');
    } catch (error) {
      console.error('创建默认文档失败:', error);
      throw error;
    }
  }

  /**
   * 创建文档
   */
  private async createDocument(
    name: string,
    type: 'file' | 'directory',
    parentId: string | null,
    creator: IUserInfo,
    content?: string
  ): Promise<IDocTreeItem> {
    const db = await this.getDB();

    const now = new Date();
    const newDoc: IDocTreeItem = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      type,
      parentId: parentId || null,
      content: type === 'file' ? (content || '') : undefined,
      createdAt: now,
      updatedAt: now,
      lastModified: now,
      lastSaved: now,
      creatorId: creator.id,
      creatorName: creator.nickname,
    };

    await db.add(this.DB_STORE_DOCUMENTS, newDoc);
    return newDoc;
  }

  /**
   * 删除数据库
   */
  public async deleteDatabase(): Promise<void> {
    try {
      console.log(`删除数据库: ${this.DB_NAME}`);
      // 关闭当前连接
      if (this.dbPromise) {
        const db = await this.dbPromise;
        db.close();
        this.dbPromise = undefined;
      }

      // 删除数据库
      await window.indexedDB.deleteDatabase(this.DB_NAME);
      console.log('数据库删除成功');
    } catch (error) {
      console.error('删除数据库失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const BootstrapService = new Bootstrap();

