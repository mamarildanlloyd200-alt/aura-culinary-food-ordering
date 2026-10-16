import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerDetails, PaymentMethod } from '../types';
import { api } from '../services/api';
import { formatPhp } from '../utils/format';
import { ShieldCheck, CreditCard, Banknote, Smartphone, ArrowRight, Minus, Plus, Trash2, Tag } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    setActivePage,
    setActiveOrder,
    refreshOrders,
    showToast,
    user,
  } = useApp();

  // Form Fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [streetAddress, setStreetAddress] = useState(user?.savedAddresses?.[0]?.streetAddress || '');
  const [aptSuite, setAptSuite] = useState(user?.savedAddresses?.[0]?.aptSuite || '');
  const [city, setCity] = useState(user?.savedAddresses?.[0]?.city || 'Taguig, Metro Manila');
  const [postalCode, setPostalCode] = useState(user?.savedAddresses?.[0]?.postalCode || '1634');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Payment State (defaults to GCash / Maya digital wallet)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('digital-wallet');
  const [eWalletProvider, setEWalletProvider] = useState<'GCash' | 'Maya'>('GCash');
  const [eWalletMobile, setEWalletMobile] = useState('+63 917 555 8120');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('883');

  // Tip Selection (in PHP)
  const [selectedTipAmount, setSelectedTipAmount] = useState<number>(50);
  const [customTip, setCustomTip] = useState<string>('');

  // Promo Form
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations in PHP
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
  const tax = taxableAmount * 0.12; // 12% VAT

  let tipAmount = 0;
  if (customTip && !isNaN(parseFloat(customTip))) {
    tipAmount = Math.max(0, parseFloat(customTip));
  } else if (selectedTipAmount > 0) {
    tipAmount = selectedTipAmount;
  }

  const totalAmount = Math.max(0, cartSubtotal - discountAmount + deliveryFee + tax + tipAmount);

  // Form Field Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full Name is required (minimum 2 letters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Valid email address is required.';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim() || phoneDigits.length < 7) {
      errs.phone = 'Valid phone number with at least 7 digits is required.';
    }

    if (!streetAddress.trim() || streetAddress.trim().length < 4) {
      errs.streetAddress = 'Street address is required.';
    }

    if (!city.trim()) {
      errs.city = 'City / Municipality is required.';
    }

    if (!postalCode.trim() || postalCode.trim().length < 3) {
      errs.postalCode = 'Valid postal / ZIP code is required.';
    }

    if (paymentMethod === 'credit-card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15 || cleanCard.length > 19) {
        errs.cardNumber = 'Valid 16-digit card number required.';
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        errs.cardExpiry = 'Expiry must be in MM/YY format.';
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        errs.cardCvv = 'CVV must be 3 or 4 digits.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const res = applyPromoCode(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoInput('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your bag is empty. Please add dishes before checkout.', 'error');
      return;
    }

    if (!validate()) {
      showToast('Please fix the errors indicated in the form.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const customer: CustomerDetails = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        streetAddress: streetAddress.trim(),
        aptSuite: aptSuite.trim() || undefined,
        city: city.trim(),
        postalCode: postalCode.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
      };

      const newOrder = await api.createOrder({
        items: cart,
        subtotal: cartSubtotal,
        discount: discountAmount,
        promoCode: appliedPromo?.code,
        deliveryFee,
        tax,
        tip: tipAmount,
        total: totalAmount,
        customer,
        payment: {
          method: paymentMethod,
          cardNumberMasked:
            paymentMethod === 'credit-card'
              ? `•••• •••• •••• ${cardNumber.replace(/\s/g, '').slice(-4)}`
              : paymentMethod === 'digital-wallet'
              ? `${eWalletProvider} (${eWalletMobile})`
              : undefined,
          cardBrand: 'Visa',
        },
        estimatedDeliveryTime: '25-35 minutes',
      });

      await refreshOrders();
      setActiveOrder(newOrder);
      clearCart();
      showToast(`Order #${newOrder.orderNumber} successfully confirmed!`);
      setActivePage('orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-amber-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-100 font-serif">
            Your Order Bag is Empty
          </h1>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Explore our curated menu to select wood-fired pizzas, Wagyu cuts, and seasonal harvest bowls.
          </p>
        </div>
        <button
          onClick={() => setActivePage('menu')}
          className="px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          View Full Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-amber-400">Order Finalization (PHP)</div>
        <h1 className="text-3xl font-bold text-neutral-100 font-serif mt-1">
          Delivery Address & Checkout
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Review your itemized dishes, delivery coordinates, and select GCash, Maya, COD, or Card payment.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Customer Details */}
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5">
            <h2 className="text-base font-bold text-neutral-100 font-serif flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-mono flex items-center justify-center font-bold">
                1
              </span>
              Recipient & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Santos"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none transition-colors ${
                    errors.fullName ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                  }`}
                />
                {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">Mobile Phone *</label>
                <input
                  type="tel"
                  placeholder="e.g. +63 (917) 234-8901"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none transition-colors ${
                    errors.phone ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-300 font-medium mb-1.5">Email Address (for Receipt & Tracking) *</label>
                <input
                  type="email"
                  placeholder="e.g. elena.santos@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none transition-colors ${
                    errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                  }`}
                />
                {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Coordinates */}
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5">
            <h2 className="text-base font-bold text-neutral-100 font-serif flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-mono flex items-center justify-center font-bold">
                2
              </span>
              Delivery Address Coordinates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-neutral-300 font-medium mb-1.5">Street Address / Landmark *</label>
                <input
                  type="text"
                  placeholder="e.g. 5th Avenue cor. 28th St, BGC"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none transition-colors ${
                    errors.streetAddress ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                  }`}
                />
                {errors.streetAddress && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.streetAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">Unit / Tower / House No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 18B, Two Serendra"
                  value={aptSuite}
                  onChange={(e) => setAptSuite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">City / Municipality *</label>
                <input
                  type="text"
                  placeholder="e.g. Taguig, Makati, Pasig"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none transition-colors ${
                    errors.city ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                  }`}
                />
                {errors.city && <p className="text-[11px] text-rose-400 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">Postal / ZIP Code *</label>
                <input
                  type="text"
                  placeholder="e.g. 1634"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none transition-colors ${
                    errors.postalCode ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                  }`}
                />
                {errors.postalCode && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.postalCode}</p>
                )}
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">Doorstep Note / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Leave at lobby guard, call upon arrival"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5">
            <h2 className="text-base font-bold text-neutral-100 font-serif flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs font-mono flex items-center justify-center font-bold">
                3
              </span>
              Payment Method (Philippine Channels)
            </h2>

            {/* Methods Tabs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'digital-wallet', label: 'GCash / Maya', icon: Smartphone },
                { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                { id: 'credit-card', label: 'Credit / Debit', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* GCash / Maya Panel */}
            {paymentMethod === 'digital-wallet' && (
              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-3 text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ewallet"
                      checked={eWalletProvider === 'GCash'}
                      onChange={() => setEWalletProvider('GCash')}
                      className="accent-amber-400"
                    />
                    <span className="font-bold text-neutral-200">GCash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ewallet"
                      checked={eWalletProvider === 'Maya'}
                      onChange={() => setEWalletProvider('Maya')}
                      className="accent-amber-400"
                    />
                    <span className="font-bold text-neutral-200">Maya</span>
                  </label>
                </div>
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1">
                    Registered {eWalletProvider} Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={eWalletMobile}
                    onChange={(e) => setEWalletMobile(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-700 text-neutral-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Instant simulated QR & e-Wallet authorization in Philippine Peso ({formatPhp(totalAmount)}).
                </p>
              </div>
            )}

            {/* Card Inputs */}
            {paymentMethod === 'credit-card' && (
              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Card Number *</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    className={`w-full px-3 py-2 rounded bg-neutral-900 border font-mono text-neutral-200 focus:outline-none ${
                      errors.cardNumber ? 'border-rose-500' : 'border-neutral-700 focus:border-amber-400'
                    }`}
                  />
                  {errors.cardNumber && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Expiration *</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      maxLength={5}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className={`w-full px-3 py-2 rounded bg-neutral-900 border font-mono text-neutral-200 focus:outline-none ${
                        errors.cardExpiry ? 'border-rose-500' : 'border-neutral-700 focus:border-amber-400'
                      }`}
                    />
                    {errors.cardExpiry && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.cardExpiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">CVV Security Code *</label>
                    <input
                      type="password"
                      placeholder="883"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3 py-2 rounded bg-neutral-900 border font-mono text-neutral-200 focus:outline-none ${
                        errors.cardCvv ? 'border-rose-500' : 'border-neutral-700 focus:border-amber-400'
                      }`}
                    />
                    {errors.cardCvv && <p className="text-[11px] text-rose-400 mt-1">{errors.cardCvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 space-y-1">
                <div className="font-semibold">Cash on Doorstep Arrival (COD)</div>
                <p className="text-amber-300/80">
                  Please prepare exact cash in Philippine Peso ({formatPhp(totalAmount)}) for the courier upon delivery.
                </p>
              </div>
            )}

            {/* Courier Gratuity Tip Selection */}
            <div className="pt-2 border-t border-neutral-800 space-y-2.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                Courier Delivery Rider Tip (PHP)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedTipAmount(amt);
                      setCustomTip('');
                    }}
                    className={`py-2 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      selectedTipAmount === amt && !customTip
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    ₱{amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTipAmount(0);
                    setCustomTip('150');
                  }}
                  className={`py-2 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    customTip
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white'
                  }`}
                >
                  Custom ₱
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Itemized Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-neutral-100 font-serif pb-3 border-b border-neutral-800">
              Itemized Order Summary
            </h2>

            {/* Dishes in Cart */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 flex gap-3 text-xs">
                  <img
                    src={item.dish.image}
                    alt={item.dish.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded object-cover shrink-0 bg-neutral-900"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-semibold text-neutral-200 truncate">{item.dish.name}</div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-500 hover:text-rose-400 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {item.selectedSize && <span>Size: {item.selectedSize} · </span>}
                      {item.selectedSpice && <span>Flavor: {item.selectedSpice}</span>}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-800 rounded bg-neutral-900">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono text-neutral-200 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-neutral-100 tabular-nums">
                        {formatPhp(item.itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            {appliedPromo ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="font-mono font-bold">{appliedPromo.code}</span>
                  <span className="text-[11px] text-emerald-400/80">({appliedPromo.label})</span>
                </div>
                <button
                  type="button"
                  onClick={removePromoCode}
                  className="text-neutral-400 hover:text-rose-400 text-xs cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. AURA15, FIRSTBITE)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 uppercase font-mono placeholder:normal-case placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-rose-400">{promoError}</p>}
              </div>
            )}

            {/* Cost Breakdown in PHP */}
            <div className="space-y-2 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((s, it) => s + it.quantity, 0)} items)</span>
                <span className="font-mono tabular-nums text-neutral-200">{formatPhp(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotion Savings</span>
                  <span className="font-mono tabular-nums">-{formatPhp(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Doorstep Delivery Dispatch</span>
                <span className="font-mono tabular-nums text-neutral-200">
                  {deliveryFee === 0 ? 'FREE' : formatPhp(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Value Added Tax (12% VAT)</span>
                <span className="font-mono tabular-nums text-neutral-200">{formatPhp(tax)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>Rider Gratuity</span>
                  <span className="font-mono tabular-nums text-neutral-200">{formatPhp(tipAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-neutral-100 pt-3 border-t border-neutral-800 font-serif">
                <span>Total Amount Due</span>
                <span className="font-mono tabular-nums text-amber-400 text-lg">
                  {formatPhp(totalAmount)}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-98 text-neutral-950 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Transmitting Order via REST API...' : 'Confirm & Place Order'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 256-Bit Encrypted · Instant Courier Dispatch</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
