import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Truck, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { SiteSettings } from '../../types';

interface TopBarProps {
  onNavigate: (view: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNavigate }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(() => storageService.getSettings());

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setSettings(storageService.getSettings());
    });
    return unsub;
  }, []);

  const announcementText =
    language === 'bn' ? settings.announcementBn : settings.announcementEn;

  return (
    <div className="bg-stone-900 text-stone-200 text-xs border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Dynamic Announcement */}
        <div className="flex items-center gap-2 text-center md:text-left overflow-hidden">
          <span className="inline-flex items-center gap-1.5 font-medium text-amber-300">
            <Truck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            {announcementText || t.announcement}
          </span>
        </div>

        {/* Right tools: Hotline, Language Switcher, Admin Toggle, Track Order */}
        <div className="flex items-center gap-4 text-[11px] font-medium divide-x divide-stone-700">
          {settings.hotline ? (
            <a
              href={`tel:${settings.hotline.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">
                {language === 'bn' ? 'হটলাইন:' : 'Hotline:'} {settings.hotline}
              </span>
              <span className="sm:hidden">{settings.hotline}</span>
            </a>
          ) : null}

          <button
            onClick={() => onNavigate('track-order')}
            className="pl-3 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{t.trackOrder}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="pl-3 flex items-center gap-1.5 text-amber-300 hover:text-white transition-colors font-bold px-1"
            title="Switch Language (বাংলা / English)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}</span>
          </button>

          {/* Admin Portal Gateway */}
          {isAdmin ? (
            <button
              onClick={() => onNavigate('admin')}
              className="pl-3 flex items-center gap-1 transition-colors px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950 hover:bg-amber-400"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onNavigate('admin');
              }}
              className="pl-3 flex items-center gap-1 transition-colors px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>{language === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
