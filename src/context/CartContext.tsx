import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductColor, Coupon } from '../types';
import { storageService } from '../services/storageService';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  buyNow: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, colorName: string) => void;
  updateQuantity: (productId: string, size: string, colorName: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 2500;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mfh_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('mfh_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mfh_cart_items', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('mfh_applied_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('mfh_applied_coupon');
      }
    } catch {}
  }, [appliedCoupon]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (product: Product, size: string, color: ProductColor, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color.nameEn === color.nameEn
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, product.stock);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          titleEn: product.titleEn,
          titleBn: product.titleBn,
          image: product.images[0] || '',
          size,
          color,
          price: product.price,
          quantity: Math.min(quantity, product.stock),
          stock: product.stock,
        },
      ];
    });
    setIsOpen(true);
  };

  const buyNow = (product: Product, size: string, color: ProductColor, quantity = 1) => {
    if (!product || !product.id) {
      console.error('Product ID is missing');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color.nameEn === color.nameEn
      );

      const targetQuantity = Math.max(1, Math.min(quantity, product.stock));

      let updated: CartItem[];
      if (existingIndex > -1) {
        // Product already in cart: update to target quantity without duplicating
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: targetQuantity,
        };
      } else {
        updated = [
          ...prev,
          {
            productId: product.id,
            titleEn: product.titleEn,
            titleBn: product.titleBn,
            image: product.images[0] || '',
            size,
            color,
            price: product.price,
            quantity: targetQuantity,
            stock: product.stock,
          },
        ];
      }

      try {
        localStorage.setItem('mfh_cart_items', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not sync cart to localStorage:', err);
      }

      return updated;
    });

    setIsOpen(false);
  };

  const removeFromCart = (productId: string, size: string, colorName: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size && item.color.nameEn === colorName)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, colorName: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.size === size && item.color.nameEn === colorName) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...item, quantity: Math.min(nextQty, item.stock) };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const availableCoupons = storageService.getCoupons();
    const found = availableCoupons.find((c) => c.code.toUpperCase() === clean && c.isActive);

    if (!found) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }

    if (subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `This coupon requires a minimum order of ৳${found.minOrderValue}.`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
