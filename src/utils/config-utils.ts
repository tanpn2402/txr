const getEnv = (key: string, defaultValue?: string | number | boolean) => {
  return import.meta.env['VITE_' + key] ?? defaultValue;
};

type ConfigUtils = {
  ENV: 'production' | 'development';
  GOOGLE_SCRIPT_URL: string;
};

export const ConfigUtils: ConfigUtils = {
  ENV: getEnv('NODE_ENV', 'production'),
  GOOGLE_SCRIPT_URL: '',
};
