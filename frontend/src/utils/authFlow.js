import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getArtworkById } from '../api/artwork.api';

const PENDING_KEY = 'abt_pending';

// Gate a buy action behind login. Returns true when the user is signed in;
// otherwise stores the intended action and redirects to the sign-in page.
export function useRequireLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();

  return (opts = {}) => {
    if (user) return true;
    const { message = 'Please sign in to continue', artworkId, action } = opts;
    const redirect = window.location.pathname + window.location.search + window.location.hash || '/';
    if (artworkId) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ action: action || 'add', artworkId, redirect }));
    }
    push(message, 'info');
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
    return false;
  };
}

// After a successful login/registration, fulfil any pending buy intent
// (e.g. "add to cart" or "buy now") and return the redirect target.
export function useCompleteLoginIntent() {
  const { addToCart, openCheckout } = useCart();
  const { push } = useToast();

  const complete = async () => {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    if (!raw) return '/';
    let pending;
    try {
      pending = JSON.parse(raw);
    } catch {
      return '/';
    }
    if (pending.artworkId) {
      try {
        const res = await getArtworkById(pending.artworkId);
        addToCart(res.data);
        if (pending.action === 'buy') {
          setTimeout(() => openCheckout(), 0);
          push('Added to cart — checkout is ready');
        } else {
          push('Added to your cart');
        }
      } catch {
        // artwork no longer available — just continue
      }
    }
    return pending.redirect || '/';
  };

  return complete;
}
