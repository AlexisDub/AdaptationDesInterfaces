import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import { Hash, ArrowRight, Utensils } from 'lucide-react';

interface TableNumberInputProps {
  onSubmit: (tableNumber: string) => void;
  deviceType: 'tablet' | 'smartphone';
}

export function TableNumberInput({ onSubmit, deviceType }: TableNumberInputProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableNumber.trim()) {
      setError('Veuillez entrer un numéro de table');
      return;
    }

    if (!/^\d+$/.test(tableNumber.trim())) {
      setError('Le numéro de table doit être un nombre');
      return;
    }

    onSubmit(tableNumber.trim());
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-amber-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-white rounded-2xl shadow-2xl p-8 w-full ${
          deviceType === 'tablet' ? 'max-w-xl' : 'max-w-md'
        }`}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <Utensils className="w-10 h-10 text-orange-600" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h2 className="text-orange-900 mb-2">Bienvenue !</h2>
          <p className="text-neutral-600">
            Veuillez entrer le numéro de table pour commencer
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-neutral-700 mb-2">
              Numéro de table
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                id="tableNumber"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={tableNumber}
                onChange={(e) => {
                  setTableNumber(e.target.value);
                  setError('');
                }}
                placeholder="Ex: 12"
                className={`pl-10 text-lg h-14 ${
                  error ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
                autoFocus
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700"
          >
            Continuer
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.form>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-neutral-500">
            Le numéro de table est inscrit sur votre table
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
