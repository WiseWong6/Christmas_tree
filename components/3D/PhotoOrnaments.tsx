
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { useTreeStore } from '../../stores/useTreeStore';
import { Text } from '@react-three/drei';

const PhotoFrame = ({ url, index, total }: { url: string, index: number, total: number }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  const meshRef = useRef<THREE.Group>(null);
  
  // Calculate fixed positions once
  const { treePos, chaosPos, rotationOffset } = useMemo(() => {
    // Spiral distribution for photos
    // Height Range: -4 to 7 (Leaves some space at very top and bottom)
    const y = -4 + (index / Math.max(1, total)) * 11; 
    
    // Radius matches cone at this height
    const r = (9 - y) * 0.6; 
    
    const angle = index * 2.4; 
    
    return {
      treePos: new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r),
      chaosPos: new THREE.Vector3((Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*10),
      rotationOffset: (Math.random() - 0.5) * 0.5
    };
  }, [index, total]);

  const setFocusedPhotoIndex = useTreeStore((state) => state.setFocusedPhotoIndex);

  useFrame((state) => {
    const { interactionStrength } = useTreeStore.getState();
    if (!meshRef.current) return;

    // Normal Tree/Chaos physics
    const pos = new THREE.Vector3().lerpVectors(chaosPos, treePos, interactionStrength);
    meshRef.current.position.lerp(pos, 0.08);

    // Dynamic Scale Logic
    // Tree State (1.0): Scale 0.66
    // Chaos State (0.0): Scale 1.8 
    const scale = THREE.MathUtils.lerp(1.8, 0.66, interactionStrength);
    meshRef.current.scale.setScalar(scale);

    // Rotation Logic
    if (interactionStrength < 0.5) {
        meshRef.current.lookAt(state.camera.position);
    } else {
        // Look Outward
        const lookPos = new THREE.Vector3(0, pos.y, 0); 
        meshRef.current.lookAt(lookPos); 
        meshRef.current.rotateY(Math.PI); // Face out
        meshRef.current.rotateZ(rotationOffset); 
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setFocusedPhotoIndex(index);
  };

  return (
    <group 
        ref={meshRef} 
        onClick={handleClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* Polaroid Frame */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[1.2, 1.5, 0.02]} /> 
        <meshStandardMaterial color="#f8f8f8" roughness={0.8} />
      </mesh>
      {/* Photo */}
      <mesh position={[0, 0.12, 0.015]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Text Hint */}
      <Text 
        position={[0, -0.45, 0.02]} 
        fontSize={0.09} 
        color="#333"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
        View
      </Text>
    </group>
  );
};

export const PhotoOrnaments = () => {
  const photos = useTreeStore((state) => state.photos);

  return (
    <group>
      {photos.map((url, i) => (
        <React.Suspense key={i} fallback={null}>
          <PhotoFrame 
            url={url} 
            index={i} 
            total={photos.length} 
          />
        </React.Suspense>
      ))}
    </group>
  );
};
