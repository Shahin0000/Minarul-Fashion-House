import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { bangladeshDivisions, calculateDeliveryFee } from '../../data/bangladeshLocations';
import { Order, PaymentMethod, ShippingAddress, PaymentSettings, LogisticsSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { settingsService } from '../../services/settingsService';
import { formatAuthError } from '../../utils/authErrors';
import { PaymentModal } from './PaymentModal';

interface CheckoutViewProps {
  onBackToShop: () => void;
  onOrderSuccess: (order: Order) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onBackToShop,
  onOrderSuccess,
  onToast,
}) => {
  const { cart, subtotal, discount, appliedCoupon, clearCart, freeShippingThreshold } = useCart();
  const { language, formatPrice, t } = useLanguage();
  const { user, openLoginModal } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState(user?.name || user?.address?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || user?.address?.phone || '');
  const [email, setEmail] = useState(user?.email || user?.address?.email || '');
  const [division, setDivision] = useState(user?.address?.division || 'Dhaka');
  const [district, setDistrict] = useState(user?.address?.district || 'dhaka-city');
  const [address, setAddress] = useState(user?.address?.address || '');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [senderMobile, setSenderMobile] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // District options based on chosen Division
  const currentDivisionObj = useMemo(() => {
    return bangladeshDivisions.find(
      (d) => d.nameEn.toLowerCase() === division.toLowerCase() || d.id === division.toLowerCase()
    ) || bangladeshDivisions[0];
  }, [division]);

  // Dynamic settings from Firestore (Source of Truth)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() =>
    settingsService.getCachedPaymentSettings()
  );
  const [logisticsSettings, setLogisticsSettings] = useState<LogisticsSettings>(() =>
    settingsService.getCachedLogisticsSettings()
  );

  useEffect(() => {
    // Always fetch latest from Firestore on mount
    Promise.all([
      settingsService.getPaymentSettings(true),
      settingsService.getLogisticsSettings(true),
    ]).then(([pay, log]) => {
      setPaymentSettings(pay);
      setLogisticsSettings(log);
    });

    const unsub = settingsService.subscribe(() => {
      setPaymentSettings(settingsService.getCachedPaymentSettings());
      setLogisticsSettings(settingsService.getCachedLogisticsSettings());
    });
    return unsub;
  }, []);

  // Delivery fee calculation from admin site settings
  const isDhaka =
    district === 'dhaka-city' ||
    district === 'gazipur' ||
    district === 'narayanganj' ||
    division.toLowerCase() === 'dhaka';
  const rawDeliveryFee = isDhaka
    ? logisticsSettings.deliveryChargeInsideDhaka
    : logisticsSettings.deliveryChargeOutsideDhaka;
  const isFreeDelivery =
    logisticsSettings.freeShippingThreshold > 0 &&
    subtotal >= logisticsSettings.freeShippingThreshold;
  const deliveryCharge = isFreeDelivery ? 0 : rawDeliveryFee;
  const grandTotal = Math.max(0, subtotal - discount + deliveryCharge);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.fullName = language === 'bn' ? 'আপনার নাম লিখুন' : 'Full name is required';
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 11 || !cleanPhone.startsWith('01')) {
      newErrors.phone =
        language === 'bn'
          ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
          : 'Please enter a valid 11-digit mobile number starting with 01';
    }
    if (!address.trim() || address.trim().length < 5) {
      newErrors.address =
        language === 'bn'
          ? 'বিস্তারিত ঠিকানা লিখুন (বাসা নং, রোড, এলাকা)'
          : 'Please enter detailed delivery address';
    }

    // Problem 6: bKash / Nagad / Rocket require senderMobile and transactionId
    if (paymentMethod !== 'cod') {
      const cleanSender = senderMobile.replace(/[^0-9]/g, '');
      if (!cleanSender || cleanSender.length < 11 || !cleanSender.startsWith('01')) {
        newErrors.senderMobile =
          language === 'bn'
            ? 'সঠিক ১১ সংখ্যার প্রেরক নম্বর লিখুন (যেমন: 017XXXXXXXX)'
            : 'Please enter valid 11-digit sender mobile number';
      }
      if (!transactionId.trim() || transactionId.trim().length < 6) {
        newErrors.transactionId =
          language === 'bn'
            ? 'সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন'
            : 'Please enter valid Transaction ID (TrxID)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrderClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      onToast(
        language === 'bn' ? 'অনুগ্রহ করে ফর্মের ভুলগুলো সংশোধন করুন' : 'Please check required form fields',
        'error'
      );
      return;
    }

    if (cart.length === 0) {
      onToast(
        language === 'bn' ? 'আপনার শপিং ব্যাগ খালি!' : 'Your cart is empty!',
        'error'
      );
      return;
    }

    // Authentication Check: auth.currentUser must exist before placing order
    if (!auth.currentUser) {
      onToast(
        language === 'bn'
          ? 'অর্ডার সম্পন্ন করতে অনুগ্রহ করে প্রথমে অ্যাকাউন্টে লগইন অথবা রেজিস্টার করুন।'
          : 'Please sign in or register to place your order.',
        'info'
      );
      openLoginModal('login');
      return;
    }

    // If mobile banking is chosen and either senderMobile or TrxID is missing
    if (paymentMethod !== 'cod' && (!transactionId.trim() || !senderMobile.trim())) {
      setShowPaymentModal(true);
      return;
    }

    finalizeOrder();
  };

  const finalizeOrder = async (providedSenderMobile?: string, providedTrxId?: string) => {
    setIsSubmitting(true);

    try {
      // Re-verify auth.currentUser
      if (!auth.currentUser) {
        onToast(
          language === 'bn'
            ? 'অর্ডার সম্পন্ন করতে অনুগ্রহ করে প্রথমে লগইন করুন।'
            : 'Please sign in to place order.',
          'info'
        );
        openLoginModal('login');
        return;
      }

      const orderId = `MFH-${Math.floor(10000 + Math.random() * 90000)}`;

      const shippingAddress: ShippingAddress = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        division,
        district:
          currentDivisionObj.districts.find((d) => d.id === district)?.nameBn || district,
        address: address.trim(),
        notes: notes.trim() || undefined,
      };

      const finalSenderMobile = (providedSenderMobile !== undefined ? providedSenderMobile : senderMobile).trim();
      const finalTrxId = (providedTrxId !== undefined ? providedTrxId : transactionId).trim();

      // Ensure bKash/Nagad/Rocket have both senderMobile and transactionId
      if (paymentMethod !== 'cod') {
        if (!finalSenderMobile || !finalTrxId) {
          setShowPaymentModal(true);
          return;
        }
      }

      // Use actual Firebase Auth UID for customerId
      const currentUid = auth.currentUser.uid;

      const newOrder: Order = {
        id: orderId,
        orderId,
        customerId: currentUid,
        customerName: fullName.trim(),
        customerEmail: email.trim() || '',
        customerPhone: phone.trim(),
        shippingAddress,
        items: cart.map((item) => ({
          productId: item.productId,
          titleEn: item.titleEn,
          titleBn: item.titleBn,
          image: item.image,
          size: item.size,
          colorName: item.color.nameEn,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        deliveryCharge,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'submitted',
        senderMobile: paymentMethod === 'cod' ? '' : finalSenderMobile,
        transactionId: paymentMethod === 'cod' ? '' : finalTrxId,
        orderStatus: 'pending',
        courierName: logisticsSettings.defaultCourier || 'Steadfast',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save order to persistent Firestore storage (properly awaited)
      await storageService.saveOrder(newOrder);

      // Decrement stock in catalog locally (non-blocking)
      for (const cItem of cart) {
        storageService.adjustStock(cItem.productId, -cItem.quantity);
      }

      // Clear cart ONLY AFTER Firestore write succeeds
      clearCart();

      onToast(
        language === 'bn' ? `অর্ডার #${orderId} সফলভাবে সম্পন্ন হয়েছে!` : `Order #${orderId} placed successfully!`,
        'success'
      );

      // Navigate to Order Receipt
      onOrderSuccess(newOrder);
    } catch (err: unknown) {
      console.warn('Order Placement Notice:', err);
      const msg = err instanceof Error ? err.message : String(err);
      onToast(formatAuthError(err, language) || ('Order placement error: ' + msg), 'error');
    } finally {
      // Guaranteed to terminate loading state under all conditions
      setIsSubmitting(false);
    }
  };

  const handlePaymentModalConfirmed = (sender: string, trxId: string) => {
    setSenderMobile(sender);
    setTransactionId(trxId);
    finalizeOrder(sender, trxId);
  };

  return (
    <div className="bg-stone-100/60 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button & Title */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBackToShop}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {t.checkoutTitle}
            </h1>
            <p className="text-xs text-stone-500">
              {language === 'bn' ? 'আপনার ঠিকানা ও পেমেন্ট পদ্ধতি নিশ্চিত করুন' : 'Provide your delivery details and choose payment'}
            </p>
          </div>
        </div>

        <form onSubmit={handlePlaceOrderClick}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Delivery Form & Payment Choice (8 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Delivery Details Card */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm sm:text-base text-stone-900">
                      {t.shippingInformation}
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      {language === 'bn' ? 'সারা বাংলাদেশে হোম ডেলিভারি সুবিধা' : 'Doorstep courier delivery across Bangladesh'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      {t.fullName} *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors({ ...errors, fullName: '' });
                        }}
                        placeholder="e.g. Minarul Islam"
                        className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border ${
                          errors.fullName ? 'border-rose-500 bg-rose-50/30' : 'border-stone-300'
                        } focus:border-amber-600 outline-none`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Mobile Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        placeholder="017XXXXXXXX"
                        className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border font-mono ${
                          errors.phone ? 'border-rose-500 bg-rose-50/30' : 'border-stone-300'
                        } focus:border-amber-600 outline-none`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email Optional */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      {t.emailOptional}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. customer@gmail.com"
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Division Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      {t.selectDivision} *
                    </label>
                    <select
                      value={division}
                      onChange={(e) => {
                        const newDiv = e.target.value;
                        setDivision(newDiv);
                        const matchedDiv = bangladeshDivisions.find((d) => d.nameEn === newDiv);
                        if (matchedDiv && matchedDiv.districts.length > 0) {
                          setDistrict(matchedDiv.districts[0].id);
                        }
                      }}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-amber-600 outline-none font-medium cursor-pointer"
                    >
                      {bangladeshDivisions.map((div) => (
                        <option key={div.id} value={div.nameEn}>
                          {language === 'bn' ? div.nameBn : div.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      {t.selectDistrict} *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-amber-600 outline-none font-medium cursor-pointer"
                    >
                      {currentDivisionObj.districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Detailed Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      {language === 'bn' ? 'পূর্ণাঙ্গ ঠিকানা (বাসা/রোড/এলাকা) *' : 'Detailed Address *'}
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors({ ...errors, address: '' });
                      }}
                      placeholder={t.fullAddressPlaceholder}
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                        errors.address ? 'border-rose-500 bg-rose-50/30' : 'border-stone-300'
                      } focus:border-amber-600 outline-none`}
                    />
                    {errors.address && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* Special Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                      {t.deliveryNotes}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Call before delivery / Leave at gate"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm sm:text-base text-stone-900">
                      {t.paymentMethod}
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      {language === 'bn' ? 'নিরাপদ এবং নির্ভরযোগ্য পেমেন্ট সিস্টেম' : 'Choose Cash on Delivery or Mobile Banking'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-amber-700 bg-amber-50/40 ring-2 ring-amber-600/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-amber-700"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">
                        💵 {t.cashOnDelivery}
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                        {t.cashOnDeliveryDesc}
                      </span>
                    </div>
                  </label>

                  {/* bKash */}
                  <label
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50/40 ring-2 ring-pink-500/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-1 accent-pink-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-pink-700 block">
                        🌸 {t.bkashPayment}
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                        {t.bkashDesc}
                      </span>
                    </div>
                  </label>

                  {/* Nagad */}
                  <label
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50/40 ring-2 ring-orange-500/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-1 accent-orange-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-orange-700 block">
                        🟠 {t.nagadPayment}
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                        {t.nagadDesc}
                      </span>
                    </div>
                  </label>

                  {/* Rocket */}
                  <label
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'rocket'
                        ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-500/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'rocket'}
                      onChange={() => setPaymentMethod('rocket')}
                      className="mt-1 accent-purple-600"
                    />
                    <div>
                      <span className="font-bold text-xs text-purple-700 block">
                        🟣 {t.rocketPayment}
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                        {t.rocketDesc}
                      </span>
                    </div>
                  </label>
                </div>

                {paymentMethod !== 'cod' && (
                  <div className="pt-3 border-t border-stone-200/80 space-y-4">
                    <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                          {paymentMethod.toUpperCase()} Merchant Number:
                        </span>
                        <span className="font-mono text-sm font-extrabold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                          {(() => {
                            const num =
                              paymentMethod === 'bkash'
                                ? paymentSettings.bkash?.number
                                : paymentMethod === 'nagad'
                                ? paymentSettings.nagad?.number
                                : paymentMethod === 'rocket'
                                ? paymentSettings.rocket?.number
                                : '';
                            return num || (language === 'bn' ? '(মার্চেন্ট নম্বর নির্ধারিত হয়নি)' : '(Not configured)');
                          })()}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        {language === 'bn'
                          ? `উপরের মার্চেন্ট নম্বরে ৳${grandTotal} টাকা Send Money বা Payment করে প্রেরক নম্বর এবং SMS-এ পাওয়া Transaction ID (TrxID) নিচে প্রদান করুন:`
                          : `Send ${formatPrice(grandTotal)} to the merchant number above, then enter your sender number and SMS Transaction ID (TrxID) below:`}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                          {language === 'bn' ? 'প্রেরক মোবাইল নম্বর *' : 'Sender Mobile Number *'}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            required
                            value={senderMobile}
                            onChange={(e) => {
                              setSenderMobile(e.target.value);
                              if (errors.senderMobile) setErrors({ ...errors, senderMobile: '' });
                            }}
                            placeholder="01XXXXXXXXX"
                            className={`w-full text-xs font-mono pl-10 pr-4 py-2.5 rounded-xl border ${
                              errors.senderMobile ? 'border-rose-500 bg-rose-50/40' : 'border-stone-300'
                            } focus:border-amber-600 outline-none`}
                          />
                        </div>
                        {errors.senderMobile && (
                          <p className="text-[11px] text-rose-600 mt-1">{errors.senderMobile}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                          Transaction ID (TrxID) *
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={transactionId}
                            onChange={(e) => {
                              setTransactionId(e.target.value.toUpperCase());
                              if (errors.transactionId) setErrors({ ...errors, transactionId: '' });
                            }}
                            placeholder="e.g. BK9X87261M"
                            className={`w-full text-xs font-mono uppercase pl-10 pr-4 py-2.5 rounded-xl border ${
                              errors.transactionId ? 'border-rose-500 bg-rose-50/40' : 'border-stone-300'
                            } focus:border-amber-600 outline-none font-bold`}
                          />
                        </div>
                        {errors.transactionId && (
                          <p className="text-[11px] text-rose-600 mt-1">{errors.transactionId}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Confirm (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-5 sticky top-28">
                <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
                  {t.orderSummary} ({cart.length} {language === 'bn' ? 'টি পোশাক' : 'items'})
                </h3>

                {/* Items preview */}
                <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="py-2.5 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.titleEn}
                        className="w-12 h-14 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-stone-900 truncate">
                          {language === 'bn' ? item.titleBn : item.titleEn}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          {t.size}: {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-xs font-bold text-stone-900 font-serif">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-2 text-xs border-t border-stone-100 pt-4">
                  <div className="flex justify-between text-stone-600">
                    <span>{t.subtotal}</span>
                    <span className="font-semibold text-stone-900 font-serif">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>
                        {t.discount} ({appliedCoupon?.code})
                      </span>
                      <span className="font-serif">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t.deliveryFee}</span>
                    </span>
                    <span className="font-semibold text-stone-900 font-serif">
                      {isFreeDelivery ? (
                        <span className="text-emerald-600 font-bold uppercase text-[10px]">
                          {language === 'bn' ? 'ফ্রি ডেলিভারি' : 'FREE'}
                        </span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-extrabold text-stone-950 pt-3 border-t border-stone-200">
                    <span>{t.total}</span>
                    <span className="text-amber-900 font-serif text-lg">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Confirm Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t.processingOrder}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-200" />
                      <span>
                        {t.placeOrder} • {formatPrice(grandTotal)}
                      </span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'bn'
                      ? '১০০% নিরাপদ কেনাকাটা ও দ্রুত কুরিয়ার ডেলিভারি'
                      : '100% Safe Shopping & Fast Courier Dispatch'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Gateway Modal (for bKash / Nagad / Rocket) */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        method={paymentMethod}
        amount={grandTotal}
        initialSenderMobile={senderMobile}
        initialTrxId={transactionId}
        onConfirm={handlePaymentModalConfirmed}
      />
    </div>
  );
};
