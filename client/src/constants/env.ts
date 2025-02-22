/**
 * Environment variables constants
 * Note: All environment variables must be prefixed with VITE_
 */

export const ENV = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || '',
  
  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  IS_PRODUCTION: import.meta.env.VITE_NODE_ENV === 'production',
  IS_DEVELOPMENT: import.meta.env.VITE_NODE_ENV === 'development',

  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_CHAT: import.meta.env.VITE_ENABLE_CHAT === 'true',
  },
} as const;

// Type guard to check if all required env variables are present
export const validateEnv = (): boolean => {
  const requiredVars = ['VITE_API_URL'];
  return requiredVars.every((variable) => !!import.meta.env[variable]);
};
