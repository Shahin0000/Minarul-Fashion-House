import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-3xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          aria-label="Close photo preview"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
          <img
            src={imageUrl}
            alt={title || 'Customer Review Photo'}
            className="max-h-[80vh] w-auto object-contain rounded-2xl"
          />
        </div>

        {title && (
          <p className="text-white/80 text-xs mt-3 text-center font-medium">
            {title}
          </p>
        )}
      </div>
    </div>
  );
};
