import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const { language, formatPrice, t } = useLanguage();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter((p) => {
      const matchEn = p.titleEn.toLowerCase().includes(q);
      const matchBn = p.titleBn.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchSub = p.subCategory.toLowerCase().includes(q);
      const matchFabric = p.fabric.toLowerCase().includes(q);
      const matchTags = p.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchEn || matchBn || matchCategory || matchSub || matchFabric || matchTags;
    });
  }, [query, products]);

  if (!isOpen) return null;

  const quickPills = [
    { labelEn: 'Panjabi (পাঞ্জাবি)', labelBn: 'পাঞ্জাবি', q: 'panjabi' },
    { labelEn: 'Saree (শাড়ি)', labelBn: 'শাড়ি', q: 'saree' },
    { labelEn: 'Kabli Suit', labelBn: 'কাবলি সেট', q: 'kabli' },
    { labelEn: 'Kids Frock', labelBn: 'বাচ্চাদের ফ্রক', q: 'frock' },
    { labelEn: 'Polo Shirt', labelBn: 'পোলো টি-শার্ট', q: 'polo' },
    { labelEn: 'Jamdani', labelBn: 'জামদানি', q: 'jamdani' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex justify-center items-start pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'bn' ? 'পাঞ্জাবি, শাড়ি, ফ্রক, পোলো বা ফেব্রিক দিয়ে খুঁজুন...' : 'Search panjabi, saree, frock, polo, silk...'}
            className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-stone-900 placeholder:text-stone-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Tags */}
        <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="flex items-center gap-1 font-semibold text-amber-800 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'bn' ? 'জনপ্রিয় অনুসন্ধান:' : 'Trending:'}
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill.q}
              onClick={() => setQuery(pill.q)}
              className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-amber-600 hover:text-amber-800 transition-colors flex-shrink-0"
            >
              {language === 'bn' ? pill.labelBn : pill.labelEn}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 divide-y divide-stone-100">
          {query && searchResults.length === 0 && (
            <div className="py-12 text-center text-stone-500">
              <p className="text-base font-medium">
                {language === 'bn' ? 'কোনো পোশাক খুঁজে পাওয়া যায়নি।' : 'No matching dresses found.'}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {language === 'bn' ? 'বানান পরীক্ষা করুন অথবা উপরের জনপ্রিয় ট্যাগগুলোতে ক্লিক করুন।' : 'Check spelling or try common keywords like "Panjabi" or "Saree".'}
              </p>
            </div>
          )}

          {!query && (
            <div className="py-8 text-center text-stone-400 text-sm">
              {language === 'bn' ? 'মিনারুল ফ্যাশন হাউসের প্রিমিয়াম ড্রেস খুঁজতে টাইপ করুন' : 'Start typing to discover dresses from Minarul Fashion House'}
            </div>
          )}

          {searchResults.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                onSelectProduct(product);
                onClose();
              }}
              className="py-3 flex items-center gap-4 hover:bg-amber-50/60 p-2 rounded-xl cursor-pointer transition-colors group"
            >
              <img
                src={product.images[0]}
                alt={product.titleEn}
                className="w-14 h-16 object-cover rounded-lg border border-stone-200"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {product.category} • {product.subCategory}
                </span>
                <h4 className="text-sm font-semibold text-stone-900 truncate mt-1 group-hover:text-amber-800">
                  {language === 'bn' ? product.titleBn : product.titleEn}
                </h4>
                <p className="text-xs text-stone-500 truncate">{product.fabric}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-stone-900">{formatPrice(product.price)}</div>
                {product.originalPrice && (
                  <div className="text-xs text-stone-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
                <div className="flex items-center text-xs text-amber-700 mt-1 group-hover:translate-x-1 transition-transform">
                  <span>{t.viewDetails}</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
