import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

import { Foliage } from './components/3D/Foliage';
import { Ornaments } from './components/3D/Ornaments';
import { PhotoOrnaments } from './components/3D/PhotoOrnaments';
import { useTreeStore } from './stores/useTreeStore';

const InteractiveGroup = ({ children }: React.PropsWithChildren) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const { cameraParallax, interactionStrength, isGestureActive } = useTreeStore.getState();
      const isChaos = interactionStrength < 0.5;

      // Chaos Mode: Follow hand gestures for rotation
      // Amplified speed by 4x per user request
      if (isChaos && isGestureActive) {
        // Target rotation based on hand position (Parallax X/Y)
        // Parallax is roughly -1 to 1. 
        // We multiply by 2.0 to give it a range of +/- 2 radians (~115 degrees)
        const targetRotY = cameraParallax.x * 2.0; 
        const targetRotX = -cameraParallax.y * 1.5; // Invert Y for natural feel

        // Smoothly rotate towards target
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1);
      } else {
        // Tree Mode (Fist) or No Hand: Reset rotation to 0 (Default State)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05);
      }
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

export const Scene = () => {
  // We need to access store to determine if we should auto-rotate
  // Optimize: Select only the boolean result to avoid re-rendering every frame on interactionStrength change
  const isTreeFormed = useTreeStore((state) => state.interactionStrength > 0.8);
  const isGestureActive = useTreeStore((state) => state.isGestureActive);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, 18], fov: 45 }}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.2} 
        penumbra={1} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#4a8b5c" />
      <pointLight position={[10, -5, 10]} intensity={1.5} color="#d4af37" />

      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />

      <Environment preset="city" />

      {/* Content wrapped in InteractiveGroup for rotation */}
      <InteractiveGroup>
        <group position={[0, -2, 0]}>
          <Foliage />
          <Ornaments />
          <PhotoOrnaments />
        </group>
      </InteractiveGroup>
      
      {/* Floor Shadow */}
      <ContactShadows 
        resolution={1024} 
        scale={50} 
        blur={2} 
        opacity={0.5} 
        far={20} 
        color="#000000" 
        position={[0, -8, 0]} 
      />

      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={5}
        maxDistance={45}
        // Auto rotate only if tree is formed AND no user gesture is interfering
        autoRotate={isTreeFormed && !isGestureActive} 
        autoRotateSpeed={0.8}
      />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.7} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.7}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
      </EffectComposer>
    </Canvas>
  );
};