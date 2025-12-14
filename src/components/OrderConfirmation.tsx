import { useEffect } from 'react';
import { CheckCircle, ChefHat, Clock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import type { CartItem } from './CartSidebar';

interface OrderConfirmationProps {
  onReset: () => void;
  deviceType: 'tablet' | 'smartphone';
  tableNumber: string;
  cart: CartItem[];
}

export function OrderConfirmation({ onReset, deviceType, tableNumber, cart }: OrderConfirmationProps) {
  // Envoyer la commande au backend au montage du composant
  useEffect(() => {
    const sendOrderToBackend = async () => {
      try {
        const orderData = {
          tableNumber,
          items: cart.map(item => ({
            dishId: item.dish.id,
            dishName: item.dish.name,
            quantity: item.quantity,
            price: item.dish.price
          })),
          totalAmount: cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0),
          timestamp: new Date().toISOString()
        };

        console.log('Envoi de la commande au backend:', orderData);
        
        // TODO: Remplacer par l'appel API réel
        // const response = await fetch('/api/orders', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(orderData)
        // });
        
        // if (!response.ok) {
        //   throw new Error('Erreur lors de l\'envoi de la commande');
        // }
        
        // Pour l'instant, on simule l'envoi
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Commande envoyée avec succès pour la table', tableNumber);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la commande:', error);
      }
    };

    sendOrderToBackend();
  }, [tableNumber, cart]);
  
  return (
    <div className="h-full bg-gradient-to-br from-green-50 via-orange-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full ${
          deviceType === 'tablet' ? 'max-w-lg' : 'max-w-md'
        }`}
      >
        {/* Success Icon with Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-green-900 mb-3"
        >
          Commande envoyée en cuisine !
        </motion.h2>

        {/* Chef Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full">
            <ChefHat className="w-5 h-5" />
            <span className="text-sm">Nos chefs préparent votre commande</span>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <p className="text-neutral-700 mb-3">
            Votre commande a bien été transmise à notre équipe.
          </p>
          <div className="bg-orange-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-sm text-orange-800 font-medium">
              Table n°{tableNumber}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Temps de préparation estimé : 15-20 min</span>
          </div>
        </motion.div>

        {/* Animated Checkmarks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 rounded-xl p-4 mb-6 text-left space-y-2"
        >
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Commande reçue par la cuisine</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Ingrédients vérifiés</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="w-4 h-4 flex-shrink-0 animate-spin" />
            <span>Préparation en cours...</span>
          </div>
        </motion.div>

        {/* Emoji Celebration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="text-4xl mb-6"
        >
          🍽️ ✨ 👨‍🍳
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onReset}
            className="w-full bg-orange-600 hover:bg-orange-700 h-12"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au menu
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}