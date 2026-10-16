import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatPhp } from '../utils/format';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    setActivePage,
  } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  // Pricing calculations (in PHP)
  const deliveryFee = appliedPromo?.freeDelivery || cartSubtotal >= 800 || cartSubtotal === 0 ? 0 : 69.00;
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      discountAmount = (cartSubtotal * appliedPromo.discountPercent) / 100;
    } else if (appliedPromo.discountAmount) {
      discountAmount = Math.min(cartSubtotal, appliedPromo.discountAmount);
    }
  }

  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const tax = taxableAmount * 0.12; // 12% PH VAT
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee + tax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const res = applyPromoCode(inputCode);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setInputCode('');
    }
  };

  const handleCheckoutNav = () => {
    setIsCartOpen(false);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-neutral-100 font-serif">Your Culinary Bag</h2>
              <span className="text-xs font-mono text-neutral-400 tabular-nums">
                ({cart.reduce((sum, it) => sum + it.quantity, 0)} items)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-rose-400 transition-colors px-2 py-1 cursor-pointer"
                  title="Clear all items"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-200 font-serif">Your bag is empty</p>
                  <p className="text-xs text-neutral-400 max-w-xs">
                    Explore our wood-fired pizzas, Wagyu burgers, and chef specialties.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActivePage('menu');
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/90 flex gap-3.5 items-start"
                >
                  <img
                    src={item.dish.image}
                    alt={item.dish.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover bg-neutral-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-neutral-200 truncate">
                        {item.dish.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                        title="Remove dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata details */}
                    <div className="mt-1 space-y-0.5 text-[11px] text-neutral-400">
                      {item.selectedSize && <div>Size: {item.selectedSize}</div>}
                      {item.selectedSpice && <div>Flavor: {item.selectedSpice}</div>}
                      {item.selectedAddOns.length > 0 && (
                        <div className="truncate">
                          + {item.selectedAddOns.map((a) => a.name).join(', ')}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="text-amber-400/80 italic truncate">
                          "{item.specialInstructions}"
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center border border-neutral-800 rounded bg-neutral-900">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-neutral-200 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-neutral-100 font-mono tabular-nums">
                        {formatPhp(item.itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Promo Code & Order Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-800 bg-neutral-950/80 space-y-4">
              {/* Promo code form */}
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-mono font-bold">{appliedPromo.code}</span>
                    <span className="text-[11px] text-emerald-400/80">({appliedPromo.label})</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-neutral-400 hover:text-rose-400 text-xs cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. AURA15, FIRSTBITE)"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 uppercase font-mono placeholder:normal-case placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[11px] text-rose-400">{promoError}</p>}
                </form>
              )}

              {/* Subtotal breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-400 border-t border-neutral-800/80 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-neutral-200">{formatPhp(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-{formatPhp(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-mono tabular-nums text-neutral-200">
                    {deliveryFee === 0 ? 'FREE' : formatPhp(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (12%)</span>
                  <span className="font-mono tabular-nums text-neutral-200">{formatPhp(tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-100 pt-2 border-t border-neutral-800 font-serif">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums text-amber-400 text-base">
                    {formatPhp(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutNav}
                className="w-full py-3 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-98 text-neutral-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>GCash / Maya / Card & COD · Fast Doorstep Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
