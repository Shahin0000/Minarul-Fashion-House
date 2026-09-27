import React, { useState } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'men' | 'women' | 'kids'>(
    category === 'women' ? 'women' : category === 'children' ? 'kids' : 'men'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {language === 'bn' ? 'সাইজ নির্দেশিকা ও মাপের চার্ট' : 'Standard Sizing Guide (Inches)'}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'bn' ? 'মিনারুল ফ্যাশন হাউসের প্রতিটি পোশাকের সঠিক মাপ' : 'All measurements are in inches unless specified'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 px-5 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('men')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'men'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {language === 'bn' ? '👔 পুরুষদের পাঞ্জাবি ও শার্ট' : "Men's Panjabi & Shirts"}
          </button>
          <button
            onClick={() => setActiveTab('women')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'women'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {language === 'bn' ? '👗 মহিলাদের শাড়ি ও থ্রি-পিস' : "Women's Sarees & Suits"}
          </button>
          <button
            onClick={() => setActiveTab('kids')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'kids'
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {language === 'bn' ? '🧸 বাচ্চাদের পোশাক' : "Children's Wear"}
          </button>
        </div>

        {/* Measurement Tables */}
        <div className="p-5 overflow-x-auto">
          {activeTab === 'men' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-stone-900">
                {language === 'bn' ? 'পাঞ্জাবি ও কাবলি সাইজ চার্ট (ইঞ্চি):' : 'Panjabi & Kabli Chart (Inches):'}
              </h4>
              <table className="w-full text-left border border-stone-200 rounded-lg overflow-hidden">
                <thead className="bg-stone-100 text-stone-700">
                  <tr>
                    <th className="p-2.5 border-b">Size</th>
                    <th className="p-2.5 border-b">Chest (বুকের মাপ)</th>
                    <th className="p-2.5 border-b">Length (দৈর্ঘ্য)</th>
                    <th className="p-2.5 border-b">Sleeve (হাতা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  <tr>
                    <td className="p-2.5 font-bold">38 (S)</td>
                    <td className="p-2.5">40"</td>
                    <td className="p-2.5">38"</td>
                    <td className="p-2.5">24"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">40 (M)</td>
                    <td className="p-2.5">42"</td>
                    <td className="p-2.5">40"</td>
                    <td className="p-2.5">24.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">42 (L)</td>
                    <td className="p-2.5">44"</td>
                    <td className="p-2.5">42"</td>
                    <td className="p-2.5">25"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">44 (XL)</td>
                    <td className="p-2.5">46"</td>
                    <td className="p-2.5">44"</td>
                    <td className="p-2.5">25.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'women' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-stone-900">
                {language === 'bn' ? 'থ্রি-পিস ও কামিজ সাইজ চার্ট (ইঞ্চি):' : 'Three-Piece & Kameez Chart (Inches):'}
              </h4>
              <table className="w-full text-left border border-stone-200 rounded-lg overflow-hidden">
                <thead className="bg-stone-100 text-stone-700">
                  <tr>
                    <th className="p-2.5 border-b">Size</th>
                    <th className="p-2.5 border-b">Bust (বুকের মাপ)</th>
                    <th className="p-2.5 border-b">Kameez Length</th>
                    <th className="p-2.5 border-b">Salwar Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  <tr>
                    <td className="p-2.5 font-bold">36 (S)</td>
                    <td className="p-2.5">36"</td>
                    <td className="p-2.5">42"</td>
                    <td className="p-2.5">38"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">38 (M)</td>
                    <td className="p-2.5">38"</td>
                    <td className="p-2.5">43"</td>
                    <td className="p-2.5">39"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">40 (L)</td>
                    <td className="p-2.5">40"</td>
                    <td className="p-2.5">44"</td>
                    <td className="p-2.5">40"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">42 (XL)</td>
                    <td className="p-2.5">42"</td>
                    <td className="p-2.5">45"</td>
                    <td className="p-2.5">41"</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-700" />
                <p>
                  {language === 'bn'
                    ? 'শাড়ির ক্ষেত্রে: প্রতিটি শাড়ির দৈর্ঘ্য ১২ হাত (প্রায় ৫.৫ মিটার) এবং সাথে ৮০ সেন্টিমিটার ম্যাচিং ব্লাউজ পিস যুক্ত থাকে।'
                    : 'Saree Specifications: Standard 12 Haat length (~5.5 meters) with 80cm unstitched blouse piece included.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'kids' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-stone-900">
                {language === 'bn' ? 'বাচ্চাদের বয়সভিত্তিক মাপ (ইঞ্চি):' : 'Kids Age-Based Sizing (Inches):'}
              </h4>
              <table className="w-full text-left border border-stone-200 rounded-lg overflow-hidden">
                <thead className="bg-stone-100 text-stone-700">
                  <tr>
                    <th className="p-2.5 border-b">Age Group (বয়স)</th>
                    <th className="p-2.5 border-b">Chest</th>
                    <th className="p-2.5 border-b">Panjabi / Frock Length</th>
                    <th className="p-2.5 border-b">Pajama Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  <tr>
                    <td className="p-2.5 font-bold">2 - 3 Years</td>
                    <td className="p-2.5">24"</td>
                    <td className="p-2.5">22"</td>
                    <td className="p-2.5">20"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">4 - 5 Years</td>
                    <td className="p-2.5">26"</td>
                    <td className="p-2.5">25"</td>
                    <td className="p-2.5">23"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">6 - 7 Years</td>
                    <td className="p-2.5">28"</td>
                    <td className="p-2.5">28"</td>
                    <td className="p-2.5">26"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">8 - 10 Years</td>
                    <td className="p-2.5">32"</td>
                    <td className="p-2.5">32"</td>
                    <td className="p-2.5">30"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
