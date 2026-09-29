import { Product, Order, Coupon, Review, ReviewReport, User, SiteSettings, HeroSlide } from '../types';
import { initialProducts, initialCoupons } from '../data/productsData';
import { auth, db, storage } from '../firebase';
import { 
  settingsService, 
  EMPTY_WEBSITE_SETTINGS, 
  EMPTY_PAYMENT_SETTINGS, 
  EMPTY_LOGISTICS_SETTINGS 
} from './settingsService';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const STORAGE_KEYS = {
  PRODUCTS: 'mfh_products_v1',
  ORDERS: 'mfh_orders_v1',
  COUPONS: 'mfh_coupons_v1',
  REVIEWS: 'mfh_reviews_v1',
  CART: 'mfh_cart_v1',
  WISHLIST: 'mfh_wishlist_v1',
  CURRENT_USER: 'mfh_user_v1',
  SETTINGS: 'mfh_settings_v1',
  HERO_SLIDES: 'mfh_hero_slides_v1',
  USERS: 'mfh_users_v1',
};

const defaultSettings: SiteSettings = {
  announcementEn: '🌟 Eid & Festive Special Offer: Up to 35% OFF! Free Delivery across Bangladesh on orders over ৳2,500',
  announcementBn: '🌟 ঈদ ও উৎসব স্পেশাল অফার: ৩৫% পর্যন্ত ছাড়! সারা বাংলাদেশে ২,৫০০ টাকার অর্ডারে ফ্রি ডেলিভারি',
  hotline: '+880 1712-345678',
  whatsapp: '+880 1712-345678',
  supportEmail: 'support@minarulfashion.com',
  bkashMerchantNumber: '01712-345678',
  nagadMerchantNumber: '01712-345678',
  rocketMerchantNumber: '01712-345678',
  dhakaDeliveryFee: 60,
  outsideDhakaDeliveryFee: 120,
  freeShippingThreshold: 2500,
  flagshipAddressEn: 'Flagship Store: Level 3, Shopping Complex, Dhanmondi 27, Dhaka-1209',
  flagshipAddressBn: 'প্রধান শোরুম: লেভেল ৩, শপিং কমপ্লেক্স, ধানমন্ডি ২৭, ঢাকা-১২০৯',
};

const defaultHeroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    badgeEn: 'EID & FESTIVE 2026',
    badgeBn: 'ঈদ ও উৎসব কালেকশন ২০২৬',
    titleEn: 'Royal Panjabi & Kabli Collection',
    titleBn: 'অভিজাত রাজকীয় পাঞ্জাবি ও কাবলি কালেকশন',
    subtitleEn: 'Handcrafted zari embroidery, combed jacquard cotton, and tailored perfection for Bangladeshi gentlemen.',
    subtitleBn: 'খাঁটি জ্যাকার্ড ও কোম্বড কটন কাপড়ে নিখুঁত এমব্রয়ডারি হাতের কাজ। আভিজাত্যের অনন্য প্রকাশ।',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
    category: 'men',
    isActive: true,
  },
  {
    id: 'slide-2',
    badgeEn: 'HERITAGE WEAVES',
    badgeBn: 'ঐতিহ্যবাহী জামদানি সমাহার',
    titleEn: 'Authentic Dhakai Jamdani & Silk Sarees',
    titleBn: 'খাঁটি ঢাকাই জামদানি ও সিল্ক শাড়ির মোহময় সাজ',
    subtitleEn: 'Timeless floral jaal patterns woven by master artisans. Graceful three-pieces & designer festive wear.',
    subtitleBn: 'নিখুঁত কারুকাজ ও খাঁটি সুতোয় বোনা মনোমুগ্ধকর ঐতিহ্যবাহী শাড়ি এবং আকর্ষণীয় থ্রি-পিস সেট।',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
    category: 'women',
    isActive: true,
  },
  {
    id: 'slide-3',
    badgeEn: 'LITTLE PRINCES & PRINCESSES',
    badgeBn: 'বাচ্চাদের রঙিন উৎসব',
    titleEn: 'Comfortable & Vibrant Kids Festive Attire',
    titleBn: 'শিশুদের আরামদায়ক ও ঝলমলে পার্টি পোশাক',
    subtitleEn: 'Breathable combed cotton Panjabis, fairy frocks, and joyful toddler sets designed for gentle skin.',
    subtitleBn: 'ছোট্ট সোনামণিদের জন্য নরম আরামদায়ক সুতি পাঞ্জাবি, রাজকীয় ফ্রক এবং পার্টি লেহেঙ্গা।',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1600&q=85',
    category: 'children',
    isActive: true,
  },
];

const initialReviews: Review[] = [
  {
    id: 'rev-01',
    productId: 'prod-m-01',
    userName: 'Tanvir Ahmed',
    userPhoneMasked: '01712***456',
    rating: 5,
    comment: 'অসাধারণ ফেব্রিক কোয়ালিটি! সাইজ ৪২ একদম পারফেক্ট হয়েছে। ঈদের জন্য পারফেক্ট পাঞ্জাবি।',
    date: '2026-09-20',
    verifiedPurchase: true,
  },
  {
    id: 'rev-02',
    productId: 'prod-w-01',
    userName: 'Nusrat Jahan',
    userPhoneMasked: '01844***990',
    rating: 5,
    comment: 'Dhakai Jamdani is pure love! Handloom work is so neat and royal looking. Delivered in 24 hours in Dhaka.',
    date: '2026-09-22',
    verifiedPurchase: true,
  },
  {
    id: 'rev-03',
    productId: 'prod-c-01',
    userName: 'Farhana Kabir',
    userPhoneMasked: '01911***332',
    rating: 5,
    comment: 'My 5-year-old son loved this cotton Panjabi! Very soft, no itchiness at all.',
    date: '2026-09-24',
    verifiedPurchase: true,
  },
];

const initialOrders: Order[] = [];

class StorageService {
  private listeners: Set<() => void> = new Set();
  private hasInitializedFirestoreListeners = false;
  private unsubscribeUsersListener: (() => void) | null = null;

  constructor() {
    this.initFirestoreListeners();
  }

  private emitChange() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in storage listener', e);
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // ---------------- FIRESTORE REALTIME SYNC ----------------
  private initFirestoreListeners() {
    if (this.hasInitializedFirestoreListeners) return;
    this.hasInitializedFirestoreListeners = true;

    try {
      // 1. Sync Products
      onSnapshot(collection(db, 'products'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Product);
          });
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
          this.emitChange();
        } else {
          // If Firestore collection is empty, auto-seed with initialProducts
          this.seedInitialProducts();
        }
      }, (err) => {
        console.warn('Firestore products listener:', err.message);
      });

      // 2. Sync Orders
      onSnapshot(collection(db, 'orders'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              ...data,
              id: docSnap.id,
              orderId: data.orderId || docSnap.id,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
            } as Order);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
          this.emitChange();
        } else {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
          this.emitChange();
        }
      }, (err) => {
        console.warn('Firestore orders listener notice:', err.message);
      });

      // 3. Sync Settings via settingsService
      settingsService.subscribe(() => {
        const combined = settingsService.getCombinedSettings();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(combined));
        this.emitChange();
      });

      // 4. Sync Hero Slides
      onSnapshot(collection(db, 'heroSlides'), (snapshot) => {
        if (!snapshot.empty) {
          const list: HeroSlide[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as HeroSlide);
          });
          localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(list));
          this.emitChange();
        } else {
          this.seedInitialHeroSlides();
        }
      }, (err) => {
        console.warn('Firestore heroSlides listener:', err.message);
      });

      // 5. Sync Coupons
      onSnapshot(collection(db, 'coupons'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Coupon[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as Coupon);
          });
          localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(list));
          this.emitChange();
        } else {
          this.seedInitialCoupons();
        }
      }, (err) => {
        console.warn('Firestore coupons listener:', err.message);
      });

      // 6. Sync Reviews
      onSnapshot(collection(db, 'reviews'), (snapshot) => {
        if (!snapshot.empty) {
          const list: Review[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              reviewId: docSnap.id,
              productId: data.productId,
              orderId: data.orderId,
              customerId: data.customerId,
              customerName: data.customerName || data.userName || 'Verified Buyer',
              customerEmail: data.customerEmail || '',
              userName: data.customerName || data.userName || 'Verified Buyer',
              userPhoneMasked: data.userPhoneMasked,
              rating: Number(data.rating) || 5,
              comment: data.reviewText || data.comment || '',
              reviewText: data.reviewText || data.comment || '',
              reviewImage: data.reviewImage || (Array.isArray(data.reviewImages) ? data.reviewImages[0] : '') || '',
              reviewImages: Array.isArray(data.reviewImages) 
                ? data.reviewImages 
                : (data.reviewImage ? [data.reviewImage] : []),
              verifiedPurchase: data.verifiedPurchase !== false,
              status: data.status || 'published',
              date: data.createdAt?.toDate 
                ? data.createdAt.toDate().toISOString().split('T')[0] 
                : (data.date || new Date().toISOString().split('T')[0]),
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as Review);
          });
          // Sort newest first
          list.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
            return dateB - dateA;
          });
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));
          this.emitChange();
        } else {
          this.seedInitialReviews();
        }
      }, (err) => {
        console.warn('Firestore reviews listener:', err.message);
      });

    } catch (e) {
      console.error('Error starting Firestore realtime listeners:', e);
    }
  }

  // Sync users collection only when an admin is active (prevents permission-denied for customers)
  syncAdminUsersListener(isAdmin: boolean) {
    if (this.unsubscribeUsersListener) {
      this.unsubscribeUsersListener();
      this.unsubscribeUsersListener = null;
    }
    if (!isAdmin) return;

    try {
      this.unsubscribeUsersListener = onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!snapshot.empty) {
          const list: User[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as User);
          });
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
          this.emitChange();
        }
      }, (err) => {
        console.warn('Firestore users admin listener:', err.message);
      });
    } catch (e) {
      console.warn('Error syncing admin users listener:', e);
    }
  }

  // Auto-seeders when Firestore collections are freshly created
  private async seedInitialProducts() {
    try {
      for (const p of initialProducts) {
        await setDoc(doc(db, 'products', p.id), p, { merge: true });
      }
    } catch (e) {
      console.warn('Could not auto-seed products to Firestore:', e);
    }
  }

  private async seedInitialHeroSlides() {
    try {
      for (const s of defaultHeroSlides) {
        await setDoc(doc(db, 'heroSlides', s.id), s, { merge: true });
      }
    } catch (e) {
      console.warn('Could not auto-seed heroSlides to Firestore:', e);
    }
  }

  private async seedInitialCoupons() {
    try {
      for (const c of initialCoupons) {
        await setDoc(doc(db, 'coupons', c.id), c, { merge: true });
      }
    } catch (e) {
      console.warn('Could not auto-seed coupons to Firestore:', e);
    }
  }

  private async seedInitialReviews() {
    try {
      for (const r of initialReviews) {
        await setDoc(doc(db, 'reviews', r.id), r, { merge: true });
      }
    } catch (e) {
      console.warn('Could not auto-seed reviews to Firestore:', e);
    }
  }

  private async seedInitialSettings() {
    try {
      const webSnap = await getDoc(doc(db, 'settings', 'website'));
      if (!webSnap.exists()) {
        await setDoc(doc(db, 'settings', 'website'), { ...EMPTY_WEBSITE_SETTINGS, updatedAt: serverTimestamp() }, { merge: true });
      }
      const paySnap = await getDoc(doc(db, 'settings', 'payment'));
      if (!paySnap.exists()) {
        await setDoc(doc(db, 'settings', 'payment'), { ...EMPTY_PAYMENT_SETTINGS, updatedAt: serverTimestamp() }, { merge: true });
      }
      const logSnap = await getDoc(doc(db, 'settings', 'logistics'));
      if (!logSnap.exists()) {
        await setDoc(doc(db, 'settings', 'logistics'), { ...EMPTY_LOGISTICS_SETTINGS, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.warn('Could not check or seed settings in Firestore:', e);
    }
  }

  // ---------------- SITE SETTINGS ----------------
  getSettings(): SiteSettings {
    try {
      return settingsService.getCombinedSettings();
    } catch {
      return defaultSettings;
    }
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    await settingsService.saveWebsiteSettings({
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      logo: settings.logo,
      announcementEn: settings.announcementEn,
      announcementBn: settings.announcementBn,
      phone: settings.hotline,
      whatsapp: settings.whatsapp,
      email: settings.supportEmail,
      address: settings.flagshipAddressBn || settings.flagshipAddressEn,
      facebook: settings.facebook,
      instagram: settings.instagram,
    });

    await settingsService.savePaymentSettings({
      bkash: { number: settings.bkashMerchantNumber, enabled: true },
      nagad: { number: settings.nagadMerchantNumber, enabled: true },
      rocket: { number: settings.rocketMerchantNumber, enabled: true },
    });

    await settingsService.saveLogisticsSettings({
      defaultCourier: settings.defaultCourier || 'Steadfast',
      deliveryChargeInsideDhaka: settings.dhakaDeliveryFee,
      deliveryChargeOutsideDhaka: settings.outsideDhakaDeliveryFee,
      freeShippingThreshold: settings.freeShippingThreshold,
    });

    this.emitChange();
  }

  // ---------------- HERO SLIDES ----------------
  getHeroSlides(): HeroSlide[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(defaultHeroSlides));
        return defaultHeroSlides;
      }
      return JSON.parse(data);
    } catch {
      return defaultHeroSlides;
    }
  }

  async saveHeroSlide(slide: HeroSlide): Promise<void> {
    const slides = this.getHeroSlides();
    const idx = slides.findIndex((s) => s.id === slide.id);
    if (idx >= 0) {
      slides[idx] = slide;
    } else {
      slides.push(slide);
    }
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    this.emitChange();

    try {
      await setDoc(doc(db, 'heroSlides', slide.id), slide);
    } catch (e) {
      console.error('Error saving heroSlide to Firestore:', e);
    }
  }

  async deleteHeroSlide(slideId: string): Promise<void> {
    const slides = this.getHeroSlides().filter((s) => s.id !== slideId);
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    this.emitChange();

    try {
      await deleteDoc(doc(db, 'heroSlides', slideId));
    } catch (e) {
      console.error('Error deleting heroSlide from Firestore:', e);
    }
  }

  // ---------------- PRODUCTS ----------------
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
        return initialProducts;
      }
      return JSON.parse(data);
    } catch {
      return initialProducts;
    }
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  async saveProduct(product: Product): Promise<void> {
    const products = this.getProducts();
    const existingIndex = products.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.emitChange();

    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (e) {
      console.error('Error saving product to Firestore:', e);
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    const products = this.getProducts().filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.emitChange();

    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (e) {
      console.error('Error deleting product from Firestore:', e);
    }
  }

  async adjustStock(productId: string, delta: number): Promise<void> {
    const products = this.getProducts();
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock + delta);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.emitChange();

      // Non-blocking update to Firestore (only succeeds if user has admin permission)
      updateDoc(doc(db, 'products', productId), { stock: prod.stock }).catch((err) => {
        // Silently caught for customers so order placement is never blocked
      });
    }
  }

  // ---------------- ORDERS ----------------
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getOrderById(id: string): Order | undefined {
    const cleanId = id.trim().toUpperCase();
    return this.getOrders().find(
      (o) => (o.id && o.id.toUpperCase() === cleanId) || 
             (o.orderId && o.orderId.toUpperCase() === cleanId) || 
             (o.shippingAddress?.phone && o.shippingAddress.phone.includes(cleanId))
    );
  }

  async fetchOrderById(orderId: string): Promise<Order | null> {
    try {
      const cleanId = orderId.trim();
      const docSnap = await getDoc(doc(db, 'orders', cleanId));
      if (docSnap.exists()) {
        return this.mapFirestoreOrder(docSnap.id, docSnap.data());
      }
      return null;
    } catch (e: any) {
      console.error('❌ Error fetching order by ID from Firestore:', e?.code, e?.message);
      return null;
    }
  }

  mapFirestoreOrder(docId: string, d: any): Order {
    const rawShipping = d.shippingAddress || d.deliveryAddress || {};
    const shippingFullName = (
      rawShipping.fullName ||
      rawShipping.name ||
      d.customerName ||
      'Customer'
    ).trim();
    const shippingPhone = (
      rawShipping.phone ||
      d.customerPhone ||
      ''
    ).trim();
    const shippingEmail = (
      rawShipping.email ||
      d.customerEmail ||
      ''
    ).trim();
    const shippingDistrict = (
      rawShipping.district ||
      d.district ||
      ''
    ).trim();
    const shippingDivision = (
      rawShipping.division ||
      d.division ||
      'Dhaka'
    ).trim();
    const shippingAddressStr = (
      rawShipping.address ||
      ''
    ).trim();

    return {
      id: docId,
      orderId: d.orderId || docId,
      customerId: d.customerId,
      customerName: d.customerName || shippingFullName,
      customerEmail: d.customerEmail || shippingEmail,
      customerPhone: d.customerPhone || shippingPhone,
      items: d.items || [],
      subtotal: Number(d.subtotal) || 0,
      discount: Number(d.discount) || 0,
      couponCode: d.couponCode,
      deliveryCharge: Number(d.deliveryCharge) || 0,
      totalAmount: Number(d.totalAmount) || 0,
      paymentMethod: d.paymentMethod || 'cod',
      paymentStatus: d.paymentStatus || 'unpaid',
      orderStatus: d.orderStatus || 'pending',
      senderMobile: d.senderMobile || '',
      transactionId: d.transactionId || '',
      courierName: d.courierName || '',
      courierTrackingId: d.courierTrackingId || '',
      shippingAddress: {
        fullName: shippingFullName,
        name: shippingFullName,
        phone: shippingPhone,
        email: shippingEmail,
        division: shippingDivision,
        district: shippingDistrict,
        address: shippingAddressStr,
        notes: rawShipping.notes || '',
      },
      createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : (d.createdAt || new Date().toISOString()),
      updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : (d.updatedAt || new Date().toISOString()),
    } as Order;
  }

  async fetchCustomerProfile(customerId: string): Promise<any | null> {
    if (!customerId || !customerId.trim()) {
      console.error("Order customerId is missing");
      return null;
    }
    try {
      const userRef = doc(db, 'users', customerId.trim());
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.warn("Customer profile not found:", customerId);
        return null;
      }
      const data = userSnap.data();
      return {
        id: customerId,
        name: data.name || data.displayName || '',
        email: data.email || '',
        phone: data.phone || data.phoneNumber || '',
        role: data.role === 'admin' ? 'admin' : 'customer',
        address: data.address,
        district: data.district || (typeof data.address === 'object' ? data.address?.district : '') || '',
        division: data.division || (typeof data.address === 'object' ? data.address?.division : '') || '',
      };
    } catch (error: any) {
      console.error("ORDER CUSTOMER FETCH ERROR:", error?.code, error?.message);
      return null;
    }
  }

  async fetchAdminOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: Order[] = snapshot.docs.map((docSnap) => this.mapFirestoreOrder(docSnap.id, docSnap.data()));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
      this.emitChange();
      return list;
    } catch (e: any) {
      console.error('❌ Error fetching admin orders from Firestore:', e?.code, e?.message);
      throw e;
    }
  }

  subscribeAdminOrders(callback: (orders: Order[]) => void, onError?: (err: Error) => void): () => void {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list: Order[] = snapshot.docs.map((docSnap) => this.mapFirestoreOrder(docSnap.id, docSnap.data()));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
      this.emitChange();
      callback(list);
    }, (err) => {
      console.error('❌ Admin orders Firestore listener error:', err?.message);
      if (onError) onError(err);
    });
  }

  async fetchCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
      const snapshot = await getDocs(q);
      const list: Order[] = snapshot.docs.map((docSnap) => this.mapFirestoreOrder(docSnap.id, docSnap.data()));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    } catch (e: any) {
      console.error('❌ Error fetching customer orders from Firestore:', e?.code, e?.message);
      throw e;
    }
  }

  subscribeCustomerOrders(customerId: string, callback: (orders: Order[]) => void, onError?: (err: Error) => void): () => void {
    const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
    return onSnapshot(q, (snapshot) => {
      const list: Order[] = snapshot.docs.map((docSnap) => this.mapFirestoreOrder(docSnap.id, docSnap.data()));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    }, (err) => {
      console.error('❌ Customer orders Firestore listener error:', err?.message);
      if (onError) onError(err);
    });
  }

  async saveOrder(order: Order): Promise<void> {
    // 5. AUTH USER CHECK
    const user = auth.currentUser;
    if (!user) {
      throw new Error("USER_NOT_AUTHENTICATED");
    }
    console.log("AUTH UID:", user.uid);

    const customerName = (order.customerName || order.shippingAddress?.fullName || user.displayName || '').trim();
    const customerEmail = (order.customerEmail || order.shippingAddress?.email || user.email || '').trim();
    const customerPhone = (order.customerPhone || order.shippingAddress?.phone || user.phoneNumber || '').trim();
    const formattedAddress = order.shippingAddress
      ? `${order.shippingAddress.address || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.division || ''}`.trim()
      : '';

    const itemsFormatted = (order.items || []).map((it) => ({
      productId: it.productId || '',
      productName: it.titleBn || it.titleEn || it.productName || 'Apparel Item',
      titleEn: it.titleEn || '',
      titleBn: it.titleBn || '',
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      image: it.image || '',
      size: it.size || '',
      colorName: it.colorName || '',
    }));

    // 6. ORDER DATA
    const rawOrderData: Record<string, unknown> = {
      orderId: order.id,
      customerId: user.uid,
      customerName,
      customerEmail,
      customerPhone,

      items: itemsFormatted,

      subtotal: Number(order.subtotal) || 0,
      deliveryCharge: Number(order.deliveryCharge) || 0,
      totalAmount: Number(order.totalAmount) || 0,

      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || (order.paymentMethod === 'cod' ? 'unpaid' : 'submitted'),
      orderStatus: order.orderStatus || 'pending',

      senderMobile: order.paymentMethod === 'cod' ? '' : (order.senderMobile || ''),
      transactionId: order.paymentMethod === 'cod' ? '' : (order.transactionId || ''),

      shippingAddress: {
        fullName: customerName,
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        division: order.shippingAddress?.division || '',
        district: order.shippingAddress?.district || '',
        address: order.shippingAddress?.address || formattedAddress,
        notes: order.shippingAddress?.notes || '',
      },

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (order.couponCode) {
      rawOrderData.couponCode = order.couponCode;
    }
    if (order.courierName) {
      rawOrderData.courierName = order.courierName;
    }

    // Defensive check: recursively strip any undefined value before writing to Firestore
    const orderData = JSON.parse(
      JSON.stringify(rawOrderData, (key, value) => (value === undefined ? null : value))
    );
    // Restore serverTimestamp instances
    orderData.createdAt = serverTimestamp();
    orderData.updatedAt = serverTimestamp();

    console.log("ORDER DATA BEFORE FIRESTORE:", orderData);

    try {
      // 3. FIRESTORE WRITE MUST BE AWAITED (NO FAKE TIMEOUT)
      await setDoc(doc(db, "orders", order.id), orderData);

      // 4. FIRESTORE WRITE SUCCESS VERIFY
      console.log("FIRESTORE ORDER SAVE SUCCESS:", order.id);

      // Only update local cache upon verified Firestore success
      const orders = this.getOrders();
      const existingIndex = orders.findIndex((o) => o.id === order.id);
      const updatedOrder: Order = {
        ...order,
        orderId: order.id,
        customerId: user.uid,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          fullName: customerName,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          division: order.shippingAddress?.division || '',
          district: order.shippingAddress?.district || '',
          address: order.shippingAddress?.address || formattedAddress,
          notes: order.shippingAddress?.notes || '',
        },
        updatedAt: new Date().toISOString(),
      };
      if (existingIndex >= 0) {
        orders[existingIndex] = updatedOrder;
      } else {
        orders.unshift(updatedOrder);
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.emitChange();
    } catch (error: any) {
      console.error("FIRESTORE ORDER SAVE FAILED:", error);
      console.error("ERROR CODE:", error?.code);
      console.error("ERROR MESSAGE:", error?.message);
      // RE-THROW so caller knows it failed and does NOT show fake success!
      throw error;
    }
  }

  async updateOrder(updatedOrder: Order): Promise<void> {
    try {
      const shippingFullName = (
        updatedOrder.shippingAddress?.fullName ||
        updatedOrder.shippingAddress?.name ||
        updatedOrder.customerName ||
        ''
      ).trim();
      const shippingPhone = (
        updatedOrder.shippingAddress?.phone ||
        updatedOrder.customerPhone ||
        ''
      ).trim();
      const shippingEmail = (
        updatedOrder.shippingAddress?.email ||
        updatedOrder.customerEmail ||
        ''
      ).trim();
      const shippingDistrict = (updatedOrder.shippingAddress?.district || '').trim();
      const shippingDivision = (updatedOrder.shippingAddress?.division || 'Dhaka').trim();
      const shippingAddressStr = (updatedOrder.shippingAddress?.address || '').trim();
      const shippingNotes = (updatedOrder.shippingAddress?.notes || '').trim();

      const payload: Record<string, unknown> = {
        deliveryCharge: updatedOrder.deliveryCharge,
        totalAmount: updatedOrder.totalAmount,
        orderStatus: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus,
        customerName: shippingFullName,
        customerPhone: shippingPhone,
        customerEmail: shippingEmail,
        courierName: updatedOrder.courierName || '',
        courierTrackingId: updatedOrder.courierTrackingId || '',
        shippingAddress: {
          fullName: shippingFullName,
          name: shippingFullName,
          phone: shippingPhone,
          email: shippingEmail,
          division: shippingDivision,
          district: shippingDistrict,
          address: shippingAddressStr,
          notes: shippingNotes,
        },
        updatedAt: serverTimestamp(),
      };
      const clean = JSON.parse(JSON.stringify(payload, (k, v) => (v === undefined ? null : v)));
      clean.updatedAt = serverTimestamp();
      await updateDoc(doc(db, 'orders', updatedOrder.id), clean);
      console.log('✅ Firestore order updated:', updatedOrder.id);

      const orders = this.getOrders();
      const idx = orders.findIndex((o) => o.id === updatedOrder.id);
      if (idx >= 0) {
        orders[idx] = updatedOrder;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.emitChange();
      }
    } catch (error: any) {
      console.error("ORDER UPDATE ERROR:", error);
      console.error("ERROR CODE:", error?.code);
      console.error("ERROR MESSAGE:", error?.message);
      throw error;
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      console.log('✅ Firestore order deleted:', orderId);

      const orders = this.getOrders().filter((o) => o.id !== orderId);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.emitChange();
    } catch (error: any) {
      console.error("ORDER UPDATE ERROR:", error);
      console.error("ERROR CODE:", error?.code);
      console.error("ERROR MESSAGE:", error?.message);
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: Order['orderStatus'],
    courierTrackingId?: string,
    courierName?: string
  ): Promise<void> {
    try {
      const updatePayload: Record<string, unknown> = {
        orderStatus: status,
        updatedAt: serverTimestamp(),
      };
      if (courierTrackingId !== undefined) updatePayload.courierTrackingId = courierTrackingId;
      if (courierName !== undefined) updatePayload.courierName = courierName;
      await updateDoc(doc(db, 'orders', orderId), updatePayload);
      console.log('✅ FIRESTORE ORDER UPDATE SUCCESS:', orderId, status);

      const orders = this.getOrders();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        order.orderStatus = status;
        if (courierTrackingId !== undefined) order.courierTrackingId = courierTrackingId;
        if (courierName !== undefined) order.courierName = courierName;
        order.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.emitChange();
      }
    } catch (error: any) {
      console.error("ORDER UPDATE ERROR:", error);
      console.error("ERROR CODE:", error?.code);
      console.error("ERROR MESSAGE:", error?.message);
      throw error;
    }
  }

  async updatePaymentStatus(orderId: string, status: Order['paymentStatus']): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: status,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ FIRESTORE PAYMENT STATUS UPDATE SUCCESS:', orderId, status);

      const orders = this.getOrders();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        order.paymentStatus = status;
        order.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.emitChange();
      }
    } catch (error: any) {
      console.error("ORDER UPDATE ERROR:", error);
      console.error("ERROR CODE:", error?.code);
      console.error("ERROR MESSAGE:", error?.message);
      throw error;
    }
  }

  // ---------------- COUPONS ----------------
  getCoupons(): Coupon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(initialCoupons));
        return initialCoupons;
      }
      return JSON.parse(data);
    } catch {
      return initialCoupons;
    }
  }

  async saveCoupon(coupon: Coupon): Promise<void> {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      coupons[idx] = coupon;
    } else {
      coupons.push(coupon);
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    this.emitChange();

    try {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
    } catch (e) {
      console.error('Error saving coupon to Firestore:', e);
    }
  }

  async toggleCouponActive(couponId: string): Promise<void> {
    const coupons = this.getCoupons();
    const c = coupons.find((item) => item.id === couponId);
    if (c) {
      c.isActive = !c.isActive;
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
      this.emitChange();

      try {
        await updateDoc(doc(db, 'coupons', couponId), { isActive: c.isActive });
      } catch (e) {
        console.error('Error updating coupon in Firestore:', e);
      }
    }
  }

  async deleteCoupon(couponId: string): Promise<void> {
    const coupons = this.getCoupons().filter((c) => c.id !== couponId);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    this.emitChange();

    try {
      await deleteDoc(doc(db, 'coupons', couponId));
    } catch (e) {
      console.error('Error deleting coupon from Firestore:', e);
    }
  }

  // ---------------- REVIEWS ----------------
  getReviews(productId?: string, onlyPublished: boolean = true): Review[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const all: Review[] = data ? JSON.parse(data) : initialReviews;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(initialReviews));
      }

      let filtered = all;
      if (onlyPublished) {
        filtered = filtered.filter((r) => r.status === 'published' || !r.status);
      }
      if (productId) {
        filtered = filtered.filter((r) => r.productId === productId);
      }
      return filtered;
    } catch {
      return initialReviews;
    }
  }

  getAllReviewsForAdmin(): Review[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const all: Review[] = data ? JSON.parse(data) : initialReviews;
      return all;
    } catch {
      return initialReviews;
    }
  }

  hasCustomerReviewed(customerId: string, productId: string, orderId: string): boolean {
    const all = this.getAllReviewsForAdmin();
    return all.some(
      (r) =>
        r.productId === productId &&
        r.orderId === orderId &&
        r.customerId === customerId
    );
  }

  getCustomerDeliveredOrdersForProduct(customerId: string, productId: string): { order: Order; alreadyReviewed: boolean }[] {
    const allOrders = this.getOrders();
    const customerOrders = allOrders.filter(
      (o) => o.customerId === customerId && o.orderStatus === 'delivered'
    );

    const matching: { order: Order; alreadyReviewed: boolean }[] = [];
    for (const order of customerOrders) {
      const hasProduct = order.items && order.items.some((item) => item.productId === productId);
      if (hasProduct) {
        matching.push({
          order,
          alreadyReviewed: this.hasCustomerReviewed(customerId, productId, order.id),
        });
      }
    }
    return matching;
  }

  async uploadReviewImage(file: File, productId: string, customerId: string, reviewId: string): Promise<string> {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `reviews/${productId}/${customerId}/${reviewId}/${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  }

  async submitCustomerReview(payload: {
    productId: string;
    orderId: string;
    rating: number;
    reviewText: string;
    photos: File[];
  }): Promise<Review> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('অনুগ্রহ করে রিভিউ দেওয়ার আগে লগইন করুন। (Login Required)');
    }

    const { productId, orderId, rating, reviewText, photos } = payload;

    if (!rating || rating < 1 || rating > 5) {
      throw new Error('দয়া করে ১ থেকে ৫ স্টার রেটিং নির্বাচন করুন। (Rating Required)');
    }

    if (!reviewText || reviewText.trim().length < 5) {
      throw new Error('দয়া করে আপনার অভিজ্ঞতা কমপক্ষে ৫টি অক্ষরে লিখুন। (Comment Required)');
    }

    if (!photos || photos.length === 0) {
      throw new Error('দয়া করে ডেলিভারি পাওয়া প্রোডাক্টের অন্তত ১টি ছবি আপলোড করুন। (Product Photo Required)');
    }

    if (photos.length > 5) {
      throw new Error('সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে। (Max 5 Photos)');
    }

    for (const p of photos) {
      if (p.size > 5 * 1024 * 1024) {
        throw new Error(`"${p.name}" ছবির সাইজ ৫ মেগাবাইটের বেশি। প্রতিটি ছবি সর্বোচ্চ 5MB হতে হবে।`);
      }
    }

    // Check duplicate review
    const customerId = user.uid;
    const reviewId = `${customerId}_${productId}_${orderId}`;

    if (this.hasCustomerReviewed(customerId, productId, orderId)) {
      throw new Error('আপনি এই অর্ডারের জন্য ইতিমধ্যে রিভিউ প্রদান করেছেন। (Already Reviewed)');
    }

    // Verify order in Firestore directly
    try {
      const orderDocSnap = await getDoc(doc(db, 'orders', orderId));
      if (!orderDocSnap.exists()) {
        throw new Error('অর্ডার রেকর্ড পাওয়া যায়নি।');
      }
      const orderData = orderDocSnap.data();
      if (orderData.customerId !== customerId) {
        throw new Error('শুধুমাত্র নিজের অর্ডারের জন্য রিভিউ দেওয়া যাবে।');
      }
      if (orderData.orderStatus !== 'delivered') {
        throw new Error('প্রোডাক্টটি ডেলিভারি সম্পন্ন হওয়ার পরই কেবল রিভিউ দেওয়া সম্ভব।');
      }
      const hasItem = Array.isArray(orderData.items) && orderData.items.some((i: any) => i.productId === productId);
      if (!hasItem) {
        throw new Error('এই অর্ডারে নির্বাচিত প্রোডাক্টটি অন্তর্ভুক্ত নেই।');
      }
    } catch (orderErr: any) {
      console.warn('Order verification notice:', orderErr.message);
      // If error thrown above was validation, rethrow it
      if (orderErr.message && !orderErr.message.includes('Firestore')) {
        throw orderErr;
      }
    }

    // Upload photos to Firebase Storage
    const imageUrls: string[] = [];
    for (const photo of photos) {
      const url = await this.uploadReviewImage(photo, productId, customerId, reviewId);
      imageUrls.push(url);
    }

    const customerName = user.displayName || user.email?.split('@')[0] || 'Verified Customer';

    const reviewDoc: Review = {
      id: reviewId,
      reviewId,
      productId,
      orderId,
      customerId,
      customerName,
      customerEmail: user.email || '',
      userName: customerName,
      rating,
      comment: reviewText.trim(),
      reviewText: reviewText.trim(),
      reviewImage: imageUrls[0] || '',
      reviewImages: imageUrls,
      verifiedPurchase: true,
      status: 'published',
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save to Firestore
    await setDoc(doc(db, 'reviews', reviewId), reviewDoc);
    console.log('✅ Review saved to Firestore:', reviewId);

    // Save to local cache & recalculate
    const currentReviews = this.getAllReviewsForAdmin();
    const existingIndex = currentReviews.findIndex((r) => r.id === reviewId);
    if (existingIndex >= 0) {
      currentReviews[existingIndex] = { ...reviewDoc, createdAt: new Date().toISOString() };
    } else {
      currentReviews.unshift({ ...reviewDoc, createdAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(currentReviews));

    // Recalculate product rating
    await this.recalculateProductRating(productId);

    this.emitChange();
    return reviewDoc;
  }

  async recalculateProductRating(productId: string): Promise<void> {
    try {
      const publishedReviews = this.getReviews(productId, true);
      const products = this.getProducts();
      const product = products.find((p) => p.id === productId);

      let newRating = 5.0;
      let newCount = 0;

      if (publishedReviews.length > 0) {
        const totalRating = publishedReviews.reduce((sum, r) => sum + r.rating, 0);
        newRating = Number((totalRating / publishedReviews.length).toFixed(1));
        newCount = publishedReviews.length;
      }

      if (product) {
        product.rating = newRating;
        product.reviewCount = newCount;
        this.saveProduct(product);
      }

      // Update Firestore product rating if exists
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        rating: newRating,
        reviewCount: newCount,
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Updated rating for product ${productId}: ${newRating} (${newCount} reviews)`);
    } catch (e: any) {
      console.warn('Could not update product rating in Firestore:', e?.message);
    }
  }

  async updateReviewStatus(reviewId: string, status: 'published' | 'hidden' | 'pending'): Promise<void> {
    const reviews = this.getAllReviewsForAdmin();
    const target = reviews.find((r) => r.id === reviewId);
    if (target) {
      target.status = status;
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      this.emitChange();
    }

    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status,
        updatedAt: serverTimestamp(),
      });
      if (target?.productId) {
        await this.recalculateProductRating(target.productId);
      }
    } catch (e) {
      console.error('Error updating review status in Firestore:', e);
      throw e;
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    const reviews = this.getAllReviewsForAdmin();
    const target = reviews.find((r) => r.id === reviewId);
    const updated = reviews.filter((r) => r.id !== reviewId);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    this.emitChange();

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      if (target?.productId) {
        await this.recalculateProductRating(target.productId);
      }
    } catch (e) {
      console.error('Error deleting review from Firestore:', e);
      throw e;
    }
  }

  async reportReview(reviewId: string, productId: string, reason: string): Promise<void> {
    const user = auth.currentUser;
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const reportData: ReviewReport = {
      reportId,
      reviewId,
      productId,
      customerId: user?.uid,
      customerName: user?.displayName || user?.email || 'Anonymous',
      reason,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'reviewReports', reportId), reportData);
      console.log('✅ Review reported:', reportId);
    } catch (e) {
      console.error('Error reporting review:', e);
      throw e;
    }
  }

  async getReviewReports(): Promise<ReviewReport[]> {
    try {
      const snap = await getDocs(collection(db, 'reviewReports'));
      const list: ReviewReport[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), reportId: d.id } as ReviewReport);
      });
      return list;
    } catch (e) {
      console.warn('Error fetching review reports:', e);
      return [];
    }
  }

  // ---------------- WISHLIST ----------------
  getWishlist(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  toggleWishlist(productId: string): boolean {
    const list = this.getWishlist();
    const index = list.indexOf(productId);
    let added = false;
    if (index >= 0) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(productId);
      added = true;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    this.emitChange();
    return added;
  }

  // ---------------- USERS (FOR ADMIN USER MANAGEMENT) ----------------
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async updateUserRole(userId: string, role: 'customer' | 'admin'): Promise<void> {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.role = role;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.emitChange();
    }
    try {
      await updateDoc(doc(db, 'users', userId), { role, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.error('Error updating user role in Firestore:', e);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const users = this.getUsers().filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.emitChange();
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.error('Error deleting user from Firestore:', e);
    }
  }

  // ---------------- CURRENT LOGGED IN USER CACHE ----------------
  getUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.name && parsed.name.trim()) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  saveUser(user: User | null): void {
    if (user && user.name && user.name.trim()) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.emitChange();
  }

  // ---------------- FIREBASE STORAGE IMAGE UPLOAD ----------------
  async uploadImage(file: File, folder = 'products'): Promise<string> {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  }

  // ---------------- RESET / SYNC ALL DATA ----------------
  async resetAllData(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(initialCoupons));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(initialReviews));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(defaultHeroSlides));
    this.emitChange();

    await this.seedInitialProducts();
    await this.seedInitialSettings();
    await this.seedInitialHeroSlides();
    await this.seedInitialCoupons();
    await this.seedInitialReviews();
  }
}

export const storageService = new StorageService();
