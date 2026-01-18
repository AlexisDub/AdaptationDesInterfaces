import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';

interface ImportCartModalProps {
  open: boolean;
  onClose: () => void;
  onValidate: (reference: string) => void;
}

export function ImportCartModal({ open, onClose, onValidate }: ImportCartModalProps) {
  const [reference, setReference] = useState('');

  if (!open) return null;

  const handleValidate = () => {
    onValidate(reference);
    setReference('');
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-lg shadow-lg p-4 min-w-[260px] relative">
        {/* Bouton fermer */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Icône */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Download className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {/* Titre */}
        <h3 className="text-sm font-bold text-center mb-4">Importer un panier</h3>

        {/* Champ référence */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Référence de votre panier :
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Ex: 8F2A-1C3B"
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Bouton valider */}
        <Button 
          onClick={handleValidate}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 h-auto"
        >
          Valider
        </Button>
      </div>
    </div>
  );
}
