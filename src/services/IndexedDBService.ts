import { openDB } from 'idb';
import type { IDBPDatabase, DBSchema } from 'idb';

// 数据库模式定义
// interface PalmDocsDBSchema extends DBSchema {
//   // 文档表
//   documents: {
//     key: string;
//     value: IDocTreeItem;
//     indexes: {
//       'parentId': string | null;
//       'type': 'file' | 'directory';
//       'name': string;
//     };
//   };
//   // 用户表
//   users: {
//     key: string; // 用户ID
//     value: IUserInfo;
//     indexes: {
//       'account_type': string; // 'default' 或 'custom'
//     };
//   };
// }
// 文档树项接口
export interface IDocTreeItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  markdown?: string;
  richText?: string;
  parentId?: string | null;
  children?: IDocTreeItem[];
  updatedAt?: Date;
  lastSaved?: Date;
  lastModified?: Date;
  createdAt?: Date;
  creatorId?: string;
  creatorName?: string;
}

// 用户信息接口
export interface IUserInfo {
  id: string; // like uuid
  account: string; // like code
  email: string;
  password: string;
  nickname: string;
  avatar?: string;
  avatarUrl?: string;  // 新增字段，存储完整的头像URL
  account_type: 'default' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

// 数据库模式
interface PalmDocsDBSchema {
  version: number;
  stores: {
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
        account_type: 'default' | 'custom';
      };
    };
  };
}

// 数据库服务类
export class IndexedDBServiceClass {
  private dbPromise?: Promise<IDBPDatabase<PalmDocsDBSchema>>;
  private currentUser?: IUserInfo;
  private readonly DB_NAME = 'palm-docs-free-local';
  private readonly DB_VERSION = 1;

  constructor() {
    // 应用启动时初始化数据库
    // 不需要在这里调用，改为懒加载方式
    // this.initializeDatabase();

    // 监听用户登录事件
    window.addEventListener('user-login', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.userId) {
        this.setCurrentUser(customEvent.detail.userId);
      }
    });
  }

  // 初始化数据库
  public async initializeDatabase(): Promise<void> {
    try {
      // 避免重复初始化
      if (this.dbPromise) {
        console.log('Database already initialized, skipping...');
        return;
      }

      console.log('Initializing database...');
      this.dbPromise = this.initDB();
      const db = await this.getDB();
      console.log('Database initialized');

      // 检查用户表是否有数据
      const userCount = await db.count('users');
      console.log('Current user count:', userCount);

      if (userCount === 0) {
        console.log('No users found, creating default user...');
        // 创建默认用户
        await this.createDefaultUser();
      }

      // 检查文档表是否有数据
      const docCount = await db.count('documents');
      console.log('Current document count:', docCount);

      if (docCount === 0) {
        // 获取默认用户
        const defaultUser = await this.getUserById('default');
        console.log('Default user:', defaultUser);

        if (defaultUser) {
          this.currentUser = defaultUser;
          // 初始化默认文档
          await this.initializeDefaultDocuments();
        }
      }
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  // 确保数据库已初始化
  private async ensureInitialized(): Promise<IDBPDatabase<PalmDocsDBSchema>> {
    if (!this.dbPromise) {
      console.log('Database not initialized, initializing now...');
      await this.initializeDatabase();
    }
    return this.getDB();
  }

  // 初始化数据库
  private async initDB(): Promise<IDBPDatabase<PalmDocsDBSchema>> {
    console.log('Starting database initialization...');
    return openDB<PalmDocsDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log('Database upgrade in progress:', { oldVersion, newVersion });

        // 创建用户表
        if (!db.objectStoreNames.contains('users')) {
          console.log('Creating users table...');
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('account', 'account', { unique: true });
          userStore.createIndex('account_type', 'account_type');
          console.log('Users table created');
        }

        // 创建文档表
        if (!db.objectStoreNames.contains('documents')) {
          console.log('Creating documents table...');
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('parentId', 'parentId');
          docStore.createIndex('type', 'type');
          docStore.createIndex('name', 'name');
          console.log('Documents table created');
        }
      },
    });
  }

  private async getDB(): Promise<IDBPDatabase<PalmDocsDBSchema>> {
    if (!this.dbPromise) {
      throw new Error('Database not initialized');
    }
    const db = await this.dbPromise;
    if (!db) {
      throw new Error('Database connection failed');
    }
    return db;
  }

  // 创建默认用户
  private async createDefaultUser(): Promise<void> {
    try {
      console.log('Creating default user...');
      const db = await this.getDB();

      // 首先检查默认用户是否已存在
      const existingUser = await db.get('users', 'default');
      if (existingUser) {
        console.log('Default user already exists, skipping creation');
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
        avatarUrl: avatarPath,
        // avatarUrl: new URL(avatarPath, window.location.origin).href, // 转换为完整URL
        account_type: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Default user data:', defaultUser);
      await db.add('users', defaultUser);
      console.log('Default user created successfully');
    } catch (error) {
      console.error('Failed to create default user:', error);
      throw error;
    }
  }

  // 初始化默认文档
  private async initializeDefaultDocuments(): Promise<void> {
    // 获取默认用户
    const defaultUser = await this.getUserById('default');
    if (!defaultUser) {
      throw new Error('默认用户不存在，无法创建默认文档');
    }

    // 临时设置为当前用户
    const originalUser = this.currentUser;
    this.currentUser = defaultUser;

    try {
      // 创建默认目录
      const myDocsDir = await this.createDocument(
        "我的文档",
        "directory"
      );
      const workDocsDir = await this.createDocument(
        "工作文档",
        "directory"
      );

      // 在目录中创建默认文件
      await this.createDocument(
        "个人笔记",
        "file",
        myDocsDir.id,
        `<h1>${new Date().getFullYear()} 个人笔记</h1>`
      );
      await this.createDocument(
        "工作计划",
        "file",
        workDocsDir.id,
        `<h1>${new Date().getFullYear()} 工作计划</h1>`
      );
    } finally {
      // 恢复原来的当前用户
      this.currentUser = originalUser;
    }
  }

  // 设置当前用户
  public async setCurrentUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      this.currentUser = user;
    }
  }

  // 获取当前用户
  public getCurrentUser(): IUserInfo | undefined {
    return this.currentUser;
  }

  // 根据ID获取用户
  public async getUserById(id: string): Promise<IUserInfo | null> {
    const db = await this.getDB();
    const user = await db.get('users', id);
    return user || null;
  }

  // 根据用户名获取用户
  public async getUserByUsername(username: string): Promise<IUserInfo | null> {
    const db = await this.getDB();
    const user = await db.getFromIndex('users', 'username', username);
    return user || null;
  }

  // 获取所有用户
  public async getAllUsers(): Promise<IUserInfo[]> {
    try {
      console.log('Getting all users...');
      const db = await this.ensureInitialized();
      console.log('Database initialized, getting users...');
      const users = await db.getAll('users');
      console.log('Loaded users:', users);
      return users;
    } catch (error) {
      console.error('Failed to get all users:', error);
      return [];
    }
  }

  // 创建新用户
  public async createUser(userInfo: Omit<IUserInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUserInfo> {
    // 简单的密码加密
    const encryptPassword = (password: string): string => {
      return btoa(password);
    };

    // 如果没有提供头像，则使用随机预置头像
    if (!userInfo.avatar) {
      const { getRandomAvatarPath } = await import('../utils/avatarUtils');
      userInfo.avatar = getRandomAvatarPath();
    }

    // 转换头像路径为完整URL
    const avatarUrl = new URL(userInfo.avatar, window.location.origin).href;

    const newUser: IUserInfo = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...userInfo,
      password: encryptPassword(userInfo.password),
      avatarUrl, // 添加完整URL
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await this.ensureInitialized();
    await db.put('users', newUser);
    return newUser;
  }

  // 更新用户信息
  public async updateUser(id: string, updates: Partial<Omit<IUserInfo, 'id' | 'account'>>): Promise<IUserInfo | undefined> {
    const db = await this.ensureInitialized();
    const user = await this.getUserById(id);

    if (!user) return undefined;

    // 如果更新包含密码，需要加密
    if (updates.password) {
      updates.password = btoa(updates.password);
    }

    // 如果更新包含头像，同时更新avatarUrl
    if (updates.avatar) {
      updates.avatarUrl = new URL(updates.avatar, window.location.origin).href;
    }

    const updatedUser: IUserInfo = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    await db.put('users', updatedUser);

    // 如果更新的是当前用户，也更新currentUser
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser = updatedUser;
    }

    return updatedUser;
  }

  // 验证用户登录
  public async verifyUserLogin(userId: string, password: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      // 解密存储的密码并比较
      const decryptedPassword = atob(user.password);
      return decryptedPassword === password;
    } catch (error) {
      console.error('Login verification failed:', error);
      return false;
    }
  }

  // 获取所有文档
  async getAllDocuments(): Promise<IDocTreeItem[]> {
    const db = await this.ensureInitialized();
    return db.getAll('documents');
  }

  // 获取单个文档
  async getDocument(id: string): Promise<IDocTreeItem | undefined> {
    const db = await this.ensureInitialized();
    return db.get('documents', id);
  }

  // 保存文档
  async saveDocument(document: IDocTreeItem): Promise<string> {
    const db = await this.ensureInitialized();

    // 确保文档有创建者信息
    if (this.currentUser) {
      document.creatorId = this.currentUser.id;
      document.creatorName = this.currentUser.nickname;
    }

    // 如果没有创建时间，添加创建时间
    if (!document.createdAt) {
      document.createdAt = new Date();
    }

    // 更新最后修改和保存时间
    document.lastSaved = new Date();
    if (!document.lastModified) {
      document.lastModified = new Date();
    }

    await db.put('documents', document);
    return document.id;
  }

  // 删除文档
  async deleteDocument(id: string): Promise<void> {
    const db = await this.ensureInitialized();

    // 获取要删除的文档
    const doc = await this.getDocument(id);
    if (!doc) return;

    // 如果是目录，递归删除所有子文档
    if (doc.type === 'directory') {
      const allDocs = await this.getAllDocuments();
      const childDocs = allDocs.filter(d => d.parentId === id);

      for (const childDoc of childDocs) {
        await this.deleteDocument(childDoc.id);
      }
    }

    // 删除文档本身
    await db.delete('documents', id);
  }

  // 构建文档树
  async getDocumentTree(): Promise<IDocTreeItem[]> {
    const allDocs = await this.getAllDocuments();
    const rootDocs: IDocTreeItem[] = [];
    const docMap = new Map<string, IDocTreeItem & { children?: IDocTreeItem[] }>();

    // 首先创建所有文档的映射
    allDocs.forEach(doc => {
      docMap.set(doc.id, { ...doc, children: [] });
    });

    // 构建树结构
    allDocs.forEach(doc => {
      const currentDoc = docMap.get(doc.id);
      if (!currentDoc) return;

      if (doc.parentId && docMap.has(doc.parentId)) {
        // 将当前文档添加到父文档的子列表中
        const parentDoc = docMap.get(doc.parentId);
        if (parentDoc && parentDoc.children) {
          parentDoc.children.push(currentDoc);
        }
      } else {
        // 没有父文档或父文档不存在，作为根文档
        rootDocs.push(currentDoc);
      }
    });

    return rootDocs;
  }

  // 创建新文档
  async createDocument(
    name: string,
    type: 'file' | 'directory',
    parentId?: string | null,
    content?: string,
    markdown?: string,
    richText?: string,
  ): Promise<IDocTreeItem> {
    const newDoc: IDocTreeItem = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      type,
      parentId: parentId || null,
      content: type === 'file' ? (content || '') : undefined,
      markdown: type === 'file' ? markdown : undefined,
      richText: type === 'file' ? richText : undefined,
      createdAt: new Date(),
      lastModified: new Date(),
      lastSaved: new Date(),
      creatorId: this.currentUser?.id,
      creatorName: this.currentUser?.nickname
    };

    await this.saveDocument(newDoc);
    return newDoc;
  }

  // 移动文档到新的父目录
  async moveDocument(id: string, newParentId: string | null): Promise<void> {
    const doc = await this.getDocument(id);
    if (!doc) throw new Error('文档不存在');

    // 如果新父目录存在，确保它是目录类型
    if (newParentId) {
      const parentDoc = await this.getDocument(newParentId);
      if (!parentDoc) throw new Error('父目录不存在');
      if (parentDoc.type !== 'directory') throw new Error('指定的父ID不是目录');
    }

    doc.parentId = newParentId;
    doc.lastModified = new Date();

    await this.saveDocument(doc);
  }

  // 更新文档内容（包括markdown和richText）
  async updateDocumentContent(
    id: string,
    content?: string,
    markdown?: string,
    richText?: string
  ): Promise<IDocTreeItem> {
    const doc = await this.getDocument(id);
    if (!doc) throw new Error('文档不存在');

    // 只更新提供的字段
    if (content !== undefined) doc.content = content;
    if (markdown !== undefined) doc.markdown = markdown;
    if (richText !== undefined) doc.richText = richText;

    doc.lastModified = new Date();

    await this.saveDocument(doc);
    return doc;
  }

  // 重命名文档
  async renameDocument(id: string, newName: string): Promise<IDocTreeItem> {
    const doc = await this.getDocument(id);
    if (!doc) throw new Error('文档不存在');

    doc.name = newName;
    doc.lastModified = new Date();

    await this.saveDocument(doc);
    return doc;
  }

  // 删除数据库
  async deleteDatabase(): Promise<void> {
    try {
      // 关闭数据库连接
      if (this.dbPromise) {
        const db = await this.dbPromise;
        db.close();
        this.dbPromise = undefined;
      }

      // 删除数据库
      const request = indexedDB.deleteDatabase(this.DB_NAME);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('数据库删除成功');
          resolve();
        };
        request.onerror = (event) => {
          console.error('数据库删除失败:', event);
          reject(new Error('数据库删除失败'));
        };
        request.onblocked = () => {
          console.error('数据库删除被阻止，请关闭所有数据库连接');
          reject(new Error('数据库删除被阻止，请关闭所有数据库连接'));
        };
      });
    } catch (error) {
      console.error('删除数据库时发生错误:', error);
      throw error;
    }
  }
}

// 导出单例
export const DocumentService = new IndexedDBServiceClass();
