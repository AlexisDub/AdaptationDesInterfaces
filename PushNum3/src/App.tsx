import { useState, useEffect } from 'react';
import { MenuInterface } from './components/MenuInterface';
import { DeviceSelector } from './components/DeviceSelector';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { TableSelectionScreen } from './components/TableSelectionScreen';
import { Smartphone, Tablet } from 'lucide-react';
import { getRushStatus, RUSH_CHECK_INTERVAL, getCurrentPrepTime } from './data/rushService';

export type UserMode = 'normal' | 'child' | null;

export default function App() {
  const [deviceType, setDeviceType] = useState<'tablet' | 'smartphone'>('tablet');
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
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

  // Auto-set table number for smartphone
  useEffect(() => {
    if (deviceType === 'smartphone') {
      setTableNumber(1); // Coder en dur le numéro de table 1 pour smartphone
    } else {
      setTableNumber(null); // Reset pour tablette
    }
  }, [deviceType]);

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Device Selector */}
      <DeviceSelector deviceType={deviceType} setDeviceType={setDeviceType} />
      
      {/* Debug indicator - À retirer en production */}
      {isRushMode && (
        <div className="fixed top-20 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs z-50 shadow-lg">
          🔥 RUSH MODE: {ordersInProgress} commandes
        </div>
      )}
      
      {/* Debug: Temps cumulé - À retirer en production */}
      <div className="fixed top-20 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs z-50 shadow-lg">
        ⏱️ Temps cumulé: {currentPrepTime} min
      </div>
      
      {/* Debug: Table number - À retirer en production */}
      {tableNumber !== null && (
        <div className="fixed top-32 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs z-50 shadow-lg">
          🍽️ Table: {tableNumber}
        </div>
      )}
      
      {/* Device Simulation */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
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