import React, { useState } from 'react';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { Order, OrderStatus } from '../../types';

interface TrackOrderViewProps {
  initialOrderId?: string;
  onViewInvoice: (order: Order) => void;
  onShopNow: () => void;
}

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({
  initialOrderId = '',
  onViewInvoice,
  onShopNow,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(initialOrderId);
  const [foundOrder, setFoundOrder] = useState<Order | null>(() => {
    if (initialOrderId) {
      return storageService.getOrderById(initialOrderId) || null;
    }
    const allOrders = storageService.getOrders();
    return allOrders.length > 0 ? allOrders[0] : null;
  });
  const [errorMsg, setErrorMsg] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = storageService.getOrderById(searchQuery.trim());
    if (res) {
      setFoundOrder(res);
      setErrorMsg(false);
    } else {
      setFoundOrder(null);
      setErrorMsg(true);
    }
  };

  const steps: { key: OrderStatus; labelEn: string; labelBn: string; descEn: string; descBn: string }[] = [
    {
      key: 'pending',
      labelEn: t.timelinePending,
      labelBn: t.timelinePending,
      descEn: t.timelinePendingDesc,
      descBn: t.timelinePendingDesc,
    },
    {
      key: 'confirmed',
      labelEn: t.timelineConfirmed,
      labelBn: t.timelineConfirmed,
      descEn: t.timelineConfirmedDesc,
      descBn: t.timelineConfirmedDesc,
    },
    {
      key: 'packaging',
      labelEn: t.timelinePackaging,
      labelBn: t.timelinePackaging,
      descEn: t.timelinePackagingDesc,
      descBn: t.timelinePackagingDesc,
    },
    {
      key: 'shipped',
      labelEn: t.timelineShipped,
      labelBn: t.timelineShipped,
      descEn: t.timelineShippedDesc,
      descBn: t.timelineShippedDesc,
    },
    {
      key: 'delivered',
      labelEn: t.timelineDelivered,
      labelBn: t.timelineDelivered,
      descEn: t.timelineDeliveredDesc,
      descBn: t.timelineDeliveredDesc,
    },
  ];

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const orderRank: Record<OrderStatus, number> = {
      pending: 1,
      confirmed: 2,
      packaging: 3,
      shipped: 4,
      delivered: 5,
      cancelled: 0,
    };

    const currentRank = orderRank[currentStatus] || 1;
    const targetRank = orderRank[stepKey] || 1;

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentRank > targetRank) return 'completed';
    if (currentRank === targetRank) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-stone-100/60 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title & Search Bar */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {t.trackYourOrder}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-1">
              {t.trackSubtitle}
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setErrorMsg(false);
              }}
              placeholder="e.g. MFH-88214 or 017XXXXXXXX"
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 outline-none font-semibold uppercase tracking-wider"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>{t.trackBtn}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4" />
              <span>{t.orderNotFound}</span>
            </div>
          )}
        </div>

        {/* Found Order Card */}
        {foundOrder && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
              <div>
                <span className="text-xs text-stone-400 block">{t.orderId}</span>
                <span className="text-xl sm:text-2xl font-extrabold text-stone-950 font-mono">
                  {foundOrder.id}
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Placed on {new Date(foundOrder.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    foundOrder.orderStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : foundOrder.orderStatus === 'shipped'
                      ? 'bg-amber-100 text-amber-800'
                      : foundOrder.orderStatus === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Status: {foundOrder.orderStatus}
                </span>

                <button
                  onClick={() => onViewInvoice(foundOrder)}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ইনভয়েস দেখুন' : 'View Invoice'}</span>
                </button>
              </div>
            </div>

            {/* Courier Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-amber-50/60 rounded-2xl border border-amber-200/50 text-xs">
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold">
                  {language === 'bn' ? 'কুরিয়ার পার্টনার' : 'Courier Service'}
                </span>
                <p className="font-bold text-stone-900 mt-0.5">
                  {foundOrder.courierName || 'Steadfast Courier'}
                </p>
              </div>
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold">
                  {language === 'bn' ? 'ট্র্যাকিং নম্বর' : 'Tracking ID'}
                </span>
                <p className="font-mono font-bold text-amber-900 mt-0.5">
                  {foundOrder.courierTrackingId || 'STF-BD-PENDING'}
                </p>
              </div>
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold">
                  {language === 'bn' ? 'গন্তব্য জেলা' : 'Destination'}
                </span>
                <p className="font-bold text-stone-900 mt-0.5">
                  {foundOrder.shippingAddress.district}, {foundOrder.shippingAddress.division}
                </p>
              </div>
            </div>

            {/* Timeline Stepper */}
            <div className="space-y-6 pt-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                {language === 'bn' ? 'ডেলিভারি ট্র্যাকিং অগ্রগতি' : 'Shipment Journey'}
              </h3>

              <div className="relative border-l-2 border-stone-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
                {steps.map((step) => {
                  const status = getStepStatus(step.key, foundOrder.orderStatus);

                  return (
                    <div key={step.key} className="relative">
                      {/* Circle Indicator */}
                      <div
                        className={`absolute -left-[35px] sm:-left-[43px] top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                          status === 'completed'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : status === 'current'
                            ? 'bg-amber-600 border-amber-600 text-white ring-4 ring-amber-600/20 animate-pulse'
                            : 'bg-white border-stone-300 text-stone-300'
                        }`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>

                      {/* Step Text */}
                      <div className="space-y-1">
                        <h4
                          className={`text-sm sm:text-base font-bold ${
                            status === 'current'
                              ? 'text-amber-800'
                              : status === 'completed'
                              ? 'text-stone-900'
                              : 'text-stone-400'
                          }`}
                        >
                          {language === 'bn' ? step.labelBn : step.labelEn}
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {language === 'bn' ? step.descBn : step.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items Snapshot */}
            <div className="border-t border-stone-200 pt-6">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                {language === 'bn' ? 'পোশাকের বিবরণ' : 'Dresses in this Parcel'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {foundOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <img
                      src={item.image}
                      alt={item.titleEn}
                      className="w-12 h-14 object-cover rounded-lg border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-stone-900 truncate">
                        {language === 'bn' ? item.titleBn : item.titleEn}
                      </h5>
                      <p className="text-[11px] text-stone-500">
                        {t.size}: {item.size} • Qty: {item.quantity}
                      </p>
                      <span className="text-xs font-bold font-serif text-amber-800">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
