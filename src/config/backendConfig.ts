/**
 * Configuration des URLs des microservices backend
 * 
 * À CONFIGURER selon votre environnement:
 * - Développement local: localhost avec ports spécifiques
 * - Production: URLs déployées
 */

export const BACKEND_CONFIG = {
  // Menu Service - Gestion des items du menu
  MENU_SERVICE_URL: (import.meta as any).env?.VITE_MENU_SERVICE_URL || "http://localhost:3001",
  
  // Dining Service - Gestion des tables et commandes
  DINING_SERVICE_URL: (import.meta as any).env?.VITE_DINING_SERVICE_URL || "http://localhost:3002",
  
  // Kitchen Service - Gestion des préparations
  KITCHEN_SERVICE_URL: (import.meta as any).env?.VITE_KITCHEN_SERVICE_URL || "http://localhost:3004",
  
  // Mode de fonctionnement
  USE_MOCK_DATA: (import.meta as any).env?.VITE_USE_MOCK_DATA !== "false", // true = utilise les données locales, false = utilise le backend
} as const;

// Debug: log configuration at startup
console.log('[backendConfig] Configuration:', {
  MENU_SERVICE_URL: BACKEND_CONFIG.MENU_SERVICE_URL,
  DINING_SERVICE_URL: BACKEND_CONFIG.DINING_SERVICE_URL,
  KITCHEN_SERVICE_URL: BACKEND_CONFIG.KITCHEN_SERVICE_URL,
  USE_MOCK_DATA: BACKEND_CONFIG.USE_MOCK_DATA,
  env_VITE_USE_MOCK_DATA: (import.meta as any).env?.VITE_USE_MOCK_DATA,
  env_VITE_MENU_SERVICE_URL: (import.meta as any).env?.VITE_MENU_SERVICE_URL,
});

/**
 * Helper pour construire les URLs complètes
 */
export const getAPIUrl = (service: 'menu' | 'dining' | 'kitchen', path: string): string => {
  const baseUrl = service === 'menu' ? BACKEND_CONFIG.MENU_SERVICE_URL :
                  service === 'dining' ? BACKEND_CONFIG.DINING_SERVICE_URL :
                  BACKEND_CONFIG.KITCHEN_SERVICE_URL;
  
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
