import { useState, useEffect } from 'react';
import { MenuInterface } from './components/MenuInterface';
import { TableTactile } from './components/TableTactile';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { TableSelectionScreen } from './components/TableSelectionScreen';
import { getRushStatus, RUSH_CHECK_INTERVAL } from './data/rushService';
import { loadDishes } from './services/dishService';
import type { Dish } from './data/dishes';

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
  const [deviceType] = useState<'table-tactile' | 'tablet' | 'smartphone'>(
    modeParam === 'phone' ? 'smartphone' : 
    modeParam === 'tablet' ? 'tablet' : 
    'table-tactile'
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
    tableParam ? parseInt(tableParam) : null
  );
  const [isRushMode, setIsRushMode] = useState(false);
  const [ordersInProgress, setOrdersInProgress] = useState(0);
  
  // État pour les plats (chargés depuis le backend)
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishesLoading, setDishesLoading] = useState(true);

  // Charger les plats depuis le backend au montage
  useEffect(() => {
    const loadDishesData = async () => {
      try {
        console.log('[App] Chargement des plats...');
        setDishesLoading(true);
        const loadedDishes = await loadDishes();
        console.log('[App] Plats chargés:', loadedDishes.length, 'plats');
        setDishes(loadedDishes);
      } catch (error) {
        console.error('[App] Erreur chargement plats:', error);
      } finally {
        setDishesLoading(false);
      }
    };
    loadDishesData();
  }, []);

  // Vérifier le statut Rush toutes les 10 secondes
  useEffect(() => {
    const checkRushStatus = async () => {
      try {
        const status = await getRushStatus();
        setIsRushMode(status.isRushMode);
        setOrdersInProgress(status.ordersInProgress);
      } catch (error) {
        console.error('Erreur lors de la vérification du mode Rush:', error);
      }
    };

    checkRushStatus();
    const interval = setInterval(checkRushStatus, RUSH_CHECK_INTERVAL);
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

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Table Tactile - Mode par défaut */}
      {deviceType === 'table-tactile' ? (
        <TableTactile 
          tableNumber={tableNumber!}
          isRushHour={isRushMode}
          dishes={dishes}
          dishesLoading={dishesLoading}
        />
      ) : (
        <>
          {/* Tablette et Smartphone */}
          {isPWA || deviceType === 'smartphone' ? (
            <div className="fixed inset-0 bg-white overflow-hidden">
              <div className="h-full w-full">
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
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white shadow-2xl transition-all duration-500 w-full max-w-6xl aspect-[4/3] rounded-2xl">
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
        </>
      )}
    </div>
  );
}
