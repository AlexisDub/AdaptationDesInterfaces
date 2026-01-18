/**
 * Services API pour communiquer avec les microservices backend
 */

import { BACKEND_CONFIG, getAPIUrl } from '../config/backendConfig';
import type {
  BackendMenuItem,
  AddMenuItemDto,
  BackendTable,
  BackendTableOrder,
  StartOrderingDto,
  AddMenuItemToOrderDto,
  Preparation,
  PreparationRequestDto,
  PreparedItem,
  Recipe,
  HealthCheckResponse,
  BackendError,
  PreparationState,
  CookingPost,
} from '../types/backend';

// ============================================
// HELPERS
// ============================================

class BackendAPIError extends Error {
  constructor(public statusCode: number, public details: string) {
    super(`Backend API Error ${statusCode}: ${details}`);
    this.name = 'BackendAPIError';
  }
}

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error: BackendError = await response.json().catch(() => ({
        error: 'Unknown error',
        details: response.statusText,
      }));
      throw new BackendAPIError(response.status, error.details);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BackendAPIError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// MENU SERVICE
// ============================================

export const MenuServiceAPI = {
  /**
   * GET /health - Vérifie l'état du Menu Service
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return fetchAPI<HealthCheckResponse>(getAPIUrl('menu', '/health'));
  },

  /**
   * GET /menus - Récupère tous les items du menu
   */
  async getAllMenuItems(): Promise<BackendMenuItem[]> {
    return fetchAPI<BackendMenuItem[]>(getAPIUrl('menu', '/menus'));
  },

  /**
   * GET /menus/{menuItemId} - Récupère un item spécifique
   */
  async getMenuItem(menuItemId: string): Promise<BackendMenuItem> {
    return fetchAPI<BackendMenuItem>(getAPIUrl('menu', `/menus/${menuItemId}`));
  },

  /**
   * POST /menus - Ajoute un nouvel item au menu
   * IMPORTANT: Pensez aussi à ajouter les données d'enrichissement dans dishEnrichment.ts
   */
  async addMenuItem(item: AddMenuItemDto): Promise<BackendMenuItem> {
    return fetchAPI<BackendMenuItem>(getAPIUrl('menu', '/menus'), {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
};

// ============================================
// DINING SERVICE
// ============================================

export const DiningServiceAPI = {
  /**
   * GET /health - Vérifie l'état du Dining Service
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return fetchAPI<HealthCheckResponse>(getAPIUrl('dining', '/health'));
  },

  // --- TABLES ---

  /**
   * GET /tables - Récupère toutes les tables
   */
  async getAllTables(): Promise<BackendTable[]> {
    return fetchAPI<BackendTable[]>(getAPIUrl('dining', '/tables'));
  },

  /**
   * GET /tables/{tableNumber} - Récupère une table spécifique
   */
  async getTable(tableNumber: number): Promise<BackendTable> {
    return fetchAPI<BackendTable>(getAPIUrl('dining', `/tables/${tableNumber}`));
  },

  /**
   * POST /tables - Crée une nouvelle table
   */
  async createTable(tableNumber: number): Promise<BackendTable> {
    return fetchAPI<BackendTable>(getAPIUrl('dining', '/tables'), {
      method: 'POST',
      body: JSON.stringify({ number: tableNumber }),
    });
  },

  // --- TABLE ORDERS ---

  /**
   * GET /tableOrders - Récupère toutes les commandes
   */
  async getAllTableOrders(): Promise<BackendTableOrder[]> {
    return fetchAPI<BackendTableOrder[]>(getAPIUrl('dining', '/tableOrders'));
  },

  /**
   * GET /tableOrders/{tableOrderId} - Récupère une commande spécifique
   */
  async getTableOrder(tableOrderId: string): Promise<BackendTableOrder> {
    return fetchAPI<BackendTableOrder>(getAPIUrl('dining', `/tableOrders/${tableOrderId}`));
  },

  /**
   * POST /tableOrders - Ouvre une nouvelle commande pour une table
   */
  async startOrdering(data: StartOrderingDto): Promise<BackendTableOrder> {
    return fetchAPI<BackendTableOrder>(getAPIUrl('dining', '/tableOrders'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /tableOrders/{tableOrderId} - Ajoute un item à la commande
   */
  async addItemToOrder(tableOrderId: string, item: AddMenuItemToOrderDto): Promise<BackendTableOrder> {
    return fetchAPI<BackendTableOrder>(getAPIUrl('dining', `/tableOrders/${tableOrderId}`), {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  /**
   * POST /tableOrders/{tableOrderId}/prepare - Envoie les items en préparation
   */
  async sendForPreparation(tableOrderId: string): Promise<Preparation[]> {
    return fetchAPI<Preparation[]>(getAPIUrl('dining', `/tableOrders/${tableOrderId}/prepare`), {
      method: 'POST',
    });
  },

  /**
   * POST /tableOrders/{tableOrderId}/bill - Facture la commande
   */
  async billOrder(tableOrderId: string): Promise<BackendTableOrder> {
    return fetchAPI<BackendTableOrder>(getAPIUrl('dining', `/tableOrders/${tableOrderId}/bill`), {
      method: 'POST',
    });
  },
};

// ============================================
// KITCHEN SERVICE
// ============================================

export const KitchenServiceAPI = {
  /**
   * GET /health - Vérifie l'état du Kitchen Service
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return fetchAPI<HealthCheckResponse>(getAPIUrl('kitchen', '/health'));
  },

  // --- PREPARATIONS ---

  /**
   * GET /preparations - Récupère les préparations filtrées
   */
  async getPreparations(state: PreparationState, tableNumber?: number): Promise<Preparation[]> {
    const params = new URLSearchParams({ state });
    if (tableNumber !== undefined) params.append('tableNumber', tableNumber.toString());
    
    return fetchAPI<Preparation[]>(getAPIUrl('kitchen', `/preparations?${params.toString()}`));
  },

  /**
   * GET /preparations/{preparationId} - Récupère une préparation spécifique
   */
  async getPreparation(preparationId: string): Promise<Preparation> {
    return fetchAPI<Preparation>(getAPIUrl('kitchen', `/preparations/${preparationId}`));
  },

  /**
   * POST /preparations - Crée de nouvelles préparations
   */
  async createPreparations(request: PreparationRequestDto): Promise<Preparation[]> {
    return fetchAPI<Preparation[]>(getAPIUrl('kitchen', '/preparations'), {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * POST /preparations/{preparationId}/takenToTable - Marque comme apporté à table
   */
  async markTakenToTable(preparationId: string): Promise<Preparation> {
    return fetchAPI<Preparation>(getAPIUrl('kitchen', `/preparations/${preparationId}/takenToTable`), {
      method: 'POST',
    });
  },

  // --- PREPARED ITEMS ---

  /**
   * GET /preparedItems - Récupère les items à préparer pour un poste
   */
  async getPreparedItems(post: CookingPost): Promise<PreparedItem[]> {
    return fetchAPI<PreparedItem[]>(getAPIUrl('kitchen', `/preparedItems?post=${post}`));
  },

  /**
   * GET /preparedItems/{preparedItemId} - Récupère un item préparé spécifique
   */
  async getPreparedItem(preparedItemId: string): Promise<PreparedItem> {
    return fetchAPI<PreparedItem>(getAPIUrl('kitchen', `/preparedItems/${preparedItemId}`));
  },

  /**
   * GET /preparedItems/{preparedItemId}/recipe - Récupère la recette d'un item
   */
  async getRecipe(preparedItemId: string): Promise<Recipe> {
    return fetchAPI<Recipe>(getAPIUrl('kitchen', `/preparedItems/${preparedItemId}/recipe`));
  },

  /**
   * POST /preparedItems/{preparedItemId}/start - Démarre la préparation d'un item
   */
  async startPreparedItem(preparedItemId: string): Promise<PreparedItem> {
    return fetchAPI<PreparedItem>(getAPIUrl('kitchen', `/preparedItems/${preparedItemId}/start`), {
      method: 'POST',
    });
  },

  /**
   * POST /preparedItems/{preparedItemId}/finish - Termine la préparation d'un item
   */
  async finishPreparedItem(preparedItemId: string): Promise<PreparedItem> {
    return fetchAPI<PreparedItem>(getAPIUrl('kitchen', `/preparedItems/${preparedItemId}/finish`), {
      method: 'POST',
    });
  },
};

// ============================================
// HEALTH CHECK GLOBAL
// ============================================

export const BackendAPI = {
  /**
   * Vérifie l'état de tous les services
   */
  async checkAllServices(): Promise<{
    menu: HealthCheckResponse;
    dining: HealthCheckResponse;
    kitchen: HealthCheckResponse;
  }> {
    const [menu, dining, kitchen] = await Promise.all([
      MenuServiceAPI.checkHealth(),
      DiningServiceAPI.checkHealth(),
      KitchenServiceAPI.checkHealth(),
    ]);

    return { menu, dining, kitchen };
  },

  /**
   * Vérifie si le backend est disponible
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const health = await this.checkAllServices();
      return health.menu.status === 'ok' && 
             health.dining.status === 'ok' && 
             health.kitchen.status === 'ok';
    } catch {
      return false;
    }
  },
};
