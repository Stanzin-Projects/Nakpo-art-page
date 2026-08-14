import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useRequireLogin } from '../utils/authFlow';

function imageUrl(item) {
  return item.image || item.imageUrl;
}

export function ShoppingCart({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeFromCart, openCheckout } = useCart();
  const requireLogin = useRequireLogin();
  if (!isOpen) return null;

  const handleCheckout = () => {
    if (!requireLogin({ message: 'Please sign in to complete your purchase' })) {
      onClose();
      return;
    }
    openCheckout();
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="flex items-center gap-2 text-lg font-medium">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({itemCount})
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-0">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2 text-foreground">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6 text-sm">Start exploring our gallery to find artworks you love.</p>
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cartItems.map((item) => (
                <div key={item.id || item._id} className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <ImageWithFallback src={imageUrl(item)} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium truncate text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.medium}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(0, (item.quantity || 1) - 1))}
                            className="p-2 hover:bg-muted disabled:opacity-50"
                            disabled={(item.quantity || 1) <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-2 min-w-[3rem] text-center text-sm">{item.quantity || 1}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="p-2 hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">${((item.price || 0) * (item.quantity || 1)).toFixed(0)}</p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-muted-foreground">${item.price} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${total}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${total}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Proceed to Checkout
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-10 rounded-md border border-border text-sm font-medium hover:bg-muted"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
