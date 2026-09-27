import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CategoryCardsProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ onSelectCategory }) => {
  const { language, t } = useLanguage();

  const categories = [
    {
      id: 'men',
      titleEn: "Men's Collection",
      titleBn: 'পুরুষদের পোশাক',
      descEn: 'Panjabi, Kabli, Formal Shirts & Polos',
      descBn: 'পাঞ্জাবি, কাবলি, ফরমাল শার্ট ও পোলো',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      badge: 'Trending',
      itemCount: '24+ Designs',
    },
    {
      id: 'women',
      titleEn: "Women's Collection",
      titleBn: 'মহিলাদের পোশাক',
      descEn: 'Jamdani Saree, Three-Piece & Kurtis',
      descBn: 'জামদানি শাড়ি, সিল্ক থ্রি-পিস ও ডিজাইনার কুর্তি',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      badge: 'Popular',
      itemCount: '36+ Designs',
    },
    {
      id: 'children',
      titleEn: "Children's Wear",
      titleBn: 'শিশুদের পোশাক',
      descEn: 'Kids Panjabi, Cute Frocks & Sets',
      descBn: 'ছোটদের পাঞ্জাবি, ফ্রক ও আরামদায়ক সেট',
      image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80',
      badge: 'Soft Cotton',
      itemCount: '20+ Designs',
    },
    {
      id: 'festive',
      titleEn: 'Eid & Festive Special',
      titleBn: 'ঈদ ও উৎসব স্পেশাল',
      descEn: 'Exclusive Royal Editions for Celebrations',
      descBn: 'বিশেষ অনুষ্ঠানের জন্য রাজকীয় কালেকশন',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
      badge: 'Special 35% Off',
      itemCount: 'Limited Edition',
    },
  ];

  return (
    <section className="py-16 bg-stone-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-amber-800 text-xs font-bold tracking-widest uppercase">
            {language === 'bn' ? 'আমাদের কালেকশন' : 'Explore Minarul Fashion'}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 mt-2">
            {t.browseByCategory}
          </h2>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">
            {t.browseSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5"
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.titleEn}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 text-stone-900 shadow-sm backdrop-blur-xs">
                  {cat.badge}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-2">
                <span className="text-[11px] font-medium text-amber-300 tracking-wider uppercase block">
                  {cat.itemCount}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight group-hover:text-amber-300 transition-colors">
                  {language === 'bn' ? cat.titleBn : cat.titleEn}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2">
                  {language === 'bn' ? cat.descBn : cat.descEn}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                  <span>{t.shopNow}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
