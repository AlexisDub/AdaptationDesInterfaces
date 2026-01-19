/**
 * DATA LOADER - Chargeur de données centralisé
 * 
 * Ce fichier charge toutes les données depuis restaurant-data.ts
 * et les exporte dans les formats attendus par l'application.
 * 
 * Avantages:
 * - Source unique de vérité pour toutes les données
 * - Facile à remplacer par des appels API
 * - Validation et transformation centralisées
 */

import { restaurantData } from './restaurant-data';
import type { Dish } from './dishes';

// ============================================================================
// TYPES
// ============================================================================

export interface RestaurantConfig {
  name: string;
  logo: string;
  welcomeMessage: string;
  rushHourConfig: {
    enabled: boolean;
    hours: { start: number; end: number }[];
    bannerMessage: string;
    warningThreshold: number;
  };
  features: {
    childMode: boolean;
    adaptiveSuggestions: boolean;
    ingredientSearch: boolean;
    multipleDevices: boolean;
  };
}

export interface ChildReward {
  id: string;
  name: string;
  emoji: string;
  stars: number;
  description: string;
  imageUrl?: string;
}

export interface ChildModeConfig {
  chefLeoMessages: {
    welcome: string;
    entrée: string;
    plat: string;
    dessert: string;
    complete: string;
    cart: string;
    rewards: string;
  };
  encouragements: string[];
}

// ============================================================================
// CHARGEMENT DES DONNÉES
// ============================================================================

/**
 * Configuration du restaurant
 */
export const restaurantConfig: RestaurantConfig = restaurantData.restaurantConfig;

/**
 * Liste de tous les plats
 * Converti automatiquement les données JSON en objets Dish typés
 */
export const dishes: Dish[] = restaurantData.dishes as Dish[];

/**
 * Récompenses pour le mode enfant
 */
export const childRewards: ChildReward[] = restaurantData.childRewards;

/**
 * Configuration du mode enfant
 */
export const childModeConfig: ChildModeConfig = restaurantData.childModeConfig;

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Récupère un plat par son ID
 */
export function getDishById(id: string): Dish | undefined {
  return dishes.find(dish => dish.id === id);
}

/**
 * Récupère les plats par catégorie
 */
export function getDishesByCategory(category: 'entrée' | 'plat' | 'dessert'): Dish[] {
  return dishes.filter(dish => dish.category === category);
}

/**
 * Récupère les plats adaptés aux enfants
 */
export function getKidFriendlyDishes(): Dish[] {
  return dishes.filter(dish => dish.kidFriendly);
}

/**
 * Récupère les plats adaptés aux enfants par catégorie
 */
export function getKidFriendlyDishesByCategory(category: 'entrée' | 'plat' | 'dessert'): Dish[] {
  return dishes.filter(dish => dish.category === category && dish.kidFriendly);
}

/**
 * Récupère les plats rapides (pour le mode Rush)
 */
export function getQuickDishes(): Dish[] {
  return dishes.filter(dish => dish.isQuick);
}

/**
 * Récupère toutes les sous-catégories pour une catégorie donnée
 */
export function getSubcategories(category: 'entrée' | 'plat' | 'dessert'): string[] {
  const subcategories = dishes
    .filter(dish => dish.category === category && dish.subcategory)
    .map(dish => dish.subcategory!);
  
  // Retourner uniquement les valeurs uniques
  return Array.from(new Set(subcategories));
}

/**
 * Récupère les plats par sous-catégorie
 */
export function getDishesBySubcategory(category: 'entrée' | 'plat' | 'dessert', subcategory: string): Dish[] {
  return dishes.filter(dish => dish.category === category && dish.subcategory === subcategory);
}

/**
 * Recherche de plats par ingrédients
 */
export function searchDishesByIngredients(
  query: string, 
  mode: 'include' | 'exclude' = 'include'
): Dish[] {
  const queryLower = query.toLowerCase().trim();
  
  if (!queryLower) return dishes;
  
  if (mode === 'include') {
    return dishes.filter(dish => 
      dish.ingredients.some(ing => ing.toLowerCase().includes(queryLower))
    );
  } else {
    return dishes.filter(dish => 
      !dish.ingredients.some(ing => ing.toLowerCase().includes(queryLower))
    );
  }
}

/**
 * Vérifie si on est en heure de pointe
 */
export function isRushHour(currentHour?: number): boolean {
  if (!restaurantConfig.rushHourConfig.enabled) {
    return false;
  }
  
  const hour = currentHour ?? new Date().getHours();
  
  return restaurantConfig.rushHourConfig.hours.some(
    period => hour >= period.start && hour <= period.end
  );
}

/**
 * Récupère une récompense par son ID
 */
export function getRewardById(id: string): ChildReward | undefined {
  return childRewards.find(reward => reward.id === id);
}

/**
 * Récupère les récompenses disponibles pour un nombre d'étoiles donné
 */
export function getAffordableRewards(stars: number): ChildReward[] {
  return childRewards.filter(reward => reward.stars <= stars);
}

/**
 * Convertit une récompense en objet Dish pour l'ajouter au panier
 */
export function rewardToDish(reward: ChildReward): Dish {
  return {
    id: `reward-${reward.id}`,
    name: `🎁 ${reward.name}`,
    description: reward.description,
    price: 0, // Gratuit !
    category: 'dessert',
    subcategory: 'Récompenses',
    popularity: 5,
    isSpecialOfDay: false,
    isQuick: true,
    imageUrl: reward.imageUrl || `https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400`,
    kidFriendly: true,
    prepTime: 0,
    ingredients: ['Cadeau', 'Récompense'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    spicyLevel: 0,
    isLight: true,
    isLocal: false,
    cuisine: 'française'
  };
}

// ============================================================================
// EXPORT PAR DÉFAUT POUR RÉTROCOMPATIBILITÉ
// ============================================================================

export default {
  restaurantConfig,
  dishes,
  childRewards,
  childModeConfig,
  getDishById,
  getDishesByCategory,
  getKidFriendlyDishes,
  getKidFriendlyDishesByCategory,
  getQuickDishes,
  getSubcategories,
  getDishesBySubcategory,
  searchDishesByIngredients,
  isRushHour,
  getRewardById,
  getAffordableRewards,
  rewardToDish
};