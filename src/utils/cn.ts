import { twMerge } from 'tailwind-merge';

export const cn = (classnames: Parameters<typeof twMerge>) => twMerge(classnames);
