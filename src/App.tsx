import { useState, useEffect } from 'react';
import { MenuInterface } from './components/MenuInterface';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { TableSelectionScreen } from './components/TableSelectionScreen';
import { getRushStatus, RUSH_CHECK_INTERVAL, getCurrentPrepTime } from './data/rushService';

export type UserMode = 'normal' | 'child' | null;

export default function App() {
  // Lire les paramètres URL au démarrage
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  const idTableParam = urlParams.get('idtable');
  
  // Mode par défaut : tablette (sauf si mode=phone dans l'URL)
  const [deviceType, setDeviceType] = useState<'tablet' | 'smartphone'>(
    modeParam === 'phone' ? 'smartphone' : 'tablet'
  );
  const [userMode, setUserMode] = useState<UserMode>(null);
  // Numéro de table : null par défaut, ou la valeur de l'URL pour mode phone
  const [tableNumber, setTableNumber] = useState<number | null>(
    modeParam === 'phone' && idTableParam ? parseInt(idTableParam, 10) : null
  );
  const [isRushMode, setIsRushMode] = useState(false);
  const [ordersInProgress, setOrdersInProgress] = useState(0);
  const [currentPrepTime, setCurrentPrepTime] = useState(0);

  // Vérifier le statut Rush toutes les 10 secondes
  useEffect(() => {
    // Fonction pour vérifier le statut
    const checkRushStatus = async () => {
      try {
        const status = await getRushStatus();
        setIsRushMode(status.isRushMode);
        setOrdersInProgress(status.ordersInProgress);
        setCurrentPrepTime(getCurrentPrepTime());
        
        // Log pour debug (à retirer en production)
        console.log(`[Rush Check] Temps cumulé: ${getCurrentPrepTime()} min, Commandes simulées: ${status.ordersInProgress}, Mode Rush: ${status.isRushMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
      } catch (error) {
        console.error('Erreur lors de la vérification du mode Rush:', error);
      }
    };

    // Vérifier immédiatement au chargement
    checkRushStatus();

    // Puis vérifier toutes les 10 secondes
    const interval = setInterval(checkRushStatus, RUSH_CHECK_INTERVAL);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Reset to mode selection
  const handleResetMode = () => {
    setUserMode(null);
  };

  // Handle table selection
  const handleTableSelection = (table: number) => {
    setTableNumber(table);
  };

  // Reset to table selection (only for tablet)
  const handleResetToTableSelection = () => {
    setTableNumber(null);
    setUserMode(null);
  };

  // Le numéro de table est maintenant géré via les paramètres URL

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Debug indicator - À retirer en production */}
      {isRushMode && (
        <div className="fixed top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs z-50 shadow-lg">
          🔥 RUSH MODE: {ordersInProgress} commandes
        </div>
      )}
      
      {/* Debug: Temps cumulé - À retirer en production */}
      <div className="fixed top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs z-50 shadow-lg">
        ⏱️ Temps cumulé: {currentPrepTime} min
      </div>
      
      {/* Debug: Table number - À retirer en production */}
      {tableNumber !== null && (
        <div className="fixed top-16 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs z-50 shadow-lg">
          🍽️ Table: {tableNumber}
        </div>
      )}
      
      {/* Device Simulation */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`bg-white shadow-2xl transition-all duration-500 ${
            deviceType === 'tablet' 
              ? 'w-full max-w-6xl aspect-[4/3] rounded-2xl' 
              : 'w-full max-w-md aspect-[9/16] rounded-3xl'
          }`}
        >
          {/* Show table selection first for tablet, skip for smartphone */}
          {deviceType === 'tablet' && tableNumber === null ? (
            <TableSelectionScreen onSelectTable={handleTableSelection} />
          ) : !userMode ? (
            <ModeSelectionScreen 
              onSelectMode={setUserMode}
              deviceType={deviceType}
            />
          ) : (
            <MenuInterface 
              deviceType={deviceType} 
              isRushHour={isRushMode}
              userMode={userMode}
              tableNumber={tableNumber!}
              onResetMode={handleResetMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}