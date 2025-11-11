const getEnv = (key: string, defaultValue?: string | number | boolean) => {
  return import.meta.env['VITE_' + key] ?? defaultValue;
};

type ConfigUtils = {
  ENV: 'production' | 'development';
  GOOGLE_SCRIPT_URL: string;
  ENCRYPTION_KEY: string;
  ENCRYPTION_SECRET: string;
};

export const ConfigUtils: ConfigUtils = {
  ENV: getEnv('NODE_ENV', 'production'),
  GOOGLE_SCRIPT_URL: '',
  ENCRYPTION_KEY: getEnv(
    'ENCRYPTION_KEY',
    '5cb481678e82b187c015b0f44e73e5273cb06a11dbfb152418781e10cbbfd83b'
  ),
  ENCRYPTION_SECRET: getEnv(
    'ENCRYPTION_SECRET',
    'f80166e42adbc589e97ca7907e498476a804673d7d10526604fd59d94f608210'
  ),
};
