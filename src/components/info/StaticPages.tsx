import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StaticPagesProps {
  pageType: 'about' | 'stores' | 'returns' | 'contact';
  onNavigateHome: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({
  pageType,
  onNavigateHome,
  onToast,
}) => {
  const { language, t } = useLanguage();

  // Contact form
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cMsg, setCMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    onToast(
      language === 'bn' ? 'ধন্যবাদ! আপনার বার্তাটি গৃহীত হয়েছে।' : 'Thank you! Your message has been sent.',
      'success'
    );
  };

  return (
    <div className="bg-stone-100/60 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ABOUT US */}
        {pageType === 'about' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xs space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              {language === 'bn' ? 'আমাদের গল্প ও ঐতিহ্য' : 'Our Story & Heritage'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              {language === 'bn' ? 'মিনারুল ফ্যাশন হাউসে আপনাকে স্বাগতম' : 'Welcome to Minarul Fashion House'}
            </h1>
            <div className="prose text-stone-600 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                {language === 'bn'
                  ? 'মিনারুল ফ্যাশন হাউস বাংলাদেশের ঐতিহ্যবাহী তাঁতশিল্প এবং সমকালীন আধুনিক ফ্যাশনের এক অনন্য মেলবন্ধন। প্রতিটি পুরুষের জন্য রাজকীয় পাঞ্জাবি-কাবলি, নারীদের জন্য জমকালো ঢাকাই জামদানি ও থ্রি-পিস এবং শিশুদের জন্য নরম তুলতুলে সুতি কাপড়ের সেরা পোশাক প্রস্তুত করাই আমাদের মূল লক্ষ্য।'
                  : 'Minarul Fashion House is Bangladesh’s premier lifestyle apparel brand fusing authentic handloom heritage with contemporary tailoring. From regal Panjabis and Kabli suits for gentlemen to timeless Dhakai Jamdani sarees and gentle babywear, our obsession is quality.'}
              </p>
              <p>
                {language === 'bn'
                  ? 'আমরা নিশ্চিত করি শতভাগ খাঁটি সুতি, খাঁটি জ্যাকার্ড ও প্রিমিয়াম ফেব্রিক। সারা দেশের ৬৪ জেলার যে কোনো প্রান্তে দ্রুততম কুরিয়ারের মাধ্যমে আমরা পৌঁছে দিচ্ছি ক্যাশ অন ডেলিভারি সুবিধা।'
                  : 'Every thread is checked for durability, skin comfort, and breathable comfort. With our nationwide courier network, customers across all 64 districts enjoy hassle-free cash on delivery.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-100">
              <div className="p-4 bg-stone-50 rounded-2xl text-center">
                <span className="font-serif text-2xl font-black text-amber-800 block">১০০%</span>
                <span className="text-xs text-stone-600">খাঁটি প্রিমিয়াম ফেব্রিক</span>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl text-center">
                <span className="font-serif text-2xl font-black text-amber-800 block">৬৪ জেলা</span>
                <span className="text-xs text-stone-600">সারা দেশে ডেলিভারি</span>
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl text-center">
                <span className="font-serif text-2xl font-black text-amber-800 block">৭ দিন</span>
                <span className="text-xs text-stone-600">সহজ এক্সচেঞ্জ গ্যারান্টি</span>
              </div>
            </div>
          </div>
        )}

        {/* STORE OUTLETS */}
        {pageType === 'stores' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {language === 'bn' ? 'আমাদের শোরুম ও আউটলেট সমূহ' : 'Our Flagship Showrooms'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              {language === 'bn'
                ? 'সরাসরি পোশাক দেখে ও ট্রায়াল দিয়ে কেনার জন্য ঘুরে আসুন আমাদের আউটলেটে'
                : 'Experience our dresses in person with dedicated trial zones'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>Dhanmondi Flagship Outlet (ধানমন্ডি)</span>
                </div>
                <p className="text-xs text-stone-600">Level 3, Road 27, Dhanmondi, Dhaka-1209</p>
                <p className="text-xs text-amber-800 font-semibold">📞 +880 1712-345678</p>
                <p className="text-[11px] text-stone-400">Open 10:00 AM - 9:30 PM (Daily)</p>
              </div>

              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>Uttara Branch (উত্তরা আউটলেট)</span>
                </div>
                <p className="text-xs text-stone-600">House 18, Sector 7, Rabindra Sarani, Uttara, Dhaka</p>
                <p className="text-xs text-amber-800 font-semibold">📞 +880 1712-345679</p>
                <p className="text-[11px] text-stone-400">Open 10:00 AM - 9:30 PM</p>
              </div>

              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>Chittagong Outlet (চট্টগ্রাম)</span>
                </div>
                <p className="text-xs text-stone-600">GEC Circle, Nasirabad, Chattogram</p>
                <p className="text-xs text-amber-800 font-semibold">📞 +880 1819-876543</p>
                <p className="text-[11px] text-stone-400">Open 10:30 AM - 9:00 PM</p>
              </div>

              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>Sylhet Branch (সিলেট আউটলেট)</span>
                </div>
                <p className="text-xs text-stone-600">Kumarpara Point, Sylhet City</p>
                <p className="text-xs text-amber-800 font-semibold">📞 +880 1711-224466</p>
                <p className="text-[11px] text-stone-400">Open 10:30 AM - 9:00 PM</p>
              </div>
            </div>
          </div>
        )}

        {/* RETURNS & EXCHANGE */}
        {pageType === 'returns' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {language === 'bn' ? '৭ দিনের সহজ এক্সচেঞ্জ ও রিটার্ন পলিসি' : '7-Day Return & Exchange Policy'}
            </h1>
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                <h4 className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    {language === 'bn' ? 'আমাদের ১০০% গ্রাহক সন্তুষ্টি প্রতিশ্রুতি' : '100% Satisfaction Promise'}
                  </span>
                </h4>
                <p className="text-xs">
                  {language === 'bn'
                    ? 'পোশাকের সাইজ না মিললে বা কোনো ত্রুটি থাকলে ডেলিভারি পাওয়ার ৭ দিনের মধ্যে বিনামূল্যে এক্সচেঞ্জ সুবিধা উপভোগ করুন।'
                    : 'If your dress sizing is not ideal or if any defect occurs, exchange it freely within 7 days of delivery.'}
                </p>
              </div>

              <h4 className="font-bold text-stone-900 pt-2">
                {language === 'bn' ? 'এক্সচেঞ্জের নিয়মাবলী:' : 'Exchange Conditions:'}
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-stone-700">
                <li>
                  {language === 'bn'
                    ? 'পোশাকটি অব্যবহৃত এবং মূল ট্যাগ সহ অক্ষত থাকতে হবে।'
                    : 'The dress must be unworn, unwashed with original brand tags attached.'}
                </li>
                <li>
                  {language === 'bn'
                    ? 'ডেলিভারি ম্যানের কাছ থেকে ইনভয়েস স্লিপ অথবা অর্ডার নম্বর সংরক্ষণ করুন।'
                    : 'Retain the parcel invoice or Order ID.'}
                </li>
                <li>
                  {language === 'bn'
                    ? 'আমাদের হটলাইনে (+৮৮০ ১৭১২-৩৪৫৬৭৮) কল করে অথবা হোয়াটসঅ্যাপে জানালে কুরিয়ারের মাধ্যমে নতুন সাইজ পাঠিয়ে দেওয়া হবে।'
                    : 'Simply reach our customer service helpline for rapid courier pickup and replacement.'}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* CONTACT US */}
        {pageType === 'contact' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {t.contact}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              {language === 'bn'
                ? 'যেকোনো প্রশ্ন বা কাস্টমাইজেশনের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন'
                : 'Have a question about fabric, bulk orders, or sizing? Drop us a message.'}
            </p>

            {submitted ? (
              <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-base text-emerald-950">
                  {language === 'bn' ? 'বার্তাটি সফলভাবে পাঠানো হয়েছে!' : 'Message Received!'}
                </h3>
                <p className="text-xs text-emerald-800">
                  {language === 'bn'
                    ? 'আমাদের কাস্টমার কেয়ার টিম দ্রুত আপনার নম্বরে যোগাযোগ করবে।'
                    : 'Our customer support representative will call or WhatsApp you shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">{t.yourName} *</label>
                    <input
                      type="text"
                      required
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      placeholder="e.g. Shakil Khan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {language === 'bn' ? 'আপনার বার্তা *' : 'Your Message *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={cMsg}
                    onChange={(e) => setCMsg(e.target.value)}
                    placeholder="Write your inquiry..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'bn' ? 'বার্তা পাঠান' : 'Send Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
