import type { TypeAny } from '@/types/TypeAny';

import { ConfigUtils } from './config-utils';
import { createGsRunMock, type GsRunHandlers, mockGsFunctions } from './gs-mock';

type ReturnType<R> = {
  success: boolean;
  data?: R;
  error?: Error | string;
};

/**
 * Call a Google Apps Script server-side function.
 * @param functionName - The name of the server-side function in Code.gs
 * @param data - Data to pass as the function argument
 * @returns A Promise that resolves with the result or rejects on error
 */
export function callGoogleScript<T = unknown, R = unknown>(
  functionName: string,
  data?: T
): Promise<{
  success: boolean;
  data?: R;
  error?: Error | string;
}> {
  return new Promise((resolve) => {
    try {
      console.group('====> [GS] callGoogleScript', functionName);
      console.log('Request body', data);

      let run: GsRunHandlers<ReturnType<R>> | undefined = undefined;

      if (!(window as TypeAny).google?.script?.run) {
        if (ConfigUtils.ENV === 'development') {
          run = createGsRunMock(mockGsFunctions);
        }
      } else {
        run = (window as TypeAny).google.script.run as GsRunHandlers<ReturnType<R>>;
      }

      if (!run) {
        throw new Error(
          'google.script.run is not available (not running inside Apps Script web app).'
        );
      }

      run
        .withSuccessHandler((res: ReturnType<R>) => {
          console.log('Response body', res);
          if (typeof res.data === 'string') {
            res.data = JSON.parse(res.data);
          }
          resolve(res);
        })
        .withFailureHandler((error: TypeAny) => {
          console.log('Response error', error);
          resolve({
            success: false,
            error,
          });
        });

      if (data !== undefined) run[functionName](data);
      else run[functionName]();
    } catch (error) {
      console.log('Failed to call Google Script', error);
      resolve({
        success: false,
        error: error as Error,
      });
    } finally {
      console.log('<==== [GS] callGoogleScript', functionName);
      console.groupEnd();
    }
  });
}
