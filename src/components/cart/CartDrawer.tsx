import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onContinueShopping,
}) => {
  const {
    cart,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    amountNeededForFreeShipping,
  } = useCart();
  const { language, formatPrice, t } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({
      msg: res.message,
      isError: !res.success,
    });
    if (res.success) {
      setCouponInput('');
    }
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-700 text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                {t.yourCart}
              </h3>
              <p className="text-xs text-stone-500">
                {cart.length} {language === 'bn' ? 'টি আইটেম' : 'unique items'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-amber-50/70 px-4 py-3 border-b border-amber-200/50 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              {amountNeededForFreeShipping === 0
                ? t.freeShippingQualified
                : t.freeShippingProgress.replace('{amount}', formatPrice(amountNeededForFreeShipping))}
            </span>
            <span className="text-[10px]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-amber-200/70 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Line Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-800 text-base">{t.emptyCartTitle}</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">{t.emptyCartDesc}</p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  onContinueShopping();
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors inline-block"
              >
                {t.startShopping}
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color.nameEn}`} className="py-3 flex gap-3.5 items-center">
                {/* Thumbnail */}
                <img
                  src={item.image}
                  alt={item.titleEn}
                  className="w-16 h-20 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {language === 'bn' ? item.titleBn : item.titleEn}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span>
                      {t.size}: <strong>{item.size}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block"
                        style={{ backgroundColor: item.color.hex }}
                      />
                      <span>{language === 'bn' ? item.color.nameBn : item.color.nameEn}</span>
                    </span>
                  </div>

                  <div className="text-xs font-bold text-stone-900 font-serif mt-1">
                    {formatPrice(item.price)}
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 text-xs">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color.nameEn, -1)}
                        className="p-1 hover:bg-stone-200 text-stone-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 font-bold text-stone-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color.nameEn, 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 hover:bg-stone-200 text-stone-700 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.size, item.color.nameEn)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Bottom Summary & Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-4">
            {/* Coupon Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{appliedCoupon.code}</span>
                    <span className="text-[10px] text-emerald-600 font-normal">
                      (-{formatPrice(discount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-rose-600 font-semibold hover:underline"
                  >
                    {t.removeCoupon}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponFeedback(null);
                    }}
                    placeholder={t.enterCoupon}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-600 outline-none uppercase font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {t.apply}
                  </button>
                </form>
              )}

              {couponFeedback && (
                <p
                  className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                    couponFeedback.isError ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {couponFeedback.isError ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  <span>{couponFeedback.msg}</span>
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200/80 pt-3">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-stone-900 font-serif">
                  {formatPrice(subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{t.discount}</span>
                  <span className="font-serif">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-stone-500">
                <span>{t.deliveryFee}</span>
                <span>{language === 'bn' ? 'চেকআউটে নির্ধারিত হবে' : 'Calculated at checkout'}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
                <span>{t.total}</span>
                <span className="font-serif text-amber-900 font-extrabold">
                  {formatPrice(subtotal - discount)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                closeCart();
                onNavigateToCheckout();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-900/20 transition-all transform active:scale-98"
            >
              <span>{t.proceedToCheckout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
