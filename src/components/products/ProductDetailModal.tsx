import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { Product, ProductColor, Review } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { storageService } from '../../services/storageService';
import { SizeGuideModal } from './SizeGuideModal';

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
  const { openLoginModal } = useAuth();

  if (!isOpen || !product) return null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0] || { nameEn: 'Standard', nameBn: 'স্ট্যান্ডার্ড', hex: '#222' }
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(() =>
    storageService.getReviews(product.id)
  );

  // Review Form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) {
      onToast(
        language === 'bn' ? 'অনুগ্রহ করে নাম এবং মতামত লিখুন' : 'Please provide your name and review comment',
        'error'
      );
      return;
    }

    setIsSubmittingReview(true);
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      productId: product.id,
      userName: reviewerName.trim(),
      rating: reviewerRating,
      comment: reviewerComment.trim(),
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
    };

    storageService.addReview(newRev);
    setReviews(storageService.getReviews(product.id));
    setReviewerName('');
    setReviewerComment('');
    setIsSubmittingReview(false);
    onToast(t.reviewSubmitted, 'success');
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

          {/* Customer Reviews Section */}
          <div className="p-6 sm:p-8 bg-stone-50 border-t border-stone-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {t.customerReviews} ({reviews.length})
                </h3>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating} / 5.0</span>
              </div>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-stone-500 py-2">
                  {language === 'bn' ? 'এখনও কোনো রিভিউ যুক্ত হয়নি। আপনার মতামত দিয়ে প্রথম হোন!' : 'No reviews yet. Be the first to review this dress!'}
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                            {language === 'bn' ? 'যাচাইকৃত ক্রেতা' : 'Verified Buyer'}
                          </span>
                        )}
                      </div>
                      <span className="text-stone-400 text-[10px]">{rev.date}</span>
                    </div>
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                {t.writeReview}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {t.yourName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Asif Mahmud"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {t.yourRating}
                  </label>
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewerRating(star)}
                        className="text-amber-400 p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewerRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  {t.description} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  placeholder={t.yourReview}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {t.submitReview}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={product.category}
      />
    </>
  );
};
