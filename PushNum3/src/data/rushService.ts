/**
 * RUSH SERVICE - Gestion du mode Rush basé sur les commandes en cours
 * 
 * Ce service simule le mode Rush en accumulant les temps de préparation des commandes.
 * Quand le temps cumulé dépasse un seuil, le mode Rush s'active.
 */

export interface RushStatus {
  ordersInProgress: number;
  isRushMode: boolean;
  threshold: number;
  lastUpdate: Date;
  totalPrepTimeMinutes?: number; // Temps cumulé de préparation
}

/**
 * Seuil de déclenchement du mode Rush en minutes de préparation cumulée
 * Si totalPrepTime > RUSH_TIME_THRESHOLD, le mode Rush s'active
 */
export const RUSH_TIME_THRESHOLD = 100; // 100 minutes de temps de préparation cumulé

/**
 * Intervalle de rafraîchissement en millisecondes (10 secondes)
 */
export const RUSH_CHECK_INTERVAL = 10000;

/**
 * Variable locale pour simuler le temps de préparation cumulé
 */
let cumulativePrepTime = 0;

/**
 * Ajoute du temps de préparation au compteur cumulé
 * @param minutes - Minutes de préparation à ajouter
 */
export function addPrepTime(minutes: number): void {
  cumulativePrepTime += minutes;
  console.log(`[Rush Simulation] +${minutes} min ajoutées. Total cumulé: ${cumulativePrepTime} min`);
}

/**
 * Réinitialise le temps de préparation cumulé
 */
export function resetPrepTime(): void {
  cumulativePrepTime = 0;
  console.log('[Rush Simulation] Temps cumulé réinitialisé');
}

/**
 * Récupère le temps de préparation cumulé actuel
 */
export function getCurrentPrepTime(): number {
  return cumulativePrepTime;
}

/**
 * SIMULATION - Récupère le nombre de commandes en cours
 * Basé sur le temps de préparation cumulé
 */
export async function simulateGetOrdersInProgress(): Promise<number> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Convertir le temps cumulé en "nombre de commandes" simulé
  // (environ 1 commande = 20 minutes de préparation moyenne)
  const simulatedOrders = Math.floor(cumulativePrepTime / 20);
  
  return simulatedOrders;
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
    isRushMode: cumulativePrepTime > RUSH_TIME_THRESHOLD,
    threshold: RUSH_TIME_THRESHOLD,
    totalPrepTimeMinutes: cumulativePrepTime,
    lastUpdate: new Date()
  };
}