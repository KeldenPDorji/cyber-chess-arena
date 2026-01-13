/**
 * Development-only logging utility
 * Logs will only appear in development mode, not in production builds
 */

const isDev = import.meta.env.DEV;

export const devLog = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
};
