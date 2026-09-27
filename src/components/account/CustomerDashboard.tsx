import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  LogOut,
  LogIn,
  ArrowRight,
  ShieldCheck,
  FileText,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { Order, Product } from '../../types';
import { bangladeshDivisions } from '../../data/bangladeshLocations';
import { formatAuthError } from '../../utils/authErrors';

interface CustomerDashboardProps {
  initialTab?: 'orders' | 'profile' | 'wishlist';
  onViewInvoice: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
  onOpenProduct: (product: Product) => void;
  onShopNow: () => void;
  onNavigateHome?: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  initialTab = 'orders',
  onViewInvoice,
  onTrackOrder,
  onOpenProduct,
  onShopNow,
  onNavigateHome,
  onToast,
}) => {
  const { user, isLoggedIn, updateProfile, logout, loginWithEmail, loginWithGoogle, openLoginModal } = useAuth();
  const { language, formatPrice, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>(initialTab);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [division, setDivision] = useState(user?.address?.division || 'Dhaka');
  const [district, setDistrict] = useState(user?.address?.district || 'Dhaka City (ঢাকা সিটি)');
  const [address, setAddress] = useState(user?.address?.address || '');

  // Login form state (if logged out)
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Sync state whenever user changes (e.g. login or logout)
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setDivision(user.address?.division || 'Dhaka');
      setDistrict(user.address?.district || 'Dhaka City (ঢাকা সিটি)');
      setAddress(user.address?.address || '');
    }
  }, [user]);

  // Customer sees their own orders
  const allOrders = storageService.getOrders();
  const orders = allOrders.filter(
    (o) => !user || o.customerId === user.id || (user.phone && o.shippingAddress.phone.includes(user.phone))
  );
  const wishlistIds = storageService.getWishlist();
  const allProducts = storageService.getProducts();
  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      phone,
      email,
      address: {
        fullName: name,
        phone,
        email,
        division,
        district,
        address,
      },
    });
    onToast(t.profileUpdated, 'success');
  };

  const handleLogoutClick = async () => {
    await logout();
    onToast(
      language === 'bn' ? 'আপনি সফলভাবে অ্যাকাউন্ট থেকে লগআউট করেছেন!' : 'You have been logged out successfully!',
      'info'
    );
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      onShopNow();
    }
  };

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailOrPhone.trim()) {
      onToast(
        language === 'bn' ? 'অনুগ্রহ করে ইমেইল বা মোবাইল নম্বর লিখুন' : 'Please enter your email or phone',
        'error'
      );
      return;
    }
    if (!loginPassword) {
      onToast(
        language === 'bn' ? 'অনুগ্রহ করে পাসওয়ার্ড লিখুন' : 'Please enter your password',
        'error'
      );
      return;
    }

    try {
      setAuthLoading(true);
      await loginWithEmail(loginEmailOrPhone.trim(), loginPassword);
      onToast(
        language === 'bn' ? 'লগইন সফল হয়েছে!' : 'Logged in successfully!',
        'success'
      );
    } catch (err: unknown) {
      console.error('❌ CustomerDashboard Direct Login Error:', err);
      onToast(formatAuthError(err, language), 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // If customer is not logged in, render the login & welcome portal
  if (!isLoggedIn || !user) {
    return (
      <div className="bg-stone-100/60 py-16 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
              <UserIcon className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {language === 'bn' ? 'কাস্টমার লগইন / সাইন ইন' : 'Customer Sign In'}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'bn'
                ? 'আপনার অর্ডার হিস্ট্রি ও প্রোফাইল দেখতে Firebase Authentication-এ লগইন করুন'
                : 'Sign in to access your orders and profile'}
            </p>
          </div>

          <form onSubmit={handleDirectLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {language === 'bn' ? 'ইমেইল অথবা মোবাইল নম্বর *' : 'Email or Mobile Number *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  placeholder="email@example.com or 017XXXXXXXX"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Social Sign-in & Register options */}
          <div className="pt-4 border-t border-stone-100 space-y-3 text-center">
            <button
              type="button"
              disabled={authLoading}
              onClick={async () => {
                try {
                  setAuthLoading(true);
                  await loginWithGoogle();
                  onToast(
                    language === 'bn' ? 'গুগল লগইন সফল হয়েছে!' : 'Google login successful',
                    'success'
                  );
                } catch (e: unknown) {
                  console.error('❌ CustomerDashboard Google Login Error:', e);
                  onToast(formatAuthError(e, language), 'error');
                } finally {
                  setAuthLoading(false);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>
                {authLoading
                  ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...')
                  : (language === 'bn' ? 'Google দিয়ে সাইন ইন করুন' : 'Sign in with Google')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => openLoginModal('register')}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন (Register)' : 'Create New Account (Register)'}
            </button>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={onNavigateHome || onShopNow}
                className="w-full py-2 rounded-xl text-stone-500 hover:text-stone-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                ← {language === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Homepage'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-100/60 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                    {user.name.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-base text-stone-900 truncate">{user.name}</h2>
                    <p className="text-xs text-stone-500 truncate">{user.phone}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                      {user.role === 'admin' ? 'Administrator' : 'Customer Account'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                  title={t.logout}
                >
                  <LogOut className="w-5 h-5 text-rose-600" />
                </button>
              </div>

              {/* Nav links */}
              <div className="space-y-1 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-amber-700 text-white font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.myOrders}</span>
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                    activeTab === 'orders' ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                    activeTab === 'wishlist'
                      ? 'bg-amber-700 text-white font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4" />
                    <span>{t.wishlist}</span>
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                    activeTab === 'wishlist' ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {wishlistProducts.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-amber-700 text-white font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{t.myProfile}</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors pt-3 border-t border-stone-100 font-bold"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-8">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <h3 className="font-serif text-xl font-bold text-stone-900">{t.myOrders}</h3>
                  <span className="text-xs text-stone-500">
                    Total {orders.length} orders
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                    <p className="text-sm font-semibold text-stone-700">{t.noOrdersYet}</p>
                    <button
                      onClick={onShopNow}
                      className="px-5 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold"
                    >
                      {t.startShopping}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl border border-stone-200/90 hover:border-amber-600 transition-colors space-y-4 bg-stone-50/40"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/60">
                          <div>
                            <span className="font-mono font-bold text-sm text-stone-900">
                              {ord.id}
                            </span>
                            <span className="text-xs text-stone-500 block">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                              {ord.orderStatus}
                            </span>
                            <span className="text-xs font-bold text-stone-900 font-serif">
                              {formatPrice(ord.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Items in order */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.titleEn}
                                className="w-12 h-14 object-cover rounded-lg border border-stone-200"
                              />
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-semibold text-stone-900 truncate">
                                  {language === 'bn' ? item.titleBn : item.titleEn}
                                </h5>
                                <p className="text-[11px] text-stone-500">
                                  Size: {item.size} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex items-center justify-between border-t border-stone-200/60 text-xs">
                          <button
                            onClick={() => onTrackOrder(ord.id)}
                            className="font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                          >
                            <span>{t.trackYourOrder}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onViewInvoice(ord)}
                            className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t.printInvoice}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <h3 className="font-serif text-xl font-bold text-stone-900">{t.wishlist}</h3>
                  <span className="text-xs text-stone-500">
                    {wishlistProducts.length} items saved
                  </span>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                    <p className="text-sm font-semibold text-stone-700">
                      {language === 'bn' ? 'আপনার পছন্দের তালিকা খালি।' : 'Your wishlist is currently empty.'}
                    </p>
                    <button
                      onClick={onShopNow}
                      className="px-5 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold"
                    >
                      {t.startShopping}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-3 rounded-2xl border border-stone-200 flex gap-3 items-center hover:border-amber-600 transition-colors"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.titleEn}
                          className="w-16 h-20 object-cover rounded-xl border border-stone-200"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {language === 'bn' ? prod.titleBn : prod.titleEn}
                          </h4>
                          <div className="text-xs font-bold font-serif text-amber-900">
                            {formatPrice(prod.price)}
                          </div>
                          <button
                            onClick={() => onOpenProduct(prod)}
                            className="text-[11px] font-bold text-amber-800 hover:underline block pt-1"
                          >
                            {t.viewDetails} →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-4 border-b border-stone-100">
                  <h3 className="font-serif text-xl font-bold text-stone-900">{t.myProfile}</h3>
                  <p className="text-xs text-stone-500">
                    {language === 'bn' ? 'আপনার ব্যক্তিগত ও ডেলিভারি তথ্য হালনাগাদ করুন' : 'Manage your contact details and default delivery address'}
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        {t.fullName}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        {t.emailOptional}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        {t.selectDivision}
                      </label>
                      <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-amber-600 outline-none"
                      >
                        {bangladeshDivisions.map((d) => (
                          <option key={d.id} value={d.nameEn}>
                            {d.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        {language === 'bn' ? 'ডিফল্ট ডেলিভারি ঠিকানা' : 'Default Delivery Address'}
                      </label>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-stone-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                    >
                      {t.saveChanges}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
