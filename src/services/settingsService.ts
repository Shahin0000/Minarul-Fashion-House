import { db, auth } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  WebsiteSettings, 
  PaymentSettings, 
  LogisticsSettings, 
  SiteSettings 
} from '../types';

export const EMPTY_WEBSITE_SETTINGS: WebsiteSettings = {
  siteName: 'MINARUL FASHION HOUSE',
  siteDescription: 'Bangladesh’s leading lifestyle apparel destination crafting timeless ethnic and contemporary apparel.',
  logo: '',
  phone: '',
  email: '',
  address: '',
  facebook: '',
  instagram: '',
  whatsapp: '',
  announcementEn: '🌟 Eid & Festive Special Offer: Up to 35% OFF! Free Delivery across Bangladesh on orders over ৳2,500',
  announcementBn: '🌟 ঈদ ও উৎসব স্পেশাল অফার: ৩৫% পর্যন্ত ছাড়! সারা বাংলাদেশে ২,৫০০ টাকার অর্ডারে ফ্রি ডেলিভারি',
};

export const EMPTY_PAYMENT_SETTINGS: PaymentSettings = {
  bkash: {
    number: '',
    enabled: true,
  },
  nagad: {
    number: '',
    enabled: true,
  },
  rocket: {
    number: '',
    enabled: true,
  },
};

export const EMPTY_LOGISTICS_SETTINGS: LogisticsSettings = {
  defaultCourier: 'Steadfast',
  deliveryChargeInsideDhaka: 60,
  deliveryChargeOutsideDhaka: 120,
  freeShippingThreshold: 2500,
  courierServices: [
    { name: 'Pathao', enabled: true },
    { name: 'Steadfast', enabled: true },
    { name: 'RedX', enabled: true },
    { name: 'Paperfly', enabled: false },
    { name: 'Sundarban', enabled: true },
    { name: 'SA Paribahan', enabled: false },
  ],
};

class SettingsService {
  private websiteSettings: WebsiteSettings = { ...EMPTY_WEBSITE_SETTINGS };
  private paymentSettings: PaymentSettings = { ...EMPTY_PAYMENT_SETTINGS };
  private logisticsSettings: LogisticsSettings = { ...EMPTY_LOGISTICS_SETTINGS };

  private isLoadedFromFirestore = false;
  private listeners: Set<() => void> = new Set();
  private unsubscribers: Array<() => void> = [];

  constructor() {
    this.initRealtimeListeners();
  }

  private emitChange() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error notifying settings listener:', err);
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // -------------------------------------------------------------
  // REAL-TIME LISTENERS
  // -------------------------------------------------------------
  private initRealtimeListeners() {
    try {
      // 1. settings/website
      const unsubWebsite = onSnapshot(doc(db, 'settings', 'website'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          this.websiteSettings = {
            ...EMPTY_WEBSITE_SETTINGS,
            ...data,
          };
          this.isLoadedFromFirestore = true;
          this.emitChange();
        }
      }, (err) => {
        console.warn('Realtime settings/website listener notice:', err.message);
      });
      this.unsubscribers.push(unsubWebsite);

      // 2. settings/payment
      const unsubPayment = onSnapshot(doc(db, 'settings', 'payment'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          this.paymentSettings = {
            bkash: {
              number: data.bkash?.number ?? '',
              enabled: data.bkash?.enabled ?? true,
            },
            nagad: {
              number: data.nagad?.number ?? '',
              enabled: data.nagad?.enabled ?? true,
            },
            rocket: {
              number: data.rocket?.number ?? '',
              enabled: data.rocket?.enabled ?? true,
            },
            updatedAt: data.updatedAt,
          };
          this.isLoadedFromFirestore = true;
          this.emitChange();
        }
      }, (err) => {
        console.warn('Realtime settings/payment listener notice:', err.message);
      });
      this.unsubscribers.push(unsubPayment);

      // 3. settings/logistics
      const unsubLogistics = onSnapshot(doc(db, 'settings', 'logistics'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          this.logisticsSettings = {
            ...EMPTY_LOGISTICS_SETTINGS,
            ...data,
            courierServices: Array.isArray(data.courierServices) && data.courierServices.length > 0
              ? data.courierServices
              : EMPTY_LOGISTICS_SETTINGS.courierServices,
          };
          this.isLoadedFromFirestore = true;
          this.emitChange();
        }
      }, (err) => {
        console.warn('Realtime settings/logistics listener notice:', err.message);
      });
      this.unsubscribers.push(unsubLogistics);
    } catch (e) {
      console.warn('Error setting up settings realtime listeners:', e);
    }
  }

  // -------------------------------------------------------------
  // GETTERS (Awaits Firestore for strict source of truth)
  // -------------------------------------------------------------
  async getWebsiteSettings(forceRefresh = false): Promise<WebsiteSettings> {
    if (this.isLoadedFromFirestore && !forceRefresh) {
      return { ...this.websiteSettings };
    }

    try {
      const snap = await getDoc(doc(db, 'settings', 'website'));
      if (snap.exists()) {
        const data = snap.data();
        this.websiteSettings = {
          ...EMPTY_WEBSITE_SETTINGS,
          ...data,
        };
        this.isLoadedFromFirestore = true;
        return { ...this.websiteSettings };
      } else {
        // Check for legacy migration from settings/general
        await this.checkAndMigrateLegacySettings();
        return { ...this.websiteSettings };
      }
    } catch (err: any) {
      console.error('Error loading settings/website from Firestore:', err);
      return { ...this.websiteSettings };
    }
  }

  async getPaymentSettings(forceRefresh = false): Promise<PaymentSettings> {
    if (this.isLoadedFromFirestore && !forceRefresh) {
      return { ...this.paymentSettings };
    }

    try {
      const snap = await getDoc(doc(db, 'settings', 'payment'));
      if (snap.exists()) {
        const data = snap.data();
        this.paymentSettings = {
          bkash: {
            number: data.bkash?.number ?? '',
            enabled: data.bkash?.enabled ?? true,
          },
          nagad: {
            number: data.nagad?.number ?? '',
            enabled: data.nagad?.enabled ?? true,
          },
          rocket: {
            number: data.rocket?.number ?? '',
            enabled: data.rocket?.enabled ?? true,
          },
          updatedAt: data.updatedAt,
        };
        this.isLoadedFromFirestore = true;
        return { ...this.paymentSettings };
      } else {
        // Check for legacy migration
        await this.checkAndMigrateLegacySettings();
        return { ...this.paymentSettings };
      }
    } catch (err: any) {
      console.error('Error loading settings/payment from Firestore:', err);
      return { ...this.paymentSettings };
    }
  }

  async getLogisticsSettings(forceRefresh = false): Promise<LogisticsSettings> {
    if (this.isLoadedFromFirestore && !forceRefresh) {
      return { ...this.logisticsSettings };
    }

    try {
      const snap = await getDoc(doc(db, 'settings', 'logistics'));
      if (snap.exists()) {
        const data = snap.data();
        this.logisticsSettings = {
          ...EMPTY_LOGISTICS_SETTINGS,
          ...data,
          courierServices: Array.isArray(data.courierServices) && data.courierServices.length > 0
            ? data.courierServices
            : EMPTY_LOGISTICS_SETTINGS.courierServices,
        };
        this.isLoadedFromFirestore = true;
        return { ...this.logisticsSettings };
      } else {
        // Check for legacy migration
        await this.checkAndMigrateLegacySettings();
        return { ...this.logisticsSettings };
      }
    } catch (err: any) {
      console.error('Error loading settings/logistics from Firestore:', err);
      return { ...this.logisticsSettings };
    }
  }

  // Synchronous cached snapshots for instant React renders
  getCachedWebsiteSettings(): WebsiteSettings {
    return { ...this.websiteSettings };
  }

  getCachedPaymentSettings(): PaymentSettings {
    return { ...this.paymentSettings };
  }

  getCachedLogisticsSettings(): LogisticsSettings {
    return { ...this.logisticsSettings };
  }

  // Combined SiteSettings for backwards compatibility across existing components
  getCombinedSettings(): SiteSettings {
    return {
      siteName: this.websiteSettings.siteName,
      siteDescription: this.websiteSettings.siteDescription,
      logo: this.websiteSettings.logo,
      announcementEn: this.websiteSettings.announcementEn || EMPTY_WEBSITE_SETTINGS.announcementEn!,
      announcementBn: this.websiteSettings.announcementBn || EMPTY_WEBSITE_SETTINGS.announcementBn!,
      hotline: this.websiteSettings.phone || '',
      whatsapp: this.websiteSettings.whatsapp || '',
      supportEmail: this.websiteSettings.email || '',
      bkashMerchantNumber: this.paymentSettings.bkash.number || '',
      nagadMerchantNumber: this.paymentSettings.nagad.number || '',
      rocketMerchantNumber: this.paymentSettings.rocket.number || '',
      dhakaDeliveryFee: this.logisticsSettings.deliveryChargeInsideDhaka,
      outsideDhakaDeliveryFee: this.logisticsSettings.deliveryChargeOutsideDhaka,
      freeShippingThreshold: this.logisticsSettings.freeShippingThreshold,
      flagshipAddressEn: this.websiteSettings.address || '',
      flagshipAddressBn: this.websiteSettings.address || '',
      defaultCourier: this.logisticsSettings.defaultCourier,
      facebook: this.websiteSettings.facebook,
      instagram: this.websiteSettings.instagram,
    };
  }

  // -------------------------------------------------------------
  // SAVE METHODS (Strict Verification & Merge)
  // -------------------------------------------------------------
  async saveWebsiteSettings(partial: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    this.verifyAdminAuth();

    const docRef = doc(db, 'settings', 'website');
    const updatePayload: Record<string, any> = {
      ...partial,
      updatedAt: serverTimestamp(),
    };

    // Remove undefined values to prevent Firestore crashes
    Object.keys(updatePayload).forEach((k) => {
      if (updatePayload[k] === undefined) delete updatePayload[k];
    });

    try {
      // 1. Write with merge to preserve any other existing fields
      await setDoc(docRef, updatePayload, { merge: true });

      // 2. Re-read from Firestore to verify persistence
      const verifySnap = await getDoc(docRef);
      if (!verifySnap.exists()) {
        throw new Error('Verification failed: settings/website document not found after save');
      }

      const verifiedData = verifySnap.data();
      this.websiteSettings = {
        ...EMPTY_WEBSITE_SETTINGS,
        ...verifiedData,
      };

      console.log('✅ Website settings saved & verified in Firestore:', this.websiteSettings);
      this.emitChange();
      return { ...this.websiteSettings };
    } catch (err: any) {
      console.error('❌ Failed to save website settings:', err);
      throw this.formatFirestoreError(err);
    }
  }

  async savePaymentSettings(partial: Partial<PaymentSettings>): Promise<PaymentSettings> {
    this.verifyAdminAuth();

    const docRef = doc(db, 'settings', 'payment');
    
    // Deep merge payload so nested accounts are preserved
    const current = this.paymentSettings;
    const updatePayload: Record<string, any> = {
      bkash: {
        number: partial.bkash?.number !== undefined ? partial.bkash.number.trim() : current.bkash.number,
        enabled: partial.bkash?.enabled !== undefined ? partial.bkash.enabled : current.bkash.enabled,
      },
      nagad: {
        number: partial.nagad?.number !== undefined ? partial.nagad.number.trim() : current.nagad.number,
        enabled: partial.nagad?.enabled !== undefined ? partial.nagad.enabled : current.nagad.enabled,
      },
      rocket: {
        number: partial.rocket?.number !== undefined ? partial.rocket.number.trim() : current.rocket.number,
        enabled: partial.rocket?.enabled !== undefined ? partial.rocket.enabled : current.rocket.enabled,
      },
      updatedAt: serverTimestamp(),
    };

    try {
      // 1. Write with merge
      await setDoc(docRef, updatePayload, { merge: true });

      // 2. Re-read from Firestore to verify persistence
      const verifySnap = await getDoc(docRef);
      if (!verifySnap.exists()) {
        throw new Error('Verification failed: settings/payment document not found after save');
      }

      const verifiedData = verifySnap.data();
      this.paymentSettings = {
        bkash: {
          number: verifiedData.bkash?.number ?? '',
          enabled: verifiedData.bkash?.enabled ?? true,
        },
        nagad: {
          number: verifiedData.nagad?.number ?? '',
          enabled: verifiedData.nagad?.enabled ?? true,
        },
        rocket: {
          number: verifiedData.rocket?.number ?? '',
          enabled: verifiedData.rocket?.enabled ?? true,
        },
        updatedAt: verifiedData.updatedAt,
      };

      console.log('✅ Payment settings saved & verified in Firestore:', this.paymentSettings);
      this.emitChange();
      return { ...this.paymentSettings };
    } catch (err: any) {
      console.error('❌ Failed to save payment settings:', err);
      throw this.formatFirestoreError(err);
    }
  }

  async saveLogisticsSettings(partial: Partial<LogisticsSettings>): Promise<LogisticsSettings> {
    this.verifyAdminAuth();

    const docRef = doc(db, 'settings', 'logistics');
    const updatePayload: Record<string, any> = {
      ...partial,
      updatedAt: serverTimestamp(),
    };

    Object.keys(updatePayload).forEach((k) => {
      if (updatePayload[k] === undefined) delete updatePayload[k];
    });

    try {
      // 1. Write with merge
      await setDoc(docRef, updatePayload, { merge: true });

      // 2. Re-read from Firestore to verify persistence
      const verifySnap = await getDoc(docRef);
      if (!verifySnap.exists()) {
        throw new Error('Verification failed: settings/logistics document not found after save');
      }

      const verifiedData = verifySnap.data();
      this.logisticsSettings = {
        ...EMPTY_LOGISTICS_SETTINGS,
        ...verifiedData,
        courierServices: Array.isArray(verifiedData.courierServices) && verifiedData.courierServices.length > 0
          ? verifiedData.courierServices
          : EMPTY_LOGISTICS_SETTINGS.courierServices,
      };

      console.log('✅ Logistics settings saved & verified in Firestore:', this.logisticsSettings);
      this.emitChange();
      return { ...this.logisticsSettings };
    } catch (err: any) {
      console.error('❌ Failed to save logistics settings:', err);
      throw this.formatFirestoreError(err);
    }
  }

  // -------------------------------------------------------------
  // BACKWARD-COMPATIBLE MIGRATION LOGIC
  // -------------------------------------------------------------
  private async checkAndMigrateLegacySettings(): Promise<void> {
    try {
      // If legacy settings/general exists, migrate fields
      const legacySnap = await getDoc(doc(db, 'settings', 'general'));
      if (!legacySnap.exists()) return;

      const legacy = legacySnap.data();
      console.log('🔄 Checking migration from legacy settings/general...');

      // 1. Migrate website settings if not already created
      const websiteSnap = await getDoc(doc(db, 'settings', 'website'));
      if (!websiteSnap.exists()) {
        const migratedWebsite: Partial<WebsiteSettings> = {
          siteName: 'MINARUL FASHION HOUSE',
          siteDescription: 'Premium Bangladeshi Fashion E-Commerce for Men, Women & Children',
          phone: legacy.hotline || '',
          whatsapp: legacy.whatsapp || '',
          email: legacy.supportEmail || '',
          address: legacy.flagshipAddressBn || legacy.flagshipAddressEn || '',
          announcementEn: legacy.announcementEn || EMPTY_WEBSITE_SETTINGS.announcementEn,
          announcementBn: legacy.announcementBn || EMPTY_WEBSITE_SETTINGS.announcementBn,
        };
        this.websiteSettings = { ...EMPTY_WEBSITE_SETTINGS, ...migratedWebsite };
        if (auth.currentUser) {
          await setDoc(doc(db, 'settings', 'website'), { ...migratedWebsite, updatedAt: serverTimestamp() }, { merge: true });
          console.log('✅ Migrated legacy website settings to settings/website');
        }
      }

      // 2. Migrate payment settings if not already created
      const paymentSnap = await getDoc(doc(db, 'settings', 'payment'));
      if (!paymentSnap.exists()) {
        const migratedPayment: PaymentSettings = {
          bkash: {
            number: legacy.bkashMerchantNumber || '',
            enabled: true,
          },
          nagad: {
            number: legacy.nagadMerchantNumber || '',
            enabled: true,
          },
          rocket: {
            number: legacy.rocketMerchantNumber || '',
            enabled: true,
          },
        };
        this.paymentSettings = migratedPayment;
        if (auth.currentUser) {
          await setDoc(doc(db, 'settings', 'payment'), { ...migratedPayment, updatedAt: serverTimestamp() }, { merge: true });
          console.log('✅ Migrated legacy payment settings to settings/payment');
        }
      }

      // 3. Migrate logistics settings if not already created
      const logisticsSnap = await getDoc(doc(db, 'settings', 'logistics'));
      if (!logisticsSnap.exists()) {
        const migratedLogistics: LogisticsSettings = {
          defaultCourier: 'Steadfast',
          deliveryChargeInsideDhaka: legacy.dhakaDeliveryFee !== undefined ? legacy.dhakaDeliveryFee : 60,
          deliveryChargeOutsideDhaka: legacy.outsideDhakaDeliveryFee !== undefined ? legacy.outsideDhakaDeliveryFee : 120,
          freeShippingThreshold: legacy.freeShippingThreshold !== undefined ? legacy.freeShippingThreshold : 2500,
          courierServices: EMPTY_LOGISTICS_SETTINGS.courierServices,
        };
        this.logisticsSettings = migratedLogistics;
        if (auth.currentUser) {
          await setDoc(doc(db, 'settings', 'logistics'), { ...migratedLogistics, updatedAt: serverTimestamp() }, { merge: true });
          console.log('✅ Migrated legacy logistics settings to settings/logistics');
        }
      }
    } catch (e) {
      console.warn('Notice during settings migration check:', e);
    }
  }

  // -------------------------------------------------------------
  // HELPER & ERROR FORMATTING
  // -------------------------------------------------------------
  private verifyAdminAuth() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Admin login required: অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্টে লগইন করুন।');
    }
  }

  private formatFirestoreError(err: any): Error {
    const code = err?.code || '';
    const message = err?.message || String(err);

    if (code === 'permission-denied' || message.includes('permission') || message.includes('Missing or insufficient permissions')) {
      return new Error('Settings save করার permission নেই (Admin authorization required)');
    }
    if (code === 'unavailable' || message.includes('offline') || message.includes('network') || message.includes('client is offline')) {
      return new Error('Internet connection check করুন');
    }
    if (code === 'unauthenticated' || message.includes('login required')) {
      return new Error('Admin login required');
    }
    return new Error(message || 'Settings সংরক্ষণ করতে ব্যর্থ হয়েছে');
  }
}

export const settingsService = new SettingsService();
