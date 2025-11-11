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

          const result = await new Promise<ReturnType<typeof fn>>((resolve) => {
            resolve(fn(...args));
          });
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
    return new Promise((resolve) => {
      setTimeout(() => {
        switch (name) {
          case 'R-2025-11-03':
            return resolve({
              success: true,
              data: [
                [
                  'tan.pham',
                  'Tan Pham',
                  'ACBS',
                  'a8c6839f-bc4f-4311-a073-b13e0095b2d5',
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
                  'ACBS',
                  'a8c6839f-bc4f-4311-a073-b13e0095b2d5',
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
                  'ACBS',
                  'a8c6839f-bc4f-4311-a073-b13e0095b2d5',
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
                  'ACBS',
                  'a8c6839f-bc4f-4311-a073-b13e0095b2d5',
                  '2025-11-06T17:00:00.000Z',
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
                  'ACBS',
                  'a8c6839f-bc4f-4311-a073-b13e0095b2d5',
                  '2025-11-03T17:00:00.000Z',
                  'CORE-26675',
                  '[VDSC] Implement websocket - build release',
                  'Development Done',
                  '',
                  '2025-11-03T10:21:40.985Z',
                  '20251104#5',
                ],
              ],
            });
          case 'R-2025-10-27':
            return resolve({
              success: true,
              data: [
                [
                  'tan.pham',
                  'Tan Pham',
                  'ACBS',
                  'a8c6839f-bc4f-4311-a073-b13e0095b2d5',
                  '2025-11-02T17:00:00.000Z',
                  'CORE-27469',
                  '[ACBS] Support internal test',
                  'Development Done',
                  '',
                  '2025-11-03T10:21:40.667Z',
                  'R-2025-10-27#1',
                ],
              ],
            });
          case 'R-2025-10-20':
            return resolve({
              success: true,
              data: [
                [
                  'tan.pham',
                  'Tan Pham',
                  'ACBS',
                  'a8c6839f-bc4f-4311-a073-b13e0095b2d5',
                  '2025-11-02T17:00:00.000Z',
                  'CORE-27469',
                  '[ACBS] Support internal test',
                  'Development Done',
                  '',
                  '2025-11-03T10:21:40.667Z',
                  'R-2025-10-20#1',
                ],
              ],
            });
          case 'MEMBERS':
            return resolve({
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
            });
          case 'PROJECTS':
            return resolve({
              success: true,
              data: [
                [
                  'ACBS',
                  'a8c6839f-bc4f-4311-a073-b13e0095b2d5',
                  '10b01be6-7e63-417c-89ca-b13e0095b2d5',
                  'Y',
                  'Y',
                ],
                [
                  'ACCC',
                  '9a3e5969-f2fe-4da4-b6b6-b13f0032457b',
                  '2e5eae26-4b04-4004-8c7a-b13f0032457b',
                  'Y',
                  'N',
                ],
              ],
            });
          default:
            return resolve({ success: false });
        }
      }, 100);
    });
  },
  callAction: async ({ action, body }: { action: string; body: TypeAny }) => {
    switch (action) {
      case 'LOGIN': {
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                success: body?.pin !== 'KpHnOx/p6PTYeqZSXK/X7w==',
                error: body?.pin === 'KpHnOx/p6PTYeqZSXK/X7w==' ? 'Failed' : undefined,
                data: {
                  role: body?.id === 'tan.pham' ? 'ADMIN' : 'DEV',
                  name: 'Tan Pham',
                  token:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRhbi5waGFtIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IlRhbiBQaGFtIiwiaWF0IjoxNzYyMTYxNjI2LCJleHAiOjE3OTM2OTc2MjZ9.D4NKkY2SzHnizLbgRkAZIfrU_E6etRw303-qbr9WC58',
                },
              }),
            4000
          );
        });
      }
      case 'GET_MEMBER': {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true, data: { token: 'xxx' } });
          }, 2_000);
        });
      }
      case 'CREATE_TASKS': {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: false, error: 'Invalid token' });
          }, 4_000);
        });
      }
      case 'DELETE_TASKS': {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: false, error: 'Invalid token' });
          }, 1_000);
        });
      }
      default: {
        return { success: false };
      }
    }
  },
};
