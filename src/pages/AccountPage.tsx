import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MENU_ITEMS } from '../data/menuData';
import { UserAddress } from '../types';
import { storage, STORAGE_KEYS } from '../services/api';
import { formatPhp } from '../utils/format';
import { User, Mail, Phone, MapPin, Heart, LogOut, Plus, ShieldCheck, Terminal, Trash2 } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, loginUser, logoutUser, favorites, toggleFavorite, addToCart, setIsTechConsoleOpen, showToast } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Taguig, Metro Manila');
  const [newZip, setNewZip] = useState('1634');

  const validate = () => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      errs.email = 'Valid email is required.';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (authMode === 'register') {
      if (!fullName.trim()) errs.fullName = 'Full name is required.';
      if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await loginUser(email);
    } catch {
      showToast('Authentication error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await loginUser('patron.rossi@aurabistro.com');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newStreet.trim()) return;

    const newAddr: UserAddress = {
      id: 'addr-' + Date.now(),
      label: newLabel,
      streetAddress: newStreet.trim(),
      city: newCity.trim(),
      postalCode: newZip.trim(),
      isDefault: false,
    };

    const updatedUser = {
      ...user,
      savedAddresses: [...user.savedAddresses, newAddr],
    };
    storage.set(STORAGE_KEYS.USER, updatedUser);
    showToast(`Added address: ${newLabel}`);
    setShowAddressModal(false);
    setNewStreet('');
  };

  const handleDeleteAddress = (id: string) => {
    if (!user) return;
    const updated = {
      ...user,
      savedAddresses: user.savedAddresses.filter((a) => a.id !== id),
    };
    storage.set(STORAGE_KEYS.USER, updated);
    showToast('Address deleted.', 'info');
  };

  const favoriteDishes = MENU_ITEMS.filter((d) => favorites.includes(d.id));

  // IF LOGGED OUT: SIGN IN / REGISTER FORM
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-400/20">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-100 font-serif">
            {authMode === 'signin' ? 'Sign In to Aura Account' : 'Create Diner Membership'}
          </h1>
          <p className="text-xs text-neutral-400">
            Store delivery coordinates, track live dispatched orders, and save favorites.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 p-1 text-xs">
          <button
            onClick={() => {
              setAuthMode('signin');
              setErrors({});
            }}
            className={`flex-1 py-2 font-medium rounded-md transition-colors cursor-pointer ${
              authMode === 'signin' ? 'bg-neutral-800 text-amber-300 font-bold' : 'text-neutral-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setErrors({});
            }}
            className={`flex-1 py-2 font-medium rounded-md transition-colors cursor-pointer ${
              authMode === 'register' ? 'bg-neutral-800 text-amber-300 font-bold' : 'text-neutral-400'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
          {authMode === 'register' && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="Elena Rostova"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none ${
                  errors.fullName ? 'border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                }`}
              />
              {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
            </div>
          )}

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Email Address *</label>
            <input
              type="email"
              placeholder="patron@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none ${
                errors.email ? 'border-rose-500' : 'border-neutral-800 focus:border-amber-400'
              }`}
            />
            {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 349-8120"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none ${
                errors.password ? 'border-rose-500' : 'border-neutral-800 focus:border-amber-400'
              }`}
            />
            {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Confirm Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border text-neutral-200 placeholder-neutral-500 focus:outline-none ${
                  errors.confirmPassword ? 'border-rose-500' : 'border-neutral-800 focus:border-amber-400'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading
              ? 'Processing authentication...'
              : authMode === 'signin'
              ? 'Sign In to Account'
              : 'Complete Registration'}
          </button>

          {/* Quick Demo Fill Button */}
          <div className="pt-2 border-t border-neutral-800 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-xs text-amber-400 hover:underline font-mono cursor-pointer"
            >
              1-Click Instant Demo Login (Patron Rossi)
            </button>
          </div>
        </form>
      </div>
    );
  }

  // IF LOGGED IN: PROFILE & DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-400 text-neutral-950 font-serif font-bold text-xl flex items-center justify-center">
            {user.avatarInitials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-100 font-serif">{user.fullName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono mt-1">
              <span>{user.email}</span>
              <span>·</span>
              <span>{user.phone}</span>
              <span>·</span>
              <span className="text-amber-400">Patron Tier</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTechConsoleOpen(true)}
            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>DB Inspect</span>
          </button>
          <button
            onClick={logoutUser}
            className="px-4 py-2 rounded-lg bg-neutral-950 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-700/50 text-neutral-300 hover:text-rose-300 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Saved Addresses Book */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-100 font-serif">Saved Delivery Addresses</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          <div className="space-y-3">
            {user.savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-200">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 text-[10px] font-mono">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-neutral-400">
                    {addr.streetAddress} {addr.aptSuite ? `, ${addr.aptSuite}` : ''}
                  </div>
                  <div className="text-neutral-500 font-mono">
                    {addr.city} {addr.postalCode}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer"
                  title="Delete address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Dishes List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-100 font-serif">Favorite Dishes</h2>
            <span className="text-xs font-mono text-neutral-400">{favoriteDishes.length} saved</span>
          </div>

          {favoriteDishes.length === 0 ? (
            <div className="p-8 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-500">
              No favorites saved yet. Click the heart icon on any dish card.
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover shrink-0 bg-neutral-950"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-200 truncate">{dish.name}</div>
                      <div className="text-neutral-400 font-mono tabular-nums">
                        {formatPhp(dish.price)} · {dish.prepTimeMinutes}m
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToCart(dish, 1)}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => toggleFavorite(dish.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Address */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleAddAddress}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl text-xs"
          >
            <h3 className="text-base font-bold text-neutral-100 font-serif">Add New Address</h3>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Address Label</label>
              <input
                type="text"
                placeholder="e.g. Vacation Villa, Penthouse, Studio"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Street Address *</label>
              <input
                type="text"
                placeholder="100 Van Ness Ave"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">City</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={newZip}
                  onChange={(e) => setNewZip(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold cursor-pointer"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
