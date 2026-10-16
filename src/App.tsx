import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { DishCustomizationModal } from './components/DishCustomizationModal';
import { TechConsole } from './components/TechConsole';
import { ToastContainer } from './components/Toast';
import { ExplorePage } from './pages/ExplorePage';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { AccountPage } from './pages/AccountPage';

const MainContent: React.FC = () => {
  const { activePage } = useApp();

  return (
    <main className="min-h-[calc(100vh-4.5rem)]">
      {activePage === 'explore' && <ExplorePage />}
      {activePage === 'menu' && <MenuPage />}
      {activePage === 'checkout' && <CheckoutPage />}
      {activePage === 'orders' && <OrdersPage />}
      {activePage === 'account' && <AccountPage />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-400 selection:text-neutral-950">
        <Navbar />
        <MainContent />
        <Footer />

        {/* Global Drawers & Modals */}
        <CartDrawer />
        <DishCustomizationModal />
        <TechConsole />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
