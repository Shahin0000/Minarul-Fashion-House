import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Tag, 
  ShieldCheck, 
  X, 
  FileText, 
  Search, 
  Settings, 
  Image as ImageIcon, 
  MessageSquare, 
  Truck, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Sliders, 
  DollarSign, 
  Copy, 
  ExternalLink,
  Layers,
  Sparkles,
  ArrowUpDown,
  Filter,
  Eye,
  Upload,
  Users as UsersIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { 
  Order, 
  Product, 
  Coupon, 
  OrderStatus, 
  PaymentStatus,
  CategoryType, 
  SubCategoryType,
  SiteSettings,
  HeroSlide,
  Review,
  ProductColor,
  User
} from '../../types';
import { formatAuthError } from '../../utils/authErrors';

interface AdminDashboardProps {
  onViewInvoice: (order: Order) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// Curated Bangladesh clothing image presets for fast 1-click product creation
const PRESET_CLOTHING_IMAGES = [
  {
    name: 'Maroon Embroidered Panjabi',
    category: 'men',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'White Jacquard Cotton Panjabi',
    category: 'men',
    url: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Royal Blue Semi-Formal Panjabi',
    category: 'men',
    url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Formal Cotton Shirt',
    category: 'men',
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Dhakai Jamdani Saree (Navy)',
    category: 'women',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Crimson Bridal Silk Saree',
    category: 'women',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Embroidered Party Three-Piece',
    category: 'women',
    url: 'https://images.unsplash.com/photo-1583391733975-08149e8954aa?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Designer Cotton Kurti',
    category: 'women',
    url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kids Royal Panjabi (Cotton)',
    category: 'children',
    url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Girls Party Princess Frock',
    category: 'children',
    url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Festive Luxury Kabli Set',
    category: 'festive',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  },
];

// Preset size suggestions
const SIZE_PRESETS = [
  { label: 'Panjabi (38, 40, 42, 44, 46)', value: '38, 40, 42, 44, 46' },
  { label: 'Shirts (S, M, L, XL, XXL)', value: 'S, M, L, XL, XXL' },
  { label: 'Kids (2-3Y, 4-5Y, 6-7Y, 8-9Y)', value: '2-3 Years, 4-5 Years, 6-7 Years, 8-9 Years' },
  { label: 'Free Size (শাড়ি / থ্রি-পিস)', value: 'Free Size' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onViewInvoice,
  onToast,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const { user, isAdmin, loginWithEmail, loginWithGoogle } = useAuth();

  // Admin Login gate states (if user is not admin)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'slides' | 'coupons' | 'reviews' | 'settings' | 'users'
  >('overview');

  // Reactive Data
  const [orders, setOrders] = useState<Order[]>(() => storageService.getOrders());
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [coupons, setCoupons] = useState<Coupon[]>(() => storageService.getCoupons());
  const [slides, setSlides] = useState<HeroSlide[]>(() => storageService.getHeroSlides());
  const [settings, setSettings] = useState<SiteSettings>(() => storageService.getSettings());
  const [reviews, setReviews] = useState<Review[]>(() => storageService.getReviews());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // In-app Custom Confirmation Modal state (Replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel = 'Delete'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      onConfirm,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Directly load and subscribe to Firestore orders for admin (Source of Truth: Firestore)
  useEffect(() => {
    if (!isAdmin) return;

    setOrdersLoading(true);
    storageService.fetchAdminOrders()
      .then((list) => {
        setOrders(list);
        setOrdersLoading(false);
        setOrdersError(null);
      })
      .catch((err) => {
        console.error('Admin initial orders fetch notice:', err);
        setOrdersLoading(false);
      });

    // Real-time onSnapshot listener so new customer orders immediately appear in Admin Panel
    const unsubscribeFirestoreOrders = storageService.subscribeAdminOrders(
      (realtimeOrders) => {
        setOrders(realtimeOrders);
        setOrdersLoading(false);
        setOrdersError(null);
      },
      (err) => {
        console.error('Admin orders listener notice:', err);
        setOrdersError(err.message);
        setOrdersLoading(false);
      }
    );

    return () => {
      unsubscribeFirestoreOrders();
    };
  }, [isAdmin]);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setProducts(storageService.getProducts());
      setCoupons(storageService.getCoupons());
      setSlides(storageService.getHeroSlides());
      setSettings(storageService.getSettings());
      setReviews(storageService.getReviews());
      setUsers(storageService.getUsers());
    });
    return unsub;
  }, []);

  const handleAdminDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');
    try {
      setAdminAuthLoading(true);
      await loginWithEmail(adminEmail.trim(), adminPassword);
      onToast('Admin login successful', 'success');
    } catch (err: unknown) {
      console.error('❌ Admin Direct Login Error:', err);
      setAdminAuthError(formatAuthError(err, language));
    } finally {
      setAdminAuthLoading(false);
    }
  };

  // Guard: If not admin, render secure Admin Login screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-100 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-amber-700" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {language === 'bn' ? 'অ্যাডমিন প্যানেল প্রবেশাধিকার' : 'Admin Portal Access'}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'bn'
                ? 'এই প্যানেলটি শুধুমাত্র অনুমোদিত অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত।'
                : 'Restricted area. Please sign in with an authorized administrator account.'}
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{adminAuthError}</span>
            </div>
          )}

          <form onSubmit={handleAdminDirectLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {language === 'bn' ? 'অ্যাডমিন ইমেইল *' : 'Admin Email *'}
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="bajajmotors.chu@gmail.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{adminAuthLoading ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন হিসেবে লগইন করুন'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 text-center">
            <button
              type="button"
              disabled={adminAuthLoading}
              onClick={async () => {
                try {
                  setAdminAuthLoading(true);
                  await loginWithGoogle();
                } catch (e: unknown) {
                  console.error('❌ Admin Google Sign-In Error:', e);
                  setAdminAuthError(formatAuthError(e, language));
                } finally {
                  setAdminAuthLoading(false);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{adminAuthLoading ? 'যাচাই করা হচ্ছে...' : 'Google Admin Sign In'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. ORDERS MANAGEMENT STATE & HANDLERS
  // =========================================================================
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Edit Order Form fields
  const [orderCustomerName, setOrderCustomerName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderDistrict, setOrderDistrict] = useState('');
  const [orderCourierName, setOrderCourierName] = useState('');
  const [orderTrackingId, setOrderTrackingId] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderDeliveryFee, setOrderDeliveryFee] = useState(60);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.shippingAddress.fullName.toLowerCase().includes(q) ||
        o.shippingAddress.phone.includes(q);

      const matchesStatus =
        orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;

      const matchesPayment =
        orderPaymentFilter === 'all' || o.paymentStatus === orderPaymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, orderSearch, orderStatusFilter, orderPaymentFilter]);

  const openEditOrderModal = (order: Order) => {
    setEditingOrder(order);
    setOrderCustomerName(order.shippingAddress.fullName);
    setOrderPhone(order.shippingAddress.phone);
    setOrderAddress(order.shippingAddress.address);
    setOrderDistrict(order.shippingAddress.district);
    setOrderCourierName(order.courierName || 'Steadfast Courier');
    setOrderTrackingId(order.courierTrackingId || '');
    setOrderNotes(order.shippingAddress.notes || '');
    setOrderDeliveryFee(order.deliveryCharge);
  };

  const handleSaveOrderEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const diffDelivery = orderDeliveryFee - editingOrder.deliveryCharge;
    const newTotal = Math.max(0, editingOrder.totalAmount + diffDelivery);

    const updated: Order = {
      ...editingOrder,
      deliveryCharge: orderDeliveryFee,
      totalAmount: newTotal,
      courierName: orderCourierName.trim(),
      courierTrackingId: orderTrackingId.trim() || undefined,
      shippingAddress: {
        ...editingOrder.shippingAddress,
        fullName: orderCustomerName.trim(),
        phone: orderPhone.trim(),
        address: orderAddress.trim(),
        district: orderDistrict.trim(),
        notes: orderNotes.trim() || undefined,
      },
      updatedAt: new Date().toISOString(),
    };

    storageService.updateOrder(updated);
    setEditingOrder(null);
    onToast(
      language === 'bn' ? `অর্ডার #${updated.id} এর তথ্য সংরক্ষিত হয়েছে!` : `Order #${updated.id} updated!`,
      'success'
    );
  };

  const handleDeleteOrderClick = (order: Order) => {
    openConfirmDialog(
      language === 'bn' ? 'অর্ডার মুছে ফেলবেন?' : 'Delete Order?',
      language === 'bn'
        ? `আপনি কি নিশ্চিত #${order.id} অর্ডারটি সম্পূর্ণ মুছে ফেলতে চান? গ্রাহক: ${order.shippingAddress.fullName}`
        : `Are you sure you want to permanently delete order #${order.id} for ${order.shippingAddress.fullName}?`,
      () => {
        storageService.deleteOrder(order.id);
        onToast(
          language === 'bn' ? `অর্ডার #${order.id} মুছে ফেলা হয়েছে` : `Order #${order.id} deleted`,
          'info'
        );
      }
    );
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    onToast(
      language === 'bn' ? `ট্র্যাকিং কোড কপি করা হয়েছে: ${code}` : `Copied tracking ID: ${code}`,
      'success'
    );
  };

  // =========================================================================
  // 2. PRODUCT MANAGEMENT STATE & HANDLERS
  // =========================================================================
  const [productViewMode, setProductViewMode] = useState<'grid' | 'table'>('grid');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productStockFilter, setProductStockFilter] = useState<string>('all');
  const [productSortBy, setProductSortBy] = useState<string>('newest');

  // Product Add / Edit Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [prodTitleEn, setProdTitleEn] = useState('');
  const [prodTitleBn, setProdTitleBn] = useState('');
  const [prodCategory, setProdCategory] = useState<CategoryType>('men');
  const [prodSubCategory, setProdSubCategory] = useState<SubCategoryType>('panjabi');
  const [prodPrice, setProdPrice] = useState(2200);
  const [prodOriginalPrice, setProdOriginalPrice] = useState(2800);
  const [prodStock, setProdStock] = useState(25);
  const [prodFabric, setProdFabric] = useState('100% Combed Cotton');
  const [prodSizes, setProdSizes] = useState('38, 40, 42, 44');
  const [prodImage, setProdImage] = useState(
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
  );
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodDescBn, setProdDescBn] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(true);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsNewArrival, setProdIsNewArrival] = useState(true);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.titleEn.toLowerCase().includes(q) ||
        p.titleBn.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q);

      const matchesCat =
        productCategoryFilter === 'all' || p.category === productCategoryFilter;

      let matchesStock = true;
      if (productStockFilter === 'in_stock') matchesStock = p.stock > 5;
      else if (productStockFilter === 'low_stock') matchesStock = p.stock > 0 && p.stock <= 5;
      else if (productStockFilter === 'out_of_stock') matchesStock = p.stock === 0;

      return matchesSearch && matchesCat && matchesStock;
    }).sort((a, b) => {
      if (productSortBy === 'price_asc') return a.price - b.price;
      if (productSortBy === 'price_desc') return b.price - a.price;
      if (productSortBy === 'stock_asc') return a.stock - b.stock;
      if (productSortBy === 'stock_desc') return b.stock - a.stock;
      return 0; // default newest / original order
    });
  }, [products, productSearch, productCategoryFilter, productStockFilter, productSortBy]);

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdTitleEn('');
    setProdTitleBn('');
    setProdCategory('men');
    setProdSubCategory('panjabi');
    setProdPrice(2200);
    setProdOriginalPrice(2800);
    setProdStock(25);
    setProdFabric('100% Pure Combed Cotton');
    setProdSizes('38, 40, 42, 44');
    setProdImage('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80');
    setProdDescEn('High quality traditional festive clothing crafted for perfection.');
    setProdDescBn('ঈদ ও উৎসবের জন্য আকর্ষণীয় প্রিমিয়াম পোশাক। নিখুঁত সেলাই ও আরামদায়ক কাপড়।');
    setProdIsFeatured(true);
    setProdIsBestSeller(false);
    setProdIsNewArrival(true);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProdTitleEn(product.titleEn);
    setProdTitleBn(product.titleBn);
    setProdCategory(product.category);
    setProdSubCategory(product.subCategory);
    setProdPrice(product.price);
    setProdOriginalPrice(product.originalPrice || product.price);
    setProdStock(product.stock);
    setProdFabric(product.fabric);
    setProdSizes(product.sizes.join(', '));
    setProdImage(product.images[0] || '');
    setProdDescEn(product.descriptionEn);
    setProdDescBn(product.descriptionBn);
    setProdIsFeatured(!!product.isFeatured);
    setProdIsBestSeller(!!product.isBestSeller);
    setProdIsNewArrival(!!product.isNewArrival);
    setShowProductModal(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      onToast('Uploading image to Firebase Storage...', 'info');
      const downloadUrl = await storageService.uploadImage(file, 'products');
      setProdImage(downloadUrl);
      onToast('Image uploaded successfully to Firebase Storage!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onToast('Firebase Storage upload failed: ' + msg, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      onToast('Uploading slide image to Firebase Storage...', 'info');
      const downloadUrl = await storageService.uploadImage(file, 'slides');
      setSlideImage(downloadUrl);
      onToast('Banner image uploaded to Firebase Storage!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onToast('Firebase Storage upload failed: ' + msg, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const clone: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      sku: `MFH-${Date.now().toString().slice(-6)}`,
      titleEn: `${product.titleEn} (Copy)`,
      titleBn: `${product.titleBn} (কপি)`,
    };
    storageService.saveProduct(clone);
    onToast(
      language === 'bn' ? 'পোশাকের সফল ক্লোন তৈরি করা হয়েছে!' : 'Product duplicated successfully!',
      'success'
    );
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitleEn.trim() || !prodTitleBn.trim()) {
      onToast('Please fill in product titles in English and Bangla', 'error');
      return;
    }

    const sizesArr = prodSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const defaultColors: ProductColor[] =
      prodCategory === 'women'
        ? [
            { nameEn: 'Royal Red', nameBn: 'লাল', hex: '#b91c1c' },
            { nameEn: 'Peacock Green', nameBn: 'সবুজ', hex: '#047857' },
          ]
        : [
            { nameEn: 'Royal Maroon', nameBn: 'মেরুন', hex: '#6b1d2f' },
            { nameEn: 'Classic White', nameBn: 'সাদা', hex: '#ffffff' },
          ];

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      titleEn: prodTitleEn.trim(),
      titleBn: prodTitleBn.trim(),
      category: prodCategory,
      subCategory: prodSubCategory,
      price: Number(prodPrice),
      originalPrice: Number(prodOriginalPrice),
      images: [prodImage.trim()],
      descriptionEn: prodDescEn.trim() || 'Premium quality garment.',
      descriptionBn: prodDescBn.trim() || 'প্রিমিয়াম কোয়ালিটি পোশাক।',
      sizes: sizesArr.length > 0 ? sizesArr : ['Standard'],
      colors: editingProduct ? editingProduct.colors : defaultColors,
      stock: Math.max(0, Number(prodStock)),
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
      fabric: prodFabric.trim(),
      sku: editingProduct ? editingProduct.sku : `MFH-${Date.now().toString().slice(-6)}`,
      tags: [prodCategory, prodSubCategory, 'clothing', 'fashion'],
      isFeatured: prodIsFeatured,
      isBestSeller: prodIsBestSeller,
      isNewArrival: prodIsNewArrival,
    };

    storageService.saveProduct(productToSave);
    setShowProductModal(false);
    onToast(
      language === 'bn' ? 'পোশাকের তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Product saved successfully!',
      'success'
    );
  };

  const handleDeleteProductClick = (product: Product) => {
    openConfirmDialog(
      language === 'bn' ? 'পোশাক মুছে ফেলবেন?' : 'Delete Product?',
      language === 'bn'
        ? `আপনি কি নিশ্চিত "${product.titleBn}" পোশাকটি স্থায়ীভাবে মুছে ফেলতে চান?`
        : `Are you sure you want to permanently delete "${product.titleEn}"?`,
      () => {
        storageService.deleteProduct(product.id);
        onToast(
          language === 'bn' ? 'পোশাকটি মুছে ফেলা হয়েছে' : 'Product deleted successfully',
          'info'
        );
      }
    );
  };

  // =========================================================================
  // 3. HERO SLIDES STATE & HANDLERS
  // =========================================================================
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  const [slideBadgeEn, setSlideBadgeEn] = useState('');
  const [slideBadgeBn, setSlideBadgeBn] = useState('');
  const [slideTitleEn, setSlideTitleEn] = useState('');
  const [slideTitleBn, setSlideTitleBn] = useState('');
  const [slideSubtitleEn, setSlideSubtitleEn] = useState('');
  const [slideSubtitleBn, setSlideSubtitleBn] = useState('');
  const [slideImage, setSlideImage] = useState('');
  const [slideCategory, setSlideCategory] = useState<CategoryType | 'all' | 'festive'>('men');

  const openAddSlideModal = () => {
    setEditingSlide(null);
    setSlideBadgeEn('EID & FESTIVE 2026');
    setSlideBadgeBn('ঈদ ও উৎসব কালেকশন ২০২৬');
    setSlideTitleEn('Royal Festive Collection');
    setSlideTitleBn('উৎসবের রাজকীয় পোশাক কালেকশন');
    setSlideSubtitleEn('Handcrafted zari embroidery, comfortable fabric and graceful patterns.');
    setSlideSubtitleBn('নিখুঁত কারুকাজ ও প্রিমিয়াম আরামদায়ক কাপড়ের অপূর্ব সমন্বয়।');
    setSlideImage('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85');
    setSlideCategory('men');
    setShowSlideModal(true);
  };

  const openEditSlideModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideBadgeEn(slide.badgeEn);
    setSlideBadgeBn(slide.badgeBn);
    setSlideTitleEn(slide.titleEn);
    setSlideTitleBn(slide.titleBn);
    setSlideSubtitleEn(slide.subtitleEn);
    setSlideSubtitleBn(slide.subtitleBn);
    setSlideImage(slide.image);
    setSlideCategory(slide.category);
    setShowSlideModal(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlide: HeroSlide = {
      id: editingSlide ? editingSlide.id : `slide-${Date.now()}`,
      badgeEn: slideBadgeEn.trim(),
      badgeBn: slideBadgeBn.trim(),
      titleEn: slideTitleEn.trim(),
      titleBn: slideTitleBn.trim(),
      subtitleEn: slideSubtitleEn.trim(),
      subtitleBn: slideSubtitleBn.trim(),
      image: slideImage.trim(),
      category: slideCategory,
      isActive: true,
    };
    storageService.saveHeroSlide(newSlide);
    setShowSlideModal(false);
    onToast(
      language === 'bn' ? 'ব্যানার স্লাইডার আপডেট হয়েছে!' : 'Hero slide updated successfully!',
      'success'
    );
  };

  const handleDeleteSlideClick = (slide: HeroSlide) => {
    openConfirmDialog(
      'Delete Banner Slide?',
      `Are you sure you want to delete banner "${slide.titleEn}"?`,
      () => {
        storageService.deleteHeroSlide(slide.id);
        onToast('Banner slide removed', 'info');
      }
    );
  };

  // =========================================================================
  // 4. COUPONS STATE & HANDLERS
  // =========================================================================
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(2000);
  const [newCouponDescEn, setNewCouponDescEn] = useState('Festive discount voucher');
  const [newCouponDescBn, setNewCouponDescBn] = useState('উৎসব স্পেশাল ছাড় ভাউচার');

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const c: Coupon = {
      id: `c-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponVal),
      minOrderValue: Number(newCouponMinOrder),
      descriptionEn: newCouponDescEn || `${newCouponVal}${newCouponType === 'percentage' ? '%' : '৳'} Off`,
      descriptionBn: newCouponDescBn || `${newCouponVal}${newCouponType === 'percentage' ? '%' : ' টাকা'} ছাড়`,
      isActive: true,
    };

    storageService.saveCoupon(c);
    setShowCouponModal(false);
    setNewCouponCode('');
    onToast('New coupon code created!', 'success');
  };

  const handleDeleteCouponClick = (c: Coupon) => {
    openConfirmDialog(
      'Delete Coupon Code?',
      `Are you sure you want to delete coupon "${c.code}"?`,
      () => {
        storageService.deleteCoupon(c.id);
        onToast('Coupon deleted', 'info');
      }
    );
  };

  // =========================================================================
  // 5. REVIEWS HANDLERS
  // =========================================================================
  const handleDeleteReviewClick = (rev: Review) => {
    openConfirmDialog(
      'Delete Review?',
      `Are you sure you want to delete review by "${rev.userName}"?`,
      () => {
        storageService.deleteReview(rev.id);
        onToast('Review removed', 'info');
      }
    );
  };

  // =========================================================================
  // 6. STORE SETTINGS STATE & HANDLERS
  // =========================================================================
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settingsForm);
    onToast(
      language === 'bn' ? 'ওয়েবসাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Website settings updated successfully!',
      'success'
    );
  };

  const handleResetDataClick = () => {
    openConfirmDialog(
      language === 'bn' ? 'সকল ডেটা রিসেট করবেন?' : 'Reset All Demo Data?',
      language === 'bn'
        ? 'সতর্কতা: এটি ওয়েবসাইটকে ডিফল্ট পণ্য এবং অর্ডারে ফিরিয়ে নেবে। আপনি কি নিশ্চিত?'
        : 'Warning: This will restore default products, orders, slides, and settings. Are you sure?',
      () => {
        storageService.resetAllData();
        onToast(
          language === 'bn' ? 'ফ্যাক্টরি ডিফল্ট ডেটায় রিসেট হয়েছে!' : 'Data reset to default successfully!',
          'info'
        );
      },
      'Reset Data'
    );
  };

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;
  const shippedOrdersCount = orders.filter((o) => o.orderStatus === 'shipped').length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'delivered').length;

  return (
    <div className="bg-stone-100/70 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header / Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-700 text-white shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {t.adminTitle}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  FULL ACCESS CONTROL
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'bn'
                  ? 'সকল পণ্য যুক্ত, পরিবর্তন, মোছা এবং কাস্টমার অর্ডার ব্যবস্থাপনার কেন্দ্রীয় প্যানেল'
                  : 'Complete product catalog management (Add/Edit/Delete), order tracking & gateway control'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openAddProductModal}
              className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addNewProduct}</span>
            </button>

            <button
              onClick={openAddSlideModal}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ImageIcon className="w-4 h-4 text-amber-300" />
              <span>{language === 'bn' ? 'নতুন ব্যানার' : 'New Banner'}</span>
            </button>

            <button
              onClick={handleResetDataClick}
              className="p-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>{t.totalRevenue}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-stone-950 font-serif">
              {formatPrice(totalRevenue)}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">
              From {orders.length} total orders
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>{t.pendingOrders}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-stone-950 font-serif">
              {pendingOrdersCount}
            </div>
            <span className="text-[10px] text-amber-700 font-semibold">
              Awaiting packaging / confirmation
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>Shipped & Out for Delivery</span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-stone-950 font-serif">
              {shippedOrdersCount}
            </div>
            <span className="text-[10px] text-blue-700 font-semibold">
              {deliveredOrdersCount} delivered successfully
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs">
              <span>{t.activeProducts}</span>
              <Package className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-extrabold text-stone-950 font-serif">
              {products.length}
            </div>
            <span className="text-[10px] text-stone-500">
              {slides.length} banners • {coupons.length} coupons
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-stone-200 gap-2 sm:gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.tabOverview}</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.tabProducts} ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.tabOrders} ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('slides')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'slides'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ব্যানার স্লাইডার' : 'Hero Banners'} ({slides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'coupons'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{t.tabCoupons} ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'গ্রাহক রিভিউ' : 'Reviews'} ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সাইট সেটিংস ও পেমেন্ট' : 'Site & Payment Settings'}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'Users'} ({users.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-sm text-stone-900">
                  {language === 'bn' ? 'সাম্প্রতিক কাস্টমার অর্ডার' : 'Recent Customer Orders'}
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-800 hover:underline font-semibold"
                >
                  View all ({orders.length})
                </button>
              </div>

              <div className="divide-y divide-stone-100 text-xs">
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900">{o.id}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-stone-600 mt-0.5 font-medium">
                        {o.shippingAddress.fullName} • {o.shippingAddress.phone}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate max-w-sm">
                        {o.shippingAddress.address}, {o.shippingAddress.district}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-serif font-bold text-stone-900">
                        {formatPrice(o.totalAmount)}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {o.orderStatus}
                      </span>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEditOrderModal(o)}
                          className="text-[10px] text-amber-800 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => onViewInvoice(o)}
                          className="text-[10px] text-stone-600 hover:underline"
                        >
                          Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Store Settings Summary */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-stone-900">
                  {language === 'bn' ? 'দ্রুত নিয়ন্ত্রণ' : 'Quick Actions'}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={openAddProductModal}
                    className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>+ {t.addNewProduct}</span>
                    <Package className="w-4 h-4 text-amber-700" />
                  </button>

                  <button
                    onClick={() => setActiveTab('products')}
                    className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>{language === 'bn' ? 'সকল পোশাক ম্যানেজ করুন' : 'Manage Dress Inventory'}</span>
                    <Layers className="w-4 h-4 text-stone-600" />
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>{language === 'bn' ? 'মার্চেন্ট পেমেন্ট নম্বর পরিবর্তন' : 'Change Merchant Numbers'}</span>
                    <Settings className="w-4 h-4 text-stone-600" />
                  </button>

                  <button
                    onClick={() => setActiveTab('slides')}
                    className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>{language === 'bn' ? 'ব্যানার স্লাইডার পরিবর্তন' : 'Update Hero Banners'}</span>
                    <ImageIcon className="w-4 h-4 text-stone-600" />
                  </button>
                </div>
              </div>

              {/* Active Gateway Information */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-stone-900">Active Payment Config</h4>
                <div className="space-y-1.5 text-stone-600">
                  <div className="flex justify-between">
                    <span>bKash Merchant:</span>
                    <strong className="font-mono text-pink-700">{settings.bkashMerchantNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Nagad Merchant:</span>
                    <strong className="font-mono text-orange-700">{settings.nagadMerchantNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Rocket Account:</span>
                    <strong className="font-mono text-purple-700">{settings.rocketMerchantNumber}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-100">
                    <span>Dhaka Delivery:</span>
                    <strong>{formatPrice(settings.dhakaDeliveryFee)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Outside Dhaka:</span>
                    <strong>{formatPrice(settings.outsideDhakaDeliveryFee)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRODUCTS MANAGEMENT (ADD, EDIT, DELETE, DUPLICATE, STOCK) */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <span>{t.tabProducts}</span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-sans font-bold px-2 py-0.5 rounded-full">
                    {filteredProducts.length} items
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'bn'
                    ? 'নতুন পোশাক যোগ করুন, যেকোনো তথ্য এডিট করুন, স্টক পরিবর্তন বা পোশাক মুছে ফেলুন'
                    : 'Add new dresses, edit prices/photos/sizes, duplicate variations, or delete products'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openAddProductModal}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addNewProduct}</span>
                </button>
              </div>
            </div>

            {/* Product Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by name, fabric, SKU..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                />
              </div>

              {/* Category Filter */}
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="men">Men's (পুরুষ)</option>
                <option value="women">Women's (মহিলা)</option>
                <option value="children">Children's (বাচ্চাদের)</option>
                <option value="festive">Festive / Eid</option>
              </select>

              {/* Stock Filter */}
              <select
                value={productStockFilter}
                onChange={(e) => setProductStockFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium outline-none cursor-pointer"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock (&gt; 5)</option>
                <option value="low_stock">Low Stock (1 - 5)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>

              {/* Sort By */}
              <select
                value={productSortBy}
                onChange={(e) => setProductSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium outline-none cursor-pointer"
              >
                <option value="newest">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
                <option value="stock_desc">Stock: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-500 font-medium">
                Showing {filteredProducts.length} of {products.length} products
              </span>
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                <button
                  onClick={() => setProductViewMode('grid')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    productViewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setProductViewMode('table')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    productViewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Table View
                </button>
              </div>
            </div>

            {/* PRODUCTS GRID VIEW */}
            {productViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-600 transition-all shadow-xs flex flex-col justify-between group"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                        <img
                          src={prod.images[0]}
                          alt={prod.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {prod.stock === 0 && (
                          <span className="absolute inset-0 bg-stone-900/70 text-white flex items-center justify-center text-[10px] font-bold text-center px-1">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-bold uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            {prod.category} • {prod.subCategory}
                          </span>
                          {prod.isFeatured && (
                            <span className="text-[9px] font-bold bg-stone-900 text-amber-300 px-1 rounded">
                              Featured
                            </span>
                          )}
                          {prod.isNewArrival && (
                            <span className="text-[9px] font-bold bg-emerald-600 text-white px-1 rounded">
                              New
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-stone-900 truncate" title={prod.titleEn}>
                          {prod.titleEn}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate" title={prod.titleBn}>
                          {prod.titleBn}
                        </p>
                        
                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-xs font-bold font-serif text-stone-950">
                            {formatPrice(prod.price)}
                          </span>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="text-[10px] text-stone-400 line-through">
                              {formatPrice(prod.originalPrice)}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 truncate">{prod.fabric}</p>
                      </div>
                    </div>

                    {/* Stock controls & action buttons */}
                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      {/* Stock Stepper */}
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-stone-500">Stock:</span>
                        <button
                          onClick={() => storageService.adjustStock(prod.id, -1)}
                          className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700"
                          title="-1 stock"
                        >
                          -
                        </button>
                        <span className={`font-mono font-bold text-xs px-1 ${prod.stock <= 5 ? 'text-rose-600' : 'text-stone-900'}`}>
                          {prod.stock}
                        </span>
                        <button
                          onClick={() => storageService.adjustStock(prod.id, 1)}
                          className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700"
                          title="+1 stock"
                        >
                          +
                        </button>
                      </div>

                      {/* Action buttons: Edit, Duplicate, Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicateProduct(prod)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditProductModal(prod)}
                          className="px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProductClick(prod)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PRODUCTS TABLE VIEW */}
            {productViewMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                      <th className="py-3">Dress Photo & Title</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Price</th>
                      <th className="py-3">Stock</th>
                      <th className="py-3">Sizes</th>
                      <th className="py-3">Fabric</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.titleEn}
                            className="w-12 h-14 object-cover rounded-lg border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-stone-900 truncate max-w-xs">{prod.titleEn}</div>
                            <div className="text-[11px] text-stone-500 truncate max-w-xs">{prod.titleBn}</div>
                            <span className="text-[10px] font-mono text-stone-400">{prod.sku}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] font-bold uppercase bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-3 font-serif font-bold text-stone-900">
                          {formatPrice(prod.price)}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => storageService.adjustStock(prod.id, -1)}
                              className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700"
                            >
                              -
                            </button>
                            <span className={`font-mono font-bold ${prod.stock <= 5 ? 'text-rose-600' : 'text-stone-900'}`}>
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => storageService.adjustStock(prod.id, 1)}
                              className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-[11px] text-stone-600">
                          {prod.sizes.join(', ')}
                        </td>
                        <td className="py-3 text-[11px] text-stone-500">
                          {prod.fabric}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProductClick(prod)}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ORDERS MANAGEMENT (FULL EDITING & LOGISTICS CONTROL) */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <span>{t.tabOrders}</span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-sans font-bold px-2 py-0.5 rounded-full">
                    {filteredOrders.length} orders
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'bn'
                    ? 'অর্ডারের ঠিকানা, ফোন নম্বর, কুরিয়ার ট্র্যাকিং ও পেমেন্ট স্ট্যাটাস কাস্টমাইজ করুন'
                    : 'Manage customer orders, modify shipping address, tracking numbers, and payment status'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by ID, name, phone..."
                    className="text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none w-56"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packaging">Packaging</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Payment Filter */}
                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none cursor-pointer"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>

                {/* Firestore Sync Refresh Button */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setOrdersLoading(true);
                      const fresh = await storageService.fetchAdminOrders();
                      setOrders(fresh);
                      onToast(language === 'bn' ? `Firestore থেকে ${fresh.length}টি অর্ডার লোড হয়েছে` : `Loaded ${fresh.length} orders from Firestore`, 'success');
                    } catch (e: any) {
                      onToast('Failed to load orders: ' + e?.message, 'error');
                    } finally {
                      setOrdersLoading(false);
                    }
                  }}
                  className="p-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="Refresh orders directly from Firestore"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin text-amber-700' : ''}`} />
                  <span className="hidden sm:inline">Firestore Sync</span>
                </button>
              </div>
            </div>

            {ordersError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Firestore Orders Warning: {ordersError}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3">Order ID & Date</th>
                    <th className="py-3">Customer & Destination</th>
                    <th className="py-3">Ordered Dresses</th>
                    <th className="py-3">Courier Logistics</th>
                    <th className="py-3">Total (৳)</th>
                    <th className="py-3">Payment</th>
                    <th className="py-3">Order Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="py-3 hover:bg-stone-50/60 transition-colors">
                        <td className="py-3">
                          <span className="font-mono font-bold text-stone-900 block">{ord.id}</span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3">
                          <div className="font-bold text-stone-900">{ord.shippingAddress.fullName}</div>
                          <a
                            href={`tel:${ord.shippingAddress.phone}`}
                            className="text-[11px] text-amber-800 font-mono hover:underline block"
                          >
                            {ord.shippingAddress.phone}
                          </a>
                          <div className="text-[10px] text-stone-400 truncate max-w-xs">
                            {ord.shippingAddress.address}, {ord.shippingAddress.district}
                          </div>
                        </td>

                        <td className="py-3">
                          <span className="font-semibold block">{ord.items.length} clothing item(s)</span>
                          <div className="text-[10px] text-stone-400 space-y-0.5">
                            {ord.items.map((i, idx) => (
                              <div key={idx} className="truncate max-w-[180px]">
                                {i.quantity}x {i.titleEn} ({i.size})
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3">
                          <span className="font-semibold block text-[11px] text-stone-900">
                            {ord.courierName || 'Steadfast'}
                          </span>
                          {ord.courierTrackingId ? (
                            <button
                              onClick={() => handleCopyTracking(ord.courierTrackingId!)}
                              className="font-mono text-[10px] text-amber-800 hover:underline flex items-center gap-1"
                              title="Click to copy tracking ID"
                            >
                              <span>{ord.courierTrackingId}</span>
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400">Tracking Pending</span>
                          )}
                        </td>

                        <td className="py-3 font-serif font-bold text-stone-900">
                          {formatPrice(ord.totalAmount)}
                        </td>

                        <td className="py-3">
                          <span className="uppercase text-[10px] font-bold block text-stone-600 mb-1">
                            {ord.paymentMethod}
                          </span>
                          <button
                            onClick={() => {
                              const newStatus: PaymentStatus = ord.paymentStatus === 'paid' ? 'unpaid' : 'paid';
                              storageService.updatePaymentStatus(ord.id, newStatus);
                              onToast(`Order #${ord.id} marked as ${newStatus.toUpperCase()}`, 'success');
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all shadow-2xs ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                                : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                            title="Click to toggle payment status"
                          >
                            {ord.paymentStatus.toUpperCase()}
                          </button>
                        </td>

                        <td className="py-3">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => {
                              storageService.updateOrderStatus(ord.id, e.target.value as OrderStatus);
                              onToast(`Order #${ord.id} status changed to ${e.target.value}`, 'success');
                            }}
                            className={`text-xs font-bold border rounded-lg px-2 py-1 outline-none cursor-pointer ${
                              ord.orderStatus === 'delivered'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : ord.orderStatus === 'shipped'
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : ord.orderStatus === 'packaging'
                                ? 'bg-purple-50 border-purple-300 text-purple-900'
                                : ord.orderStatus === 'confirmed'
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                                : ord.orderStatus === 'cancelled'
                                ? 'bg-rose-50 border-rose-300 text-rose-900'
                                : 'bg-amber-50 border-amber-300 text-amber-900'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packaging">Packaging</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditOrderModal(ord)}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-amber-50 hover:text-amber-800 text-stone-700 transition-colors"
                              title="Edit Order Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onViewInvoice(ord)}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
                              title="Print Invoice"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrderClick(ord)}
                              className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HERO BANNERS */}
        {/* ========================================================================= */}
        {activeTab === 'slides' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {language === 'bn' ? 'হোমপেজ ব্যানার স্লাইডার' : 'Homepage Hero Banners'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'bn'
                    ? 'হোমপেজের স্লাইডার ইমেজ, আকর্ষণীয় টাইটেল ও সাবটাইটেল পরিবর্তন করুন'
                    : 'Add or modify homepage banner carousels and promotional slides'}
                </p>
              </div>
              <button
                onClick={openAddSlideModal}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন ব্যানার যুক্ত করুন' : 'Add New Slide'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slides.map((s, index) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-xs flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-stone-900">
                    <img src={s.image} alt={s.titleEn} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950 uppercase">
                      Slide #{index + 1}
                    </span>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                      Target: {s.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      {s.badgeEn}
                    </span>
                    <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{s.titleEn}</h4>
                    <p className="text-xs text-stone-600 line-clamp-1">{s.titleBn}</p>
                    <p className="text-[11px] text-stone-400 line-clamp-2">{s.subtitleEn}</p>
                  </div>

                  <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => openEditSlideModal(s)}
                      className="font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Slide</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSlideClick(s)}
                      className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: COUPONS */}
        {/* ========================================================================= */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">{t.tabCoupons}</h3>
                <p className="text-xs text-stone-500">
                  Create and manage discount codes for Eid and special occasions
                </p>
              </div>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t.createCoupon}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-amber-50/40 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold text-amber-900 tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => storageService.toggleCouponActive(coupon.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                        coupon.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100'
                          : 'bg-stone-200 text-stone-600 hover:bg-emerald-100'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {language === 'bn' ? coupon.descriptionBn : coupon.descriptionEn}
                  </p>

                  <div className="text-[11px] text-stone-500 pt-2 border-t border-amber-200/60 flex justify-between items-center">
                    <div>
                      <span>Min: {formatPrice(coupon.minOrderValue)}</span> •{' '}
                      <strong className="text-amber-900 font-bold">
                        {coupon.discountValue}
                        {coupon.discountType === 'percentage' ? '%' : ' ৳'}
                      </strong>
                    </div>
                    <button
                      onClick={() => handleDeleteCouponClick(coupon)}
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CUSTOMER REVIEWS */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Customer Reviews Moderation ({reviews.length})
              </h3>
              <p className="text-xs text-stone-500">
                View buyer ratings, delete spam or unverified comments
              </p>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {reviews.map((rev) => (
                <div key={rev.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{rev.userName}</span>
                      <span className="text-amber-500 font-bold">★ {rev.rating}/5</span>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                          Verified
                        </span>
                      )}
                      <span className="text-stone-400 text-[10px]">{rev.date}</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed max-w-2xl">{rev.comment}</p>
                    <span className="text-[10px] text-stone-400">Product ID: {rev.productId}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteReviewClick(rev)}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SITE SETTINGS & PAYMENT GATEWAYS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-4 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {language === 'bn' ? 'ওয়েবসাইট, পেমেন্ট নম্বর ও লজিস্টিকস সেটিংস' : 'Website & Payment Configuration'}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'bn'
                  ? 'আপনার বিকাশ, নগদ, রকেট মার্চেন্ট নম্বর এবং ডেলিভারি ফি আপডেট করুন'
                  : 'Customize top bar announcement, helpline numbers, bKash/Nagad accounts & shipping fees'}
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              {/* Payment Merchant Numbers Section */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'bn' ? 'মার্চেন্ট পেমেন্ট নম্বর সমূহ' : 'Payment Accounts & Mobile Numbers'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-pink-700 mb-1">
                      bKash (বিকাশ) Merchant Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.bkashMerchantNumber}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bkashMerchantNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-orange-700 mb-1">
                      Nagad (নগদ) Merchant Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.nagadMerchantNumber}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, nagadMerchantNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-purple-700 mb-1">
                      Rocket (রকেট) Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.rocketMerchantNumber}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, rocketMerchantNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Fees & Threshold Section */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-700" />
                  <span>{language === 'bn' ? 'ডেলিভারি ফি ও ফ্রি শিপিং' : 'Delivery Charges (BDT)'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Inside Dhaka Delivery (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      value={settingsForm.dhakaDeliveryFee}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          dhakaDeliveryFee: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Outside Dhaka Delivery (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      value={settingsForm.outsideDhakaDeliveryFee}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          outsideDhakaDeliveryFee: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Free Shipping Min. Order (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      value={settingsForm.freeShippingThreshold}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          freeShippingThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Bar & Hotline */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-700" />
                  <span>Top Bar Announcement & Contacts</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Announcement Ticker (Bangla)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.announcementBn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, announcementBn: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Announcement Ticker (English)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.announcementEn}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, announcementEn: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Hotline Number</label>
                    <input
                      type="text"
                      value={settingsForm.hotline}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, hotline: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">WhatsApp Helpline</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, whatsapp: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save All Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: USERS MANAGEMENT (FIREBASE FIRESTORE RBAC) */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>{language === 'bn' ? 'ইউজার ম্যানেজমেন্ট ও এক্সেস কন্ট্রোল' : 'User Management & Role Control'}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'bn'
                    ? 'Firebase Authentication ও Firestore-এ নিবন্ধিত গ্রাহক ও অ্যাডমিনিস্ট্রেটরদের তালিকা'
                    : 'Manage customer and admin roles strictly verified via Firestore users/{uid} documents'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                  Total {users.length} Users
                </span>
                <button
                  onClick={() => {
                    openConfirmDialog(
                      'Sync / Seed to Firestore?',
                      'This will sync all initial products, coupons, settings, and hero slides into your live Firebase Firestore database.',
                      async () => {
                        await storageService.resetAllData();
                        onToast('All data successfully synced to Firestore!', 'success');
                      },
                      'Sync Now'
                    );
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors"
                >
                  ⚡ Sync Data to Firestore
                </button>
              </div>
            </div>

            {/* Firebase Connection Status Banner */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400">Firebase Backend Project</span>
                <p className="font-mono font-bold text-stone-900">minarul-fashion-house (Live)</p>
                <p className="text-stone-500 text-[11px]">Firestore Database • Firebase Auth • Cloud Storage Active</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Realtime Synchronized
                </span>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-bold">User / Profile</th>
                    <th className="pb-3 font-bold">Contact</th>
                    <th className="pb-3 font-bold">Role</th>
                    <th className="pb-3 font-bold">Address</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-500">
                        <UsersIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <p className="font-bold text-stone-700">No users found</p>
                        <p className="text-[11px] text-stone-400">New registered users will appear here automatically in real time.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900">{u.name}</p>
                              <p className="text-[10px] text-stone-400 font-mono">UID: {u.id.slice(0, 10)}...</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3">
                          <p className="text-stone-800 font-medium">{u.email || 'N/A'}</p>
                          <p className="text-stone-500 font-mono text-[11px]">{u.phone || 'N/A'}</p>
                        </td>

                        <td className="py-3">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950">
                              <ShieldCheck className="w-3 h-3" />
                              <span>ADMIN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                              CUSTOMER
                            </span>
                          )}
                        </td>

                        <td className="py-3 max-w-[200px] truncate text-stone-600">
                          {u.address ? `${u.address.district || ''}, ${u.address.division || ''}` : 'Not provided'}
                        </td>

                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.role === 'admin' ? (
                              <button
                                onClick={() => {
                                  openConfirmDialog(
                                    'Demote Admin?',
                                    `Are you sure you want to demote "${u.name}" to Customer role?`,
                                    async () => {
                                      await storageService.updateUserRole(u.id, 'customer');
                                      onToast(`Demoted ${u.name} to customer`, 'info');
                                    },
                                    'Demote'
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px] font-bold transition-colors"
                              >
                                Set Customer
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  openConfirmDialog(
                                    'Promote to Administrator?',
                                    `Are you sure you want to grant "${u.name}" Admin privileges? This will update their Firestore document role to "admin".`,
                                    async () => {
                                      await storageService.updateUserRole(u.id, 'admin');
                                      onToast(`Promoted ${u.name} to Admin!`, 'success');
                                    },
                                    'Promote'
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-colors"
                              >
                                Make Admin
                              </button>
                            )}

                            <button
                              onClick={() => {
                                openConfirmDialog(
                                  'Delete User?',
                                  `Are you sure you want to delete profile for "${u.name}"?`,
                                  async () => {
                                    await storageService.deleteUser(u.id);
                                    onToast('User profile deleted', 'info');
                                  }
                                );
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* IN-APP CONFIRMATION MODAL (Replaces window.confirm) */}
      {/* ========================================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex justify-center items-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-stone-500">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={closeConfirmDialog}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirmDialog();
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                {confirmModal.confirmLabel || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT ORDER MODAL */}
      {/* ========================================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden">
            <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Edit Order Details — {editingOrder.id}
                </h3>
                <p className="text-xs text-stone-500">
                  Update customer phone, destination address, delivery fee & courier
                </p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={orderCustomerName}
                    onChange={(e) => setOrderCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">District (জেলা) *</label>
                  <input
                    type="text"
                    required
                    value={orderDistrict}
                    onChange={(e) => setOrderDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Delivery Charge (৳) *</label>
                  <input
                    type="number"
                    required
                    value={orderDeliveryFee}
                    onChange={(e) => setOrderDeliveryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Delivery Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Courier Partner</label>
                  <select
                    value={orderCourierName}
                    onChange={(e) => setOrderCourierName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 bg-white"
                  >
                    <option value="Steadfast Courier">Steadfast Courier</option>
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="RedX Logistics">RedX Logistics</option>
                    <option value="Paperfly">Paperfly</option>
                    <option value="Sundarban Courier">Sundarban Courier</option>
                    <option value="SA Paribahan">SA Paribahan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Courier Tracking ID</label>
                  <input
                    type="text"
                    value={orderTrackingId}
                    onChange={(e) => setOrderTrackingId(e.target.value.toUpperCase())}
                    placeholder="e.g. STF-BD-98214"
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Order Notes / Instructions</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT PRODUCT MODAL */}
      {/* ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden my-6">
            <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingProduct ? t.editProduct : t.addNewProduct}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'bn'
                    ? 'পোশাকের নাম, দাম, ছবি, ফেব্রিক ও মাপ কাস্টমাইজ করুন'
                    : 'Configure product details, Bangladeshi sizing, and pricing'}
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.productNameEn} *</label>
                  <input
                    type="text"
                    required
                    value={prodTitleEn}
                    onChange={(e) => setProdTitleEn(e.target.value)}
                    placeholder="e.g. Royal Embroidered Panjabi - Maroon"
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.productNameBn} *</label>
                  <input
                    type="text"
                    required
                    value={prodTitleBn}
                    onChange={(e) => setProdTitleBn(e.target.value)}
                    placeholder="যেমন: রয়েল এমব্রয়ডারি জ্যাকার্ড পাঞ্জাবি"
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 bg-white"
                  >
                    <option value="men">Men's (পুরুষ)</option>
                    <option value="women">Women's (মহিলা)</option>
                    <option value="children">Children's (বাচ্চাদের)</option>
                    <option value="festive">Festive / Eid (ঈদ স্পেশাল)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Subcategory</label>
                  <select
                    value={prodSubCategory}
                    onChange={(e) => setProdSubCategory(e.target.value as SubCategoryType)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 bg-white"
                  >
                    <option value="panjabi">Panjabi & Kabli</option>
                    <option value="shirt">Shirts</option>
                    <option value="polo">Polo T-Shirts</option>
                    <option value="pant">Pants & Trousers</option>
                    <option value="saree">Saree</option>
                    <option value="three-piece">Three-Piece</option>
                    <option value="kurti">Kurti</option>
                    <option value="lehenga">Party Lehenga</option>
                    <option value="kids-panjabi">Kids Panjabi</option>
                    <option value="frock">Girls Frock</option>
                    <option value="baby-set">Toddler Set</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.price} (৳) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.originalPrice} (৳)</label>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.stock} Quantity *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.fabric} *</label>
                  <input
                    type="text"
                    required
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    placeholder="e.g. 100% Combed Jacquard Cotton"
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                {/* SIZES WITH QUICK CHIPS */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-stone-700">Available Sizes (Comma separated) *</label>
                    <span className="text-[10px] text-stone-400">Click preset chips below to auto-fill</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    placeholder="38, 40, 42, 44 or S, M, L, XL"
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SIZE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProdSizes(preset.value)}
                        className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IMAGE URL WITH FAST 1-CLICK PHOTO GALLERY PICKER & FIREBASE STORAGE UPLOAD */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-stone-700">Image URL (ছবির লিংক বা আপলোড) *</label>
                    <label className="cursor-pointer px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-800" />
                      <span>{isUploadingImage ? 'Uploading to Storage...' : 'Upload Image (Firebase Storage)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        className="hidden"
                        onChange={handleProductImageUpload}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="https://... or upload from device above"
                      className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono text-xs"
                    />
                    {prodImage && (
                      <img
                        src={prodImage}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-xl border border-stone-200 shrink-0"
                      />
                    )}
                  </div>

                  {/* 1-Click Fashion Photos Preset */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-700 block">
                      ⚡ Quick Photo Presets (Click any image to use instantly):
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {PRESET_CLOTHING_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProdImage(preset.url)}
                          className={`relative w-14 h-18 rounded-lg overflow-hidden border shrink-0 group ${
                            prodImage === preset.url ? 'ring-2 ring-amber-700 border-amber-700' : 'border-stone-200 hover:border-amber-400'
                          }`}
                          title={preset.name}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] truncate px-0.5 py-0.5 text-center">
                            {preset.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description Fields */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Description (English)</label>
                  <textarea
                    rows={2}
                    value={prodDescEn}
                    onChange={(e) => setProdDescEn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">বিবরণ (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={prodDescBn}
                    onChange={(e) => setProdDescBn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                {/* Flags */}
                <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={(e) => setProdIsFeatured(e.target.checked)}
                      className="w-4 h-4 accent-amber-700"
                    />
                    <span>Featured on Home (হোমপেজে ফিচার্ড)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={prodIsBestSeller}
                      onChange={(e) => setProdIsBestSeller(e.target.checked)}
                      className="w-4 h-4 accent-amber-700"
                    />
                    <span>Best Seller (বেস্ট সেলার)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={prodIsNewArrival}
                      onChange={(e) => setProdIsNewArrival(e.target.checked)}
                      className="w-4 h-4 accent-amber-700"
                    />
                    <span>New Arrival (নতুন কালেকশন)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold shadow-md"
                >
                  {t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: HERO SLIDE MODAL */}
      {/* ========================================================================= */}
      {showSlideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden">
            <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingSlide ? 'Edit Banner Slide' : 'Add New Hero Banner'}
              </h3>
              <button
                onClick={() => setShowSlideModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Badge (English)</label>
                  <input
                    type="text"
                    required
                    value={slideBadgeEn}
                    onChange={(e) => setSlideBadgeEn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">ব্যাজ (বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={slideBadgeBn}
                    onChange={(e) => setSlideBadgeBn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={slideTitleEn}
                    onChange={(e) => setSlideTitleEn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">শিরোনাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={slideTitleBn}
                    onChange={(e) => setSlideTitleBn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Subtitle (English)</label>
                  <input
                    type="text"
                    value={slideSubtitleEn}
                    onChange={(e) => setSlideSubtitleEn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">উপ-শিরোনাম (বাংলা)</label>
                  <input
                    type="text"
                    value={slideSubtitleBn}
                    onChange={(e) => setSlideSubtitleBn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-stone-700">Banner Background Image URL *</label>
                    <label className="cursor-pointer px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-800" />
                      <span>{isUploadingImage ? 'Uploading to Storage...' : 'Upload Image (Firebase Storage)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        className="hidden"
                        onChange={handleSlideImageUpload}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    required
                    value={slideImage}
                    onChange={(e) => setSlideImage(e.target.value)}
                    placeholder="https://... or upload from device above"
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Target Category Link</label>
                  <select
                    value={slideCategory}
                    onChange={(e) => setSlideCategory(e.target.value as CategoryType | 'all' | 'festive')}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 bg-white"
                  >
                    <option value="men">Men's Collection</option>
                    <option value="women">Women's Collection</option>
                    <option value="children">Children's Collection</option>
                    <option value="festive">Eid & Festive</option>
                    <option value="all">All Products</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowSlideModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: COUPON MODAL */}
      {/* ========================================================================= */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-stone-200 overflow-hidden">
            <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">{t.createCoupon}</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.couponCode} *</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BOISHAKH20"
                  className="w-full px-3 py-2 border rounded-xl border-stone-300 font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed BDT (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">{t.discountValue} *</label>
                  <input
                    type="number"
                    required
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">{t.minOrder} (৳)</label>
                <input
                  type="number"
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description (English)</label>
                <input
                  type="text"
                  value={newCouponDescEn}
                  onChange={(e) => setNewCouponDescEn(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">বিবরণ (বাংলা)</label>
                <input
                  type="text"
                  value={newCouponDescBn}
                  onChange={(e) => setNewCouponDescBn(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
