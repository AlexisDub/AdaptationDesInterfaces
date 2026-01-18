/**
 * Script de test et initialisation du backend
 * À exécuter dans la console du navigateur (F12)
 */

import { MenuServiceAPI } from './backendAPI';
import { prepareDishForBackend } from './dishMapper';
import { dishes } from '../data/dishes';

/**
 * Vérifie s'il y a des plats dans le backend
 */
export const checkBackendHasDishes = async () => {
  console.log('🔍 Vérification des plats dans le backend...\n');
  
  try {
    const items = await MenuServiceAPI.getAllMenuItems();
    
    if (items.length === 0) {
      console.log('❌ Le backend est VIDE - Aucun plat trouvé');
      console.log('💡 Utilisez initializeBackendWithDishes() pour ajouter des plats');
      return { isEmpty: true, count: 0 };
    } else {
      console.log(`✅ Le backend contient ${items.length} plat(s)`);
      console.log('\n📋 Liste des plats:');
      items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.fullName} (${item.shortName}) - ${item.price}€ - ${item.category}`);
      });
      return { isEmpty: false, count: items.length, items };
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    console.log('⚠️ Vérifiez que le backend est bien lancé et accessible');
    throw error;
  }
};

/**
 * Initialise le backend avec quelques plats de base
 * Utilise les plats de votre base locale
 */
export const initializeBackendWithDishes = async (maxDishes = 10) => {
  console.log(`🚀 Initialisation du backend avec ${maxDishes} plats...\n`);
  
  const dishesToAdd = dishes.slice(0, maxDishes);
  const results = {
    success: [],
    errors: []
  };
  
  for (const dish of dishesToAdd) {
    try {
      console.log(`📝 Ajout de "${dish.name}"...`);
      
      const backendData = prepareDishForBackend(dish);
      const added = await MenuServiceAPI.addMenuItem(backendData);
      
      console.log(`  ✅ Ajouté: ${added.fullName} (ID: ${added._id})`);
      results.success.push(added);
      
    } catch (error: any) {
      console.error(`  ❌ Erreur pour "${dish.name}":`, error.message);
      results.errors.push({ dish: dish.name, error: error.message });
    }
  }
  
  console.log('\n📊 Résultat:');
  console.log(`  ✅ Réussis: ${results.success.length}`);
  console.log(`  ❌ Échoués: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️ Erreurs détaillées:');
    results.errors.forEach(err => {
      console.log(`  - ${err.dish}: ${err.error}`);
    });
  }
  
  return results;
};

/**
 * Initialise TOUS les plats de votre base locale
 * ATTENTION: Peut prendre du temps si vous avez beaucoup de plats
 */
export const initializeBackendWithAllDishes = async () => {
  console.log(`🚀 Initialisation du backend avec TOUS les plats (${dishes.length})...\n`);
  console.log('⏳ Cela peut prendre quelques secondes...\n');
  
  return await initializeBackendWithDishes(dishes.length);
};

/**
 * Ajoute un seul plat manuellement
 */
export const addSingleDish = async (dishData: {
  fullName: string;
  shortName: string;
  price: number;
  category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
  image: string;
}) => {
  console.log(`📝 Ajout de "${dishData.fullName}"...`);
  
  try {
    const added = await MenuServiceAPI.addMenuItem(dishData);
    console.log(`✅ Plat ajouté avec succès !`);
    console.log(`   ID: ${added._id}`);
    console.log(`   ShortName: ${added.shortName}`);
    console.log(`\n⚠️ IMPORTANT: Ajoutez aussi l'enrichissement dans dishEnrichment.ts:`);
    console.log(`\n"${added.shortName}": {`);
    console.log(`  description: "Description ici",`);
    console.log(`  ingredients: ["Ingrédient 1", "Ingrédient 2"],`);
    console.log(`  allergens: ["Allergène 1"],`);
    console.log(`  isSpicy: false`);
    console.log(`},\n`);
    
    return added;
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
};

/**
 * Guide d'utilisation
 */
export const showBackendInitGuide = () => {
  console.log('📖 Guide d\'initialisation du backend\n');
  console.log('1️⃣ Vérifier si le backend a des plats:');
  console.log('   await checkBackendHasDishes()\n');
  console.log('2️⃣ Initialiser avec quelques plats (10 par défaut):');
  console.log('   await initializeBackendWithDishes(10)\n');
  console.log('3️⃣ Initialiser avec TOUS vos plats locaux:');
  console.log('   await initializeBackendWithAllDishes()\n');
  console.log('4️⃣ Ajouter un plat manuellement:');
  console.log('   await addSingleDish({');
  console.log('     fullName: "Nom du Plat",');
  console.log('     shortName: "nom-du-plat",');
  console.log('     price: 12.50,');
  console.log('     category: "MAIN",');
  console.log('     image: "https://..."');
  console.log('   })\n');
  console.log('💡 Après avoir ajouté des plats, pensez à enrichir dans dishEnrichment.ts !');
};

// Exposer globalement pour utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).backendInit = {
    checkBackendHasDishes,
    initializeBackendWithDishes,
    initializeBackendWithAllDishes,
    addSingleDish,
    showBackendInitGuide,
  };
  
  console.log('🛠️ Outils d\'initialisation backend chargés !');
  console.log('Tapez: backendInit.showBackendInitGuide() pour voir les commandes');
}
