/**
 * RUSH SERVICE - Gestion du mode Rush basé sur les commandes en cours
 * 
 * Ce service simule les appels API pour vérifier l'état du mode Rush.
 * Dans un backend réel, remplacer simulateGetOrdersInProgress() par un vrai fetch().
 */

export interface RushStatus {
  ordersInProgress: number;
  isRushMode: boolean;
  threshold: number;
  lastUpdate: Date;
}

/**
 * Seuil de déclenchement du mode Rush
 * Si ordersInProgress > RUSH_THRESHOLD, le mode Rush s'active
 */
export const RUSH_THRESHOLD = 10;

/**
 * Intervalle de rafraîchissement en millisecondes (10 secondes)
 */
export const RUSH_CHECK_INTERVAL = 10000;

/**
 * SIMULATION - Récupère le nombre de commandes en cours
 * 
 * ⚠️ POUR LE MOMENT: Retourne toujours 15 pour tester le mode Rush
 * 
 * Dans un vrai backend, remplacer par:
 * ```typescript
 * const response = await fetch('/api/rush-status');
 * const data = await response.json();
 * return data.ordersInProgress;
 * ```
 */
export async function simulateGetOrdersInProgress(): Promise<number> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // ⚠️ SIMULATION: Retourne toujours 15 commandes (> 10 donc Rush activé)
  // TODO: Remplacer par un vrai appel API
  return 15;
  
  // Pour tester le mode normal (désactivé), décommenter la ligne suivante :
  // return 5;
  
  // Pour simuler des variations aléatoires, décommenter :
  // return Math.floor(Math.random() * 20);
}

/**
 * Récupère le statut actuel du mode Rush
 * 
 * @returns RushStatus contenant le nombre de commandes et l'état du mode Rush
 */
export async function getRushStatus(): Promise<RushStatus> {
  const ordersInProgress = await simulateGetOrdersInProgress();
  
  return {
    ordersInProgress,
    isRushMode: ordersInProgress > RUSH_THRESHOLD,
    threshold: RUSH_THRESHOLD,
    lastUpdate: new Date()
  };
}

/**
 * Version réelle pour migration API:
 * 
 * export async function getRushStatus(): Promise<RushStatus> {
 *   try {
 *     const response = await fetch('/api/rush-status');
 *     if (!response.ok) {
 *       throw new Error('Failed to fetch rush status');
 *     }
 *     const data = await response.json();
 *     
 *     return {
 *       ordersInProgress: data.ordersInProgress,
 *       isRushMode: data.ordersInProgress > RUSH_THRESHOLD,
 *       threshold: RUSH_THRESHOLD,
 *       lastUpdate: new Date()
 *     };
 *   } catch (error) {
 *     console.error('Error fetching rush status:', error);
 *     // Fallback: mode normal en cas d'erreur
 *     return {
 *       ordersInProgress: 0,
 *       isRushMode: false,
 *       threshold: RUSH_THRESHOLD,
 *       lastUpdate: new Date()
 *     };
 *   }
 * }
 */
