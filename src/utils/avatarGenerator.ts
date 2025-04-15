// 生成更精美的SVG头像 - 现代设计风格版本

// 预定义的柔和颜色组合 - 使用设计师推荐的配色方案
const colorPalettes = [
  { primary: '#7F56D9', secondary: '#9E77ED', accent: '#E0D7F7' }, // 紫色系
  { primary: '#2563EB', secondary: '#3B82F6', accent: '#DBEAFE' }, // 蓝色系
  { primary: '#0E9F6E', secondary: '#10B981', accent: '#D1FAE5' }, // 绿色系
  { primary: '#D946EF', secondary: '#E879F9', accent: '#FAE8FF' }, // 粉色系
  { primary: '#F59E0B', secondary: '#FBBF24', accent: '#FEF3C7' }, // 黄色系
  { primary: '#EC4899', secondary: '#F472B6', accent: '#FCE7F3' }, // 玫红色系
  { primary: '#EF4444', secondary: '#F87171', accent: '#FEE2E2' }, // 红色系
  { primary: '#6366F1', secondary: '#818CF8', accent: '#E0E7FF' }, // 靛青色系
  { primary: '#475569', secondary: '#64748B', accent: '#F1F5F9' }, // 灰色系
  { primary: '#0EA5E9', secondary: '#38BDF8', accent: '#E0F2FE' }  // 天蓝色系
];

// 获取随机颜色组合
const getRandomColorPalette = (): { primary: string, secondary: string, accent: string } => {
  return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
};

// 生成随机ID用于SVG渐变
const generateRandomId = (): string => {
  return 'gradient-' + Math.random().toString(36).substring(2, 9);
};

// 生成现代设计风格的SVG头像
export const generateModernAvatar = (name: string): string => {
  const { primary, secondary, accent } = getRandomColorPalette();
  const gradientId = generateRandomId();
  const patternId = generateRandomId();
  const radialGradientId = generateRandomId();

  // 生成一个现代设计风格的头像 - 不使用文字，而是使用几何图形
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="50%" stop-color="${secondary}" />
          <stop offset="100%" stop-color="${primary}" />
        </linearGradient>
        <radialGradient id="${radialGradientId}" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.5" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
        <pattern id="${patternId}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          ${generatePatternElements(primary, secondary)}
        </pattern>
      </defs>
      <rect width="100" height="100" rx="20" ry="20" fill="url(#${gradientId})" />
      <rect width="100" height="100" rx="20" ry="20" fill="url(#${radialGradientId})" />
      ${generateDesignElements(primary, secondary, name)}
    </svg>
  `;
};

// 生成图案元素
const generatePatternElements = (primary: string, secondary: string): string => {
  const patternType = Math.floor(Math.random() * 3);

  if (patternType === 0) {
    // 点状图案
    return `<circle cx="10" cy="10" r="2" fill="${lightenColor(primary, 20)}" opacity="0.3" />`;
  } else if (patternType === 1) {
    // 线状图案
    return `<line x1="0" y1="10" x2="20" y2="10" stroke="${lightenColor(primary, 20)}" stroke-width="1" opacity="0.2" />`;
  } else {
    // 方格图案
    return `<rect x="8" y="8" width="4" height="4" fill="${lightenColor(secondary, 20)}" opacity="0.2" />`;
  }
};

// 生成设计元素
const generateDesignElements = (primary: string, secondary: string, name: string): string => {
  // 使用名称的哈希值来确定设计风格，使同一个名称总是生成相同的设计
  const nameHash = hashString(name);
  const designStyle = nameHash % 5; // 5种不同的设计风格

  switch (designStyle) {
    case 0:
      return generateAbstractShapes(primary, secondary, nameHash);
    case 1:
      return generateGeometricPattern(primary, secondary, nameHash);
    case 2:
      return generateWavePattern(primary, secondary, nameHash);
    case 3:
      return generateCirclePattern(primary, secondary, nameHash);
    case 4:
      return generateTrianglePattern(primary, secondary, nameHash);
    default:
      return generateAbstractShapes(primary, secondary, nameHash);
  }
};

// 生成抽象形状
const generateAbstractShapes = (primary: string, secondary: string, seed: number): string => {
  const elements: string[] = [];
  const rng = seedRandom(seed);

  // 生成3-5个抽象形状
  const numShapes = 3 + Math.floor(rng() * 3);

  for (let i = 0; i < numShapes; i++) {
    const x = 20 + Math.floor(rng() * 60);
    const y = 20 + Math.floor(rng() * 60);
    const size = 10 + Math.floor(rng() * 30);
    const opacity = (0.4 + rng() * 0.4).toFixed(2);
    const color = i % 2 === 0 ? lightenColor(primary, 30) : lightenColor(secondary, 30);

    // 随机形状类型
    const shapeType = Math.floor(rng() * 3);

    if (shapeType === 0) {
      // 圆形
      elements.push(`<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}" opacity="${opacity}" />`);
    } else if (shapeType === 1) {
      // 矩形
      elements.push(`<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" rx="${size/5}" fill="${color}" opacity="${opacity}" />`);
    } else {
      // 多边形
      const points = generatePolygonPoints(x, y, size/2, 6, rng);
      elements.push(`<polygon points="${points}" fill="${color}" opacity="${opacity}" />`);
    }
  }

  return elements.join('');
};

// 生成几何图案
const generateGeometricPattern = (primary: string, secondary: string, seed: number): string => {
  const elements: string[] = [];
  const rng = seedRandom(seed);

  // 中心大圆及其光晕效果
  elements.push(`<circle cx="50" cy="50" r="25" fill="${lightenColor(primary, 40)}" opacity="0.6">
    <animate attributeName="r" values="23;25;23" dur="3s" repeatCount="indefinite" />
  </circle>`);
  elements.push(`<circle cx="50" cy="50" r="30" fill="${lightenColor(primary, 60)}" opacity="0.3">
    <animate attributeName="r" values="28;30;28" dur="3s" repeatCount="indefinite" />
  </circle>`);

  // 周围动态小圆
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI / 4) + (rng() * 0.5);
    const distance = 20 + rng() * 10;
    const x = 50 + Math.cos(angle) * distance;
    const y = 50 + Math.sin(angle) * distance;
    const radius = 3 + rng() * 8;
    const delay = i * 0.3; // 错开动画时间

    elements.push(`<circle cx="${x}" cy="${y}" r="${radius}" fill="${lightenColor(secondary, 20)}" opacity="0.7">
      <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" begin="${delay}s" repeatCount="indefinite" />
    </circle>`);
  }

  return elements.join('');
};

// 生成波浪图案
const generateWavePattern = (primary: string, secondary: string, seed: number): string => {
  const rng = seedRandom(seed);
  const numWaves = 3 + Math.floor(rng() * 2);
  const elements: string[] = [];

  for (let i = 0; i < numWaves; i++) {
    const yOffset = 30 + i * 15;
    const amplitude = 5 + rng() * 10;
    const frequency = 3 + rng() * 2;
    const color = i % 2 === 0 ? lightenColor(primary, 40) : lightenColor(secondary, 40);
    const opacity = (0.3 + rng() * 0.4).toFixed(2);
    const delay = i * 0.5; // 错开动画时间

    let path = `M 0,${yOffset} `;
    for (let x = 0; x <= 100; x += 5) {
      const y = yOffset + Math.sin(x / 100 * Math.PI * frequency) * amplitude;
      path += `L ${x},${y} `;
    }

    elements.push(`<path d="${path}" fill="none" stroke="${color}" stroke-width="3" opacity="${opacity}">
      <animate attributeName="stroke-width" values="2;3;2" dur="2s" begin="${delay}s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="${opacity};${Number(opacity)+0.2};${opacity}" dur="3s" begin="${delay}s" repeatCount="indefinite" />
    </path>`);
  }

  return elements.join('');
};

// 生成圆形图案
const generateCirclePattern = (primary: string, secondary: string, seed: number): string => {
  const rng = seedRandom(seed);
  const elements: string[] = [];

  // 同心圆
  for (let i = 0; i < 4; i++) {
    const radius = 40 - i * 10;
    const color = i % 2 === 0 ? lightenColor(primary, 30) : lightenColor(secondary, 30);
    const opacity = (0.2 + i * 0.15).toFixed(2);

    elements.push(`<circle cx="50" cy="50" r="${radius}" fill="none" stroke="${color}" stroke-width="2" opacity="${opacity}" />`);
  }

  // 装饰点
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const radius = 20 + rng() * 20;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    const dotSize = 2 + rng() * 3;

    elements.push(`<circle cx="${x}" cy="${y}" r="${dotSize}" fill="white" opacity="0.6" />`);
  }

  return elements.join('');
};

// 生成三角形图案
const generateTrianglePattern = (primary: string, secondary: string, seed: number): string => {
  const rng = seedRandom(seed);
  const elements: string[] = [];

  // 中心大三角形及其光晕
  const centerTriangle = generatePolygonPoints(50, 50, 30, 3, rng);
  elements.push(`<polygon points="${centerTriangle}" fill="${lightenColor(primary, 30)}" opacity="0.5">
    <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite" />
  </polygon>`);

  // 中心三角形的光晕效果
  const glowTriangle = generatePolygonPoints(50, 50, 35, 3, rng);
  elements.push(`<polygon points="${glowTriangle}" fill="${lightenColor(primary, 50)}" opacity="0.3">
    <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
  </polygon>`);

  // 周围动态小三角形
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    const distance = 25 + rng() * 15;
    const x = 50 + Math.cos(angle) * distance;
    const y = 50 + Math.sin(angle) * distance;
    const size = 5 + rng() * 10;
    const rotation = rng() * Math.PI;
    const delay = i * 0.4; // 错开动画时间

    const trianglePoints = generatePolygonPoints(x, y, size, 3, rng, rotation);
    elements.push(`<polygon points="${trianglePoints}" fill="${lightenColor(secondary, 20)}" opacity="0.6">
      <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" begin="${delay}s" repeatCount="indefinite" />
      <animateTransform attributeName="transform" type="rotate" values="0 ${x} ${y};${rotation*2} ${x} ${y};0 ${x} ${y}" dur="4s" begin="${delay}s" repeatCount="indefinite" />
    </polygon>`);
  }

  return elements.join('');
};

// 生成多边形点
const generatePolygonPoints = (centerX: number, centerY: number, radius: number, sides: number, rng: () => number, rotation: number = 0): string => {
  let points = '';

  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i * 2 * Math.PI / sides);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points += `${x},${y} `;
  }

  return points.trim();
};

// 调亮颜色
const lightenColor = (color: string, amount: number): string => {
  // 移除#并转换为RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 调整RGB值
  const adjustR = Math.min(255, r + amount);
  const adjustG = Math.min(255, g + amount);
  const adjustB = Math.min(255, b + amount);

  // 转回十六进制
  return `#${adjustR.toString(16).padStart(2, '0')}${adjustG.toString(16).padStart(2, '0')}${adjustB.toString(16).padStart(2, '0')}`;
};

// 基于字符串生成哈希值
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
};

// 基于种子的随机数生成器
const seedRandom = (seed: number): () => number => {
  let state = seed;

  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};
