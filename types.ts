export interface TreeState {
  interactionStrength: number; // 1.0 = Tree, 0.0 = Chaos
  targetStrength: number;
  cameraParallax: { x: number; y: number };
  photos: string[]; // Base64 strings
  setTargetStrength: (val: number) => void;
  setCameraParallax: (x: number, y: number) => void;
  addPhoto: (url: string) => void;
  focusedPhotoIndex: number | null;
  setFocusedPhotoIndex: (index: number | null) => void;
  isGestureActive: boolean;
  setIsGestureActive: (active: boolean) => void;
  audioUrl: string | null;
  setAudioUrl: (url: string | null) => void;
}

export interface HandLandmarkerResult {
  landmarks: number[][][];
}