/**
 * Mapper pour transformer les données backend en format frontend
 * et enrichir avec les données locales
 */

import type { BackendMenuItem } from '../types/backend';
import type { Dish } from '../data/dishes';
import { getEnrichmentData, hasEnrichmentData } from '../data/dishEnrichment';

/**
 * Convertit une catégorie backend en catégorie frontend
 */
const mapCategory = (backendCategory: string): "entrée" | "plat" | "dessert" => {
  const categoryMap: Record<string, "entrée" | "plat" | "dessert"> = {
    'STARTER': 'entrée',
    'MAIN': 'plat',
    'DESSERT': 'dessert',
    'BEVERAGE': 'dessert', // Les boissons sont traitées comme desserts
  };
  
  return categoryMap[backendCategory] || 'plat';
};

/**
 * Transforme un MenuItem du backend en Dish pour le frontend
 * Enrichit avec les données locales (description, ingrédients, etc.)
 * 
 * @param backendItem - Item du backend (partiel)
 * @param prepTime - Temps de préparation (peut venir du Kitchen Service)
 * @returns Dish complet pour le frontend
 */
export const mapBackendItemToDish = (
  backendItem: BackendMenuItem,
  prepTime?: number
): Dish => {
  const enrichment = getEnrichmentData(backendItem.shortName);
  
  // Avertissement si pas de données d'enrichissement
  if (!hasEnrichmentData(backendItem.shortName)) {
    console.warn(`⚠️ Pas de données d'enrichissement pour "${backendItem.shortName}". Ajoutez-le dans dishEnrichment.ts`);
  }

  return {
    id: backendItem._id,
    name: backendItem.fullName,
    description: enrichment.description,
    price: backendItem.price,
    category: mapCategory(backendItem.category),
    imageUrl: backendItem.image,
    ingredients: enrichment.ingredients,
    prepTime: prepTime || 15, // Défaut 15 min si non fourni
    // Propriétés par défaut pour correspondre au type Dish
    popularity: 3,
    isSpecialOfDay: false,
    isQuick: (prepTime || 15) <= 15,
    kidFriendly: false,
    spicyLevel: enrichment.isSpicy ? 2 : 0,
    // Détection automatique des propriétés diététiques
    isVegetarian: !enrichment.ingredients.some(ing => 
      /viande|poulet|boeuf|porc|poisson|saumon|thon/i.test(ing)
    ),
    isVegan: !enrichment.ingredients.some(ing => 
      /viande|poulet|boeuf|porc|poisson|lait|crème|fromage|oeuf|beurre/i.test(ing)
    ),
    isGlutenFree: !enrichment.allergens.some(all => /gluten/i.test(all)),
  };
};

/**
 * Transforme un tableau d'items backend en tableau de Dish frontend
 */
export const mapBackendItemsToDishes = (
  backendItems: BackendMenuItem[]
): Dish[] => {
  return backendItems.map(item => mapBackendItemToDish(item));
};

/**
 * Convertit une catégorie frontend en catégorie backend
 * (Pour créer de nouveaux items)
 */
export const mapFrontendCategoryToBackend = (frontendCategory: string): string => {
  const categoryMap: Record<string, string> = {
    'entrée': 'STARTER',
    'plat': 'MAIN',
    'dessert': 'DESSERT',
    'boisson': 'BEVERAGE',
  };
  
  return categoryMap[frontendCategory.toLowerCase()] || 'MAIN';
};

/**
 * Prépare les données pour créer un nouvel item dans le backend
 */
export const prepareDishForBackend = (dish: Partial<Dish>) => {
  if (!dish.name || !dish.price || !dish.category) {
    throw new Error('name, price et category sont obligatoires');
  }

  // Générer un shortName à partir du name
  const shortName = dish.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères spéciaux par -
    .replace(/^-+|-+$/g, ''); // Enlève les - au début/fin

  return {
    fullName: dish.name,
    shortName,
    price: dish.price,
    category: mapFrontendCategoryToBackend(dish.category),
    image: dish.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
  };
};
