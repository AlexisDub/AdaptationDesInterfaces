/**
 * Utilitaires de test pour le backend
 * À utiliser dans la console du navigateur pour tester les connexions
 */

import { BackendAPI, MenuServiceAPI, DiningServiceAPI, KitchenServiceAPI } from './backendAPI';
import { mapBackendItemsToDishes } from './dishMapper';
import { BACKEND_CONFIG } from '../config/backendConfig';

/**
 * Teste la connexion à tous les services backend
 */
export const testBackendConnection = async () => {
  console.log('🔍 Test de connexion au backend...\n');
  console.log('Configuration:');
  console.log('- Mode MOCK:', BACKEND_CONFIG.USE_MOCK_DATA);
  console.log('- Menu Service:', BACKEND_CONFIG.MENU_SERVICE_URL);
  console.log('- Dining Service:', BACKEND_CONFIG.DINING_SERVICE_URL);
  console.log('- Kitchen Service:', BACKEND_CONFIG.KITCHEN_SERVICE_URL);
  console.log('\n');

  if (BACKEND_CONFIG.USE_MOCK_DATA) {
    console.warn('⚠️ Mode MOCK activé. Les tests backend sont désactivés.');
    console.log('Pour tester le backend réel, modifiez .env:');
    console.log('VITE_USE_MOCK_DATA=false');
    return;
  }

  try {
    const health = await BackendAPI.checkAllServices();
    
    console.log('✅ Menu Service:', health.menu.status);
    console.log('✅ Dining Service:', health.dining.status);
    console.log('✅ Kitchen Service:', health.kitchen.status);
    console.log('\n🎉 Tous les services sont opérationnels !');
    
    return health;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    throw error;
  }
};

/**
 * Teste le chargement et l'enrichissement des plats
 */
export const testDishLoading = async () => {
  console.log('🍽️ Test du chargement des plats...\n');

  if (BACKEND_CONFIG.USE_MOCK_DATA) {
    console.warn('⚠️ Mode MOCK activé. Utilise les données locales.');
    return;
  }

  try {
    const backendItems = await MenuServiceAPI.getAllMenuItems();
    console.log(`📦 ${backendItems.length} items reçus du backend`);
    
    const enrichedDishes = mapBackendItemsToDishes(backendItems);
    console.log(`✨ ${enrichedDishes.length} plats enrichis`);
    
    // Affiche un exemple
    if (enrichedDishes.length > 0) {
      console.log('\n📋 Exemple de plat enrichi:');
      console.log(enrichedDishes[0]);
    }
    
    // Vérifie les enrichissements manquants
    const missingEnrichment = enrichedDishes.filter(
      dish => dish.description === "Description non disponible"
    );
    
    if (missingEnrichment.length > 0) {
      console.warn(`\n⚠️ ${missingEnrichment.length} plats sans enrichissement:`);
      missingEnrichment.forEach(dish => {
        console.warn(`  - ${dish.name} (shortName manquant dans dishEnrichment.ts)`);
      });
    } else {
      console.log('\n✅ Tous les plats sont correctement enrichis !');
    }
    
    return enrichedDishes;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

/**
 * Teste le cycle complet d'une commande
 */
export const testOrderFlow = async (tableNumber: number = 1) => {
  console.log(`🍴 Test du cycle de commande pour la table ${tableNumber}...\n`);

  if (BACKEND_CONFIG.USE_MOCK_DATA) {
    console.warn('⚠️ Mode MOCK activé. Test désactivé.');
    return;
  }

  try {
    // 1. Vérifier la table
    console.log('1️⃣ Vérification de la table...');
    const table = await DiningServiceAPI.getTable(tableNumber);
    console.log(`   Table ${table.number} - Occupée: ${table.taken}`);
    
    if (table.taken) {
      console.warn('   ⚠️ Table déjà occupée !');
      return;
    }

    // 2. Ouvrir une commande
    console.log('\n2️⃣ Ouverture de la commande...');
    const order = await DiningServiceAPI.startOrdering({
      tableNumber: tableNumber,
      customersCount: 4
    });
    console.log(`   ✅ Commande créée: ${order._id}`);

    // 3. Récupérer les plats disponibles
    console.log('\n3️⃣ Chargement des plats...');
    const menuItems = await MenuServiceAPI.getAllMenuItems();
    console.log(`   ${menuItems.length} plats disponibles`);

    // 4. Ajouter un plat
    if (menuItems.length > 0) {
      const firstItem = menuItems[0];
      console.log(`\n4️⃣ Ajout de "${firstItem.fullName}"...`);
      
      const updatedOrder = await DiningServiceAPI.addItemToOrder(order._id, {
        menuItemId: firstItem._id,
        menuItemShortName: firstItem.shortName,
        howMany: 2
      });
      
      console.log(`   ✅ Plat ajouté - Total: ${updatedOrder.lines.length} ligne(s)`);
    }

    // 5. Envoyer en préparation
    console.log('\n5️⃣ Envoi en préparation...');
    const preparations = await DiningServiceAPI.sendForPreparation(order._id);
    console.log(`   ✅ ${preparations.length} préparation(s) créée(s)`);

    // 6. Facturer
    console.log('\n6️⃣ Facturation...');
    const billedOrder = await DiningServiceAPI.billOrder(order._id);
    console.log(`   ✅ Commande facturée à ${new Date(billedOrder.billed).toLocaleString()}`);

    console.log('\n🎉 Cycle complet testé avec succès !');
    return billedOrder;
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

/**
 * Affiche un résumé de l'état actuel
 */
export const showStatus = () => {
  console.log('📊 État de l\'intégration backend\n');
  console.log('Mode:', BACKEND_CONFIG.USE_MOCK_DATA ? '📦 MOCK (données locales)' : '🌐 BACKEND (services réels)');
  console.log('\nServices configurés:');
  console.log('  Menu:', BACKEND_CONFIG.MENU_SERVICE_URL);
  console.log('  Dining:', BACKEND_CONFIG.DINING_SERVICE_URL);
  console.log('  Kitchen:', BACKEND_CONFIG.KITCHEN_SERVICE_URL);
  console.log('\nCommandes disponibles dans la console:');
  console.log('  - testBackendConnection()    : Teste la connexion');
  console.log('  - testDishLoading()          : Teste le chargement des plats');
  console.log('  - testOrderFlow(tableNum)    : Teste un cycle complet');
  console.log('  - showStatus()               : Affiche ce message');
};

// Exposer globalement pour utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).backendTest = {
    testBackendConnection,
    testDishLoading,
    testOrderFlow,
    showStatus,
  };
  
  console.log('🧪 Utilitaires de test backend chargés !');
  console.log('Tapez: backendTest.showStatus() pour voir les commandes disponibles');
}
