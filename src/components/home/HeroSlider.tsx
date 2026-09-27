import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';
import { HeroSlide } from '../../types';

interface HeroSliderProps {
  onNavigate: (view: string, filter?: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>(() =>
    storageService.getHeroSlides().filter((s) => s.isActive)
  );

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      const active = storageService.getHeroSlides().filter((s) => s.isActive);
      setSlides(active.length > 0 ? active : storageService.getHeroSlides());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const safeIndex = currentSlide >= slides.length ? 0 : currentSlide;
  const slide = slides[safeIndex];

  return (
    <div className="relative overflow-hidden bg-stone-950 min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* Background Slides */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === safeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={s.image}
            alt={s.titleEn}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-7000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/80 to-stone-950/95" />
        </div>
      ))}

      {/* Slide Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl text-white space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? slide.badgeBn : slide.badgeEn}</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-stone-100">
            {language === 'bn' ? slide.titleBn : slide.titleEn}
          </h1>

          {/* Subtitle */}
          <p className="text-stone-300 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
            {language === 'bn' ? slide.subtitleBn : slide.subtitleEn}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('shop', slide.category)}
              className="px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-amber-900/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{t.shopNow}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('shop')}
              className="px-6 sm:px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm tracking-wide backdrop-blur-md border border-white/20 transition-all"
            >
              {t.exploreCollection}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="w-10 h-10 rounded-full bg-stone-900/70 hover:bg-stone-900 border border-stone-700 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === safeIndex ? 'w-8 bg-amber-500' : 'w-2 bg-stone-600 hover:bg-stone-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="w-10 h-10 rounded-full bg-stone-900/70 hover:bg-stone-900 border border-stone-700 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
