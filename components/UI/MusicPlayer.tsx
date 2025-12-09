import React, { useState, useRef, useEffect } from 'react';

// Using a stable Pixabay CDN link for royalty-free Christmas music
const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/12/13/audio_4725e98586.mp3"; 

export const MusicPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio instance
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.5;
    
    const handleError = (e: Event) => {
      console.warn("Audio source failed. Please try a different track or check network.", e);
    };
    audio.addEventListener('error', handleError);

    audioRef.current = audio;

    // Browsers block autoplay. We attempt it, but catch the error silently.
    const attemptPlay = async () => {
        try {
            await audio.play();
            setPlaying(true);
        } catch (e) {
            // Auto-play blocked. User needs to interact.
            setPlaying(false);
        }
    };
    attemptPlay();

    return () => {
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = "";
        audioRef.current = null;
    };
  }, []);

  const toggle = async () => {
    if(!audioRef.current) return;
    
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch (e) {
        console.error("Playback failed", e);
      }
    }
  };

  return (
    <div className="absolute bottom-6 left-6 z-50">
      <button 
        onClick={toggle}
        className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all group"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/20 transition-colors ${playing ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/50'}`}>
            {playing ? (
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                 <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
               </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
            )}
        </div>
        <div className="flex flex-col text-left">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-inter">Now Playing</span>
            <span className="text-xs text-white/90 font-cinzel group-hover:text-gold transition-colors">
                Christmas Magic
            </span>
        </div>
      </button>
    </div>
  );
};