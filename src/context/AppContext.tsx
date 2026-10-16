import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dish, CartItem, Order, User, ActivePage } from '../types';
import { storage, STORAGE_KEYS, api } from '../services/api';
import { PROMO_CODES } from '../data/menuData';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  customizingDish: Dish | null;
  setCustomizingDish: (dish: Dish | null) => void;
  addToCart: (dish: Dish, quantity?: number, customData?: Partial<CartItem>) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  promoCode: string;
  appliedPromo: { code: string; label: string; discountPercent?: number; discountAmount?: number; freeDelivery?: boolean } | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  refreshOrders: () => Promise<void>;
  user: User | null;
  loginUser: (email: string) => Promise<User>;
  logoutUser: () => void;
  favorites: string[];
  toggleFavorite: (dishId: string) => void;
  isFavorite: (dishId: string) => boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  isTechConsoleOpen: boolean;
  setIsTechConsoleOpen: (open: boolean) => void;
  // Menu filters shared state
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  dietaryFilter: string;
  setDietaryFilter: (diet: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('explore');
  const [cart, setCart] = useState<CartItem[]>(() => storage.get<CartItem[]>(STORAGE_KEYS.CART, []));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customizingDish, setCustomizingDish] = useState<Dish | null>(null);
  const [orders, setOrders] = useState<Order[]>(() => storage.get<Order[]>(STORAGE_KEYS.ORDERS, []));
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const saved = storage.get<Order[]>(STORAGE_KEYS.ORDERS, []);
    return saved.length > 0 ? saved[0] : null;
  });
  const [user, setUser] = useState<User | null>(() => storage.get<User | null>(STORAGE_KEYS.USER, null));
  const [favorites, setFavorites] = useState<string[]>(() => storage.get<string[]>(STORAGE_KEYS.FAVORITES, ['dish-1', 'dish-4']));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isTechConsoleOpen, setIsTechConsoleOpen] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; label: string; discountPercent?: number; discountAmount?: number; freeDelivery?: boolean } | null>(null);

  // Sync cart to LocalStorage
  useEffect(() => {
    storage.set(STORAGE_KEYS.CART, cart);
  }, [cart]);

  // Sync favorites to LocalStorage
  useEffect(() => {
    storage.set(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const addToCart = (dish: Dish, quantity: number = 1, customData?: Partial<CartItem>) => {
    const sizeDelta = customData?.selectedSizePriceDelta || 0;
    const addOnsTotal = (customData?.selectedAddOns || []).reduce((acc, a) => acc + a.price, 0);
    const unitPrice = dish.price + sizeDelta + addOnsTotal;

    const newItem: CartItem = {
      id: 'cart-item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      dish,
      quantity,
      selectedSize: customData?.selectedSize || dish.customization?.sizes?.[0]?.label,
      selectedSizePriceDelta: sizeDelta,
      selectedSpice: customData?.selectedSpice,
      selectedAddOns: customData?.selectedAddOns || [],
      specialInstructions: customData?.specialInstructions,
      unitPrice,
      itemTotal: unitPrice * quantity,
    };

    setCart((prev) => {
      // Check if an identical dish configuration already exists
      const existingIdx = prev.findIndex(
        (it) =>
          it.dish.id === dish.id &&
          it.selectedSize === newItem.selectedSize &&
          it.selectedSpice === newItem.selectedSpice &&
          JSON.stringify(it.selectedAddOns) === JSON.stringify(newItem.selectedAddOns) &&
          it.specialInstructions === newItem.specialInstructions
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        const existing = copy[existingIdx];
        const newQty = existing.quantity + quantity;
        copy[existingIdx] = {
          ...existing,
          quantity: newQty,
          itemTotal: existing.unitPrice * newQty,
        };
        return copy;
      }
      return [...prev, newItem];
    });

    showToast(`Added "${dish.name}" to your order.`);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              itemTotal: item.unitPrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((it) => it.id !== itemId));
    showToast('Item removed from order.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setPromoCode('');
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Please enter a coupon code.' };
    const match = PROMO_CODES[clean];
    if (match) {
      setAppliedPromo({
        code: clean,
        label: match.label,
        discountPercent: match.discountPercent,
        discountAmount: match.discountAmount,
        freeDelivery: match.freeDelivery,
      });
      showToast(`Promo "${clean}" applied: ${match.label}`);
      return { success: true, message: 'Code applied successfully!' };
    }
    return { success: false, message: 'Invalid or expired promotion code.' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    showToast('Promo code removed.', 'info');
  };

  const toggleFavorite = (dishId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(dishId);
      if (exists) {
        showToast('Removed from favorites.', 'info');
        return prev.filter((id) => id !== dishId);
      } else {
        showToast('Saved to your favorites.');
        return [...prev, dishId];
      }
    });
  };

  const isFavorite = (dishId: string) => favorites.includes(dishId);

  const refreshOrders = async () => {
    const list = await api.getOrders();
    setOrders(list);
    if (list.length > 0 && !activeOrder) {
      setActiveOrder(list[0]);
    }
  };

  const loginUser = async (email: string) => {
    const usr = await api.login(email);
    setUser(usr);
    showToast(`Welcome back, ${usr.fullName}!`);
    return usr;
  };

  const logoutUser = () => {
    storage.remove(STORAGE_KEYS.USER);
    setUser(null);
    showToast('Signed out of account.', 'info');
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        customizingDish,
        setCustomizingDish,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        promoCode,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        orders,
        activeOrder,
        setActiveOrder,
        refreshOrders,
        user,
        loginUser,
        logoutUser,
        favorites,
        toggleFavorite,
        isFavorite,
        toasts,
        showToast,
        isTechConsoleOpen,
        setIsTechConsoleOpen,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        dietaryFilter,
        setDietaryFilter,
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
