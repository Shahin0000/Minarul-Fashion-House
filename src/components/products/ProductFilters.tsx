import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CategoryType } from '../../types';

interface FilterState {
  category: string;
  subCategory: string;
  minPrice: number;
  maxPrice: number;
  selectedSize: string;
  inStockOnly: boolean;
  sortBy: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  availableSizes: string[];
  maxProductPrice: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableSizes,
  maxProductPrice,
}) => {
  const { language, formatPrice, t } = useLanguage();

  const categories = [
    { id: 'all', labelEn: 'All Collections', labelBn: 'সকল পোশাক' },
    { id: 'men', labelEn: "Men's Collection", labelBn: 'পুরুষদের কালেকশন' },
    { id: 'women', labelEn: "Women's Collection", labelBn: 'মহিলাদের কালেকশন' },
    { id: 'children', labelEn: "Children's Wear", labelBn: 'বাচ্চাদের পোশাক' },
    { id: 'festive', labelEn: 'Eid & Festive', labelBn: 'ঈদ ও উৎসব' },
  ];

  return (
    <aside className="bg-white rounded-2xl border border-stone-200 p-5 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-700" />
          <h3 className="font-bold text-sm text-stone-900">{t.filterBy}</h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-amber-800 hover:text-amber-900 flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t.clearFilters}</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
          {t.categories}
        </label>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ ...filters, category: cat.id, subCategory: 'all' })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                filters.category === cat.id
                  ? 'bg-amber-100 text-amber-900 font-bold'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
              {filters.category === cat.id && <Check className="w-3.5 h-3.5 text-amber-800" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold uppercase tracking-wider text-stone-700">
            {t.priceRange}
          </label>
          <span className="font-bold text-amber-800 font-serif">
            {formatPrice(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={maxProductPrice > 0 ? maxProductPrice : 10000}
          step={200}
          value={filters.maxPrice}
          onChange={(e) =>
            onFilterChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-amber-700 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-stone-400 font-medium">
          <span>{formatPrice(500)}</span>
          <span>{formatPrice(maxProductPrice > 0 ? maxProductPrice : 10000)}</span>
        </div>
      </div>

      {/* Available Sizes */}
      <div className="space-y-2.5 pt-3 border-t border-stone-100">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
          {t.size}
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onFilterChange({ ...filters, selectedSize: 'all' })}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              filters.selectedSize === 'all'
                ? 'bg-amber-700 text-white border-amber-700 font-bold'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-600'
            }`}
          >
            {language === 'bn' ? 'সব সাইজ' : 'All'}
          </button>
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() =>
                onFilterChange({
                  ...filters,
                  selectedSize: filters.selectedSize === size ? 'all' : size,
                })
              }
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                filters.selectedSize === size
                  ? 'bg-amber-700 text-white border-amber-700 font-bold'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Toggle */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
        <label
          htmlFor="inStockToggle"
          className="text-xs font-medium text-stone-700 cursor-pointer"
        >
          {t.inStockOnly}
        </label>
        <input
          id="inStockToggle"
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
          className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 cursor-pointer accent-amber-700"
        />
      </div>

      {/* Sort By Dropdown */}
      <div className="space-y-2 pt-3 border-t border-stone-100">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
          {t.sortBy}
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
          className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-amber-600 cursor-pointer"
        >
          <option value="newest">{t.sortNewest}</option>
          <option value="price-low">{t.sortPriceLowHigh}</option>
          <option value="price-high">{t.sortPriceHighLow}</option>
          <option value="rating">{t.sortRating}</option>
        </select>
      </div>
    </aside>
  );
};
