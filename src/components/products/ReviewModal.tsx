import React, { useState, useRef } from 'react';
import { 
  X, 
  Star, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Package
} from 'lucide-react';
import { Product, Review } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  orderId: string;
  onSuccess: (review: Review) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  orderId,
  onSuccess,
  onToast,
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const starLabels: Record<number, { bn: string; en: string }> = {
    1: { bn: 'খুবই খারাপ (Very Poor)', en: 'Very Poor' },
    2: { bn: 'চলনসই (Fair)', en: 'Fair' },
    3: { bn: 'মোটামুটি (Good)', en: 'Good' },
    4: { bn: 'খুব ভালো (Very Good)', en: 'Very Good' },
    5: { bn: 'অসাধারণ (Excellent)', en: 'Excellent' },
  };

  const activeStar = hoverRating || rating;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total photos limit (max 5)
    if (selectedPhotos.length + files.length > 5) {
      setErrorMessage(
        language === 'bn' 
          ? 'সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে।' 
          : 'You can upload a maximum of 5 photos.'
      );
      return;
    }

    const validNewFiles: File[] = [];
    const validNewPreviews: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(
          language === 'bn'
            ? `"${file.name}" ছবির সাইজ ৫ মেগাবাইটের বেশি। সর্বোচ্চ 5MB গ্রহণযোগ্য।`
            : `"${file.name}" exceeds 5MB. Maximum size is 5MB per photo.`
        );
        continue;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        setErrorMessage(
          language === 'bn'
            ? 'শুধুমাত্র JPG, PNG বা WEBP ফরম্যাটের ছবি আপলোড করুন।'
            : 'Only JPG, PNG or WEBP images are supported.'
        );
        continue;
      }
      validNewFiles.push(file);
      validNewPreviews.push(URL.createObjectURL(file));
    }

    setSelectedPhotos((prev) => [...prev, ...validNewFiles]);
    setPreviewUrls((prev) => [...prev, ...validNewPreviews]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation 1: Star Rating
    if (!rating || rating === 0) {
      setErrorMessage(
        language === 'bn' ? 'দয়া করে Product Rating দিন (১ থেকে ৫ স্টার)' : 'Please provide a star rating (1 to 5 stars)'
      );
      return;
    }

    // Validation 2: Comment
    if (!reviewText.trim() || reviewText.trim().length < 5) {
      setErrorMessage(
        language === 'bn' ? 'দয়া করে আপনার অভিজ্ঞতা লিখুন (কমপক্ষে ৫টি অক্ষর)' : 'Please write your experience (at least 5 characters)'
      );
      return;
    }

    // Validation 3: Product Photo (Mandatory)
    if (selectedPhotos.length === 0) {
      setErrorMessage(
        language === 'bn' 
          ? 'দয়া করে হাতে পাওয়া Product-এর অন্তত ১টি ছবি আপলোড করুন।' 
          : 'Please upload at least 1 photo of the delivered product.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStep(
        language === 'bn' ? 'প্রোডাক্টের ছবি আপলোড করা হচ্ছে...' : 'Uploading product photo(s)...'
      );

      const createdReview = await storageService.submitCustomerReview({
        productId: product.id,
        orderId,
        rating,
        reviewText: reviewText.trim(),
        photos: selectedPhotos,
      });

      setSubmitStep(language === 'bn' ? 'রিভিউ সেভ করা হচ্ছে...' : 'Saving review to database...');

      onToast(
        language === 'bn' 
          ? 'আপনার রিভিউ সফলভাবে প্রকাশিত হয়েছে!' 
          : 'Your review was submitted and published successfully!',
        'success'
      );
      onSuccess(createdReview);
      onClose();
    } catch (err: any) {
      console.error('Review submit error:', err);
      setErrorMessage(
        err?.message || (language === 'bn' ? 'রিভিউ জমা দেওয়া যায়নি। আবার চেষ্টা করুন।' : 'Failed to submit review. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden relative my-6">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'যাচাইকৃত ক্রেতা রিভিউ' : 'Verified Buyer Review'}</span>
              </span>
              <h3 className="font-serif text-base font-bold text-white">
                {language === 'bn' ? 'প্রোডাক্ট রিভিউ ও রেটিং' : 'Product Review & Rating'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot Banner */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center gap-3.5">
          <img
            src={product.images[0] || ''}
            alt={product.titleEn}
            className="w-14 h-16 object-cover rounded-xl border border-stone-200 shadow-2xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 mb-1">
              <Package className="w-3 h-3" />
              <span>{language === 'bn' ? 'ডেলিভারি সম্পন্ন (Delivered)' : 'Delivered Order'}</span>
            </span>
            <h4 className="font-bold text-xs text-stone-900 line-clamp-1">
              {language === 'bn' ? product.titleBn : product.titleEn}
            </h4>
            <p className="text-[11px] font-mono text-stone-500">
              Order ID: <span className="font-bold text-stone-700">{orderId}</span>
            </p>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* STEP 1: STAR RATING */}
          <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                ১. {language === 'bn' ? 'আপনার রেটিং দিন *' : 'Your Rating *'}
              </label>
              {activeStar > 0 && (
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                  {starLabels[activeStar]?.[language === 'bn' ? 'bn' : 'en']}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => {
                    setRating(star);
                    setErrorMessage('');
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                  aria-label={`${star} star rating`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeStar
                        ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                        : 'text-stone-300 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-stone-500 font-medium">
              {rating === 0 
                ? (language === 'bn' ? 'স্টার চিহ্নে ক্লিক করে রেটিং সিলেক্ট করুন' : 'Click stars to select rating')
                : (language === 'bn' ? `আপনি ${rating} স্টার নির্বাচন করেছেন` : `You selected ${rating} out of 5 stars`)}
            </p>
          </div>

          {/* STEP 2: COMMENT */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                ২. {language === 'bn' ? 'আপনার অভিজ্ঞতা লিখুন *' : 'Your Experience *'}
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                {reviewText.length}/1000
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                setErrorMessage('');
              }}
              placeholder={
                language === 'bn'
                  ? 'কাপড়ের কোয়ালিটি, সাইজ এবং ডেলিভারি অভিজ্ঞতা কেমন ছিল বিস্তারিত লিখুন...'
                  : 'Share details about fabric quality, fitting, packaging, and overall experience...'
              }
              className="w-full p-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-xs text-stone-800 outline-none leading-relaxed transition-all"
            />
          </div>

          {/* STEP 3: PRODUCT PHOTO (MANDATORY) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>৩. {language === 'bn' ? 'Product-এর ছবি দিন (বাধ্যতামূলক) *' : 'Product Photo (Required) *'}</span>
              </label>
              <span className="text-[10px] text-amber-800 font-semibold">
                {selectedPhotos.length}/5 {language === 'bn' ? 'টি ছবি' : 'photos'}
              </span>
            </div>

            <p className="text-[11px] text-stone-500">
              {language === 'bn'
                ? 'ডেলিভারি পাওয়া ড্রেসের আসল ছবি আপলোড করুন (JPG, PNG, WEBP, সর্বোচ্চ 5MB)।'
                : 'Upload real photos of the delivered dress you received (JPG, PNG, WEBP, max 5MB each).'}
            </p>

            {/* Photo Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-stone-200 bg-stone-100 group shadow-2xs">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-stone-950 uppercase shadow-xs">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 p-1 bg-stone-900/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {selectedPhotos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-600 bg-stone-50 hover:bg-amber-50/50 flex items-center justify-center gap-2 text-stone-700 font-semibold text-xs transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-700" />
                <span>
                  {selectedPhotos.length === 0
                    ? (language === 'bn' ? '+ প্রোডাক্টের ছবি নির্বাচন করুন' : '+ Upload Product Photo')
                    : (language === 'bn' ? '+ আরও ছবি যোগ করুন' : '+ Add More Photos')}
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Submission Info & Button */}
          <div className="pt-2 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{user?.name || user?.email}</span>
              </span>
              <span>
                {language === 'bn' ? 'যাচাইকৃত ব্যাজ সহ প্রদর্শিত হবে' : 'Will display with Verified Badge'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || !reviewText.trim() || selectedPhotos.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-900/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{submitStep || (language === 'bn' ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...')}</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span>{language === 'bn' ? 'রিভিউ জমা দিন (Submit Review)' : 'Submit Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
