import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Zap, 
  Ruler, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Heart,
  Plus,
  Minus,
  MessageSquare,
  PackageCheck,
  Flag,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Product, ProductColor, Review } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { storageService } from '../../services/storageService';
import { SizeGuideModal } from './SizeGuideModal';
import { ReviewModal } from './ReviewModal';
import { ImageLightboxModal } from '../common/ImageLightboxModal';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCheckout: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onNavigateToCheckout,
  isWishlisted,
  onToggleWishlist,
  onToast,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const { addToCart, buyNow } = useCart();
  const { user, openLoginModal } = useAuth();

  if (!isOpen || !product) return null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0] || { nameEn: 'Standard', nameBn: 'স্ট্যান্ডার্ড', hex: '#222' }
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Reviews & Rating System State
  const [reviews, setReviews] = useState<Review[]>(() =>
    storageService.getReviews(product.id, true)
  );
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [visibleCount, setVisibleCount] = useState(4);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [targetOrderId, setTargetOrderId] = useState<string>('');
  
  // Image Lightbox
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string>('');
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  // Subscribe to real-time review updates
  useEffect(() => {
    const updateReviews = () => {
      setReviews(storageService.getReviews(product.id, true));
    };
    updateReviews();
    const unsub = storageService.subscribe(updateReviews);
    return unsub;
  }, [product.id]);

  // Check customer order eligibility
  const eligibleDeliveredOrders = useMemo(() => {
    if (!user) return [];
    return storageService.getCustomerDeliveredOrdersForProduct(user.id, product.id);
  }, [user, product.id, reviews]);

  const unreviewedDeliveredOrder = useMemo(() => {
    return eligibleDeliveredOrders.find((item) => !item.alreadyReviewed)?.order;
  }, [eligibleDeliveredOrders]);

  const hasAnyReviewed = useMemo(() => {
    return eligibleDeliveredOrders.some((item) => item.alreadyReviewed);
  }, [eligibleDeliveredOrders]);

  // Rating Statistics & Breakdown calculation
  const { averageRating, totalCount, distribution } = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        averageRating: 5.0,
        totalCount: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      dist[star] = (dist[star] || 0) + 1;
      sum += r.rating;
    }
    const avg = Number((sum / total).toFixed(1));
    return {
      averageRating: avg,
      totalCount: total,
      distribution: dist,
    };
  }, [reviews]);

  // Sorted reviews list
  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();

      if (sortBy === 'newest') return timeB - timeA;
      if (sortBy === 'oldest') return timeA - timeB;
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return timeB - timeA;
    });
    return list;
  }, [reviews, sortBy]);

  const handleOpenWriteReview = (orderId?: string) => {
    if (!user) {
      onToast(
        language === 'bn' ? 'রিভিউ দিতে অনুগ্রহ করে প্রথমে লগইন করুন।' : 'Please sign in to write a review.',
        'info'
      );
      openLoginModal('login');
      return;
    }

    const orderToReview = orderId || unreviewedDeliveredOrder?.id;
    if (!orderToReview) {
      if (hasAnyReviewed) {
        onToast(
          language === 'bn' 
            ? 'আপনি এই প্রোডাক্টের জন্য ইতিমধ্যে রিভিউ প্রদান করেছেন।' 
            : 'You have already reviewed this product.',
          'info'
        );
      } else {
        onToast(
          language === 'bn'
            ? 'শুধুমাত্র ডেলিভারি সম্পন্ন অর্ডারের প্রোডাক্টে রিভিউ দেওয়া যায়।'
            : 'Reviews are only available after your order has been delivered.',
          'info'
        );
      }
      return;
    }

    setTargetOrderId(orderToReview);
    setIsReviewModalOpen(true);
  };

  const handleReport = async (review: Review) => {
    if (!user) {
      openLoginModal('login');
      return;
    }
    try {
      await storageService.reportReview(
        review.id,
        product.id,
        'Inappropriate content or spam reported by user'
      );
      onToast(
        language === 'bn' ? 'রিভিউটি মডারেশনের জন্য রিপোর্ট করা হয়েছে।' : 'Review reported for moderation.',
        'info'
      );
    } catch {
      onToast('Report failed', 'error');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onToast(
      language === 'bn'
        ? `"${product.titleBn}" ব্যাগে যুক্ত হয়েছে!`
        : `"${product.titleEn}" added to your bag!`,
      'success'
    );
  };

  const handleBuyNow = () => {
    // 1. Debug Logs
    console.log("BUY NOW CLICKED");
    console.log("PRODUCT:", product);
    console.log("PRODUCT ID:", product?.id);
    console.log("CURRENT USER:", auth.currentUser);

    // 2. Product ID & Product Validation Check
    if (!product || !product.id) {
      console.error('BUY NOW: Product ID is missing');
      onToast(
        language === 'bn' ? 'পণ্য শনাক্ত করা যায়নি (Product ID is missing)' : 'Product ID is missing',
        'error'
      );
      return;
    }

    // 3. Firebase Authentication Check
    if (!auth.currentUser) {
      console.log('Firebase Auth: currentUser is null. Storing pending Buy Now and prompting login.');
      try {
        sessionStorage.setItem(
          'mfh_pending_buynow',
          JSON.stringify({
            productId: product.id,
            product,
            size: selectedSize,
            color: selectedColor,
            quantity: quantity || 1,
          })
        );
      } catch (err) {
        console.warn('Could not store pending buynow session:', err);
      }

      onToast(
        language === 'bn'
          ? 'এখনই কিনতে অনুগ্রহ করে প্রথমে লগইন অথবা রেজিস্টার করুন।'
          : 'Please sign in or register to buy now.',
        'info'
      );
      openLoginModal('login');
      return;
    }

    // 4. User is logged in: direct checkout with current product
    buyNow(product, selectedSize, selectedColor, quantity || 1);
    onClose();
    onNavigateToCheckout();
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex justify-center items-start pt-6 sm:pt-10 pb-16 px-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-stone-200 overflow-hidden relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-stone-100 text-stone-700 shadow-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Left: Gallery */}
            <div className="space-y-4">
              <div className="aspect-3/4 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs relative">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.titleEn}
                  className="w-full h-full object-cover object-center"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-extrabold bg-rose-600 text-white shadow-md">
                    -{discountPercent}% {t.off}
                  </span>
                )}

                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all ${
                    isWishlisted
                      ? 'bg-rose-50 text-rose-600 shadow-md'
                      : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                </button>
              </div>

              {/* Thumbnails if multiple images exist */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === idx
                          ? 'border-amber-700 ring-2 ring-amber-700/20'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust micro-badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-stone-600">
                <div className="flex items-center gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-100">
                  <Truck className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>{language === 'bn' ? 'দ্রুত হোম ডেলিভারি' : 'Fast Delivery'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span>{language === 'bn' ? '১০০% অরিজিনাল' : '100% Genuine'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-100">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>{language === 'bn' ? '৭ দিনে এক্সচেঞ্জ' : '7-Day Return'}</span>
                </div>
              </div>
            </div>

            {/* Right: Details & Purchase Options */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Rating */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                    {product.category} • {product.subCategory}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-stone-400">({reviews.length} reviews)</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                  {language === 'bn' ? product.titleBn : product.titleEn}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-serif">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-stone-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {product.stock > 0 ? `${product.stock} ${t.itemsLeft}` : t.outOfStock}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {language === 'bn' ? product.descriptionBn : product.descriptionEn}
                </p>

                {/* Fabric & SKU specs */}
                <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 text-stone-700 border border-stone-100">
                  <div>
                    <span className="font-bold text-stone-900">{t.fabricDetails}:</span>{' '}
                    <span>{product.fabric}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900">{t.sku}:</span>{' '}
                    <span className="font-mono text-stone-600">{product.sku}</span>
                  </div>
                </div>

                {/* Size Selector + Size Guide Button */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      {t.selectSize}: <span className="text-amber-800">{selectedSize}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{t.sizeGuide}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === sz
                            ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-amber-600'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Swatch Selector */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    {t.selectColor}:{' '}
                    <span className="text-amber-800">
                      {language === 'bn' ? selectedColor.nameBn : selectedColor.nameEn}
                    </span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 ${
                          selectedColor.nameEn === c.nameEn
                            ? 'border-amber-700 ring-2 ring-amber-600/30 scale-110'
                            : 'border-transparent'
                        }`}
                        title={c.nameEn}
                      >
                        <span
                          className="w-full h-full rounded-full block border border-stone-300 shadow-xs"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    {t.quantity}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-sm font-bold text-stone-900 min-w-[2rem] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock}
                        className="p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-stone-500">
                      {t.subtotal}: <strong className="text-stone-900 font-serif">{formatPrice(product.price * quantity)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Bag & Buy Now */}
              <div className="space-y-2.5 pt-4 border-t border-stone-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full py-3 px-4 rounded-xl border-2 border-stone-900 hover:bg-stone-900 hover:text-white text-stone-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.addToCart}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-900/20 transition-all disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{t.buyNow}</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-500 text-center">
                  {t.deliveryNotice}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CUSTOMER REVIEWS & RATINGS SECTION */}
          {/* ========================================================================= */}
          <div id="reviews-section" className="p-6 sm:p-8 bg-stone-50 border-t border-stone-200 space-y-6">
            
            {/* Header & Write Review Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-700" />
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {language === 'bn' ? 'ক্রেতাদের রিভিউ ও রেটিং' : 'Customer Reviews & Ratings'}
                  </h3>
                </div>
                <p className="text-xs text-stone-500">
                  {language === 'bn' 
                    ? 'শুধুমাত্র ডেলিভারি পাওয়া যাচাইকৃত ক্রেতাদের বাস্তব ছবি ও মতামত।' 
                    : 'Authentic photos and reviews from verified customers after delivery.'}
                </p>
              </div>

              {/* Write Review Button / Status */}
              <div>
                {unreviewedDeliveredOrder ? (
                  <button
                    type="button"
                    onClick={() => handleOpenWriteReview(unreviewedDeliveredOrder.id)}
                    className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-900/10 transition-all cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span>{language === 'bn' ? 'রিভিউ দিন (+ছবি সহ)' : 'Write Review (+Photo)'}</span>
                  </button>
                ) : hasAnyReviewed ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'bn' ? 'আপনি রিভিউ প্রদান করেছেন' : 'You have reviewed this product'}</span>
                  </div>
                ) : user ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 text-xs">
                    <PackageCheck className="w-4 h-4 text-amber-700" />
                    <span>{language === 'bn' ? 'প্রোডাক্ট ডেলিভারির পর রিভিউ দিতে পারবেন' : 'Review available after delivery'}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openLoginModal('login')}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'লগইন করে রিভিউ দিন' : 'Login to Review'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Rating Breakdown Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs items-center">
              
              {/* Average Rating Score */}
              <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-stone-100 pb-4 md:pb-0 md:pr-6">
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-4xl font-extrabold text-stone-900 font-serif">
                    {totalCount > 0 ? averageRating : '5.0'}
                  </span>
                  <span className="text-xs text-stone-400">/ 5.0</span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-stone-500">
                  {totalCount > 0 
                    ? (language === 'bn' ? `সর্বমোট ${totalCount} টি যাচাইকৃত রিভিউ` : `Based on ${totalCount} verified reviews`)
                    : (language === 'bn' ? 'এখনও কোনো রিভিউ যুক্ত হয়নি' : 'No customer reviews yet')}
                </p>
              </div>

              {/* Star Distribution Bars */}
              <div className="md:col-span-8 space-y-2 text-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = distribution[star] || 0;
                  const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-10 text-stone-600 font-semibold flex items-center gap-0.5 justify-end">
                        <span>{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                      </span>
                      <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-12 text-stone-400 text-[11px] font-mono text-right">
                        {count} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sorting Toolbar */}
            {reviews.length > 1 && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500 font-medium">
                  {language === 'bn' ? `${reviews.length} টি রিভিউ প্রদর্শিত হচ্ছে:` : `Showing ${reviews.length} reviews:`}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-stone-500 text-[11px]">{language === 'bn' ? 'সাজান:' : 'Sort by:'}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-semibold focus:border-amber-600 outline-none cursor-pointer"
                  >
                    <option value="newest">{language === 'bn' ? 'নতুন রিভিউ আগে (Newest)' : 'Newest'}</option>
                    <option value="oldest">{language === 'bn' ? 'পুরোনো রিভিউ আগে (Oldest)' : 'Oldest'}</option>
                    <option value="highest">{language === 'bn' ? 'সর্বোচ্চ রেটিং (Highest Rating)' : 'Highest Rating'}</option>
                    <option value="lowest">{language === 'bn' ? 'সর্বনিম্ন রেটিং (Lowest Rating)' : 'Lowest Rating'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Review Cards List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs text-stone-600 font-semibold">
                    {language === 'bn'
                      ? 'এখনও কোনো রিভিউ দেওয়া হয়নি।'
                      : 'No customer reviews yet for this product.'}
                  </p>
                  <p className="text-[11px] text-stone-400 max-w-sm mx-auto leading-relaxed">
                    {language === 'bn'
                      ? 'আপনি এই ড্রেসটি ক্রয় করে ডেলিভারি পেলে নিজের হাতে তোলা ছবি সহ প্রথম রিভিউ দিয়ে অন্য ক্রেতাদের উৎসাহিত করুন!'
                      : 'Purchase this dress and be the first to share your real photo and feedback after delivery!'}
                  </p>
                </div>
              ) : (
                sortedReviews.slice(0, visibleCount).map((rev) => {
                  const photos = rev.reviewImages && rev.reviewImages.length > 0 
                    ? rev.reviewImages 
                    : rev.reviewImage ? [rev.reviewImage] : [];

                  return (
                    <div 
                      key={rev.id} 
                      className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 shadow-2xs hover:border-stone-300 transition-colors"
                    >
                      {/* Top Bar: Stars, Date, Report */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-amber-900 text-xs">
                            {rev.rating}.0
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-stone-400 text-[11px]">
                            {rev.date}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleReport(rev)}
                            className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer"
                            title={language === 'bn' ? 'রিপোর্ট করুন' : 'Report'}
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Customer Info & Verified Badge */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs">
                          {rev.customerName || rev.userName}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{language === 'bn' ? 'যাচাইকৃত ক্রেতা' : 'Verified Purchase'}</span>
                          </span>
                        )}
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {rev.reviewText || rev.comment}
                      </p>

                      {/* Customer Uploaded Photos */}
                      {photos.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                            {language === 'bn' ? 'ক্রেতার তোলা ছবি:' : 'Customer Photos:'}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {photos.map((imgUrl, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  setLightboxImageUrl(imgUrl);
                                  setLightboxTitle(
                                    `${rev.customerName || rev.userName} - ${product.titleEn}`
                                  );
                                }}
                                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 hover:opacity-90 hover:scale-105 transition-all shadow-2xs group cursor-pointer"
                              >
                                <img
                                  src={imgUrl}
                                  alt="Customer Review Photo"
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

              {/* Load More Button */}
              {sortedReviews.length > visibleCount && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 4)}
                    className="px-5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {language === 'bn' 
                      ? `আরও রিভিউ দেখুন (${sortedReviews.length - visibleCount} বাকি)` 
                      : `Load More Reviews (${sortedReviews.length - visibleCount} remaining)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal Trigger */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={product}
        orderId={targetOrderId}
        onSuccess={() => {
          setReviews(storageService.getReviews(product.id, true));
        }}
        onToast={onToast}
      />

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImageUrl)}
        onClose={() => setLightboxImageUrl('')}
        imageUrl={lightboxImageUrl}
        title={lightboxTitle}
      />

      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={product.category}
      />
    </>
  );
};
