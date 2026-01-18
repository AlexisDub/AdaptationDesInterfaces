/**
 * Types pour les données du backend (d'après Swagger)
 */

// ============================================
// MENU SERVICE
// ============================================

export type MenuItemCategory = "STARTER" | "MAIN" | "DESSERT" | "BEVERAGE";

export interface BackendMenuItem {
  _id: string;
  fullName: string;
  shortName: string;
  price: number;
  category: MenuItemCategory;
  image: string;
}

export interface AddMenuItemDto {
  fullName: string;
  shortName: string;
  price: number;
  category: MenuItemCategory;
  image: string;
}

// ============================================
// DINING SERVICE
// ============================================

export interface BackendTable {
  _id: string;
  number: number;
  taken: boolean;
  tableOrderId: string;
}

export interface OrderingItem {
  _id: string;
  shortName: string;
}

export interface OrderingLine {
  item: OrderingItem;
  howMany: number;
  sentForPreparation: boolean;
}

export interface PreparedItemDto {
  _id: string;
  shortName: string;
}

export interface PreparationDto {
  _id: string;
  shouldBeReadyAt: string;
  preparedItems: PreparedItemDto[];
}

export interface BackendTableOrder {
  _id: string;
  tableNumber: number;
  customersCount: number;
  opened: string; // ISO date
  lines: OrderingLine[];
  preparations: PreparationDto[];
  billed: string; // ISO date
}

export interface StartOrderingDto {
  tableNumber: number;
  customersCount: number;
}

export interface AddMenuItemToOrderDto {
  menuItemId: string;
  menuItemShortName: string;
  howMany: number;
}

// ============================================
// KITCHEN SERVICE
// ============================================

export type PreparationState = "readyToBeServed" | "preparationStarted";
export type CookingPost = "BAR" | "COLD_DISH" | "HOT_DISH";

export interface Recipe {
  _id: string;
  shortName: string;
  post: CookingPost;
  cookingSteps: string[];
  meanCookingTimeInSec: number;
}

export interface PreparedItem {
  _id: string;
  shortName: string;
  recipe: Recipe;
  shouldStartAt: string; // ISO date
  startedAt: string; // ISO date
  finishedAt: string; // ISO date
}

export interface Preparation {
  _id: string;
  tableNumber: number;
  shouldBeReadyAt: string;
  completedAt: string;
  takenForServiceAt: string;
  preparedItems: PreparedItem[];
}

export interface ItemToBeCookedDto {
  menuItemShortName: string;
  howMany: number;
}

export interface PreparationRequestDto {
  tableNumber: number;
  itemsToBeCooked: ItemToBeCookedDto[];
}

// ============================================
// ERROR RESPONSES
// ============================================

export interface BackendError {
  error: string;
  details: string;
}

// ============================================
// HEALTH CHECK
// ============================================

export interface HealthCheckResponse {
  status: "ok" | "error";
  info: Record<string, { status: string }>;
  error: Record<string, { status: string; message?: string }>;
  details: Record<string, { status: string; message?: string }>;
}
