import React, { Suspense, useEffect, useRef, useState } from 'react';
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
  const setIsAudioPlaying = useTreeStore((state) => state.setIsAudioPlaying);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => {
    if (audioUrl) {
      // Stop previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = 0.5;
      
      // Sync global state events
      audio.onplay = () => {
        setIsAudioPlaying(true);
        setNeedsInteraction(false);
      };
      audio.onpause = () => setIsAudioPlaying(false);
      audio.onended = () => setIsAudioPlaying(false);

      const attemptPlay = async () => {
        try {
            await audio.play();
        } catch (error) {
            console.log("Autoplay blocked. Showing manual play button.");
            setNeedsInteraction(true);
            setIsAudioPlaying(false);
        }
      };
      
      attemptPlay();
      audioRef.current = audio;
    } else {
        setIsAudioPlaying(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl, setIsAudioPlaying]);

  const handleManualPlay = () => {
    if (audioRef.current) {
        audioRef.current.play();
    }
  };

  if (!needsInteraction) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto animate-bounce">
            <button 
                onClick={handleManualPlay}
                className="bg-yellow-500 text-black font-cinzel font-bold py-4 px-8 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 transition-transform flex items-center gap-3 text-lg border-2 border-yellow-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
                Tap to Start Music
            </button>
        </div>
    </div>
  );
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