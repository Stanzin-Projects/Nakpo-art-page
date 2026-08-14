import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

export function useCart() {
  return useContext(CartContext);
}

const CART_KEY = 'abt_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function normalize(item) {
  return {
    id: item.id || item._id,
    title: item.title,
    image: item.image || item.imageUrl,
    medium: item.medium,
    price: item.price,
    quantity: item.quantity || 1,
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((artwork) => {
    const item = normalize(artwork);
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);
  const openTracking = useCallback((order) => {
    setTrackingOrder(order || null);
    setIsTrackingOpen(true);
  }, []);
  const closeTracking = useCallback(() => {
    setTrackingOrder(null);
    setIsTrackingOpen(false);
  }, []);

  const itemCount = useMemo(() => cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0), [cartItems]);
  const subtotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0),
    [cartItems]
  );

  const value = {
    cartItems,
    itemCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
    isCheckoutOpen,
    openCheckout,
    closeCheckout,
    isTrackingOpen,
    trackingOrder,
    openTracking,
    closeTracking,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
