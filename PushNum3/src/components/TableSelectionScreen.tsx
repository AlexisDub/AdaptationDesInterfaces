import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Utensils, Hash } from 'lucide-react';

interface TableSelectionScreenProps {
  onSelectTable: (tableNumber: number) => void;
}

export function TableSelectionScreen({ onSelectTable }: TableSelectionScreenProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const num = parseInt(tableNumber);
    
    if (!tableNumber) {
      setError('Veuillez entrer un numéro de table');
      return;
    }
    
    if (isNaN(num) || num < 1 || num > 999) {
      setError('Numéro de table invalide (1-999)');
      return;
    }
    
    onSelectTable(num);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-full shadow-2xl">
            <Utensils className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-orange-900">Restaurant Le Gourmet</h1>
          <p className="text-neutral-600">
            Bienvenue ! Pour commencer, veuillez saisir le numéro de la table.
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              <Hash className="w-5 h-5" />
            </div>
            <Input
              type="number"
              min="1"
              max="999"
              placeholder="Numéro de table"
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              className="pl-12 text-center h-16 text-2xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
            disabled={!tableNumber}
          >
            Continuer
          </Button>
        </div>

        {/* Quick Select Buttons */}
        <div className="pt-4">
          <p className="text-sm text-neutral-500 mb-3">Sélection rapide :</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => onSelectTable(num)}
                className="h-12 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-500 text-neutral-700"
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
