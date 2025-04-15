// 导入头像工具函数
import { getRandomAvatarPath } from './avatarUtils';

// 生成随机颜色 (保留此函数用于其他地方可能的使用)
const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};


// 注意：generateRandomShapes函数已被移除，现在使用avatarGenerator.ts中的函数生成更精美的头像

// 生成随机用户名
const generateRandomUsername = (): string => {
  const prefixes = ['user', 'editor', 'writer', 'author', 'creator'];
  const suffix = Math.floor(Math.random() * 1000);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}${suffix}`;
};

// 生成随机昵称
const generateRandomNickname = (): string => {
  // 形容词部分 - 更丰富的形容词选择
  const adjectives = [
    '快乐的', '聪明的', '勇敢的', '温柔的', '睿智的', '活泼的', '机智的',
    '幽默的', '可爱的', '优雅的', '神秘的', '梦幻的', '创意的', '热情的',
    '冷静的', '耐心的', '细心的', '认真的', '开朗的', '文艺的', '科技的',
    '浪漫的', '理性的', '灵动的', '敏捷的', '专注的', '好奇的', '友善的'
  ];

  // 名词部分 - 更多样化的名词选择
  const nouns = [
    '猫咪', '狗狗', '兔子', '熊猫', '小鹿', '飞鸟', '金鱼', '巨龙', '猛虎',
    '狐狸', '蝴蝶', '海豚', '企鹅', '猫头鹰', '小象', '松鼠', '独角兽',
    '探险家', '艺术家', '科学家', '作家', '诗人', '音乐家', '程序员', '设计师',
    '旅行者', '思想家', '梦想家', '观察者', '收藏家', '创造者', '守护者'
  ];

  // 随机选择形容词和名词
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return adjective + noun;
};

// 生成完整的用户信息
export const generateUserInfo = () => {
  const account = generateRandomUsername();
  const nickname = generateRandomNickname();
  const avatar = getRandomAvatarPath();
  const providers = ['google', 'github', 'wechat'];

  return {
    account,
    nickname,
    avatar,
    provider: providers[Math.floor(Math.random() * providers.length)],
    email: `${account}@example.com`,
    name: nickname,
    // 新增GitHub信息字段
    bio: Math.random() > 0.5 ? '全栈开发者 | 开源爱好者' : null,
    location: ['北京', '上海', '广州', '深圳'][Math.floor(Math.random() * 4)],
    company: Math.random() > 0.5 ? '某互联网公司' : null,
    blog: 'https://github.com/' + account,
    twitter_username: Math.random() > 0.7 ? '@' + nickname : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    public_repos: Math.floor(Math.random() * 100),
    followers: Math.floor(Math.random() * 500),
    following: Math.floor(Math.random() * 200)
  };
};

// 获取当前用户信息
export const getCurrentUser = () => {
  const storedProfile = localStorage.getItem('userProfile');
  if (storedProfile) {
    try {
      return JSON.parse(storedProfile);
    } catch (e) {
      console.error('解析用户信息失败', e);
      return null;
    }
  }
  return null;
};

// 退出登录
export const logout = () => {
  localStorage.removeItem('userProfile');
};

// 检查用户是否已登录
export const isLoggedIn = (): boolean => {
  const userProfile = localStorage.getItem('userProfile');
  if (userProfile) return true;
  return false;
};
