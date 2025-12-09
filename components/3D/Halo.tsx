
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTreeStore } from '../../stores/useTreeStore';

const PARTICLE_COUNT = 3000;

const HaloShader = {
  uniforms: {
    uTime: { value: 0 },
    uInteraction: { value: 1.0 },
    uColor: { value: new THREE.Color('#FFD700') }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uInteraction;
    attribute float aSize;
    attribute float aOffset;
    attribute float aSpeed;
    
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      // Basic Spiral Math
      // We want particles to flow UP the spiral
      
      float t = aOffset + uTime * aSpeed * 0.1; 
      t = mod(t, 1.0); // Loop 0..1
      
      // Calculate Spiral Position based on 't'
      float height = -4.0 + (t * 10.0); // Height range -4 to 6
      
      // Radius tapers as we go up
      float radius = (6.0 - height) * 0.6;
      radius = max(radius, 0.1); // Prevent negative radius
      
      // Angle: 6 full turns
      float angle = t * 6.0 * 6.28318; 
      
      vec3 pos = vec3(
        cos(angle) * radius,
        height,
        sin(angle) * radius
      );
      
      // Add some "Spread" noise to make it a ribbon, not a line
      // Use vertex ID or similar random factor if available, here we use aSpeed/aSize as pseudo-random
      float noiseVal = sin(t * 20.0 + aOffset * 100.0);
      pos.x += noiseVal * 0.15;
      pos.z += cos(t * 30.0) * 0.15;
      pos.y += sin(aOffset * 50.0) * 0.1;

      // Expand outward when "Exploded" (Chaos)
      vec3 chaosPos = pos * 2.5; 
      vec3 finalPos = mix(chaosPos, pos, uInteraction);

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Size attenuation
      gl_PointSize = aSize * (200.0 / -mvPosition.z);
      
      // Alpha Fade at top and bottom
      float edgeFade = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.9, 1.0, t));
      vAlpha = edgeFade * 0.8;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
      // Soft glow particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      
      // Sparkle core
      alpha += (1.0 - smoothstep(0.0, 0.1, dist)) * 0.5;

      if (alpha < 0.05) discard;
      
      gl_FragColor = vec4(uColor, alpha * vAlpha);
    }
  `
};

export const Halo = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, sizes, offsets, speeds } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3); // Dummy positions, shader handles it
    const sizes = new Float32Array(PARTICLE_COUNT);
    const offsets = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    
    for(let i=0; i<PARTICLE_COUNT; i++) {
        sizes[i] = Math.random() * 0.4 + 0.1;
        offsets[i] = Math.random(); // Start position along curve
        speeds[i] = 0.5 + Math.random() * 0.5; // Flow speed
    }
    
    return { positions: pos, sizes, offsets, speeds };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
        const { interactionStrength } = useTreeStore.getState();
        
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        
        // Lerp interaction uniform for smoothness
        const currentInter = materialRef.current.uniforms.uInteraction.value;
        materialRef.current.uniforms.uInteraction.value = THREE.MathUtils.lerp(currentInter, interactionStrength, 0.05);
    }
  });

  return (
    <points>
        <bufferGeometry>
            <bufferAttribute 
                attach="attributes-position"
                count={PARTICLE_COUNT}
                array={positions}
                itemSize={3}
            />
            <bufferAttribute 
                attach="attributes-aSize"
                count={PARTICLE_COUNT}
                array={sizes}
                itemSize={1}
            />
             <bufferAttribute 
                attach="attributes-aOffset"
                count={PARTICLE_COUNT}
                array={offsets}
                itemSize={1}
            />
             <bufferAttribute 
                attach="attributes-aSpeed"
                count={PARTICLE_COUNT}
                array={speeds}
                itemSize={1}
            />
        </bufferGeometry>
        <shaderMaterial 
            ref={materialRef}
            args={[HaloShader]}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
        />
    </points>
  )
}
