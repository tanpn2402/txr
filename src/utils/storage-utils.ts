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
  setUserId: (userId: string) => {
    return localforage.setItem(`${storagePrefix}auserid`, userId);
  },
  getUserId: () => {
    return localforage.getItem<string>(`${storagePrefix}auserid`);
  },
  clearTokens: async () => {
    await Promise.allSettled([
      localforage.removeItem(`${storagePrefix}atoken`),
      localforage.removeItem(`${storagePrefix}ftoken`),
    ]);
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
