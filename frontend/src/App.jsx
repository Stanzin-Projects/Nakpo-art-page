import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ShoppingCart } from './components/ShoppingCart';
import { Checkout } from './components/Checkout';
import { OrderTracking } from './components/OrderTracking';
import { Footer } from './components/Footer';
import { useCart } from './context/CartContext';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      // wait a tick for the home sections to mount
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    if (location.hash) {
      const id = location.hash.slice(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash, location.state]);

  return null;
}

function AppContent() {
  const {
    isCartOpen,
    closeCart,
    isCheckoutOpen,
    closeCheckout,
    isTrackingOpen,
    trackingOrder,
    closeTracking,
    openTracking,
  } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Navigation onTrackClick={openTracking} />

      <ScrollManager />

      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer siteName="ARTBYLOPSANG" tagline="Creating meaningful art that transforms spaces and touches hearts" />

      <ShoppingCart isOpen={isCartOpen} onClose={closeCart} />
      <Checkout isOpen={isCheckoutOpen} onClose={closeCheckout} onOrderComplete={() => {}} />
      <OrderTracking isOpen={isTrackingOpen} onClose={closeTracking} initialOrder={trackingOrder} />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
