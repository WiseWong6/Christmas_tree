
import React, { useRef } from 'react';
import { useTreeStore } from '../../stores/useTreeStore';

export const PhotoOverlay = () => {
  const focusedPhotoIndex = useTreeStore((state) => state.focusedPhotoIndex);
  const photos = useTreeStore((state) => state.photos);
  const setFocusedPhotoIndex = useTreeStore((state) => state.setFocusedPhotoIndex);
  
  // Swipe references
  const touchStartX = useRef<number | null>(null);

  if (focusedPhotoIndex === null) return null;

  const currentPhoto = photos[focusedPhotoIndex];

  const goNext = () => {
    const next = (focusedPhotoIndex + 1) % photos.length;
    setFocusedPhotoIndex(next);
  };

  const goPrev = () => {
    const prev = (focusedPhotoIndex - 1 + photos.length) % photos.length;
    setFocusedPhotoIndex(prev);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    goNext();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    goPrev();
  };

  // Touch Handlers for Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const SWIPE_THRESHOLD = 50;

    // Swipe Left -> Next Photo
    if (diff > SWIPE_THRESHOLD) {
        goNext();
    }
    // Swipe Right -> Prev Photo
    else if (diff < -SWIPE_THRESHOLD) {
        goPrev();
    }
    
    touchStartX.current = null;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={() => setFocusedPhotoIndex(null)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative max-w-4xl max-h-[90vh] p-4 flex flex-col items-center">
        {/* Photo Container */}
        <div 
            className="relative bg-white p-4 pb-16 shadow-2xl rotate-1 transform transition-transform duration-500 hover:rotate-0"
            onClick={(e) => e.stopPropagation()} // Prevent close on photo click
        >
          <img 
            src={currentPhoto} 
            alt="Memory" 
            className="max-h-[70vh] object-contain border border-gray-100"
            draggable={false}
          />
          <div className="absolute bottom-6 left-0 w-full text-center font-cinzel text-gray-800 text-xl">
             Memory {focusedPhotoIndex + 1} of {photos.length}
          </div>
        </div>

        {/* Navigation Arrows */}
        {photos.length > 1 && (
            <>
                <button 
                    onClick={handlePrev}
                    className="absolute left-[-60px] top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:scale-110 transition-all p-4 hidden md:block"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                
                <button 
                    onClick={handleNext}
                    className="absolute right-[-60px] top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:scale-110 transition-all p-4 hidden md:block"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </>
        )}
        
        <div className="absolute top-[-40px] text-white/40 text-sm font-inter tracking-widest">
            CLICK BACKGROUND TO CLOSE {photos.length > 1 && "| SWIPE TO NAVIGATE"}
        </div>
      </div>
    </div>
  );
};
