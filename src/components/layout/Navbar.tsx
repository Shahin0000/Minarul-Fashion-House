import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, filter?: string) => void;
  onOpenSearch: () => void;
  wishlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  wishlistCount,
}) => {
  const { language, t } = useLanguage();
  const { itemCount, openCart } = useCart();
  const { user, isLoggedIn, isAdmin, openLoginModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t.home, view: 'home' },
    { id: 'men', label: t.men, view: 'shop', filter: 'men' },
    { id: 'women', label: t.women, view: 'shop', filter: 'women' },
    { id: 'children', label: t.children, view: 'shop', filter: 'children' },
    { id: 'festive', label: t.festive, view: 'shop', filter: 'festive', isHighlight: true },
    { id: 'track-order', label: t.trackOrder, view: 'track-order' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-white shadow-md shadow-amber-900/20 font-serif font-black text-xl tracking-tighter">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-stone-900 leading-none">
                  MINARUL
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-amber-700">
                  Fashion House
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive =
                (currentView === link.view && (!link.filter || currentView === 'shop')) ||
                (link.id === 'home' && currentView === 'home');

              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.view, link.filter)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    link.isHighlight
                      ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold'
                      : isActive
                      ? 'text-amber-800 font-semibold bg-stone-100/70'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.isHighlight && <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
                    {link.label}
                  </span>
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.adminPanel}</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons (Search, Wishlist, Account, Cart) */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-2 border border-transparent hover:border-stone-200"
              title="Search Clothing"
            >
              <Search className="w-5 h-5 text-stone-600" />
              <span className="hidden md:inline text-xs text-stone-500 font-normal">
                {language === 'bn' ? 'পোশাক খুঁজুন...' : 'Search dresses...'}
              </span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('account', 'wishlist')}
              className="p-2 rounded-xl text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors relative"
              title={t.wishlist}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Customer Account / Login Dropdown */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors flex items-center gap-1.5 border border-stone-200/80"
                  title={t.myAccount}
                >
                  <UserIcon className="w-5 h-5 text-amber-700" />
                  <span className="hidden xl:inline text-xs font-semibold text-stone-800 truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden xl:inline" />
                </button>

                {accountMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-[10px] text-stone-400 font-bold uppercase">{t.myAccount}</p>
                      <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                      <p className="text-xs text-stone-500 font-mono truncate">{user.phone}</p>
                    </div>

                    <button
                      onClick={() => onNavigate('account', 'orders')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors flex items-center justify-between"
                    >
                      <span>{t.myOrders}</span>
                      <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                        {storageService.getOrders().length}
                      </span>
                    </button>

                    <button
                      onClick={() => onNavigate('account', 'profile')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                    >
                      {t.myProfile}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onNavigate('admin')}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{t.adminPanel}</span>
                      </button>
                    )}

                    {/* Prominent Red Logout Button */}
                    <div className="pt-1 mt-1 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          logout();
                          onNavigate('home');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title={t.login}
              >
                <LogIn className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">{language === 'bn' ? 'লগইন' : 'Login'}</span>
              </button>
            )}

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-3.5 py-2.5 rounded-xl shadow-md shadow-amber-900/15 transition-all transform active:scale-95"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-amber-100" />
              <span className="hidden sm:inline text-xs font-bold tracking-wide uppercase">
                {t.cart}
              </span>
              <span className="bg-white text-amber-900 font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                onNavigate('shop', 'men');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 text-center"
            >
              👔 {t.men}
            </button>
            <button
              onClick={() => {
                onNavigate('shop', 'women');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 text-center"
            >
              👗 {t.women}
            </button>
            <button
              onClick={() => {
                onNavigate('shop', 'children');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 text-center"
            >
              🧸 {t.children}
            </button>
            <button
              onClick={() => {
                onNavigate('shop', 'festive');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200 text-center"
            >
              ✨ {t.festive}
            </button>
          </div>

          <div className="space-y-1 pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              {t.home}
            </button>
            <button
              onClick={() => {
                onNavigate('shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              {t.shop}
            </button>
            <button
              onClick={() => {
                onNavigate('track-order');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              {t.trackOrder}
            </button>

            {isLoggedIn && user ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('account');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
                >
                  {t.myAccount} ({user.name})
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginModal();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-amber-800 bg-amber-50 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'কাস্টমার লগইন / সাইন ইন' : 'Customer Login / Sign In'}</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-amber-800 bg-amber-50"
              >
                🛡️ {t.adminPanel}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
