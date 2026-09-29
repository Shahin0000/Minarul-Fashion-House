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
  Users as UsersIcon,
  Loader2,
  Star,
  EyeOff,
  Flag
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { settingsService, EMPTY_WEBSITE_SETTINGS, EMPTY_PAYMENT_SETTINGS, EMPTY_LOGISTICS_SETTINGS } from '../../services/settingsService';
import { 
  Order, 
  Product, 
  Coupon, 
  OrderStatus, 
  PaymentStatus,
  CategoryType, 
  SubCategoryType,
  SiteSettings,
  WebsiteSettings,
  PaymentSettings,
  LogisticsSettings,
  HeroSlide,
  Review,
  ReviewReport,
  ProductColor,
  User
} from '../../types';
import { formatAuthError } from '../../utils/authErrors';
import { app, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { bangladeshDivisions, allBangladeshDistricts, normalizeDistrictName, FlatDistrict } from '../../data/bangladeshLocations';

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
  const [reviews, setReviews] = useState<Review[]>(() => storageService.getAllReviewsForAdmin());
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
      setReviews(storageService.getAllReviewsForAdmin());
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
  const [orderCustomerEmail, setOrderCustomerEmail] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderDistrict, setOrderDistrict] = useState('');
  const [orderCourierName, setOrderCourierName] = useState('');
  const [orderTrackingId, setOrderTrackingId] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderDeliveryFee, setOrderDeliveryFee] = useState(60);
  const [isLoadingCustomerProfile, setIsLoadingCustomerProfile] = useState(false);

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

  const openEditOrderModal = async (order: Order) => {
    setEditingOrder(order);
    setIsLoadingCustomerProfile(true);

    // Initial fallback population from order snapshot
    const initialName = (
      order.shippingAddress?.fullName ||
      (order.shippingAddress as any)?.name ||
      order.customerName ||
      ''
    ).trim();
    const initialPhone = (
      order.shippingAddress?.phone ||
      order.customerPhone ||
      ''
    ).trim();
    const initialEmail = (
      order.customerEmail ||
      order.shippingAddress?.email ||
      ''
    ).trim();
    const initialDistrict = (
      order.shippingAddress?.district ||
      (order as any).deliveryAddress?.district ||
      (order as any).district ||
      ''
    ).trim();
    const initialAddress = (
      order.shippingAddress?.address ||
      (order as any).deliveryAddress?.address ||
      ''
    ).trim();

    setOrderCustomerName(initialName);
    setOrderPhone(initialPhone);
    setOrderCustomerEmail(initialEmail);
    setOrderDistrict(initialDistrict);
    setOrderAddress(initialAddress);
    setOrderCourierName(order.courierName || 'Steadfast Courier');
    setOrderTrackingId(order.courierTrackingId || '');
    setOrderNotes(order.shippingAddress?.notes || '');
    setOrderDeliveryFee(order.deliveryCharge || 60);

    // Asynchronously fetch live order and users/{customerId} from Firestore
    try {
      let liveOrder = order;
      try {
        const orderRef = doc(db, 'orders', order.id);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          liveOrder = storageService.mapFirestoreOrder(orderSnap.id, orderSnap.data());
        }
      } catch (orderErr: any) {
        console.warn('Order document live read notice:', orderErr?.message);
      }

      const customerId = liveOrder.customerId || order.customerId;
      if (!customerId || !customerId.trim()) {
        console.error("Order customerId is missing");
        setIsLoadingCustomerProfile(false);
        return;
      }

      const userRef = doc(db, 'users', customerId.trim());
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn("Customer profile not found:", customerId);
      } else {
        const userData = userSnap.data();
        const uName = (userData.name || userData.displayName || '').trim();
        const uPhone = (userData.phone || userData.phoneNumber || (typeof userData.address === 'object' ? userData.address?.phone : '') || '').trim();
        const uEmail = (userData.email || (typeof userData.address === 'object' ? userData.address?.email : '') || '').trim();
        const uDistrict = (userData.district || (typeof userData.address === 'object' ? userData.address?.district : '') || '').trim();
        const uAddress = (typeof userData.address === 'string' ? userData.address : (userData.address?.address || '')).trim();

        // 1. Customer Name (Order delivery name takes priority if not empty or generic 'Customer')
        const orderNameVal = (liveOrder.shippingAddress?.fullName || (liveOrder.shippingAddress as any)?.name || liveOrder.customerName || '').trim();
        const resolvedName = (orderNameVal && orderNameVal.toLowerCase() !== 'customer') ? orderNameVal : (uName || orderNameVal || '');

        // 2. District Priority:
        // Priority 1: order.shippingAddress.district
        // Priority 2: order.deliveryAddress.district
        // Priority 3: userProfile.district
        const orderDistVal = (
          liveOrder.shippingAddress?.district ||
          (liveOrder as any).deliveryAddress?.district ||
          (liveOrder as any).district ||
          ''
        ).trim();
        const chosenDist = orderDistVal || uDistrict || '';
        const resolvedDistrict = chosenDist || '';

        // 3. Mobile Number Priority:
        // Priority 1: order.shippingAddress.phone
        // Priority 2: order.customerPhone
        // Priority 3: userProfile.phone
        const orderPhoneVal = (liveOrder.shippingAddress?.phone || liveOrder.customerPhone || '').trim();
        const resolvedPhone = orderPhoneVal || uPhone || '';

        // 4. Email Priority:
        // Priority 1: order.customerEmail || order.shippingAddress.email
        // Priority 2: userProfile.email
        const orderEmailVal = (liveOrder.customerEmail || liveOrder.shippingAddress?.email || '').trim();
        const resolvedEmail = orderEmailVal || uEmail || '';

        // 5. Address Priority:
        // Priority 1: order.shippingAddress.address
        // Priority 2: order.deliveryAddress.address
        // Priority 3: userProfile.address
        const orderAddrVal = (liveOrder.shippingAddress?.address || (liveOrder as any).deliveryAddress?.address || '').trim();
        const resolvedAddress = orderAddrVal || uAddress || '';

        setOrderCustomerName(resolvedName);
        setOrderPhone(resolvedPhone);
        setOrderCustomerEmail(resolvedEmail);
        setOrderDistrict(resolvedDistrict);
        setOrderAddress(resolvedAddress);
      }
    } catch (error: any) {
      console.error("ORDER CUSTOMER FETCH ERROR:", error?.code, error?.message);
    } finally {
      setIsLoadingCustomerProfile(false);
    }
  };

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
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
      customerName: orderCustomerName.trim(),
      customerPhone: orderPhone.trim(),
      customerEmail: orderCustomerEmail.trim(),
      shippingAddress: {
        ...editingOrder.shippingAddress,
        fullName: orderCustomerName.trim(),
        name: orderCustomerName.trim(),
        phone: orderPhone.trim(),
        email: orderCustomerEmail.trim() || undefined,
        address: orderAddress.trim(),
        district: orderDistrict.trim(),
        notes: orderNotes.trim() || undefined,
      },
      updatedAt: new Date().toISOString(),
    };

    try {
      await storageService.updateOrder(updated);
      setEditingOrder(null);
      onToast(
        language === 'bn' ? `অর্ডার #${updated.id} এর তথ্য সংরক্ষিত হয়েছে!` : `Order #${updated.id} updated!`,
        'success'
      );
    } catch (err: any) {
      console.error("ORDER UPDATE ERROR:", err);
      console.error("ERROR CODE:", err?.code);
      console.error("ERROR MESSAGE:", err?.message);
      onToast(`Order update failed: ${err?.message || err?.code || 'Permission denied'}`, 'error');
    }
  };

  const handleDeleteOrderClick = (order: Order) => {
    openConfirmDialog(
      language === 'bn' ? 'অর্ডার মুছে ফেলবেন?' : 'Delete Order?',
      language === 'bn'
        ? `আপনি কি নিশ্চিত #${order.id} অর্ডারটি সম্পূর্ণ মুছে ফেলতে চান? গ্রাহক: ${order.shippingAddress.fullName}`
        : `Are you sure you want to permanently delete order #${order.id} for ${order.shippingAddress.fullName}?`,
      async () => {
        try {
          await storageService.deleteOrder(order.id);
          onToast(
            language === 'bn' ? `অর্ডার #${order.id} মুছে ফেলা হয়েছে` : `Order #${order.id} deleted`,
            'info'
          );
        } catch (err: any) {
          console.error("ORDER UPDATE ERROR:", err);
          console.error("ERROR CODE:", err?.code);
          console.error("ERROR MESSAGE:", err?.message);
          onToast(`Delete failed: ${err?.message || err?.code || 'Permission denied'}`, 'error');
        }
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
  // 5. REVIEWS HANDLERS & MODERATION
  // =========================================================================
  const [reviewFilter, setReviewFilter] = useState<'all' | 'published' | 'pending' | 'hidden' | 'reported'>('all');
  const [reviewReports, setReviewReports] = useState<ReviewReport[]>([]);
  const [reviewLightboxUrl, setReviewLightboxUrl] = useState<string>('');
  const [reviewLightboxTitle, setReviewLightboxTitle] = useState<string>('');

  useEffect(() => {
    if (isAdmin && activeTab === 'reviews') {
      storageService.getReviewReports().then(setReviewReports).catch(() => {});
    }
  }, [isAdmin, activeTab]);

  const handlePublishReview = async (rev: Review) => {
    try {
      await storageService.updateReviewStatus(rev.id, 'published');
      onToast(language === 'bn' ? 'রিভিউটি পাবলিশ করা হয়েছে' : 'Review published', 'success');
    } catch {
      onToast('Failed to update review status', 'error');
    }
  };

  const handleHideReview = async (rev: Review) => {
    try {
      await storageService.updateReviewStatus(rev.id, 'hidden');
      onToast(language === 'bn' ? 'রিভিউটি হাইড করা হয়েছে' : 'Review hidden', 'info');
    } catch {
      onToast('Failed to hide review', 'error');
    }
  };

  const handleDeleteReviewClick = (rev: Review) => {
    openConfirmDialog(
      language === 'bn' ? 'রিভিউ মুছে ফেলবেন?' : 'Delete Review?',
      language === 'bn'
        ? `আপনি কি নিশ্চিত যে "${rev.customerName || rev.userName}"-এর রিভিউটি স্থায়ীভাবে মুছে ফেলতে চান?`
        : `Are you sure you want to permanently delete review by "${rev.customerName || rev.userName}"?`,
      async () => {
        try {
          await storageService.deleteReview(rev.id);
          onToast(language === 'bn' ? 'রিভিউ মুছে ফেলা হয়েছে' : 'Review removed', 'info');
        } catch {
          onToast('Failed to delete review', 'error');
        }
      }
    );
  };

  // =========================================================================
  // 6. STORE SETTINGS STATE & HANDLERS (PRIMARY SOURCE OF TRUTH: FIRESTORE)
  // =========================================================================
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsActiveSection, setSettingsActiveSection] = useState<'website' | 'payment' | 'logistics'>('website');
  const [websiteForm, setWebsiteForm] = useState<WebsiteSettings>(() => EMPTY_WEBSITE_SETTINGS);
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>(() => EMPTY_PAYMENT_SETTINGS);
  const [logisticsForm, setLogisticsForm] = useState<LogisticsSettings>(() => EMPTY_LOGISTICS_SETTINGS);

  const [isSavingWebsite, setIsSavingWebsite] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSavingLogistics, setIsSavingLogistics] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Load latest settings strictly from Firestore upon opening / authentication
  useEffect(() => {
    if (!isAdmin) return;
    let isMounted = true;
    setSettingsLoading(true);

    Promise.all([
      settingsService.getWebsiteSettings(true),
      settingsService.getPaymentSettings(true),
      settingsService.getLogisticsSettings(true),
    ])
      .then(([web, pay, log]) => {
        if (isMounted) {
          setWebsiteForm(web);
          setPaymentForm(pay);
          setLogisticsForm(log);
          setSettingsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Settings load error from Firestore:', err);
          onToast(err?.message || 'Settings লোড করতে সমস্যা হয়েছে', 'error');
          setSettingsLoading(false);
        }
      });

    // Real-time synchronization
    const unsub = settingsService.subscribe(() => {
      if (isMounted) {
        setWebsiteForm(settingsService.getCachedWebsiteSettings());
        setPaymentForm(settingsService.getCachedPaymentSettings());
        setLogisticsForm(settingsService.getCachedLogisticsSettings());
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [isAdmin]);

  // Section 1: Save Website Settings (settings/website)
  const handleSaveWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingWebsite || isSavingAll) return;
    try {
      setIsSavingWebsite(true);
      const verified = await settingsService.saveWebsiteSettings(websiteForm);
      setWebsiteForm(verified);
      onToast(
        language === 'bn' ? 'ওয়েবসাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Website settings saved & verified!',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to save website settings:', err);
      onToast(err?.message || 'Website settings সংরক্ষণ ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSavingWebsite(false);
    }
  };

  // Section 2: Save Payment Settings (settings/payment)
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingPayment || isSavingAll) return;
    try {
      setIsSavingPayment(true);
      const verified = await settingsService.savePaymentSettings(paymentForm);
      setPaymentForm(verified);
      onToast(
        language === 'bn' ? 'পেমেন্ট মার্চেন্ট নম্বর সফলভাবে সংরক্ষিত হয়েছে!' : 'Payment accounts saved & verified!',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to save payment settings:', err);
      onToast(err?.message || 'Payment settings সংরক্ষণ ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Section 3: Save Logistics Settings (settings/logistics)
  const handleSaveLogistics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingLogistics || isSavingAll) return;
    try {
      setIsSavingLogistics(true);
      const verified = await settingsService.saveLogisticsSettings(logisticsForm);
      setLogisticsForm(verified);
      onToast(
        language === 'bn' ? 'লজিস্টিকস ও ডেলিভারি সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Logistics settings saved & verified!',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to save logistics settings:', err);
      onToast(err?.message || 'Logistics settings সংরক্ষণ ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSavingLogistics(false);
    }
  };

  // Save All Settings
  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingAll) return;
    try {
      setIsSavingAll(true);
      const [vWeb, vPay, vLog] = await Promise.all([
        settingsService.saveWebsiteSettings(websiteForm),
        settingsService.savePaymentSettings(paymentForm),
        settingsService.saveLogisticsSettings(logisticsForm),
      ]);
      setWebsiteForm(vWeb);
      setPaymentForm(vPay);
      setLogisticsForm(vLog);
      onToast(
        language === 'bn' ? 'সকল সেটিংস সফলভাবে Firestore-এ সংরক্ষিত হয়েছে!' : 'All settings saved & verified in Firestore!',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to save all settings:', err);
      onToast(err?.message || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSavingAll(false);
    }
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
                            onClick={async () => {
                              const newStatus: PaymentStatus = ord.paymentStatus === 'paid' ? 'unpaid' : 'paid';
                              try {
                                await storageService.updatePaymentStatus(ord.id, newStatus);
                                onToast(`Order #${ord.id} marked as ${newStatus.toUpperCase()}`, 'success');
                              } catch (err: any) {
                                console.error("ORDER UPDATE ERROR:", err);
                                console.error("ERROR CODE:", err?.code);
                                console.error("ERROR MESSAGE:", err?.message);
                                onToast(`Payment update failed: ${err?.message || err?.code || 'Permission denied'}`, 'error');
                              }
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
                          <div className="flex items-center gap-1.5">
                            {ord.orderStatus === 'pending' && (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await storageService.updateOrderStatus(ord.id, 'confirmed');
                                    onToast(
                                      language === 'bn'
                                        ? `অর্ডার #${ord.id} সফলভাবে কনফার্ম করা হয়েছে!`
                                        : `Order #${ord.id} confirmed successfully!`,
                                      'success'
                                    );
                                  } catch (err: any) {
                                    console.error("ORDER UPDATE ERROR:", err);
                                    console.error("ERROR CODE:", err?.code);
                                    console.error("ERROR MESSAGE:", err?.message);
                                    onToast(`Order confirmation failed: ${err?.message || err?.code || 'Permission denied'}`, 'error');
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                                title="Confirm this customer order"
                              >
                                <Check className="w-3 h-3" />
                                <span>{language === 'bn' ? 'কনফার্ম' : 'Confirm'}</span>
                              </button>
                            )}
                            <select
                              value={ord.orderStatus}
                              onChange={async (e) => {
                                const newStatus = e.target.value as OrderStatus;
                                try {
                                  await storageService.updateOrderStatus(ord.id, newStatus);
                                  onToast(`Order #${ord.id} status changed to ${newStatus}`, 'success');
                                } catch (err: any) {
                                  console.error("ORDER UPDATE ERROR:", err);
                                  console.error("ERROR CODE:", err?.code);
                                  console.error("ERROR MESSAGE:", err?.message);
                                  onToast(`Order update failed: ${err?.message || err?.code || 'Permission denied'}`, 'error');
                                }
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
                          </div>
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
        {/* TAB 6: CUSTOMER REVIEWS & MODERATION */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (() => {
          const publishedCount = reviews.filter((r) => r.status === 'published' || !r.status).length;
          const pendingCount = reviews.filter((r) => r.status === 'pending').length;
          const hiddenCount = reviews.filter((r) => r.status === 'hidden').length;
          const reportedReviewIds = new Set(reviewReports.map((rp) => rp.reviewId));
          const reportedCount = reviews.filter((r) => reportedReviewIds.has(r.id)).length;
          
          const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
          const overallAvgRating = reviews.length > 0 ? (totalRatingSum / reviews.length).toFixed(1) : '5.0';

          const filteredReviews = reviews.filter((rev) => {
            if (reviewFilter === 'published') return rev.status === 'published' || !rev.status;
            if (reviewFilter === 'pending') return rev.status === 'pending';
            if (reviewFilter === 'hidden') return rev.status === 'hidden';
            if (reviewFilter === 'reported') return reportedReviewIds.has(rev.id);
            return true;
          });

          return (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    Customer Reviews & Rating Moderation ({reviews.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Moderate verified buyer feedback, customer product photos, and customer ratings
                  </p>
                </div>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Total</span>
                  <span className="text-lg font-bold text-stone-900 font-mono">{reviews.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Published</span>
                  <span className="text-lg font-bold text-emerald-900 font-mono">{publishedCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending</span>
                  <span className="text-lg font-bold text-amber-900 font-mono">{pendingCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-300 text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-600 block">Hidden</span>
                  <span className="text-lg font-bold text-stone-700 font-mono">{hiddenCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Reported</span>
                  <span className="text-lg font-bold text-rose-900 font-mono">{reportedCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Avg Rating</span>
                  <span className="text-lg font-bold text-amber-900 font-mono flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500 inline" />
                    <span>{overallAvgRating}</span>
                  </span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-stone-100 pb-3">
                {[
                  { key: 'all', label: 'All Reviews', count: reviews.length },
                  { key: 'published', label: 'Published', count: publishedCount },
                  { key: 'pending', label: 'Pending', count: pendingCount },
                  { key: 'hidden', label: 'Hidden', count: hiddenCount },
                  { key: 'reported', label: 'Reported', count: reportedCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setReviewFilter(tab.key as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      reviewFilter === tab.key
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      reviewFilter === tab.key ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    No reviews found matching the selected filter ({reviewFilter}).
                  </div>
                ) : (
                  filteredReviews.map((rev) => {
                    const matchedProduct = products.find((p) => p.id === rev.productId);
                    const photos = rev.reviewImages && rev.reviewImages.length > 0 
                      ? rev.reviewImages 
                      : rev.reviewImage ? [rev.reviewImage] : [];
                    const isReported = reportedReviewIds.has(rev.id);
                    const currentStatus = rev.status || 'published';

                    return (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 transition-all space-y-3.5 shadow-2xs"
                      >
                        {/* Top row: Customer, Rating, Badges, Moderation actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/60">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-stone-900 text-sm">
                                {rev.customerName || rev.userName}
                              </span>
                              {rev.customerEmail && (
                                <span className="text-xs text-stone-500">
                                  ({rev.customerEmail})
                                </span>
                              )}
                              {rev.verifiedPurchase && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Verified Buyer</span>
                                </span>
                              )}
                              {isReported && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                                  <Flag className="w-3 h-3 text-rose-600" />
                                  <span>Reported</span>
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                currentStatus === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : currentStatus === 'pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-stone-200 text-stone-700'
                              }`}>
                                {currentStatus}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-stone-400">
                              <span>Date: <strong className="text-stone-600">{rev.date}</strong></span>
                              {rev.orderId && (
                                <>
                                  <span>•</span>
                                  <span>Order: <strong className="font-mono text-stone-700">{rev.orderId}</strong></span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Moderation Action Buttons */}
                          <div className="flex items-center gap-2">
                            {currentStatus !== 'published' && (
                              <button
                                type="button"
                                onClick={() => handlePublishReview(rev)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Publish</span>
                              </button>
                            )}

                            {currentStatus === 'published' && (
                              <button
                                type="button"
                                onClick={() => handleHideReview(rev)}
                                className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteReviewClick(rev)}
                              className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Review Permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Product reference & Stars */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          {matchedProduct ? (
                            <div className="flex items-center gap-2.5">
                              <img
                                src={matchedProduct.images[0] || ''}
                                alt={matchedProduct.titleEn}
                                className="w-9 h-11 object-cover rounded-lg border border-stone-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="font-bold text-stone-900 truncate">
                                  {language === 'bn' ? matchedProduct.titleBn : matchedProduct.titleEn}
                                </h5>
                                <span className="text-[10px] font-mono text-stone-400">
                                  Code: {matchedProduct.id} • {matchedProduct.category}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400 text-xs font-mono">
                              Product ID: {rev.productId}
                            </span>
                          )}

                          {/* Star Rating */}
                          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60 self-start sm:self-center">
                            <div className="flex gap-0.5 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-amber-900 text-xs font-mono">
                              {rev.rating}.0 / 5.0
                            </span>
                          </div>
                        </div>

                        {/* Review text */}
                        <p className="text-xs text-stone-800 leading-relaxed bg-white p-3 rounded-xl border border-stone-200/70">
                          {rev.reviewText || rev.comment}
                        </p>

                        {/* Customer Uploaded Photos */}
                        {photos.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] uppercase font-bold text-stone-500 block">
                              Customer Photos ({photos.length}):
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {photos.map((imgUrl, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => {
                                    setReviewLightboxUrl(imgUrl);
                                    setReviewLightboxTitle(
                                      `Review by ${rev.customerName || rev.userName} (${matchedProduct?.titleEn || rev.productId})`
                                    );
                                  }}
                                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300 hover:border-amber-600 bg-stone-100 hover:opacity-90 hover:scale-105 transition-all shadow-2xs group cursor-pointer"
                                >
                                  <img
                                    src={imgUrl}
                                    alt="Review uploaded photo"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <ImageIcon className="w-4 h-4 text-white" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB 7: SITE SETTINGS & PAYMENT GATEWAYS (PRIMARY SOURCE: FIRESTORE) */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {language === 'bn' ? 'ওয়েবসাইট, পেমেন্ট নম্বর ও লজিস্টিকস সেটিংস' : 'Website, Payment & Logistics Configuration'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'bn'
                    ? 'Firestore-এর settings/website, settings/payment এবং settings/logistics ডকুমেন্ট থেকে সরাসরি সংরক্ষিত ও আপডেট হয়।'
                    : 'Directly synchronized with Firestore settings/website, settings/payment, and settings/logistics documents.'}
                </p>
              </div>

              {/* Sub-tab navigation */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl self-start sm:self-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSettingsActiveSection('website')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    settingsActiveSection === 'website'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🌐 {language === 'bn' ? 'ওয়েবসাইট' : 'Website'}
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsActiveSection('payment')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    settingsActiveSection === 'payment'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  💳 {language === 'bn' ? 'পেমেন্ট নম্বর' : 'Payments'}
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsActiveSection('logistics')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    settingsActiveSection === 'logistics'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🚚 {language === 'bn' ? 'লজিস্টিকস ও কুরিয়ার' : 'Logistics'}
                </button>
              </div>
            </div>

            {/* Loading Indicator */}
            {settingsLoading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
                <p className="text-xs font-semibold text-stone-600">
                  {language === 'bn' ? 'Firestore থেকে সেটিংস লোড হচ্ছে...' : 'Loading settings from Firestore...'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ------------------------------------------------------------- */}
                {/* SECTION 1: WEBSITE SETTINGS (settings/website) */}
                {/* ------------------------------------------------------------- */}
                {settingsActiveSection === 'website' && (
                  <form onSubmit={handleSaveWebsite} className="space-y-5 text-xs">
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-amber-700" />
                          <span>{language === 'bn' ? 'সাধারণ ওয়েবসাইট সেটিংস (settings/website)' : 'Website Identity & Basic Details'}</span>
                        </h4>
                        <span className="text-[11px] font-mono text-stone-500">Firestore: settings/website</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'ওয়েবসাইটের নাম (Site Name) *' : 'Site Name *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={websiteForm.siteName}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, siteName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold"
                            placeholder="MINARUL FASHION HOUSE"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'ওয়েবসাইট বিবরণ (Description)' : 'Site Description'}
                          </label>
                          <textarea
                            rows={2}
                            value={websiteForm.siteDescription}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, siteDescription: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                            placeholder="Short description of your fashion brand..."
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'লোগো ইমেজ লিঙ্ক (Logo URL)' : 'Logo Image URL'}
                          </label>
                          <input
                            type="url"
                            value={websiteForm.logo}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, logo: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono"
                            placeholder="https://.../logo.png"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'হটলাইন ফোন নম্বর (Phone)' : 'Hotline Phone'}
                          </label>
                          <input
                            type="text"
                            value={websiteForm.phone}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, phone: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono"
                            placeholder="+880 1712-345678"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর (WhatsApp)' : 'WhatsApp Number'}
                          </label>
                          <input
                            type="text"
                            value={websiteForm.whatsapp}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, whatsapp: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono"
                            placeholder="+880 1712-345678"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'সাপোর্ট ইমেইল (Email)' : 'Support Email'}
                          </label>
                          <input
                            type="email"
                            value={websiteForm.email}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, email: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                            placeholder="support@minarulfashion.com"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'শোরুম / স্টোর ঠিকানা (Address)' : 'Store Address'}
                          </label>
                          <textarea
                            rows={2}
                            value={websiteForm.address}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, address: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                            placeholder="লেভেল ৩, শপিং কমপ্লেক্স, ধানমন্ডি ২৭, ঢাকা-১২০৯"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            Facebook Page Link
                          </label>
                          <input
                            type="text"
                            value={websiteForm.facebook}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, facebook: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                            placeholder="https://facebook.com/minarulfashion"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            Instagram Profile Link
                          </label>
                          <input
                            type="text"
                            value={websiteForm.instagram}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, instagram: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                            placeholder="https://instagram.com/minarulfashion"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'টপ বার ঘোষণা (বাংলা)' : 'Announcement Ticker (Bangla)'}
                          </label>
                          <input
                            type="text"
                            value={websiteForm.announcementBn || ''}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, announcementBn: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'টপ বার ঘোষণা (English)' : 'Announcement Ticker (English)'}
                          </label>
                          <input
                            type="text"
                            value={websiteForm.announcementEn || ''}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, announcementEn: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingWebsite}
                        className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {isSavingWebsite ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to Firestore...'}</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{language === 'bn' ? 'ওয়েবসাইট সেটিংস সেভ করুন' : 'Save Website Settings'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SECTION 2: PAYMENT SETTINGS (settings/payment) */}
                {/* ------------------------------------------------------------- */}
                {settingsActiveSection === 'payment' && (
                  <form onSubmit={handleSavePayment} className="space-y-5 text-xs">
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-700" />
                          <span>{language === 'bn' ? 'পেমেন্ট মার্চেন্ট নম্বর সমূহ (settings/payment)' : 'Merchant Payment Accounts'}</span>
                        </h4>
                        <span className="text-[11px] font-mono text-stone-500">Firestore: settings/payment</span>
                      </div>

                      <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200/80 leading-relaxed">
                        ⚠️ <strong>{language === 'bn' ? 'গুরুত্বপূর্ণ নিয়ম:' : 'Important Rule:'}</strong>{' '}
                        {language === 'bn'
                          ? 'এখানে যে নম্বরটি দিবেন সেটাই ওয়েবসাইটে চেকআউটে প্রদর্শিত হবে। কোনো নম্বর ফাঁকা রাখলে চেকআউটে কোনো ডিফল্ট বা ভুয়া নম্বর আসবে না।'
                          : 'Numbers saved here are the primary source of truth for the entire website. If left blank, no fake default number will be displayed at checkout.'}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* bKash */}
                        <div className="p-4 bg-white rounded-xl border border-pink-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-pink-700">🌸 bKash (বিকাশ)</span>
                            <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                              <input
                                type="checkbox"
                                checked={paymentForm.bkash.enabled}
                                onChange={(e) =>
                                  setPaymentForm({
                                    ...paymentForm,
                                    bkash: { ...paymentForm.bkash, enabled: e.target.checked },
                                  })
                                }
                                className="accent-pink-600 rounded"
                              />
                              <span className="text-stone-600">{paymentForm.bkash.enabled ? 'Active' : 'Disabled'}</span>
                            </label>
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold">
                              Merchant / Personal Number:
                            </label>
                            <input
                              type="text"
                              value={paymentForm.bkash.number}
                              onChange={(e) =>
                                setPaymentForm({
                                  ...paymentForm,
                                  bkash: { ...paymentForm.bkash, number: e.target.value },
                                })
                              }
                              placeholder="01XXXXXXXXX"
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold text-stone-900"
                            />
                          </div>
                        </div>

                        {/* Nagad */}
                        <div className="p-4 bg-white rounded-xl border border-orange-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-orange-700">🟠 Nagad (নগদ)</span>
                            <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                              <input
                                type="checkbox"
                                checked={paymentForm.nagad.enabled}
                                onChange={(e) =>
                                  setPaymentForm({
                                    ...paymentForm,
                                    nagad: { ...paymentForm.nagad, enabled: e.target.checked },
                                  })
                                }
                                className="accent-orange-600 rounded"
                              />
                              <span className="text-stone-600">{paymentForm.nagad.enabled ? 'Active' : 'Disabled'}</span>
                            </label>
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold">
                              Merchant / Personal Number:
                            </label>
                            <input
                              type="text"
                              value={paymentForm.nagad.number}
                              onChange={(e) =>
                                setPaymentForm({
                                  ...paymentForm,
                                  nagad: { ...paymentForm.nagad, number: e.target.value },
                                })
                              }
                              placeholder="01XXXXXXXXX"
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold text-stone-900"
                            />
                          </div>
                        </div>

                        {/* Rocket */}
                        <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-700">🟣 Rocket (রকেট)</span>
                            <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                              <input
                                type="checkbox"
                                checked={paymentForm.rocket.enabled}
                                onChange={(e) =>
                                  setPaymentForm({
                                    ...paymentForm,
                                    rocket: { ...paymentForm.rocket, enabled: e.target.checked },
                                  })
                                }
                                className="accent-purple-600 rounded"
                              />
                              <span className="text-stone-600">{paymentForm.rocket.enabled ? 'Active' : 'Disabled'}</span>
                            </label>
                          </div>
                          <div>
                            <label className="block text-stone-600 mb-1 font-semibold">
                              Account Number:
                            </label>
                            <input
                              type="text"
                              value={paymentForm.rocket.number}
                              onChange={(e) =>
                                setPaymentForm({
                                  ...paymentForm,
                                  rocket: { ...paymentForm.rocket, number: e.target.value },
                                })
                              }
                              placeholder="01XXXXXXXXX-X"
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold text-stone-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingPayment}
                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {isSavingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to Firestore...'}</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{language === 'bn' ? 'পেমেন্ট নম্বর সেভ করুন' : 'Save Payment Accounts'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SECTION 3: LOGISTICS SETTINGS (settings/logistics) */}
                {/* ------------------------------------------------------------- */}
                {settingsActiveSection === 'logistics' && (
                  <form onSubmit={handleSaveLogistics} className="space-y-5 text-xs">
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-amber-700" />
                          <span>{language === 'bn' ? 'ডেলিভারি ফি ও কুরিয়ার সেটিংস (settings/logistics)' : 'Logistics, Shipping Rates & Courier'}</span>
                        </h4>
                        <span className="text-[11px] font-mono text-stone-500">Firestore: settings/logistics</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'ঢাকার ভেতরে ডেলিভারি চার্জ (৳) *' : 'Inside Dhaka Delivery Charge (BDT) *'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={logisticsForm.deliveryChargeInsideDhaka}
                            onChange={(e) =>
                              setLogisticsForm({
                                ...logisticsForm,
                                deliveryChargeInsideDhaka: Number(e.target.value),
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'ঢাকার বাইরে ডেলিভারি চার্জ (৳) *' : 'Outside Dhaka Delivery Charge (BDT) *'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={logisticsForm.deliveryChargeOutsideDhaka}
                            onChange={(e) =>
                              setLogisticsForm({
                                ...logisticsForm,
                                deliveryChargeOutsideDhaka: Number(e.target.value),
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'ফ্রি শিপিং নূন্যতম অর্ডার (৳) *' : 'Free Shipping Minimum Order (BDT) *'}
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={logisticsForm.freeShippingThreshold}
                            onChange={(e) =>
                              setLogisticsForm({
                                ...logisticsForm,
                                freeShippingThreshold: Number(e.target.value),
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block font-bold text-stone-700 mb-1">
                            {language === 'bn' ? 'ডিফল্ট কুরিয়ার পার্টনার (Default Courier)' : 'Default Courier Partner'}
                          </label>
                          <select
                            value={logisticsForm.defaultCourier}
                            onChange={(e) =>
                              setLogisticsForm({ ...logisticsForm, defaultCourier: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                          >
                            <option value="Steadfast">Steadfast Courier</option>
                            <option value="Pathao">Pathao Courier</option>
                            <option value="RedX">RedX Logistics</option>
                            <option value="Paperfly">Paperfly</option>
                            <option value="Sundarban">Sundarban Courier</option>
                            <option value="SA Paribahan">SA Paribahan</option>
                          </select>
                        </div>
                      </div>

                      {/* Courier Services Active List */}
                      <div className="pt-2">
                        <label className="block font-bold text-stone-700 mb-2">
                          {language === 'bn' ? 'সক্রিয় কুরিয়ার সার্ভিস সমূহ (Courier Services):' : 'Supported Courier Services:'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {logisticsForm.courierServices.map((c, idx) => (
                            <label
                              key={c.name}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                                c.enabled ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-stone-200'
                              }`}
                            >
                              <span className="font-semibold text-stone-800">{c.name}</span>
                              <input
                                type="checkbox"
                                checked={c.enabled}
                                onChange={(e) => {
                                  const updated = [...logisticsForm.courierServices];
                                  updated[idx] = { ...updated[idx], enabled: e.target.checked };
                                  setLogisticsForm({ ...logisticsForm, courierServices: updated });
                                }}
                                className="accent-amber-600 rounded"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingLogistics}
                        className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {isSavingLogistics ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to Firestore...'}</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{language === 'bn' ? 'লজিস্টিকস সেটিংস সেভ করুন' : 'Save Logistics Settings'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Save All Settings Global Bar */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                  <div className="text-xs text-stone-600">
                    💡 <strong>{language === 'bn' ? 'টিপ্স:' : 'Tip:'}</strong>{' '}
                    {language === 'bn'
                      ? 'যেকোনো একটি সেকশন অথবা এক ক্লিকে একবারে সব সেটিংস Firestore-এ সেভ করতে পারেন।'
                      : 'You can save individual sections or click Save All to update all 3 documents simultaneously.'}
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAllSettings}
                    disabled={isSavingAll || isSavingWebsite || isSavingPayment || isSavingLogistics}
                    className="px-7 py-3 bg-stone-900 hover:bg-black text-amber-300 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    {isSavingAll ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>{language === 'bn' ? 'সব সেটিংস সেভ হচ্ছে...' : 'Saving All Settings...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'bn' ? 'এক ক্লিকে সব সেটিংস সংরক্ষণ করুন' : 'Save All Settings (Batch)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
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
                <p className="font-mono font-bold text-stone-900">{app.options.projectId || 'minarul-fashion-house-f5101'} (Live)</p>
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
              {isLoadingCustomerProfile && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold animate-pulse border border-amber-200/80">
                  <Clock className="w-4 h-4 animate-spin text-amber-700" />
                  <span>Loading customer information... (গ্রাহকের তথ্য লোড হচ্ছে...)</span>
                </div>
              )}

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
                  <label className="block font-bold text-stone-700 mb-1">Email (ইমেইল)</label>
                  <input
                    type="email"
                    value={orderCustomerEmail}
                    onChange={(e) => setOrderCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 border rounded-xl border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">District (জেলা) *</label>
                  <select
                    required
                    value={orderDistrict}
                    onChange={(e) => setOrderDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-stone-300 bg-white"
                  >
                    <option value="">-- জেলা নির্বাচন করুন (Select District) --</option>
                    {orderDistrict &&
                      !bangladeshDivisions.some((div) =>
                        div.districts.some(
                          (d) =>
                            d.nameBn === orderDistrict ||
                            d.nameBn.replace(/\s+সিটি$/, '').trim() === orderDistrict ||
                            d.nameEn.split('(')[0].trim().replace(/\s+City$/i, '').toLowerCase() === orderDistrict.toLowerCase()
                        )
                      ) && <option value={orderDistrict}>{orderDistrict}</option>}
                    {bangladeshDivisions.map((div) => (
                      <optgroup key={div.id} label={`${div.nameEn} (${div.nameBn})`}>
                        {div.districts.map((d) => {
                          const cleanBn = d.nameBn.replace(/\s+সিটি$/, '').trim();
                          const cleanEn = d.nameEn.split('(')[0].trim().replace(/\s+City$/i, '');
                          const optionValue =
                            orderDistrict && orderDistrict.toLowerCase() === cleanEn.toLowerCase()
                              ? orderDistrict
                              : orderDistrict && orderDistrict === cleanBn
                              ? cleanBn
                              : cleanBn;
                          return (
                            <option key={d.id} value={optionValue}>
                              {cleanBn} ({cleanEn})
                            </option>
                          );
                        })}
                      </optgroup>
                    ))}
                  </select>
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

      {/* Review Photo Lightbox Modal */}
      <ImageLightboxModal
        isOpen={Boolean(reviewLightboxUrl)}
        onClose={() => setReviewLightboxUrl('')}
        imageUrl={reviewLightboxUrl}
        title={reviewLightboxTitle}
      />
    </div>
  );
};
