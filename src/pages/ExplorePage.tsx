import React from 'react';
import { useApp } from '../context/AppContext';
import { DISH_IMAGES, MENU_ITEMS, INITIAL_REVIEWS } from '../data/menuData';
import { formatPhp } from '../utils/format';
import { ArrowRight, Star, Clock, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { setActivePage, setSelectedCategory, setCustomizingDish, toggleFavorite, isFavorite } = useApp();

  const signatureDishes = MENU_ITEMS.slice(0, 4);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setActivePage('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 pb-16">
      {/* SECTION 1: HERO SHOWCASE (Split Screen Layout) */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-mono">
                Artisanal Culinary Kitchen · Est. 2024
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 font-serif leading-[1.1] text-balance">
                Wood-fired perfection & Wagyu indulgence, delivered warm.
              </h1>

              <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-xl">
                Slow-fermented sourdough crusts, 45-day dry-aged cuts, and wild-foraged truffles. Crafted on demand and dispatched in temperature-sealed pods within 30 minutes.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    setActivePage('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Full Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCategoryClick('pizzas')}
                  className="px-5 py-3.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 text-neutral-200 text-sm font-medium transition-colors cursor-pointer"
                >
                  Neapolitan Pizzas
                </button>
              </div>

              {/* Trust Metric Strip */}
              <div className="pt-6 border-t border-neutral-900 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-serif text-2xl font-bold text-neutral-100 tabular-nums">28 min</div>
                  <div className="text-neutral-500 text-[11px] mt-0.5">Average dispatch speed</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-neutral-100 tabular-nums">4.9 / 5</div>
                  <div className="text-neutral-500 text-[11px] mt-0.5">Over 1,200 verified reviews</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-neutral-100 tabular-nums">100%</div>
                  <div className="text-neutral-500 text-[11px] mt-0.5">Organic local provenance</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 aspect-[16/10] group">
                <img
                  src={DISH_IMAGES.hero}
                  alt="Aura Bistro Artisanal Table Spread"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-amber-400 font-mono">Chef Special of the Week</div>
                    <div className="text-sm font-bold text-neutral-100 font-serif">
                      Truffle Wagyu & 48h Fermented Crust
                    </div>
                  </div>
                  <button
                    onClick={() => setCustomizingDish(signatureDishes[0])}
                    className="px-3.5 py-2 rounded-lg bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    Quick Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CURATED CUISINE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400">Curated Offerings</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 font-serif mt-1">
              Browse by Culinary Discipline
            </h2>
          </div>
          <button
            onClick={() => setActivePage('menu')}
            className="text-xs font-medium text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { id: 'burgers', label: 'Wagyu & Sliders', count: '2 dishes', img: DISH_IMAGES.truffleBurger },
            { id: 'pizzas', label: 'Wood-Fired Pizza', count: '1 dish', img: DISH_IMAGES.woodfiredPizza },
            { id: 'bowls', label: 'Poke & Bowls', count: '1 dish', img: DISH_IMAGES.salmonPoke },
            { id: 'pastas', label: 'Handmade Pasta', count: '1 dish', img: DISH_IMAGES.hero },
            { id: 'desserts', label: 'French Sweets', count: '1 dish', img: DISH_IMAGES.lavaCake },
            { id: 'beverages', label: 'Craft Cold Brews', count: '2 drinks', img: DISH_IMAGES.hero },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 transition-all text-left group cursor-pointer"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 bg-neutral-950">
                <img
                  src={cat.img}
                  alt={cat.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors truncate">
                {cat.label}
              </div>
              <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{cat.count}</div>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: CHEF'S SIGNATURE SPECIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-8">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400">Signature Selections</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 font-serif">
            Most Ordered by Discerning Diners
          </h2>
          <p className="text-xs text-neutral-400 max-w-lg">
            Prepared to order using heritage ingredients, delivered in sealed thermal packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {signatureDishes.map((dish) => {
            const favorited = isFavorite(dish.id);
            return (
              <div
                key={dish.id}
                className="rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col overflow-hidden group"
              >
                {/* Visual */}
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
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorited ? 'fill-rose-500 text-rose-500' : 'text-neutral-300'
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <span>{dish.category.toUpperCase()}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {dish.rating}
                      </span>
                      <span>·</span>
                      <span>{dish.prepTimeMinutes}m</span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-100 font-serif mt-1 leading-snug">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-neutral-100 font-mono tabular-nums">
                        {formatPhp(dish.price)}
                      </span>
                      {dish.originalPrice && (
                        <span className="text-xs text-neutral-500 font-mono line-through ml-1.5 tabular-nums">
                          {formatPhp(dish.originalPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setCustomizingDish(dish)}
                      className="px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-colors cursor-pointer"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: ARTISANAL PROVENANCE & SPEED (Adjacency of proof) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                30-Minute Thermal Pod Logistics
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Custom insulated honeycomb pods preserve crust crispness and cheese melt without condensation during transit.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Zero Frozen Shortcuts
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Heritage stone-ground flour naturally fermented for 48 hours. Pasture-raised Wagyu sourced directly from northern ranches.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Live Kitchen Transparency
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Step-by-step courier dispatch tracking with driver telemetry and verifiable kitchen hygiene audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: VERIFIED DINER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-8">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400">Diner Reflections</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 font-serif">
            Endorsed by Culinary Critics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-bold text-neutral-100 font-sans">{rev.authorName}</div>
                  <div className="text-[11px] text-neutral-500">{rev.dishName}</div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Verified Order
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
