
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTreeStore } from '../../stores/useTreeStore';
import { Instance, Instances } from '@react-three/drei';

// Increased count by ~30% (620 -> 820)
const ORNAMENT_COUNT = 820;

const OrnamentInstance = ({ id, chaosPos, treePos, color, shapeType }: any) => {
  const ref = useRef<any>(null);
  
  useFrame(() => {
    const { interactionStrength } = useTreeStore.getState();
    if (ref.current) {
      // Lerp position
      const target = new THREE.Vector3().lerpVectors(chaosPos, treePos, interactionStrength);
      
      // Add slight lag/noise based on ID
      const delay = id * 0.001;
      const laggedStrength = Math.max(0, Math.min(1, interactionStrength + (interactionStrength > 0.5 ? -delay : delay)));
      
      ref.current.position.lerp(target, 0.1);
      
      // Rotate when in chaos
      if (interactionStrength < 0.9) {
        ref.current.rotation.x += 0.01;
        ref.current.rotation.y += 0.02;
      } else {
         // Subtle sway when static
         ref.current.rotation.z = Math.sin(Date.now() * 0.001 + id) * 0.1;
      }
      
      const scale = THREE.MathUtils.lerp(0.5, 1.0, interactionStrength);
      ref.current.scale.setScalar(scale);
    }
  });

  return <Instance ref={ref} color={color} />;
};

export const Ornaments = () => {
  // Generate data for 3 types of ornaments
  const { spheres, boxes, gems } = useMemo(() => {
    const spheres = [];
    const boxes = [];
    const gems = [];
    
    // Elegant Palette
    const colors = ['#FFD700', '#C0C0C0', '#D4AF37', '#8B0000', '#FFFFFF', '#B8860B']; 

    // Golden Angle for perfect spiral distribution
    const PHI = Math.PI * (3 - Math.sqrt(5)); 
    const TOTAL_HEIGHT = 15.0; // From -6 to 9

    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      // PHYLLOTAXIS / GOLDEN SPIRAL ON CONE
      // To get uniform surface density, height 'h' (from tip) must be proportional to sqrt(index).
      // Area of cone surface at distance h is proportional to h^2.
      
      const t = i / (ORNAMENT_COUNT - 1); 
      const hFromTip = Math.sqrt(t) * TOTAL_HEIGHT; // 0 to 15
      
      const y = 9.0 - hFromTip; // 9 down to -6
      
      // Radius at this height (Slope 0.45)
      const maxRadius = (9 - y) * 0.45;
      
      // Push ornaments to the outer surface, but allow slight depth variation
      // Range: 0.75 to 1.0 of maxRadius to ensure it looks full but structured
      const r = maxRadius * (0.75 + Math.random() * 0.25);
      
      // Angle based on Golden Ratio
      const theta = i * PHI;
      
      const tx = r * Math.cos(theta);
      const ty = y;
      const tz = r * Math.sin(theta);

      // Chaos Logic
      const cx = (Math.random() - 0.5) * 30;
      const cy = (Math.random() - 0.5) * 30;
      const cz = (Math.random() - 0.5) * 20;

      const data = {
        id: i,
        treePos: new THREE.Vector3(tx, ty, tz),
        chaosPos: new THREE.Vector3(cx, cy, cz),
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      // Distribute types
      const type = Math.random();
      if(type < 0.65) spheres.push(data); // Mostly spheres
      else if (type < 0.85) boxes.push(data);
      else gems.push(data);
    }
    return { spheres, boxes, gems };
  }, []);

  return (
    <group>
      {/* The Star Topper */}
      <StarTopper />

      {/* Type 1: Classic Baubles (Shiny) */}
      <Instances range={spheres.length}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial metalness={1.0} roughness={0.15} envMapIntensity={3} />
        {spheres.map((data, i) => <OrnamentInstance key={i} {...data} />)}
      </Instances>

      {/* Type 2: Gift Boxes (Matte/Satin) */}
      <Instances range={boxes.length}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial metalness={0.4} roughness={0.4} />
        {boxes.map((data, i) => <OrnamentInstance key={i} {...data} />)}
      </Instances>

      {/* Type 3: Gems/Crystals (Sparkly) */}
      <Instances range={gems.length}>
        <icosahedronGeometry args={[0.25, 0]} />
        <meshPhysicalMaterial 
            metalness={0.1} 
            roughness={0} 
            transmission={0.6} 
            thickness={1.5} 
            ior={2.0}
            color="white"
            emissive="white"
            emissiveIntensity={0.2}
        />
        {gems.map((data, i) => <OrnamentInstance key={i} {...data} />)}
      </Instances>
    </group>
  );
};

const StarTopper = () => {
    const ref = useRef<THREE.Mesh>(null);
    // Tree Tip is at 9.0.
    // User requested "half a star height" gap.
    // Star radius approx 0.7. 
    // Position 10.4 = 9.0 (Tip) + 0.7 (Gap) + 0.7 (Radius)
    const treePos = new THREE.Vector3(0, 10.4, 0); 
    const chaosPos = new THREE.Vector3(0, 8, 0); 
    
    // Create Custom Star Shape
    const starGeometry = useMemo(() => {
      const shape = new THREE.Shape();
      const points = 5;
      const outerRadius = 0.7;
      const innerRadius = 0.3;
      
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (points * 2)) * Math.PI * 2;
        // Rotate -PI/2 to point upwards
        const x = Math.cos(angle - Math.PI / 2) * r;
        const y = Math.sin(angle - Math.PI / 2) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      
      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.1
      };
      
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }, []);

    useFrame(({ clock }) => {
        const { interactionStrength } = useTreeStore.getState();
        if(ref.current) {
            const target = new THREE.Vector3().lerpVectors(chaosPos, treePos, interactionStrength);
            ref.current.position.lerp(target, 0.05);
            
            // Spin slowly
            ref.current.rotation.y = clock.getElapsedTime() * 0.8;
            
            // Pulse scale
            const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
            ref.current.scale.setScalar(pulse);
        }
    });

    return (
        <mesh ref={ref} geometry={starGeometry}>
            <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFAA00" 
                emissiveIntensity={4}
                metalness={0.8}
                roughness={0.2}
            />
            <pointLight distance={10} intensity={10} color="#ffaa00" decay={2} />
        </mesh>
    )
}
