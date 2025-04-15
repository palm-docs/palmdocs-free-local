
// 格式化日期
export const formatDate = (date: Date | undefined): string => {
  if (!date) return "";
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 添加防抖函数
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
export const throttle = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) return;
    lastCall = now;
    return fn(...args);
  };
};
