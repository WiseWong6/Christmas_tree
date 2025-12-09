import React, { useState } from 'react';
import { useTreeStore } from '../../stores/useTreeStore';

// Helper to compress images to avoid memory crashes on mobile
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Optimization: Create Object URL from file directly instead of FileReader
    // This avoids reading the entire file into JS string memory (Base64) which crashes mobile browsers
    const srcUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Use slightly smaller max dimension for mobile safety (800px is sufficient for 3D textures)
      const MAX_DIMENSION = 1024;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // CRITICAL FIX: Use toBlob instead of toDataURL. 
          // toDataURL creates massive base64 strings in heap. 
          // toBlob keeps data in browser internal storage.
          canvas.toBlob((blob) => {
            // Clean up source object URL
            URL.revokeObjectURL(srcUrl);

            if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                resolve(blobUrl);
            } else {
                reject(new Error("Canvas blob creation failed"));
            }
          }, 'image/jpeg', 0.8);
      } else {
          URL.revokeObjectURL(srcUrl);
          reject(new Error("Canvas context failed"));
      }
    };

    img.onerror = (err) => {
        URL.revokeObjectURL(srcUrl);
        reject(err);
    };

    img.src = srcUrl;
  });
};

export const Uploader = () => {
  const addPhoto = useTreeStore((state) => state.addPhoto);
  const setAudioUrl = useTreeStore((state) => state.setAudioUrl);
  const isAudioPlaying = useTreeStore((state) => state.isAudioPlaying);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const files = Array.from(e.target.files) as File[];
      
      try {
        // Process sequentially to avoid memory spikes
        for (const file of files) {
          const compressedBlobUrl = await resizeImage(file);
          addPhoto(compressedBlobUrl);
        }
      } catch (error) {
        console.error("Image processing failed", error);
        alert("Some photos could not be processed. Try selecting fewer at a time.");
      } finally {
        setIsProcessing(false);
        // Reset input value so same file can be selected again if needed
        e.target.value = '';
      }
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use createObjectURL instead of readAsDataURL for better memory management with large audio files (like FLAC)
      // This prevents mobile browser crashes when handling large Base64 strings
      const objectUrl = URL.createObjectURL(file);
      setAudioUrl(objectUrl);
    }
  };

  // Shared classes for consistent sizing
  const buttonBaseClass = "cursor-pointer backdrop-blur-md p-4 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105";

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
      {/* Music Uploader */}
      <div className="group">
        <label 
          className={`${buttonBaseClass} 
            ${isAudioPlaying 
              ? 'bg-white/20 border border-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.4)]' 
              : 'bg-white/10 border border-white/20 hover:bg-white/20 group-hover:shadow-gold/50'
            }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className={`w-6 h-6 transition-colors ${isAudioPlaying ? 'text-yellow-400 animate-[spin_4s_linear_infinite]' : 'text-white'}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
          <span className={`font-cinzel text-xs hidden group-hover:block transition-all whitespace-nowrap ${isAudioPlaying ? 'text-yellow-100' : 'text-white'}`}>
            {isAudioPlaying ? 'Playing...' : 'Upload Music'}
          </span>
          <input 
            type="file" 
            accept="audio/*, .mp3, .m4a, .wav, .flac" 
            onChange={handleAudioUpload} 
            className="hidden" 
          />
        </label>
      </div>

      {/* Photo Uploader */}
      <div className="group">
        <label className={`${buttonBaseClass} bg-white/10 border border-white/20 hover:bg-white/20 group-hover:shadow-gold/50 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
          {isProcessing ? (
             <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          )}
          <span className="text-white font-cinzel text-sm hidden group-hover:block transition-all whitespace-nowrap">
            {isProcessing ? 'Processing...' : 'Add Memory'}
          </span>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            className="hidden" 
          />
        </label>
      </div>
    </div>
  );
};