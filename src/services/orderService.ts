/**
 * Service pour gérer la soumission des commandes au backend
 */

import { DiningServiceAPI } from './backendAPI';
import { BACKEND_CONFIG } from '../config/backendConfig';
import type { CartItem } from '../components/CartSidebar';
import type { BackendTableOrder } from '../types/backend';

export interface OrderSubmissionResult {
  success: boolean;
  orderId?: string;
  backendOrder?: BackendTableOrder;
  error?: string;
}

/**
 * Soumet une commande au backend (Dining Service)
 * 
 * Flux:
 * 1. POST /tableOrders - Ouvre une commande pour la table
 * 2. POST /tableOrders/{id} - Ajoute chaque item
 * 3. POST /tableOrders/{id}/prepare - Envoie en cuisine
 * 4. GET /tableOrders/{id} - Vérifie que tout est bien enregistré
 * 
 * @param tableNumber - Numéro de la table
 * @param items - Items du panier à commander
 * @param customersCount - Nombre de clients (optionnel)
 * @returns Résultat de la soumission avec l'ordre backend
 */
export const submitOrderToBackend = async (
  tableNumber: number,
  items: CartItem[],
  customersCount: number = 1
): Promise<OrderSubmissionResult> => {
  // Si mode MOCK, ne pas envoyer au backend
  if (BACKEND_CONFIG.USE_MOCK_DATA) {
    console.log('📦 [Mode MOCK] Commande simulée localement:', { tableNumber, items });
    return {
      success: true,
      orderId: `MOCK-${tableNumber}-${Date.now()}`,
    };
  }

  try {
    console.log(`🌐 [Order Service] Soumission commande pour table ${tableNumber}...`);
    
    // Étape 1: Vérifier si la table a déjà une commande ouverte
    console.log(`  → GET /tableOrders (recherche commande existante pour table ${tableNumber})`);
    const allOrders = await DiningServiceAPI.getAllTableOrders();
    const existingOrder = allOrders.find(order => 
      order.tableNumber === tableNumber && !order.billed
    );
    
    let orderId: string;
    
    if (existingOrder) {
      // Réutiliser la commande existante
      console.log(`  ✅ Commande existante trouvée: ${existingOrder._id}`);
      orderId = existingOrder._id;
    } else {
      // Ouvrir une nouvelle commande
      console.log(`  → POST /tableOrders (table: ${tableNumber}, clients: ${customersCount})`);
      const newOrder = await DiningServiceAPI.startOrdering({
        tableNumber: tableNumber,
        customersCount: customersCount,
      });
      console.log(`  ✅ Nouvelle commande ouverte: ${newOrder._id}`);
      orderId = newOrder._id;
    }

    // Étape 2: Ajouter chaque item à la commande
    for (const item of items) {
      console.log(`  → POST /tableOrders/${orderId} (${item.quantity}x ${item.dish.name})`);
      
      // Trouver le shortName pour l'item (nécessaire pour l'API backend)
      // Le backend utilise shortName pour identifier les plats
      const shortName = extractShortName(item.dish.name);
      
      await DiningServiceAPI.addItemToOrder(orderId, {
        menuItemId: item.dish.id, // ID MongoDB du plat
        menuItemShortName: shortName,
        howMany: item.quantity,
      });
    }
    
    console.log(`  ✅ ${items.length} items ajoutés`);

    // Étape 3: Envoyer la commande en préparation (cuisine)
    console.log(`  → POST /tableOrders/${orderId}/prepare`);
    await DiningServiceAPI.sendForPreparation(orderId);
    console.log(`  ✅ Commande envoyée à la cuisine`);

    // Étape 4: VERIFICATION - Récupérer la commande pour vérifier
    console.log(`  → GET /tableOrders/${orderId} (vérification)`);
    const verifiedOrder = await DiningServiceAPI.getTableOrder(orderId);
    
    console.log('  ✅ Vérification réussie:', {
      orderId: verifiedOrder._id,
      table: verifiedOrder.tableNumber,
      items: verifiedOrder.lines?.length || 0,
      opened: verifiedOrder.opened,
    });

    console.log(`✅ [Order Service] Commande ${orderId} complète et vérifiée!`);

    return {
      success: true,
      orderId: orderId,
      backendOrder: verifiedOrder,
    };

  } catch (error) {
    console.error('❌ [Order Service] Erreur lors de la soumission:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
};

/**
 * Extrait le shortName d'un nom de plat complet
 * Essaie de faire correspondre avec les noms connus du backend
 */
const extractShortName = (fullName: string): string => {
  // Mapping des noms complets vers shortNames backend
  const knownMappings: Record<string, string> = {
    'Homemade foie gras terrine': 'foie gras',
    'Soft-boiled egg breaded with breadcrumbs and nuts': 'soft-boiled egg',
    'Goat cheese foom from "Valbonne goat farm"': 'goat cheese',
    'Homemade dill salmon gravlax': 'salmon',
    'Crab maki with fresh mango': 'crab maki',
    'Burrata Mozzarella': 'burrata',
    'Delicious Pizza Regina': 'pizza',
    'Lasagna al forno': 'lasagna',
    'Homemade beef burger': 'beef burger',
    'Beef chuck cooked 48 hours at low temperature': 'beef chuck',
    'Half cooked tuna and octopus grilled on the plancha': 'half cooked tuna',
    'Brownie (home made)': 'brownie',
    'Valrhona chocolate declination with salted chocolate ice cream': 'chocolate',
    "Marmalade of Menton's lemon - Lemon cream - Limoncello jelly and sorbet - Homemade meringue": 'lemon',
    'Fresh raspberries and peaches': 'rasp and peaches',
    'Dessert of fresh strawberries and vanilla mascarpone mousse': 'strawberries',
    'Fresh seasonal fruit': 'seasonal fruit',
    'Speculoos tiramisu': 'tiramisu',
    'Bottled coke (33cl)': 'coke',
    'Ice Tea (33cl)': 'ice tea',
    'Bottled water': 'bottled water',
    'Sparkling water': 'sparkling water',
    'Spritz': 'spritz',
    'Margarita': 'margarita',
    'Tequila sunrise': 'tequila',
    'Mojito': 'mojito',
    'Martini': 'martini',
    'Lemonade': 'lemonade',
    'Apple juice': 'apple juice',
    'Café': 'café',
  };

  const shortName = knownMappings[fullName];
  
  if (!shortName) {
    console.warn(`⚠️ [Order Service] Pas de mapping trouvé pour "${fullName}". Utilisation du nom comme shortName.`);
    return fullName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  }
  
  return shortName;
};

/**
 * Récupère l'historique des commandes d'une table
 */
export const getTableOrderHistory = async (tableNumber: number): Promise<BackendTableOrder[]> => {
  if (BACKEND_CONFIG.USE_MOCK_DATA) {
    return [];
  }

  try {
    const allOrders = await DiningServiceAPI.getAllTableOrders();
    return allOrders.filter(order => order.tableNumber === tableNumber);
  } catch (error) {
    console.error('❌ [Order Service] Erreur récupération historique:', error);
    return [];
  }
};
