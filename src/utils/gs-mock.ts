import type { TypeAny } from '@/types/TypeAny';

type AnyFn = (...args: TypeAny[]) => TypeAny;

export interface GsRunHandlers<R> {
  withSuccessHandler(handler: (res: R) => void): this;
  withFailureHandler(handler: (err?: Error) => void): this;
  [key: string]: TypeAny;
}

export function createGsRunMock<R>(api: Record<string, AnyFn>): GsRunHandlers<R> {
  let successHandler: ((res: R) => void) | null = null;
  let failureHandler: ((err: Error) => void) | null = null;

  const handlerBuilder: GsRunHandlers<R> = {
    withSuccessHandler(handler) {
      successHandler = handler;
      return this;
    },
    withFailureHandler(handler) {
      failureHandler = handler;
      return this;
    },
  };

  // Use Proxy to dynamically handle `run[functionName](...)`
  return new Proxy(handlerBuilder, {
    get(target, prop: string) {
      if (prop in target) return (target as TypeAny)[prop];

      // Assume prop is a function name inside api
      return async (...args: TypeAny[]) => {
        try {
          const fn = api[prop];
          if (typeof fn !== 'function') {
            throw new Error(`Function "${prop}" not found`);
          }

          const result = await new Promise<ReturnType<typeof fn>>((resolve) =>
            setTimeout(() => {
              resolve(fn(...args));
            }, 1)
          );
          successHandler?.(result);
        } catch (err) {
          failureHandler?.(err as Error);
        }
      };
    },
  });
}

export const mockGsFunctions = {
  getSheetData: async (name: string) => {
    switch (name) {
      case 'R-2025-11-03':
        return {
          success: true,
          data: [
            [
              'tan.pham',
              'Tan Pham',
              '2025-11-02T17:00:00.000Z',
              'CORE-27469',
              '[ACBS] Support internal test',
              'Development Done',
              '',
              '2025-11-03T10:21:40.667Z',
              '20251104#1',
            ],
            [
              'tan.pham',
              'Tan Pham',
              '2025-11-02T17:00:00.000Z',
              'CORE-26675',
              '[VDSC] Implement websocket - build release',
              'Development Done',
              '',
              '2025-11-03T10:21:40.985Z',
              '20251104#2',
            ],
            [
              'tan.pham',
              'Tan Pham',
              '2025-11-02T17:00:00.000Z',
              'CORE-26675',
              '[VDSC] Implement websocket - build release',
              'Development Done',
              '',
              '2025-11-03T10:21:40.985Z',
              '20251104#3',
            ],
            [
              'tan.pham',
              'Tan Pham',
              '2025-11-02T17:00:00.000Z',
              'CORE-26675',
              '[VDSC] Implement websocket - build release',
              'Development Done',
              '',
              '2025-11-03T10:21:40.985Z',
              '20251104#4',
            ],
            [
              'tan.pham',
              'Tan Pham',
              '2025-11-03T17:00:00.000Z',
              'CORE-26675',
              '[VDSC] Implement websocket - build release',
              'Development Done',
              '',
              '2025-11-03T10:21:40.985Z',
              '20251104#5',
            ],
          ],
        };
      case 'MEMBERS':
        return {
          success: true,
          data: [
            [
              'tan.pham',
              'Tan Pham',
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRhbi5waGFtIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IlRhbiBQaGFtIiwiaWF0IjoxNzYyMTYxNjI2LCJleHAiOjE3OTM2OTc2MjZ9.D4NKkY2SzHnizLbgRkAZIfrU_E6etRw303-qbr9WC58',
            ],
            [
              'longp.tran',
              'Long Tran',
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImxvbmdwLnRyYW4iLCJyb2xlIjoiREVWIiwibmFtZSI6IkxvbmcgVHJhbiIsImlhdCI6MTc2MjE2MTk1NiwiZXhwIjoxNzkzNjk3OTU2fQ.E1hoPGB8kSjrHosiPEMMYWeY2IGO4pq-iU2Aj6KXreU',
            ],
            [
              'phiemt.hoang',
              'Phiem Tu',
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InBoaWVtdC5ob2FuZyIsInJvbGUiOiJERVYiLCJuYW1lIjoiUGhpZW0gVHUiLCJpYXQiOjE3NjIxNjIxMDAsImV4cCI6MTc5MzY5ODEwMH0.mRq8WImrqTHiL8AR6MuJMdicQFBklnPfZqcH_KCao8w',
            ],
            [
              'thienh.vu',
              'Thien Vu',
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRoaWVuaC52dSIsInJvbGUiOiJERVYiLCJuYW1lIjoiVGhpZW4gVnUiLCJpYXQiOjE3NjIxNjIwNDMsImV4cCI6MTc5MzY5ODA0M30.mgl_2SJNpIuErCl8DqiXsBbH7nGuZJucsXuJNFH-OTY',
            ],
          ],
        };
      default:
        return { success: false };
    }
  },
};
