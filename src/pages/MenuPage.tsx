import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Dish } from '../types';
import { api } from '../services/api';
import { formatPhp } from '../utils/format';
import { Search, X, SlidersHorizontal, Star, Clock, Flame, Heart, Plus, Sparkles } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    dietaryFilter,
    setDietaryFilter,
    sortBy,
    setSortBy,
    setCustomizingDish,
    addToCart,
    isFavorite,
    toggleFavorite,
  } = useApp();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dishes from REST API service
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getMenu({
        category: selectedCategory,
        query: searchQuery,
        dietary: dietaryFilter,
        sortBy,
      })
      .then((res) => {
        if (mounted) {
          setDishes(res.dishes);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [selectedCategory, searchQuery, dietaryFilter, sortBy]);

  const categories = [
    { id: 'all', label: 'All Offerings' },
    { id: 'burgers', label: 'Wagyu & Sliders' },
    { id: 'pizzas', label: 'Wood-Fired Pizzas' },
    { id: 'bowls', label: 'Harvest & Poke Bowls' },
    { id: 'pastas', label: 'Handmade Pastas' },
    { id: 'desserts', label: 'French Sweets' },
    { id: 'beverages', label: 'Craft Beverages' },
  ];

  const dietaryOptions = [
    { id: 'all', label: 'All Diets' },
    { id: 'chef-special', label: "Chef's Special" },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'spicy', label: 'Spicy' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-900">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
            Artisanal Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 font-serif mt-1">
            The Complete Culinary Menu
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Filter by craft technique, dietary preferences, or search specific ingredients.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search Wagyu, Truffle, Sourdough..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="space-y-4">
        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-800 text-amber-300 font-semibold shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Dietary & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-900 text-xs">
          {/* Dietary filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-500 font-mono text-[11px] uppercase tracking-wider mr-1">
              Dietary:
            </span>
            {dietaryOptions.map((diet) => {
              const isSelected = dietaryFilter === diet.id;
              return (
                <button
                  key={diet.id}
                  onClick={() => setDietaryFilter(diet.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-400/10 text-amber-300'
                      : 'border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  {diet.label}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
            >
              <option value="popularity">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="prep">Sort: Fastest Prep Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dishes Count and Active Filter Tag */}
      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-2">
        <span>Showing {dishes.length} artisanal dishes</span>
        {(searchQuery || selectedCategory !== 'all' || dietaryFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setDietaryFilter('all');
            }}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Grid of Dishes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-neutral-900/60 animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-4">
          <p className="text-sm font-semibold text-neutral-200 font-serif">
            No culinary creations match your current filters.
          </p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search keywords, switching categories, or clearing the dietary constraints.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setDietaryFilter('all');
            }}
            className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => {
            const favorited = isFavorite(dish.id);
            return (
              <div
                key={dish.id}
                className="rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col overflow-hidden group shadow-sm"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <button
                    onClick={() => toggleFavorite(dish.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-neutral-950/60 hover:bg-neutral-950 text-neutral-300 transition-colors cursor-pointer"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorited ? 'fill-rose-500 text-rose-500' : 'text-neutral-300'
                      }`}
                    />
                  </button>

                  {dish.dietary.includes('chef-special') && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-neutral-950/80 backdrop-blur-sm border border-amber-400/30 text-[10px] font-mono text-amber-300">
                      Chef Special
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Unboxed Metadata with separators */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <span>{dish.category.toUpperCase()}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {dish.rating}
                      </span>
                      <span>·</span>
                      <span>{dish.prepTimeMinutes}m</span>
                      <span>·</span>
                      <span>{dish.calories} kcal</span>
                    </div>

                    <h2 className="text-base font-bold text-neutral-100 font-serif mt-1.5 leading-snug">
                      {dish.name}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>

                    {/* Ingredients list */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {dish.ingredients.map((ing, idx) => (
                        <span key={idx} className="text-[11px] text-neutral-500">
                          {ing}
                          {idx < dish.ingredients.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-neutral-100 font-mono tabular-nums">
                        {formatPhp(dish.price)}
                      </span>
                      {dish.originalPrice && (
                        <span className="text-xs text-neutral-500 font-mono line-through ml-2 tabular-nums">
                          {formatPhp(dish.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToCart(dish, 1)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
                        title="Quick Add 1 item"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCustomizingDish(dish)}
                        className="px-3.5 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors cursor-pointer"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
