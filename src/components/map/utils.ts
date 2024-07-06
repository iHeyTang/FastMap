/**
 * 防抖函数
 * @param fn
 * @param delay
 */
export const antiShake = <T extends (...args: never[]) => void>(
  fn: T,
  delay: number
) => {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
};
