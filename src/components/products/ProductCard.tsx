import React from 'react';
import { Heart, Eye, ShoppingBag, Star, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { storageService } from '../../services/storageService';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onNavigateToCheckout?: () => void;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  isWishlisted,
  onToggleWishlist,
  onNavigateToCheckout,
  onToast,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const { addToCart, buyNow } = useCart();
  const { openLoginModal } = useAuth();

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const defaultSize = product.sizes[0] || 'Standard';
  const defaultColor = product.colors[0] || { nameEn: 'Standard', nameBn: 'স্ট্যান্ডার্ড', hex: '#333' };

  const handleBuyNow = (targetProduct: Product) => {
    // 1. Debug Logs (as requested)
    console.log("BUY NOW CLICKED");
    console.log("PRODUCT:", targetProduct);
    console.log("PRODUCT ID:", targetProduct?.id);
    console.log("CURRENT USER:", auth.currentUser);

    // 2. Product Validation (as requested)
    if (!targetProduct) {
      console.error("BUY NOW: Product is missing");
      if (onToast) {
        onToast(language === 'bn' ? 'পণ্য পাওয়া যায়নি!' : 'Product is missing!', 'error');
      }
      return;
    }

    if (!targetProduct.id) {
      console.error("BUY NOW: Product ID is missing");
      if (onToast) {
        onToast(language === 'bn' ? 'পণ্যের আইডি পাওয়া যায়নি!' : 'Product ID is missing!', 'error');
      }
      return;
    }

    // Verify valid product attributes
    const productId = targetProduct.id;
    const productName = language === 'bn' ? targetProduct.titleBn : targetProduct.titleEn;
    const productPrice = targetProduct.price;
    const productImage = targetProduct.images?.[0] || '';
    const productStock = targetProduct.stock ?? 0;
    const productQuantity = 1;

    console.log("BUY NOW VALIDATED:", {
      productId,
      productName,
      productPrice,
      productImage,
      productStock,
      productQuantity,
    });

    // 3. Login Check
    const user = auth.currentUser;
    if (!user) {
      console.log("BUY NOW: User not logged in, storing pending buynow item and opening login modal");
      try {
        sessionStorage.setItem(
          'mfh_pending_buynow',
          JSON.stringify({
            productId: targetProduct.id,
            product: targetProduct,
            size: defaultSize,
            color: defaultColor,
            quantity: 1,
          })
        );
      } catch (err) {
        console.warn("Could not save pending Buy Now item in sessionStorage:", err);
      }

      if (onToast) {
        onToast(
          language === 'bn'
            ? 'এখনই কিনতে অনুগ্রহ করে প্রথমে লগইন অথবা রেজিস্টার করুন।'
            : 'Please sign in or register to buy now.',
          'info'
        );
      }

      openLoginModal('login');
      return;
    }

    // 4. User is logged in: Select product for checkout without requiring Add to Cart
    buyNow(targetProduct, defaultSize, defaultColor, 1);

    if (onToast) {
      onToast(
        language === 'bn'
          ? `"${language === 'bn' ? targetProduct.titleBn : targetProduct.titleEn}" চেকআউট পেজে নেওয়া হচ্ছে...`
          : `Proceeding to checkout with "${targetProduct.titleEn}"...`,
        'success'
      );
    }

    // 5. Checkout Navigation
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    } else {
      window.dispatchEvent(new CustomEvent('mfh:navigate', { detail: 'checkout' }));
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Product Image Container */}
      <div className="relative aspect-3/4 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onOpenDetails(product)}>
        <img
          src={product.images[0]}
          alt={product.titleEn}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-rose-600 text-white shadow-sm tracking-tight">
              -{discountPercent}% {t.off}
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-stone-950 uppercase tracking-wider">
              {t.bestseller}
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
              {t.newArrival}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md'
              : 'bg-white/80 text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Quick View Hover Trigger */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="flex-1 py-2 rounded-xl bg-white/95 hover:bg-white text-stone-900 font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-stone-600" />
            <span>{t.quickView}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, defaultSize, defaultColor, 1);
            }}
            className="p-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white shadow-md transition-colors"
            title={t.addToCart}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="uppercase font-semibold tracking-wider text-[10px] text-amber-800">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {language === 'bn' ? product.titleBn : product.titleEn}
          </h3>

          {/* Fabric badge */}
          <p className="text-[11px] text-stone-500 mt-1 truncate">
            {product.fabric}
          </p>

          {/* Color swatches */}
          <div className="flex items-center gap-1.5 mt-2">
            {product.colors.map((c, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full border border-stone-300 ring-1 ring-white"
                style={{ backgroundColor: c.hex }}
                title={c.nameEn}
              />
            ))}
            <span className="text-[10px] text-stone-400 ml-1">
              {product.sizes.length} {language === 'bn' ? 'টি সাইজ' : 'sizes'}
            </span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-stone-950 font-serif">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {product.stock > 0 ? t.inStock : t.outOfStock}
            </span>
          </div>

          {/* Quick Buy Now / Add to Cart for mobile & desktop */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, defaultSize, defaultColor, 1);
              }}
              className="w-full py-2 px-2 rounded-xl border border-stone-300 hover:border-amber-700 hover:bg-amber-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
              <span className="truncate">{t.addToCart}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBuyNow(product);
              }}
              className="w-full py-2 px-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="truncate">{language === 'bn' ? '⚡ এখনই কিনুন' : '⚡ Buy Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
