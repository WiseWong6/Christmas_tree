import React, { Suspense, useEffect, useRef } from 'react';
import { Scene } from './Scene';
import { Uploader } from './components/UI/Uploader';
import { Gestures } from './components/UI/Gestures';
import { PhotoOverlay } from './components/UI/PhotoOverlay';
import { useTreeStore } from './stores/useTreeStore';

const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-50">
    <div className="text-center">
      <h1 className="text-4xl font-cinzel text-gold mb-4 text-yellow-500">Grand Luxury Tree</h1>
      <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
        <div className="h-full bg-yellow-500 w-1/2 animate-[loading_1s_ease-in-out_infinite]" />
      </div>
      <p className="mt-4 text-gray-400 text-sm font-inter">Preparing magic...</p>
    </div>
  </div>
);

const AudioController = () => {
  const audioUrl = useTreeStore((state) => state.audioUrl);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      // Stop previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = 0.5;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Auto-play was prevented. Interaction required.", error);
        });
      }
      
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  return null;
};

const App = () => {
  return (
    <div className="w-full h-screen relative bg-black">
      <Suspense fallback={<Loader />}>
        <Scene />
      </Suspense>

      {/* Audio Logic */}
      <AudioController />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-6 w-full text-center pointer-events-none">
            <h1 className="text-white/20 font-cinzel text-2xl tracking-[0.5em] uppercase">Merry Christmas</h1>
        </div>
        
        {/* Pointer events re-enabled for interactive elements */}
        <div className="pointer-events-auto">
            <Gestures />
            <Uploader />
            <PhotoOverlay />
        </div>
      </div>
    </div>
  );
};

export default App;