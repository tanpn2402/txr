import { useEffect, useRef } from 'react';

export function useDebounceFn<T>(value: T, callback: (value: T) => void, delay = 500) {
  const handlerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // clear previous timeout
    if (handlerRef.current) {
      clearTimeout(handlerRef.current);
    }

    // set new timeout
    handlerRef.current = setTimeout(() => {
      callback(value);
    }, delay);

    // cleanup on unmount or value change
    return () => {
      if (handlerRef.current) {
        clearTimeout(handlerRef.current);
      }
    };
  }, [value, delay, callback]);
}
