import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Truck, 
  Heart,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavigate: (view: string, filter?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 4 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{t.freeShippingTitle}</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">{t.freeShippingDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{t.genuineTitle}</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">{t.genuineDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{t.easyExchangeTitle}</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">{t.easyExchangeDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{t.supportTitle}</h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">{t.supportDesc}</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-stone-800 text-xs">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white font-serif font-black text-lg">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-white">
                  MINARUL
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                  Fashion House
                </span>
              </div>
            </div>

            <p className="text-stone-400 leading-relaxed pr-6">
              {language === 'bn'
                ? 'মিনারুল ফ্যাশন হাউস বাংলাদেশের ঐতিহ্য ও আধুনিক রুচিশীল পোশাকের এক অনন্য ঠিকানা। পুরুষ, মহিলা ও শিশুদের জন্য শতভাগ নিখুঁত ফিটিং ও কোয়ালিটি সম্পন্ন পোশাক পৌঁছে দিচ্ছি সারা দেশের ঘরে ঘরে।'
                : 'Minarul Fashion House is Bangladesh’s leading lifestyle apparel destination crafting timeless ethnic and contemporary apparel for men, women, and children nationwide.'}
            </p>

            <div className="space-y-2 pt-1 text-stone-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'প্রধান শোরুম: লেভেল ৩, শপিং কমপ্লেক্স, ধানমন্ডি ২৭, ঢাকা-১২০৯'
                    : 'Flagship Store: Level 3, Shopping Complex, Dhanmondi 27, Dhaka-1209'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>+880 1712-345678 / +880 1987-654321</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>support@minarulfashion.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a href="#facebook" className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-amber-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#instagram" className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-amber-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#youtube" className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:border-amber-600 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase">
              {language === 'bn' ? 'পোশাক কালেকশন' : 'Collections'}
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onNavigate('shop', 'men')} className="hover:text-amber-400 transition-colors">
                  {t.men}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'women')} className="hover:text-amber-400 transition-colors">
                  {t.women}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'children')} className="hover:text-amber-400 transition-colors">
                  {t.children}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'festive')} className="hover:text-amber-400 transition-colors">
                  {t.festive}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition-colors">
                  {language === 'bn' ? 'নতুন কালেকশন' : 'New Arrivals'}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase">
              {language === 'bn' ? 'গ্রাহক সেবা' : 'Customer Care'}
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-amber-400 transition-colors">
                  {t.trackOrder}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-amber-400 transition-colors">
                  {t.myOrders}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('info-size')} className="hover:text-amber-400 transition-colors">
                  {t.sizeGuide}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('info-returns')} className="hover:text-amber-400 transition-colors">
                  {t.deliveryAndReturns}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('info-stores')} className="hover:text-amber-400 transition-colors">
                  {language === 'bn' ? 'আউটলেট সমূহ' : 'Store Locations'}
                </button>
              </li>
            </ul>
          </div>

          {/* Payment & Logistics Partners */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase">
              {language === 'bn' ? 'নিরাপদ পেমেন্ট' : 'Payment Methods'}
            </h4>
            <p className="text-stone-400">
              {language === 'bn'
                ? 'বিকাশ, নগদ, রকেট এবং ক্যাশ অন ডেলিভারিতে ঝামেলাহীন পেমেন্ট।'
                : '100% secure payment via bKash, Nagad, Rocket and Cash on Delivery.'}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-2 text-center text-[10px] font-bold text-pink-400 flex items-center justify-center gap-1">
                <span>🌸 bKash বিকাশ</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-2 text-center text-[10px] font-bold text-orange-400 flex items-center justify-center gap-1">
                <span>🟠 Nagad নগদ</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-2 text-center text-[10px] font-bold text-purple-400 flex items-center justify-center gap-1">
                <span>🟣 Rocket রকেট</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-2 text-center text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-1">
                <span>💵 Cash On Delivery</span>
              </div>
            </div>

            <div className="pt-2 text-stone-400">
              <span className="text-[11px] block font-semibold text-stone-300">
                {language === 'bn' ? 'লজিস্টিক পার্টনার্স:' : 'Courier Partners:'}
              </span>
              <span className="text-[10px] text-stone-500">
                Steadfast Courier • Pathao • RedX • eCourier
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Minarul Fashion House. All Rights Reserved. Dhaka, Bangladesh.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Bangladeshi Fashion</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
