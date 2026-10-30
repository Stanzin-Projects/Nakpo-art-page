import { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle, ArrowLeft, Package, Tag, X } from 'lucide-react';
import { createOrder } from '../api/order.api';
import { validateCoupon } from '../api/coupon.api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Checkout({ isOpen, onClose, onOrderComplete }) {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { push } = useToast();

  const [step, setStep] = useState('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerDetails, setCustomerDetails] = useState(() => ({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  }));

  // prefill customer details once the logged-in user is known
  useEffect(() => {
    if (!user) return;
    setCustomerDetails((prev) => ({
      ...prev,
      email: user.email || prev.email,
      firstName: user.name?.split(' ')[0] || prev.firstName,
      lastName: user.name?.split(' ').slice(1).join(' ') || prev.lastName,
    }));
  }, [user]);

  // coupon state
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.08;
  const discount = coupon ? coupon.discount : 0;
  const total = Math.max(0, subtotal + shipping + tax - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Enter a coupon code');
      return;
    }
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await validateCoupon(couponCode, subtotal);
      setCoupon(res.data);
      push(`Coupon ${res.data.code} applied — you save ₹${res.data.discount}`);
    } catch (err) {
      setCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const useAddress = (addr) => {
    setCustomerDetails((prev) => ({
      ...prev,
      address: [addr.line1, addr.line2].filter(Boolean).join(', '),
      city: addr.city || '',
      zipCode: addr.zip || '',
      country: addr.country || '',
    }));
  };

  const handleDetailsNext = () => {
    if (!customerDetails.email || !customerDetails.firstName || !customerDetails.lastName) return;
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const orderPayload = {
        customer: customerDetails,
        items: cartItems.map((item) => ({
          id: String(item.id),
          title: item.title,
          image: item.image,
          price: item.price,
          quantity: item.quantity || 1,
          selectedDimension: item.selectedDimension || '',
          selectedFrame: item.selectedFrame || 'No Frame',
          selectedFrameColor: item.selectedFrameColor || 'transparent',
        })),
        total: Math.round(total * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping,
        tax: Math.round(tax * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        couponCode: coupon ? coupon.code : '',
        shippingInfo: {
          address: [customerDetails.address, customerDetails.city, customerDetails.zipCode, customerDetails.country]
            .filter(Boolean)
            .join(', '),
          method: shipping === 0 ? 'Free Shipping' : 'Standard',
        },
      };
      const res = await createOrder(orderPayload);
      const created = res.data;
      setOrderNumber(created.orderNumber || '');
      setStep('success');
      push(`Order ${created.orderNumber} placed! 🎉`);
      setTimeout(() => {
        onOrderComplete(created);
        clearCart();
        onClose();
        setStep('details');
        setOrderNumber('');
        setCoupon(null);
        setCouponCode('');
      }, 3000);
    } catch (err) {
      console.error(err);
      push(err.response?.data?.message || 'Order failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setStep('details');
    setOrderNumber('');
    setCoupon(null);
    setCouponCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={resetAndClose} aria-hidden />
      <div className="fixed inset-4 md:inset-8 z-50 overflow-auto bg-background rounded-lg shadow-2xl max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium flex items-center gap-2">
            {step !== 'details' && step !== 'success' && (
              <button type="button" onClick={() => setStep('details')} className="p-1 hover:bg-muted rounded">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            Secure Checkout
            <Lock className="h-4 w-4 text-muted-foreground" />
          </h2>
          <button type="button" onClick={resetAndClose} className="text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">Qty: {item.quantity || 1}</p>
                  {item.selectedDimension && (
                    <p className="text-xs text-muted-foreground">
                      Size: {item.selectedDimension}{' '}
                      {item.selectedFrame && item.selectedFrame !== 'No Frame' && (
                        <>· Frame: {item.selectedFrame}</>
                      )}
                    </p>
                  )}
                  <p className="font-medium text-sm">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-700">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Coupon {coupon.code}
                  </span>
                  <span>−₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon */}
            {!coupon ? (
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Try codes: <span className="font-mono">WELCOME15</span>, <span className="font-mono">YAK10</span>, <span className="font-mono">ART50</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 h-9 px-3 rounded-md border border-border bg-background text-sm"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    {applyingCoupon ? '…' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between border border-green-200 bg-green-50 rounded-lg p-3">
                <span className="text-sm text-green-700 flex items-center gap-2">
                  <Tag className="h-4 w-4" /> {coupon.code} — {coupon.description}
                </span>
                <button type="button" onClick={() => setCoupon(null)} className="text-green-700 hover:text-green-900">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {user && user.addresses?.length > 0 && (
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">Use a saved address:</p>
                <div className="flex flex-wrap gap-2">
                  {user.addresses.map((a) => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => useAddress(a)}
                      className="text-xs border border-border rounded-md px-2 py-1 hover:bg-muted"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div>
            {step === 'details' && (
              <div className="space-y-4">
                <h3 className="font-medium">Customer Details</h3>
                <input
                  type="email"
                  placeholder="Email *"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="First Name *"
                    value={customerDetails.firstName}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, firstName: e.target.value })}
                    className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                  />
                  <input
                    placeholder="Last Name *"
                    value={customerDetails.lastName}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, lastName: e.target.value })}
                    className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                  />
                </div>
                <input
                  placeholder="Address"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    placeholder="City"
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                    className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                  />
                  <input
                    placeholder="ZIP"
                    value={customerDetails.zipCode}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, zipCode: e.target.value })}
                    className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                  />
                  <input
                    placeholder="Country"
                    value={customerDetails.country}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, country: e.target.value })}
                    className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDetailsNext}
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Demo: Order will be saved. In production you would integrate Stripe here.
                </p>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    'Processing…'
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay ₹{total.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-medium mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground mb-4">Thank you for your purchase.</p>
                <div className="p-4 bg-green-50 rounded-lg mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <p className="font-medium text-green-700">Order #{orderNumber}</p>
                  </div>
                  <p className="text-sm text-green-700">Total: ₹{total.toFixed(2)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user ? 'Track it from your dashboard.' : 'You can track your order using your order number.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
