import { useState, useEffect } from 'react';
import { MenuInterface } from './components/MenuInterface';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { TableSelectionScreen } from './components/TableSelectionScreen';
import { getRushStatus, RUSH_CHECK_INTERVAL, getCurrentPrepTime } from './data/rushService';

export type UserMode = 'normal' | 'child' | null;

export default function App() {
  // Lire les paramètres URL
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  const tableParam = urlParams.get('idtable');
  
  // Detect if running as PWA (standalone mode)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
  
  // Déterminer le type de dispositif basé sur l'URL
  const [deviceType] = useState<'tablet' | 'smartphone'>(
    modeParam === 'phone' ? 'smartphone' : 'tablet'
  );
  
  // Lock orientation for tablet PWA in landscape
  useEffect(() => {
    if (isPWA && deviceType === 'tablet' && screen.orientation && (screen.orientation as any).lock) {
      (screen.orientation as any).lock('landscape').catch((err: any) => {
        console.log('Orientation lock not supported:', err);
      });
    }
  }, [isPWA, deviceType]);
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(
    deviceType === 'smartphone' && tableParam ? parseInt(tableParam) : null
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

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Device Display */}
      {isPWA || deviceType === 'smartphone' ? (
        // Mode PWA ou téléphone : Conteneur plein écran avec dimensions viewport
        <div className="fixed inset-0 bg-white overflow-hidden">
          <div className="h-full w-full">
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
      ) : (
        // Mode tablette dans navigateur : Simulation centrée
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white shadow-2xl transition-all duration-500 w-full max-w-6xl aspect-[4/3] rounded-2xl">
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
      )}
    </div>
  );
}