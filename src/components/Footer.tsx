import React from 'react';
import { useApp } from '../context/AppContext';
import { Terminal, Clock, MapPin, Phone, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActivePage, setIsTechConsoleOpen } = useApp();

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Concept */}
          <div className="space-y-3">
            <div className="text-base font-bold text-neutral-100 font-serif flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              AURA BISTRO
            </div>
            <p className="text-neutral-400 leading-relaxed text-xs">
              Artisanal culinary kitchen merging Michelin-inspired farm provenance with rapid 30-minute doorstep dispatch across Metro Manila.
            </p>
            <div className="pt-1 flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>FDA & HACCP Food Safety Certified</span>
            </div>
          </div>

          {/* Service Hours & Dispatch */}
          <div className="space-y-2.5">
            <h4 className="text-neutral-200 font-semibold uppercase tracking-wider text-[11px]">
              Kitchen & Logistics
            </h4>
            <div className="space-y-1.5 text-neutral-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Mon – Sun: 10:30 AM – 11:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>5th Ave cor. 28th St, BGC, Taguig, Philippines</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+63 (2) 8880-9210</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-neutral-200 font-semibold uppercase tracking-wider text-[11px]">
              Website Sections
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => {
                    setActivePage('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Explore & Chef Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Full Menu & Sizing (PHP)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('orders');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Live Order Tracker & History
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('account');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Customer Account & Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Developer Architecture Info */}
          <div className="space-y-2.5">
            <h4 className="text-neutral-200 font-semibold uppercase tracking-wider text-[11px]">
              Technology & Databases
            </h4>
            <p className="text-neutral-400 text-xs">
              Built with HTML, CSS, JavaScript, React, Tailwind CSS, LocalStorage, Fetch & REST API, PostgreSQL, MySQL, and Firebase.
            </p>
            <button
              onClick={() => setIsTechConsoleOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 hover:text-amber-300 hover:border-neutral-700 transition-colors font-mono text-xs cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Open Dev Database Console</span>
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
          <div>© {new Date().getFullYear()} Aura Bistro Philippines. All prices in Philippine Peso (PHP).</div>
          <div className="flex items-center gap-4">
            <span>React 19</span>
            <span>·</span>
            <span>PHP Currency</span>
            <span>·</span>
            <span>GCash / Maya / COD</span>
            <span>·</span>
            <span>LocalStorage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
