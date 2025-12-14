import { LayoutGrid, List } from 'lucide-react';
import { motion } from 'motion/react';

export type DisplayMode = 'grid' | 'list';

interface ViewModeToggleProps {
  displayMode: DisplayMode;
  onToggle: () => void;
}

export function ViewModeToggle({ displayMode, onToggle }: ViewModeToggleProps) {
  return (
    <div className="sticky bottom-6 left-0 right-0 pointer-events-none z-40 h-0">
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="absolute right-4 bottom-0 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all pointer-events-auto"
        aria-label={`Basculer vers le mode ${displayMode === 'grid' ? 'liste' : 'grille'}`}
      >
        {displayMode === 'grid' ? (
          <List className="w-6 h-6" />
        ) : (
          <LayoutGrid className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
}