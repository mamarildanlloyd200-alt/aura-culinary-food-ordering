import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatPhp } from '../utils/format';
import { X, Plus, Minus, Check } from 'lucide-react';

export const DishCustomizationModal: React.FC = () => {
  const { customizingDish, setCustomizingDish, addToCart } = useApp();

  if (!customizingDish) return null;

  const dish = customizingDish;
  const initialSize = dish.customization?.sizes?.[0];

  const [selectedSize, setSelectedSize] = useState<{ name: string; priceDelta: number; label: string } | undefined>(
    initialSize
  );
  const [selectedSpice, setSelectedSpice] = useState<string | undefined>(
    dish.customization?.spiceLevels?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<{ id: string; name: string; price: number }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  const toggleAddOn = (addOn: { id: string; name: string; price: number }) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addOn.id);
      if (exists) return prev.filter((a) => a.id !== addOn.id);
      return [...prev, addOn];
    });
  };

  const basePrice = dish.price;
  const sizeDelta = selectedSize?.priceDelta || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = basePrice + sizeDelta + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    addToCart(dish, quantity, {
      selectedSize: selectedSize?.label,
      selectedSizePriceDelta: sizeDelta,
      selectedSpice,
      selectedAddOns,
      specialInstructions: specialInstructions.trim() || undefined,
    });
    setCustomizingDish(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Image */}
        <div className="relative h-56 w-full bg-neutral-950">
          <img
            src={dish.image}
            alt={dish.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
          <button
            onClick={() => setCustomizingDish(null)}
            className="absolute top-4 right-4 p-2 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-300 hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-neutral-100 font-serif leading-snug">
                {dish.name}
              </h2>
              <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                {formatPhp(dish.price)}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {dish.description}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400 font-mono">
              <span>{dish.prepTimeMinutes} mins prep</span>
              <span>·</span>
              <span>{dish.calories} kcal</span>
              <span>·</span>
              <span>★ {dish.rating.toFixed(1)} ({dish.reviewCount})</span>
            </div>
          </div>

          {/* Size Selection */}
          {dish.customization?.sizes && dish.customization.sizes.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Select Portion Size
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {dish.customization.sizes.map((size) => {
                  const isSelected = selectedSize?.label === size.label;
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                          : 'border-neutral-800 bg-neutral-950/50 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span>{size.name}</span>
                      {size.priceDelta > 0 && (
                        <span className="font-mono text-neutral-400 tabular-nums">
                          +{formatPhp(size.priceDelta)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spice / Flavor Level */}
          {dish.customization?.spiceLevels && dish.customization.spiceLevels.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Flavor / Spice Profile
              </label>
              <div className="grid grid-cols-3 gap-2">
                {dish.customization.spiceLevels.map((lvl) => {
                  const isSelected = selectedSpice === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedSpice(lvl)}
                      className={`p-2.5 rounded-lg text-center text-xs font-medium border transition-colors cursor-pointer truncate ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                          : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {dish.customization?.addOns && dish.customization.addOns.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Artisanal Add-ons
              </label>
              <div className="space-y-2">
                {dish.customization.addOns.map((addon) => {
                  const isSelected = selectedAddOns.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon)}
                      className={`w-full p-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-amber-400/80 bg-amber-400/10 text-amber-200'
                          : 'border-neutral-800 bg-neutral-950/40 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-amber-400 border-amber-400 text-neutral-950' : 'border-neutral-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="font-mono text-neutral-400 tabular-nums">
                        +{formatPhp(addon.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen instructions */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Special Culinary Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Sauce on the side, dressing lightly, allergy alert"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
              maxLength={120}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-4">
          <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900 p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-mono font-semibold text-neutral-100 tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-98 text-neutral-950 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Add to Order</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{formatPhp(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
