/**
 * Service unifié pour charger les plats
 * Gère automatiquement le mode mock (données locales) ou backend réel
 */

import { BACKEND_CONFIG } from '../config/backendConfig';
import { MenuServiceAPI } from './backendAPI';
import { mapBackendItemsToDishes } from './dishMapper';
import { dishes as mockDishes } from '../data/dishes';
import type { Dish } from '../data/dishes';

/**
 * Charge tous les plats depuis le backend ou les données mock
 * 
 * @returns Promesse avec la liste des plats enrichis
 */
export const loadDishes = async (): Promise<Dish[]> => {
  // Mode MOCK : utilise les données locales
  if (BACKEND_CONFIG.USE_MOCK_DATA) {
    console.log('📦 Mode MOCK: Utilisation des données locales');
    return Promise.resolve(mockDishes);
  }

  // Mode BACKEND : récupère depuis le Menu Service
  try {
    console.log('🌐 Chargement des plats depuis le backend...');
    const backendItems = await MenuServiceAPI.getAllMenuItems();
    const enrichedDishes = mapBackendItemsToDishes(backendItems);
    
    console.log(`✅ ${enrichedDishes.length} plats chargés et enrichis`);
    return enrichedDishes;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des plats:', error);
    
    // Fallback sur les données mock en cas d'erreur
    console.warn('⚠️ Fallback sur les données locales');
    return mockDishes;
  }
};

/**
 * Charge un plat spécifique par son ID
 */
export const loadDish = async (dishId: string): Promise<Dish | null> => {
  // Mode MOCK
  if (BACKEND_CONFIG.USE_MOCK_DATA) {
    return mockDishes.find(d => d.id === dishId) || null;
  }

  // Mode BACKEND
  try {
    const backendItem = await MenuServiceAPI.getMenuItem(dishId);
    return mapBackendItemsToDishes([backendItem])[0];
  } catch (error) {
    console.error(`Erreur lors du chargement du plat ${dishId}:`, error);
    return mockDishes.find(d => d.id === dishId) || null;
  }
};

/**
 * Filtre les plats par catégorie
 */
export const filterDishesByCategory = (dishes: Dish[], category: string): Dish[] => {
  if (category === 'Tous') return dishes;
  return dishes.filter(dish => dish.category === category);
};

/**
 * Recherche des plats par nom ou ingrédients
 */
export const searchDishes = (dishes: Dish[], query: string): Dish[] => {
  const lowerQuery = query.toLowerCase();
  return dishes.filter(dish => 
    dish.name.toLowerCase().includes(lowerQuery) ||
    dish.description.toLowerCase().includes(lowerQuery) ||
    dish.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery))
  );
};
