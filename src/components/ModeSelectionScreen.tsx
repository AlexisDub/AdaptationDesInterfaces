import { Button } from './ui/button';
import { User, Baby, Sparkles, UtensilsCrossed, ArrowRight } from 'lucide-react';
import type { UserMode } from '../App';
import { motion } from 'motion/react';
import { restaurantConfig } from '../data/dataLoader';

interface ModeSelectionScreenProps {
  onSelectMode: (mode: 'normal' | 'child') => void;
  deviceType: 'tablet' | 'smartphone';
}

export function ModeSelectionScreen({ onSelectMode, deviceType }: ModeSelectionScreenProps) {
  // Mode Tablette : Split Screen avec séparateur central
  if (deviceType === 'tablet') {
    return (
      <div className="h-full flex relative overflow-hidden">
        {/* Left Side - Mode Adulte */}
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => onSelectMode('normal')}
          className="flex-1 relative overflow-hidden group cursor-pointer"
        >
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-orange-50 to-white group-hover:from-orange-200 group-hover:via-orange-100 transition-all duration-500" />
          
          {/* Decorative circles */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-12">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
            >
              <User className="w-16 h-16 text-white" />
            </motion.div>
            
            <h2 className="text-neutral-900 mb-4 text-center">Mode Adulte</h2>
            
            <div className="space-y-3 max-w-xs text-center">
              <div className="flex items-center justify-center gap-2 text-neutral-700 text-sm">
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                <span>Menu complet</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-neutral-700 text-sm">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Suggestions intelligentes</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-neutral-700 text-sm">
                <ArrowRight className="w-4 h-4 text-orange-600" />
                <span>Filtres avancés</span>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 px-6 py-3 bg-orange-600 text-white rounded-full shadow-lg group-hover:shadow-xl group-hover:bg-orange-700 transition-all"
            >
              Commencer
            </motion.div>
          </div>
        </motion.button>

        {/* Central Divider - Animated */}
        <div className="relative w-1 bg-gradient-to-b from-orange-300 via-purple-300 to-purple-300 z-10">
          <motion.div
            animate={{
              y: [0, 100, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl border-4 border-neutral-200 flex items-center justify-center"
          >
            <div className="text-xl">{restaurantConfig.logo}</div>
          </motion.div>
        </div>

        {/* Right Side - Mode Enfant */}
        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => onSelectMode('child')}
          className="flex-1 relative overflow-hidden group cursor-pointer"
        >
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-white group-hover:from-purple-200 group-hover:via-pink-100 transition-all duration-500" />
          
          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-12">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl"
            >
              <Baby className="w-16 h-16 text-white" />
            </motion.div>
            
            <h2 className="text-neutral-900 mb-4 text-center">Mode Enfant</h2>
            
            <div className="space-y-3 max-w-xs text-center">
              <div className="flex items-center justify-center gap-2 text-neutral-700 text-sm">
                <span className="text-lg">🦁</span>
                <span>Chef Léo te guide</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-neutral-700 text-sm">
                <span className="text-lg">⭐</span>
                <span>Gagne des étoiles</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-neutral-700 text-sm">
                <span className="text-lg">🎁</span>
                <span>Débloque des cadeaux</span>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg group-hover:shadow-xl group-hover:from-purple-700 group-hover:to-pink-700 transition-all"
            >
              Jouer
            </motion.div>
          </div>
        </motion.button>

        {/* Top Banner */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-md py-6 px-8 border-b border-neutral-200 z-20"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="text-4xl">{restaurantConfig.logo}</div>
            <div>
              <h1 className="text-neutral-900 text-center">{restaurantConfig.name}</h1>
              <p className="text-neutral-600 text-sm text-center">Choisissez votre expérience</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mode Smartphone : Cards Stack avec grandes images
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-neutral-50 to-white">
      {/* Header Compact */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-8 pb-6 text-center"
      >
        <div className="text-5xl mb-3">{restaurantConfig.logo}</div>
        <h1 className="text-neutral-900 mb-2">{restaurantConfig.name.replace('Restaurant ', '')}</h1>
        <p className="text-neutral-600 text-sm">Choisissez votre mode</p>
      </motion.div>

      {/* Cards Stack */}
      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <div className="space-y-4 max-w-sm mx-auto">
          {/* Mode Adulte Card */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => onSelectMode('normal')}
            className="w-full bg-white rounded-3xl shadow-xl overflow-hidden group active:scale-95 transition-transform"
          >
            {/* Image/Icon Area */}
            <div className="relative h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10 group-active:bg-black/20 transition-colors" />
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative z-10"
              >
                <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-white/40">
                  <User className="w-14 h-14 text-white" />
                </div>
              </motion.div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-4xl opacity-30">🍷</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-30">🍝</div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-neutral-900">Mode Adulte</h2>
                <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-neutral-700 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                  <span>Menu complet avec filtres</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                  <span>Suggestions intelligentes</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                  <span>Recherche d'ingrédients</span>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Mode Enfant Card */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => onSelectMode('child')}
            className="w-full bg-white rounded-3xl shadow-xl overflow-hidden group active:scale-95 transition-transform"
          >
            {/* Image/Icon Area */}
            <div className="relative h-48 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10 group-active:bg-black/20 transition-colors" />
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative z-10"
              >
                <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-white/40">
                  <Baby className="w-14 h-14 text-white" />
                </div>
              </motion.div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-4xl opacity-30">⭐</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-30">🎁</div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-neutral-900">Mode Enfant</h2>
                <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-neutral-700 text-sm">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                  <span>Chef Léo te guide pas à pas</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700 text-sm">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                  <span>Gagne des étoiles pour tes choix</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700 text-sm">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                  <span>Débloque des cadeaux gratuits</span>
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-6 pb-6 text-center text-neutral-500 text-xs"
      >
        Tu pourras changer de mode plus tard
      </motion.div>
    </div>
  );
}