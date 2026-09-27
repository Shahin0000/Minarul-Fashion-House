/**
 * Minarul Fashion House (মিনারুল ফ্যাশন হাউস)
 * Premium Bangladeshi Fashion E-Commerce for Men, Women & Children
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Flame, 
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  ChevronRight
} from 'lucide-react';

import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { storageService } from './services/storageService';
import { Product, Order, CategoryType } from './types';

// Layout & Common components
import { TopBar } from './components/layout/TopBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { SearchModal } from './components/common/SearchModal';
import { LoginModal } from './components/common/LoginModal';

// Home components
import { HeroSlider } from './components/home/HeroSlider';
import { CategoryCards } from './components/home/CategoryCards';

// Product components
import { ProductCard } from './components/products/ProductCard';
import { ProductFilters } from './components/products/ProductFilters';
import { ProductDetailModal } from './components/products/ProductDetailModal';

// Cart & Checkout
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutView } from './components/checkout/CheckoutView';
import { OrderReceipt } from './components/checkout/OrderReceipt';
import { TrackOrderView } from './components/tracking/TrackOrderView';

// Account & Admin
import { CustomerDashboard } from './components/account/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StaticPages } from './components/info/StaticPages';

const MainApp: React.FC = () => {
  const { language, formatPrice, t } = useLanguage();
  const { openCart, buyNow } = useCart();
  const { user, isAdmin, isLoadingAuth, isLoginModalOpen, closeLoginModal } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountSubTab, setAccountSubTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');

  // Active Order for confirmation receipt
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  // Products from persistent storage
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [wishlist, setWishlist] = useState<string[]>(() => storageService.getWishlist());

  // Search & Detail Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync products and wishlist on storage event
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setProducts(storageService.getProducts());
      setWishlist(storageService.getWishlist());
    });
    return unsub;
  }, []);

  // Global internal navigation listener
  useEffect(() => {
    const handleNavEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        handleNavigate(customEvent.detail);
      }
    };
    window.addEventListener('mfh:navigate', handleNavEvent);
    return () => window.removeEventListener('mfh:navigate', handleNavEvent);
  }, []);

  // Enforce Admin View Security: If user is not verified admin in Firestore, redirect to Customer Dashboard
  useEffect(() => {
    if (!isLoadingAuth && currentView === 'admin' && !isAdmin) {
      setCurrentView('account');
    }
  }, [currentView, isAdmin, isLoadingAuth]);

  // Support URL routing for products (e.g. /product/:id, ?productId=..., ?product=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlProdId = searchParams.get('productId') || searchParams.get('product');
      const hashProdId = window.location.hash.startsWith('#product-')
        ? window.location.hash.replace('#product-', '')
        : null;
      const pathMatch = window.location.pathname.match(/\/product\/([a-zA-Z0-9_-]+)/);
      const pathProdId = pathMatch ? pathMatch[1] : null;
      const targetId = urlProdId || hashProdId || pathProdId;

      if (targetId) {
        const found = products.find((p) => p.id === targetId);
        if (found) {
          setSelectedProduct(found);
        } else {
          console.error('Product ID is missing or not found in catalog:', targetId);
        }
      }
    } catch (e) {
      console.warn('URL route detection notice:', e);
    }
  }, [products]);

  const handleToggleWishlist = (productId: string) => {
    const added = storageService.toggleWishlist(productId);
    setWishlist(storageService.getWishlist());
    addToast(
      added
        ? language === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে' : 'Added to Wishlist'
        : language === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from Wishlist',
      'info'
    );
  };

  // Navigation Handler
  const handleNavigate = (view: string, filter?: string) => {
    setCurrentView(view);
    if (filter) {
      if (view === 'account') {
        setAccountSubTab(filter as 'orders' | 'profile' | 'wishlist');
      } else {
        setCategoryFilter(filter);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shop filter state
  const [filters, setFilters] = useState({
    category: 'all',
    subCategory: 'all',
    minPrice: 500,
    maxPrice: 10000,
    selectedSize: 'all',
    inStockOnly: false,
    sortBy: 'newest',
  });

  // Keep filters.category in sync when user clicks navbar links
  useEffect(() => {
    if (categoryFilter && categoryFilter !== filters.category) {
      setFilters((prev) => ({ ...prev, category: categoryFilter }));
    }
  }, [categoryFilter]);

  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set).slice(0, 10);
  }, [products]);

  // Filtered Products for Shop View
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (filters.category !== 'all') {
        if (filters.category === 'festive') {
          if (!p.isFeatured && !p.tags.includes('festive') && !p.tags.includes('eid')) {
            return false;
          }
        } else if (p.category !== filters.category) {
          return false;
        }
      }

      // Price filter
      if (p.price > filters.maxPrice) return false;

      // Size filter
      if (filters.selectedSize !== 'all') {
        if (!p.sizes.includes(filters.selectedSize)) return false;
      }

      // Stock filter
      if (filters.inStockOnly && p.stock <= 0) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      return 0; // default newest
    });
  }, [products, filters]);

  // Featured sections for Homepage
  const featuredPanjabi = useMemo(
    () => products.filter((p) => p.category === 'men').slice(0, 4),
    [products]
  );
  const featuredWomen = useMemo(
    () => products.filter((p) => p.category === 'women').slice(0, 4),
    [products]
  );
  const featuredChildren = useMemo(
    () => products.filter((p) => p.category === 'children').slice(0, 4),
    [products]
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-700 selection:text-white">
      {/* Top Announcement & Switcher Bar */}
      <TopBar onNavigate={handleNavigate} />

      {/* Main Sticky Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        wishlistCount={wishlist.length}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="space-y-16">
            {/* Hero Carousel */}
            <HeroSlider onNavigate={handleNavigate} />

            {/* Visual Category Gateways */}
            <CategoryCards
              onSelectCategory={(cat) => {
                setCategoryFilter(cat);
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Section 1: Men's Panjabi & Shirts Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-200 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>{language === 'bn' ? 'অভিজাত সংগ্রহ' : "Gentlemen's Edit"}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                    {language === 'bn' ? 'পুরুষদের রাজকীয় পাঞ্জাবি ও কাবলি' : 'Royal Panjabi & Kabli Suits'}
                  </h2>
                </div>
                <button
                  onClick={() => handleNavigate('shop', 'men')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group"
                >
                  <span>{language === 'bn' ? 'সকল পাঞ্জাবি দেখুন' : 'Explore All Men’s'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredPanjabi.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onNavigateToCheckout={() => handleNavigate('checkout')}
                    onToast={addToast}
                  />
                ))}
              </div>
            </section>

            {/* Mid Banner: Eid & Wedding Festive Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white p-8 sm:p-14 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80"
                  alt="Festive Saree"
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
                />
                <div className="relative z-10 max-w-xl space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest">
                    {language === 'bn' ? 'ঈদ ও বিয়ে স্পেশাল ২০২৬' : 'Eid & Bridal Festive Edition'}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
                    {language === 'bn'
                      ? 'ঐতিহ্যবাহী ঢাকাই জামদানি ও প্রিমিয়াম পার্টি ড্রেস'
                      : 'Heritage Dhakai Jamdani & Royal Party Ensembles'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {language === 'bn'
                      ? 'বাংলার তাঁতশিল্পের নিখুঁত কারুকাজ ও আধুনিক ট্রিমসের অপূর্ব সমন্বয়। সারা বাংলাদেশে দ্রুততম কুরিয়ার হোম ডেলিভারি।'
                      : 'Authentic 84-count pure cotton Jamdani, pure silk sarees and tailored festive suites ready for your biggest celebrations.'}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => handleNavigate('shop', 'festive')}
                      className="px-7 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                    >
                      <span>{t.shopNow}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Women's Saree & Three-Piece Collection */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-200 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{language === 'bn' ? 'নারী সৌন্দর্য ও আভিজাত্য' : "Women's Collection"}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                    {language === 'bn' ? 'ঐতিহ্যবাহী শাড়ি ও ডিজাইনার থ্রি-পিস' : 'Handloom Sarees & Party Three-Pieces'}
                  </h2>
                </div>
                <button
                  onClick={() => handleNavigate('shop', 'women')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group"
                >
                  <span>{language === 'bn' ? 'সকল পোশাক দেখুন' : 'Explore All Women’s'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredWomen.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onNavigateToCheckout={() => handleNavigate('checkout')}
                    onToast={addToast}
                  />
                ))}
              </div>
            </section>

            {/* Section 3: Children's Collection */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-200 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                    <span>🧸</span>
                    <span>{language === 'bn' ? 'ছোটদের উৎসব' : "Children's Wear"}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                    {language === 'bn' ? 'বাচ্চাদের আরামদায়ক পাঞ্জাবি ও ফ্রক' : 'Joyful Kids Panjabi & Party Frocks'}
                  </h2>
                </div>
                <button
                  onClick={() => handleNavigate('shop', 'children')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group"
                >
                  <span>{language === 'bn' ? 'বাচ্চাদের সব কালেকশন' : 'Explore Kids Collection'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredChildren.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onNavigateToCheckout={() => handleNavigate('checkout')}
                    onToast={addToast}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SHOP / CATALOG PAGE */}
        {currentView === 'shop' && (
          <div className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Breadcrumb & Header */}
              <div className="mb-8 space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <button onClick={() => handleNavigate('home')} className="hover:text-stone-900">
                    {t.home}
                  </button>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-amber-800 font-semibold">{t.shop}</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
                  {filters.category === 'men'
                    ? t.men
                    : filters.category === 'women'
                    ? t.women
                    : filters.category === 'children'
                    ? t.children
                    : filters.category === 'festive'
                    ? t.festive
                    : t.allProducts}
                </h1>
                <p className="text-xs sm:text-sm text-stone-500">
                  {language === 'bn'
                    ? `সর্বমোট ${filteredProducts.length} টি পোশাক প্রদর্শিত হচ্ছে`
                    : `Showing ${filteredProducts.length} clothing items`}
                </p>
              </div>

              {/* Grid with Filter Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filter Sidebar */}
                <div className="lg:col-span-1">
                  <ProductFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    onResetFilters={() =>
                      setFilters({
                        category: 'all',
                        subCategory: 'all',
                        minPrice: 500,
                        maxPrice: maxProductPrice,
                        selectedSize: 'all',
                        inStockOnly: false,
                        sortBy: 'newest',
                      })
                    }
                    availableSizes={availableSizes}
                    maxProductPrice={maxProductPrice}
                  />
                </div>

                {/* Products Grid */}
                <div className="lg:col-span-3">
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <h3 className="font-bold text-base text-stone-900">{t.noProductsFound}</h3>
                      <button
                        onClick={() =>
                          setFilters({
                            category: 'all',
                            subCategory: 'all',
                            minPrice: 500,
                            maxPrice: maxProductPrice,
                            selectedSize: 'all',
                            inStockOnly: false,
                            sortBy: 'newest',
                          })
                        }
                        className="px-5 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold"
                      >
                        {t.clearFilters}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onOpenDetails={(p) => setSelectedProduct(p)}
                          isWishlisted={wishlist.includes(product.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onNavigateToCheckout={() => handleNavigate('checkout')}
                          onToast={addToast}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CHECKOUT */}
        {currentView === 'checkout' && (
          <CheckoutView
            onBackToShop={() => handleNavigate('shop')}
            onOrderSuccess={(order) => {
              setActiveOrder(order);
              setCurrentView('receipt');
            }}
            onToast={addToast}
          />
        )}

        {/* VIEW 4: ORDER RECEIPT / INVOICE */}
        {currentView === 'receipt' && activeOrder && (
          <OrderReceipt
            order={activeOrder}
            onContinueShopping={() => handleNavigate('shop')}
            onTrackOrder={(orderId) => {
              setTrackingOrderId(orderId);
              setCurrentView('track-order');
            }}
          />
        )}

        {/* VIEW 5: ORDER TRACKING */}
        {currentView === 'track-order' && (
          <TrackOrderView
            initialOrderId={trackingOrderId}
            onViewInvoice={(ord) => {
              setActiveOrder(ord);
              setCurrentView('receipt');
            }}
            onShopNow={() => handleNavigate('shop')}
          />
        )}

        {/* VIEW 6: CUSTOMER DASHBOARD */}
        {currentView === 'account' && (
          <CustomerDashboard
            initialTab={accountSubTab}
            onViewInvoice={(ord) => {
              setActiveOrder(ord);
              setCurrentView('receipt');
            }}
            onTrackOrder={(orderId) => {
              setTrackingOrderId(orderId);
              setCurrentView('track-order');
            }}
            onOpenProduct={(p) => setSelectedProduct(p)}
            onShopNow={() => handleNavigate('shop')}
            onNavigateHome={() => handleNavigate('home')}
            onToast={addToast}
          />
        )}

        {/* VIEW 7: ADMIN PORTAL */}
        {currentView === 'admin' && isAdmin && (
          <AdminDashboard
            onViewInvoice={(ord) => {
              setActiveOrder(ord);
              setCurrentView('receipt');
            }}
            onToast={addToast}
          />
        )}

        {/* VIEW 8: STATIC / INFORMATIONAL PAGES */}
        {(currentView === 'info-about' ||
          currentView === 'info-stores' ||
          currentView === 'info-returns' ||
          currentView === 'info-contact' ||
          currentView === 'info-size') && (
          <StaticPages
            pageType={
              currentView === 'info-about'
                ? 'about'
                : currentView === 'info-stores'
                ? 'stores'
                : currentView === 'info-returns'
                ? 'returns'
                : 'contact'
            }
            onNavigateHome={() => handleNavigate('home')}
            onToast={addToast}
          />
        )}
      </main>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => handleNavigate('checkout')}
        onContinueShopping={() => handleNavigate('shop')}
      />

      {/* Global Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Global Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onNavigateToCheckout={() => handleNavigate('checkout')}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onToast={addToast}
      />

      {/* Global Login / Sign In Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSuccess={(role) => {
          // If customer clicked "Buy Now" before logging in, resume Checkout directly with that item
          const pendingBuyNowStr = sessionStorage.getItem('mfh_pending_buynow');
          if (pendingBuyNowStr) {
            try {
              const pending = JSON.parse(pendingBuyNowStr);
              sessionStorage.removeItem('mfh_pending_buynow');
              const foundProduct = 
                products.find((p) => p.id === pending.productId) || 
                storageService.getProductById(pending.productId) || 
                pending.product;
              if (foundProduct) {
                buyNow(foundProduct, pending.size, pending.color, pending.quantity || 1);
                setSelectedProduct(null);
                handleNavigate('checkout');
                addToast(
                  language === 'bn' ? 'লগইন সফল! চেকআউট পেজে নিয়ে যাওয়া হচ্ছে...' : 'Signed in! Proceeding to checkout...',
                  'success'
                );
                return;
              }
            } catch (err) {
              console.warn('Error resuming pending buy now:', err);
            }
          }

          if (role === 'admin') {
            handleNavigate('admin');
            addToast(
              language === 'bn' ? 'অ্যাডমিন প্যানেলে স্বাগতম!' : 'Welcome to Admin Portal!',
              'success'
            );
          } else {
            handleNavigate('account');
            addToast(
              language === 'bn' ? 'লগইন সফল হয়েছে!' : 'Logged in successfully!',
              'success'
            );
          }
        }}
      />

      {/* Floating Action Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Comprehensive Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
