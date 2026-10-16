import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatPhp } from '../utils/format';
import { ShoppingBag, Terminal, Menu as MenuIcon, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    setIsTechConsoleOpen,
    user,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'explore', label: 'Explore' },
    { id: 'menu', label: 'Full Menu' },
    { id: 'orders', label: 'Live Orders' },
    { id: 'account', label: user ? 'Account' : 'Sign In' },
  ] as const;

  const handleNav = (id: typeof activePage) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => handleNav('explore')}
          className="text-xl font-bold tracking-tight text-neutral-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 font-serif flex items-center gap-2 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          AURA BISTRO
        </button>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id as any)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-amber-400 border-amber-400 font-semibold'
                    : 'text-neutral-300 border-transparent hover:text-neutral-100 hover:border-neutral-700'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <button
            onClick={() => setIsTechConsoleOpen(true)}
            className="whitespace-nowrap shrink-0 text-xs font-mono text-neutral-400 hover:text-amber-300 flex items-center gap-1.5 py-1 px-2.5 rounded border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 transition-colors cursor-pointer"
            title="Inspect REST API, SQL Schemas (Postgres/MySQL), LocalStorage & Firebase"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Dev DB & API</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Cart Drawer Trigger) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-4 py-2.5 text-xs font-semibold text-neutral-950 bg-amber-400 rounded-lg hover:bg-amber-300 active:scale-98 transition-all whitespace-nowrap shrink-0 flex items-center gap-2.5 shadow-sm shadow-amber-500/10 cursor-pointer"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-950" />
            <span className="tabular-nums">
              {cartCount > 0 ? `${cartCount} items · ${formatPhp(cartSubtotal)}` : 'Bag (0)'}
            </span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-900/95 border-b border-neutral-800 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id as any)}
              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between ${
                activePage === link.id
                  ? 'bg-amber-400/10 text-amber-400 font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span>{link.label}</span>
              {link.id === 'account' && user && (
                <span className="text-xs text-neutral-400 font-mono">{user.email}</span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              setIsTechConsoleOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 text-xs font-mono text-amber-300 bg-neutral-950/80 rounded-lg border border-neutral-800 flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Developer DB & REST API Console</span>
          </button>
        </div>
      )}
    </header>
  );
};
