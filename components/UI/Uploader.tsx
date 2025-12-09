import React from 'react';
import { useTreeStore } from '../../stores/useTreeStore';

export const Uploader = () => {
  const addPhoto = useTreeStore((state) => state.addPhoto);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            addPhoto(event.target.result as string);
          }
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-50 group">
      <label className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full shadow-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 group-hover:scale-105 group-hover:shadow-gold/50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <span className="text-white font-cinzel text-sm hidden group-hover:block transition-all">Hang Memory</span>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleUpload} 
          className="hidden" 
        />
      </label>
    </div>
  );
};