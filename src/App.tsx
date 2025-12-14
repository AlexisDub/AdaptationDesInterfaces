import { useState, useEffect } from 'react';
import { MenuInterface } from './components/MenuInterface';
import { DeviceSelector } from './components/DeviceSelector';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { TableNumberInput } from './components/TableNumberInput';
import { Smartphone, Tablet } from 'lucide-react';
import { getRushStatus, RUSH_CHECK_INTERVAL } from './data/rushService';

export type UserMode = 'normal' | 'child' | null;

export default function App() {
  // Détection du mode et du numéro de table depuis l'URL
  const getInitialDeviceType = (): 'tablet' | 'smartphone' => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    return mode === 'phone' ? 'smartphone' : 'tablet';
  };

  const getTableNumberFromUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('idtable');
  };

  const [deviceType, setDeviceType] = useState<'tablet' | 'smartphone'>(getInitialDeviceType());
  const [isUrlMode, setIsUrlMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('mode');
  });
  const [tableNumber, setTableNumber] = useState<string | null>(getTableNumberFromUrl());
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [isRushMode, setIsRushMode] = useState(false);
  const [ordersInProgress, setOrdersInProgress] = useState(0);

  // Vérifier le statut Rush toutes les 10 secondes
  useEffect(() => {
    // Fonction pour vérifier le statut
    const checkRushStatus = async () => {
      try {
        const status = await getRushStatus();
        setIsRushMode(status.isRushMode);
        setOrdersInProgress(status.ordersInProgress);
        
        // Log pour debug (à retirer en production)
        console.log(`[Rush Check] Commandes en cours: ${status.ordersInProgress}, Mode Rush: ${status.isRushMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
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

  // Handle table number submission (for tablet)
  const handleTableNumberSubmit = (number: string) => {
    setTableNumber(number);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Debug indicator - À retirer en production */}
      {isRushMode && (
        <div className="fixed top-20 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs z-50 shadow-lg">
          🔥 RUSH MODE: {ordersInProgress} commandes
        </div>
      )}
      
      {/* Device Simulation */}
      {isUrlMode && deviceType === 'smartphone' ? (
        // Mode smartphone plein écran via URL
        <div className="w-full h-screen bg-white overflow-hidden">
          {!tableNumber ? (
            <TableNumberInput 
              onSubmit={handleTableNumberSubmit}
              deviceType={deviceType}
            />
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
              onResetMode={handleResetMode}
              tableNumber={tableNumber}
            />
          )}
        </div>
      ) : (
        // Mode tablette avec simulation
        <div className="flex items-center justify-center p-4 min-h-screen">
          <div 
            className={`bg-white shadow-2xl transition-all duration-500 ${
              deviceType === 'tablet' 
                ? 'w-full max-w-6xl aspect-[4/3] rounded-2xl' 
                : 'w-full max-w-md aspect-[9/16] rounded-3xl'
            }`}
          >
            {!tableNumber ? (
              <TableNumberInput 
                onSubmit={handleTableNumberSubmit}
                deviceType={deviceType}
              />
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
                onResetMode={handleResetMode}
                tableNumber={tableNumber}
              />
            )}
          </div>
        </div>
      )}        onResetMode={handleResetMode}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}