import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useTreeStore } from '../stores/useTreeStore';

export const useHandLandmarker = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isReady, setIsReady] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const setTargetStrength = useTreeStore((state) => state.setTargetStrength);
  const setCameraParallax = useTreeStore((state) => state.setCameraParallax);
  const setIsGestureActive = useTreeStore((state) => state.setIsGestureActive);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setIsReady(true);
      } catch (e) {
        console.error("MediaPipe Init Error:", e);
      }
    };
    init();
  }, []);

  const predict = () => {
    if (videoRef.current && handLandmarkerRef.current && videoRef.current.readyState >= 2) {
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
      
      if (results.landmarks.length > 0) {
        setIsGestureActive(true);
        const landmarks = results.landmarks[0];
        
        // 4 is Thumb Tip, 8 is Index Finger Tip
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleBase = landmarks[9]; // Middle finger MCP for tracking

        // Calculate Distance for Open/Close pinch
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2) +
          Math.pow(thumbTip.z - indexTip.z, 2)
        );

        // Heuristic: Open palm usually has larger distance between thumb and index
        // Close fist/pinch has small distance.
        const isClosed = distance < 0.1;
        
        // Logic Update:
        // Closed Fist (Small distance) -> Tree Formed (Strength 1.0)
        // Open Hand (Large distance) -> Tree Explodes (Strength 0.0)
        setTargetStrength(isClosed ? 1.0 : 0.0);

        // Parallax mapping (inverted x for mirror effect)
        // Center of screen is 0.5, 0.5
        // Update: We now allow movement even when hand is Open, per user request.
        const px = (middleBase.x - 0.5) * 2; 
        const py = (middleBase.y - 0.5) * 2;
        setCameraParallax(-px, -py);

      } else {
        setIsGestureActive(false);
        // No hand detected, return to peace
        setTargetStrength(1.0);
        setCameraParallax(0, 0);
      }
    }
    requestRef.current = requestAnimationFrame(predict);
  };

  useEffect(() => {
    if (isReady) {
      requestRef.current = requestAnimationFrame(predict);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return isReady;
};