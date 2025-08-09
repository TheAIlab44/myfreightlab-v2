// Configuration pour choisir le mode d'authentification
export const AUTH_CONFIG = {
  // Basculer entre 'mock' et 'supabase' selon vos besoins
  mode: import.meta.env.VITE_SUPABASE_URL ? 'supabase' : 'mock'
} as const;

export type AuthMode = typeof AUTH_CONFIG.mode;
