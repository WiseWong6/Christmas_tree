import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTreeStore } from '../../stores/useTreeStore';

// High count for "Luxury" density
const PARTICLE_COUNT = 25000;

const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uStrength: { value: 1 },
    uColorBottom: { value: new THREE.Color('#02260a') }, // Deeper, Darker Green
    uColorTop: { value: new THREE.Color('#4a8b5c') },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uStrength;
    uniform vec3 uColorBottom;
    uniform vec3 uColorTop;
    attribute vec3 aChaosPosition;
    attribute float aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;

    // Simplex noise function for breathing
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) { 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i); 
      vec4 p = permute( permute( permute( 
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      // Tree Form: Cone
      // "position" attribute holds the perfect tree position
      vec3 treePos = position;
      
      // Breathing effect on tree
      float noise = snoise(treePos * 0.5 + uTime * 0.5);
      treePos += normal * noise * 0.1;

      // Chaos Form
      vec3 chaosPos = aChaosPosition;
      
      // Interpolation
      vec3 finalPos = mix(chaosPos, treePos, uStrength);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
      
      // Point size attenuation
      float dist = length(modelViewMatrix * vec4(finalPos, 1.0));
      gl_PointSize = (500.0 / dist) * 0.15; 

      // Color logic (Height based gradient)
      // Height range is now -6 to 9 (Total 15)
      float h = (treePos.y + 6.0) / 15.0; 
      
      // Add random color variation for realism
      vec3 noiseColor = vec3(aRandom * 0.1, aRandom * 0.15, 0.0);

      // Mix colors based on height
      vec3 baseColor = mix(uColorBottom, uColorTop, h) + noiseColor;
      
      float sparkle = smoothstep(0.6, 1.0, noise);
      vColor = mix(baseColor, vec3(0.8, 0.9, 0.7), sparkle * 0.2 * uStrength);
      
      vAlpha = 0.9 + 0.1 * snoise(vec3(uTime));
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Create a sharper, "needle cluster" or "star" shape
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      
      // Star/Needle shape logic
      // Creates a cross pattern faded at edges
      float d = length(abs(coord) * vec2(1.0, 0.2)); // Vertical streak
      d = min(d, length(abs(coord) * vec2(0.2, 1.0))); // Horizontal streak
      
      // Soft circle core
      float circle = 1.0 - smoothstep(0.0, 0.5, dist);
      
      // Mix shapes: mostly circle but with "spikes"
      float alphaShape = max(circle, 1.0 - smoothstep(0.0, 0.15, d));

      if (alphaShape < 0.1) discard;

      gl_FragColor = vec4(vColor, alphaShape * vAlpha);
    }
  `
};

export const Foliage = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, chaosPositions, randoms } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const chaos = new Float32Array(PARTICLE_COUNT * 3);
    const rands = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Tree Shape (Cone)
      // Corrected range to match design intent: -6 to 9 (Total height 15)
      const y = (Math.random() * 15) - 6; 
      // Taper radius to 0 at y=9
      const maxRadius = (9 - y) * 0.4; 
      
      const radius = Math.random() * maxRadius;
      const angle = Math.random() * Math.PI * 2;
      
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Chaos Shape
      const cx = (Math.random() - 0.5) * 35;
      const cy = (Math.random() - 0.5) * 35;
      const cz = (Math.random() - 0.5) * 20;

      chaos[i * 3] = cx;
      chaos[i * 3 + 1] = cy;
      chaos[i * 3 + 2] = cz;

      rands[i] = Math.random();
    }
    return { positions: pos, chaosPositions: chaos, randoms: rands };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      const { interactionStrength, targetStrength } = useTreeStore.getState();
      
      const current = materialRef.current.uniforms.uStrength.value;
      const next = THREE.MathUtils.lerp(current, targetStrength, 0.05);
      
      useTreeStore.setState({ interactionStrength: next });
      
      materialRef.current.uniforms.uStrength.value = next;
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
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
          attach="attributes-aChaosPosition"
          count={PARTICLE_COUNT}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={PARTICLE_COUNT}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};