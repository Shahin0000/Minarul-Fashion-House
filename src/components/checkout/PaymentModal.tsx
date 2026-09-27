import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Copy, Check, Loader2, ArrowRight, Phone } from 'lucide-react';
import { PaymentMethod } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { normalizePhoneNumber, isValidBangladeshiPhone } from '../../utils/phoneUtils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: PaymentMethod;
  amount: number;
  initialSenderMobile?: string;
  initialTrxId?: string;
  onConfirm: (senderMobile: string, trxId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  method,
  amount,
  initialSenderMobile = '',
  initialTrxId = '',
  onConfirm,
}) => {
  const { language, formatPrice } = useLanguage();
  const [senderMobile, setSenderMobile] = useState(initialSenderMobile);
  const [trxId, setTrxId] = useState(initialTrxId);
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const settings = storageService.getSettings();

  useEffect(() => {
    if (isOpen) {
      setSenderMobile(initialSenderMobile);
      setTrxId(initialTrxId);
      setErrorMsg('');
    }
  }, [isOpen, initialSenderMobile, initialTrxId]);

  if (!isOpen) return null;

  const merchantNumber =
    method === 'bkash'
      ? settings.bkashMerchantNumber
      : method === 'nagad'
      ? settings.nagadMerchantNumber
      : method === 'rocket'
      ? settings.rocketMerchantNumber
      : '01712-345678';

  const methodDetails = {
    bkash: {
      name: 'bKash (বিকাশ)',
      color: 'bg-pink-600',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-500',
      code: '*247#',
      type: 'bKash Merchant / Personal Send Money',
    },
    nagad: {
      name: 'Nagad (নগদ)',
      color: 'bg-orange-600',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-500',
      code: '*167#',
      type: 'Nagad Send Money / Payment',
    },
    rocket: {
      name: 'Rocket (রকেট)',
      color: 'bg-purple-700',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-500',
      code: '*322#',
      type: 'Rocket DBBL Mobile Banking',
    },
    cod: {
      name: 'Cash on Delivery',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-500',
      code: '',
      type: 'COD',
    },
  }[method] || {
    name: 'Mobile Banking',
    color: 'bg-amber-600',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-500',
    code: '',
    type: 'Mobile Payment',
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(merchantNumber.replace(/[^0-9]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSender = normalizePhoneNumber(senderMobile);
    if (!cleanSender || !isValidBangladeshiPhone(cleanSender)) {
      setErrorMsg(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ১১ সংখ্যার প্রেরক বিকাশ/নগদ/রকেট নম্বর লিখুন (যেমন: 017XXXXXXXX)।'
          : 'Please enter a valid 11-digit sender mobile number starting with 01.'
      );
      return;
    }

    if (!trxId.trim() || trxId.trim().length < 6) {
      setErrorMsg(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ৮-১০ অক্ষরের ট্রানজেকশন আইডি (TrxID) লিখুন।'
          : 'Please enter a valid Transaction ID (TrxID).'
      );
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);
      onConfirm(cleanSender, trxId.trim().toUpperCase());
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className={`${methodDetails.color} p-5 text-white flex items-center justify-between`}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
              {language === 'bn' ? 'নিরাপদ মোবাইল পেমেন্ট' : 'Secure Payment Gateway'}
            </span>
            <h3 className="font-serif text-lg font-bold">{methodDetails.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Merchant Info */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
            <span className="text-xs text-stone-500">
              {language === 'bn' ? 'পরিশোধযোগ্য মোট মূল্য:' : 'Total Payable Amount:'}
            </span>
            <div className="text-2xl font-extrabold text-stone-950 font-serif">
              {formatPrice(amount)}
            </div>
          </div>

          {/* Number & Copy */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              {language === 'bn' ? 'মিনারুল ফ্যাশন মার্চেন্ট অ্যাকাউন্ট নম্বর:' : 'Merchant Account Number:'}
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-stone-300 bg-stone-50">
              <span className="font-mono text-base font-extrabold text-stone-900 tracking-wider">
                {merchantNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-950 space-y-1">
            <h5 className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>{language === 'bn' ? 'পেমেন্ট নির্দেশিকা:' : 'Quick Steps:'}</span>
            </h5>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-amber-900 leading-relaxed">
              <li>
                {language === 'bn'
                  ? `আপনার ${methodDetails.name} অ্যাপ বা ${methodDetails.code} ডায়াল করুন`
                  : `Open your ${methodDetails.name} app or dial ${methodDetails.code}`}
              </li>
              <li>
                {language === 'bn'
                  ? `Send Money / Payment অপশনে গিয়ে উপরে দেওয়া নম্বরে ৳${amount} টাকা পাঠান`
                  : `Send ${formatPrice(amount)} to the merchant number above`}
              </li>
              <li>
                {language === 'bn'
                  ? 'মেসেজ থেকে পাওয়া Transaction ID (TrxID) নিচে লিখে নিশ্চিত করুন'
                  : 'Enter the Transaction ID (TrxID) from your confirmation SMS below'}
              </li>
            </ol>
          </div>

          {/* Form for Sender Mobile and TrxID */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                {language === 'bn' ? 'প্রেরক মোবাইল নম্বর (যে নম্বর থেকে টাকা পাঠিয়েছেন) *' : 'Sender Mobile Number (Paid From) *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={senderMobile}
                  onChange={(e) => {
                    setSenderMobile(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-xs font-mono pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Transaction ID (TrxID) *
              </label>
              <input
                type="text"
                required
                value={trxId}
                onChange={(e) => {
                  setTrxId(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                placeholder="e.g. BK9X87261M or NG882103"
                className="w-full text-sm font-mono uppercase tracking-widest px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none font-bold"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 mt-1 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className={`w-full py-3 rounded-xl ${methodDetails.color} hover:opacity-90 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'পেমেন্ট যাচাই করা হচ্ছে...' : 'Verifying TrxID...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'bn' ? 'পেমেন্ট সম্পন্ন করুন' : 'Confirm & Complete'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
