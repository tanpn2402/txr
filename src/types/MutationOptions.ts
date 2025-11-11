import type { UseMutationOptions } from '@tanstack/react-query';

export type MutationOptions<T, V> = UseMutationOptions<T, Error, V, unknown>;
