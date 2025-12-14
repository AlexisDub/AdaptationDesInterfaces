import { Button } from './ui/button';
import { Utensils } from 'lucide-react';

interface TableSelectionScreenProps {
  onSelectTable: (tableNumber: number) => void;
}

export function TableSelectionScreen({ onSelectTable }: TableSelectionScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
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
            Bienvenue ! Veuillez sélectionner le numéro de la table.
          </p>
        </div>

        {/* Quick Select Buttons */}
        <div className="pt-4">
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => onSelectTable(num)}
                className="h-16 text-xl border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-500 text-neutral-700 font-semibold"
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
