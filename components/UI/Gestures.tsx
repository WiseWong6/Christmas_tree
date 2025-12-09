import React, { useRef, useEffect } from 'react';
import { useHandLandmarker } from '../../hooks/useHandLandmarker';
import { useTreeStore } from '../../stores/useTreeStore';

export const Gestures = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isReady = useHandLandmarker(videoRef);
  const targetStrength = useTreeStore((state) => state.targetStrength);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", () => {
             // ensure prediction loop starts after data is loaded
          });
        }
      } catch (err) {
        console.error("Camera denied:", err);
      }
    };
    startVideo();
  }, []);

  return (
    <div className="absolute top-6 left-6 z-50">
      <div className="relative overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-black/50 backdrop-blur w-32 h-24 transition-all hover:w-48 hover:h-36">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover opacity-50 mirror-mode" 
          style={{ transform: 'scaleX(-1)' }}
        />
        {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50 animate-pulse">
                Loading AI...
            </div>
        )}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
            <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[10px] text-white/80 font-inter">
                {targetStrength > 0.5 ? "Open hand to explode" : "Close hand to restore"}
            </span>
        </div>
      </div>
    </div>
  );
};
