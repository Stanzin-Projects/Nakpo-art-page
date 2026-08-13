import { useState } from 'react';
import { CreditCard, Lock, CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { createOrder } from '../api/order.api';

export function Checkout({ isOpen, onClose, cartItems, onOrderComplete }) {
  const [step, setStep] = useState('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

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
          id: String(item.id || item._id),
          title: item.title,
          image: item.image || item.imageUrl,
          price: item.price,
          quantity: item.quantity || 1,
        })),
        total,
        subtotal,
        shipping,
        tax,
        shippingInfo: {
          address: [customerDetails.address, customerDetails.city, customerDetails.zipCode, customerDetails.country].filter(Boolean).join(', '),
          method: shipping === 0 ? 'Free Shipping' : 'Standard',
        },
      };
      const res = await createOrder(orderPayload);
      const created = res.data;
      setOrderNumber(created.orderNumber || '');
      setStep('success');
      setTimeout(() => {
        onOrderComplete(created);
        onClose();
        setStep('details');
        setOrderNumber('');
        setCustomerDetails({ email: '', firstName: '', lastName: '', address: '', city: '', zipCode: '', country: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setStep('details');
    setOrderNumber('');
    setCustomerDetails({ email: '', firstName: '', lastName: '', address: '', city: '', zipCode: '', country: '' });
    onClose();
  };

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
          <div className="space-y-4">
            <h3 className="font-medium">Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.id || item._id} className="flex gap-3">
                <img
                  src={item.image || item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">Qty: {item.quantity || 1}</p>
                  <p className="font-medium text-sm">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

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
                      Pay ${total.toFixed(2)}
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
                  <p className="text-sm text-green-700">Total: ${total.toFixed(2)}</p>
                </div>
                <p className="text-sm text-muted-foreground">You can track your order using your order number.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
