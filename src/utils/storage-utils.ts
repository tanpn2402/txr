import localforage from 'localforage';

import type { ITaskForm } from '@/services/tasks/schema';

const storagePrefix = 'txr_';

const tokenStorage = {
  getAccessToken: () => {
    return localforage.getItem<string>(`${storagePrefix}atoken`);
  },
  setAccessToken: (token: string) => {
    return localforage.setItem(`${storagePrefix}atoken`, token);
  },
  setUserInfo: (data: { userId?: string | null; role?: string | null; name?: string | null }) => {
    return localforage.setItem(`${storagePrefix}auser`, data);
  },
  getUserInfo: async () => {
    const storedData = await localforage.getItem<{
      userId?: string | null;
      role?: string | null;
      name?: string | null;
    }>(`${storagePrefix}auser`);
    if (typeof storedData === 'string') {
      return JSON.parse(storedData) as {
        userId?: string | null;
        role?: string | null;
        name?: string | null;
      };
    }
    return storedData;
  },
  clearTokens: async () => {
    await Promise.allSettled([
      localforage.removeItem(`${storagePrefix}atoken`),
      localforage.removeItem(`${storagePrefix}ftoken`),
    ]);
  },
  clearUserInfo: async () => {
    await Promise.allSettled([localforage.removeItem(`${storagePrefix}auser`)]);
  },
};

const taskStorage = {
  get: async () => {
    const storedTasks = await localforage.getItem<string>(`${storagePrefix}tasks`);
    if (typeof storedTasks === 'string') {
      return JSON.parse(storedTasks) as ITaskForm['tasks'];
    }
    return storedTasks;
  },
  save: (tasks: ITaskForm['tasks']) => {
    return localforage.setItem(`${storagePrefix}tasks`, tasks);
  },
};

export { taskStorage, tokenStorage };
