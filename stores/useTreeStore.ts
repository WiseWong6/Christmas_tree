import { create } from 'zustand';
import { TreeState } from '../types';

interface ExtendedTreeState extends TreeState {
  focusedPhotoIndex: number | null;
  setFocusedPhotoIndex: (index: number | null) => void;
}

export const useTreeStore = create<ExtendedTreeState>((set) => ({
  interactionStrength: 1.0,
  targetStrength: 1.0,
  cameraParallax: { x: 0, y: 0 },
  photos: [],
  focusedPhotoIndex: null,
  isGestureActive: false,
  audioUrl: null,
  setTargetStrength: (val) => set({ targetStrength: val }),
  setCameraParallax: (x, y) => set({ cameraParallax: { x, y } }),
  addPhoto: (url) => set((state) => ({ photos: [...state.photos, url] })),
  setFocusedPhotoIndex: (index) => set({ focusedPhotoIndex: index }),
  setIsGestureActive: (active) => set({ isGestureActive: active }),
  setAudioUrl: (url) => set({ audioUrl: url }),
}));