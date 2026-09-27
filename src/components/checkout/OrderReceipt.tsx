import React from 'react';
import { 
  CheckCircle2, 
  Printer, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail,
  Calendar, 
  Truck, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { Order } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface OrderReceiptProps {
  order: Order;
  onContinueShopping: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({
  order,
  onContinueShopping,
  onTrackOrder,
}) => {
  const { language, formatPrice, t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    language === 'bn' ? 'bn-BD' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  return (
    <div className="bg-stone-100/60 py-10 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header Notice */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 text-center space-y-4 shadow-sm mb-6 print:hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {t.orderSuccessTitle}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
              {t.orderSuccessSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-700" />
              <span>
                {order.paymentMethod === 'cod'
                  ? 'Print Memo'
                  : language === 'bn' ? 'Print Invoice (ইনভয়েস প্রিন্ট)' : 'Print Invoice'}
              </span>
            </button>

            <button
              onClick={() => onTrackOrder(order.id)}
              className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>{t.trackYourOrder}</span>
            </button>

            <button
              onClick={onContinueShopping}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.continueShopping}</span>
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-stone-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-serif font-black text-2xl">
                M
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-none">
                  MINARUL FASHION HOUSE
                </h2>
                <p className="text-[11px] text-amber-800 font-semibold tracking-wider uppercase mt-1">
                  Dhaka, Bangladesh • Hotline: +880 1712-345678
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold font-mono">
                {order.paymentMethod === 'cod' ? 'ORDER MEMO: ' : 'INVOICE: '}{order.id}
              </div>
              <p className="text-xs text-stone-500">{formattedDate}</p>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-stone-50 p-5 rounded-2xl border border-stone-200/80">
            <div className="space-y-1">
              <span className="font-bold text-stone-900 uppercase tracking-wider block text-[10px] text-amber-800">
                {language === 'bn' ? 'গ্রাহক ও ডেলিভারি তথ্য' : 'Customer & Shipping Info'}
              </span>
              <p className="font-bold text-sm text-stone-900">{order.customerName || order.shippingAddress.fullName}</p>
              <p className="text-stone-600 flex items-center gap-1.5 pt-0.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{order.customerPhone || order.shippingAddress.phone}</span>
              </p>
              {(order.customerEmail || order.shippingAddress.email) && (
                <p className="text-stone-600 flex items-center gap-1.5 pt-0.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{order.customerEmail || order.shippingAddress.email}</span>
                </p>
              )}
              <p className="text-stone-600 flex items-start gap-1.5 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                <span>
                  {order.shippingAddress.address}, {order.shippingAddress.district},{' '}
                  {order.shippingAddress.division}
                </span>
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="font-bold text-stone-900 uppercase tracking-wider block text-[10px] text-amber-800">
                {order.paymentMethod === 'cod'
                  ? (language === 'bn' ? 'পেমেন্ট মেথড (ক্যাশ অন ডেলিভারি)' : 'Payment Method: Cash on Delivery')
                  : (language === 'bn' ? 'মোবাইল পেমেন্ট তথ্য' : 'Mobile Payment Info')}
              </span>
              <p className="font-bold text-stone-900 uppercase">
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery (ক্যাশ অন ডেলিভারি)'
                  : `${order.paymentMethod.toUpperCase()} Mobile Banking`}
              </p>
              
              {/* Payment Details */}
              {order.paymentMethod === 'cod' ? (
                <div className="space-y-0.5 pt-1 text-[11px] text-stone-700 sm:text-right font-mono">
                  <p>
                    <span className="text-stone-500 font-sans">Payment Method: </span>
                    <strong className="text-stone-900">Cash on Delivery (COD)</strong>
                  </p>
                  <p>
                    <span className="text-stone-500 font-sans">Payment Status: </span>
                    <strong className="text-amber-700">Pending</strong>
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5 pt-1 text-[11px] text-stone-700 sm:text-right font-mono">
                  {order.senderMobile && (
                    <p>
                      <span className="text-stone-500 font-sans">Sender Mobile: </span>
                      <strong>{order.senderMobile}</strong>
                    </p>
                  )}
                  {order.transactionId && (
                    <p>
                      <span className="text-stone-500 font-sans">TrxID: </span>
                      <strong className="text-emerald-800">{order.transactionId}</strong>
                    </p>
                  )}
                  <p>
                    <span className="text-stone-500 font-sans">Payment Status: </span>
                    <strong className={order.paymentStatus === 'verified' ? 'text-emerald-700' : 'text-amber-700'}>
                      {order.paymentStatus === 'verified' ? 'Verified (যাচাইকৃত)' : 'Submitted (জমা দেওয়া হয়েছে)'}
                    </strong>
                  </p>
                </div>
              )}

              <p className="text-stone-600 pt-1">
                {language === 'bn' ? 'কুরিয়ার পার্টনার:' : 'Courier Partner:'}{' '}
                <strong>{order.courierName || 'Steadfast Courier'}</strong>
              </p>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                  Order Status: {order.orderStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Item & Details</th>
                  <th className="py-2.5 text-center">Size</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-3">
                    <td className="py-3 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.titleEn}
                        className="w-10 h-12 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-stone-900">
                          {language === 'bn' ? item.titleBn : item.titleEn}
                        </div>
                        <div className="text-[11px] text-stone-400">{item.colorName}</div>
                      </div>
                    </td>
                    <td className="py-3 text-center font-bold">{item.size}</td>
                    <td className="py-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 text-right font-serif">{formatPrice(item.price)}</td>
                    <td className="py-3 text-right font-bold font-serif text-stone-900">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-stone-200 pt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{t.subtotal}</span>
                <span className="font-serif">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>
                    {t.discount} ({order.couponCode})
                  </span>
                  <span className="font-serif">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>{t.deliveryFee}</span>
                <span className="font-serif">
                  {order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-950 pt-2 border-t border-stone-200">
                <span>{t.total}</span>
                <span className="font-serif text-amber-900 text-lg">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note on invoice / memo */}
          <div className="border-t border-stone-200 pt-6 text-center text-[11px] text-stone-500 space-y-1">
            <p className="font-bold text-stone-800 text-xs">
              {order.paymentMethod === 'cod'
                ? (language === 'bn' ? 'আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ। (Thank you for shopping with us.)' : 'Thank you for shopping with us.')
                : (language === 'bn' ? 'আপনার অর্ডারের জন্য ধন্যবাদ। (Thank you for your order.)' : 'Thank you for your order.')}
            </p>
            <p>
              {language === 'bn'
                ? 'পণ্য সংক্রান্ত যেকোনো সহায়তায় যোগাযোগ করুন: +৮৮০ ১৭১২-৩৪৫৬৭৮'
                : 'For exchange or assistance, please reach our hotline: +880 1712-345678'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
