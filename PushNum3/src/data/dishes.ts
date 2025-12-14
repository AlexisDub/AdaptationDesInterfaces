export interface Dish {
  id: string;
  name: string;
  description: string;
  category: 'entrée' | 'plat' | 'dessert';
  subcategory?: string;
  price: number;
  prepTime: number; // in minutes
  popularity: number; // 1-5
  isSpecialOfDay: boolean;
  isQuick: boolean;
  imageUrl: string;
  kidFriendly: boolean;
  kidFriendlyDescription?: string; // Description simplifiée pour les enfants
  hasVegetables: boolean;
  ingredients: string[]; // List of ingredients for search/filter
  // New filter properties
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: 0 | 1 | 2 | 3; // 0 = not spicy, 3 = very spicy
  isLight?: boolean; // Light/healthy option
  isLocal?: boolean; // Local/seasonal ingredients
  cuisine?: 'française' | 'italienne' | 'asiatique' | 'méditerranéenne';
}

// Import dishes from centralized data loader
import { dishes as dishesData } from './dataLoader';

export const dishes: Dish[] = dishesData;