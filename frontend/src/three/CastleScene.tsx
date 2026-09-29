import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CastleProps {
  scrollProgress: number; // 0.0 (distant landscape) to 1.0 (inside castle hall)
}

function Cloud({ position, scale }: { position: [number, number, number]; scale: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const speed = useMemo(() => 0.2 + Math.random() * 0.3, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x += delta * speed;
      if (meshRef.current.position.x > 50) {
        meshRef.current.position.x = -50;
      }
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3, 7, 7]} />
        <meshBasicMaterial color="#EEE7D4" transparent opacity={0.12} />
      </mesh>
      <mesh position={[2, 0.5, 0]}>
        <sphereGeometry args={[2.2, 7, 7]} />
        <meshBasicMaterial color="#D9C28F" transparent opacity={0.09} />
      </mesh>
      <mesh position={[-2, -0.2, 0]}>
        <sphereGeometry args={[2, 7, 7]} />
        <meshBasicMaterial color="#EEE7D4" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function StylizedTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Wooden Trunk */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.45, 3, 6]} />
        <meshStandardMaterial color="#4A3B2C" roughness={0.9} />
      </mesh>
      {/* Foliage Layers (Deep Forest Green & Muted Moss) */}
      <mesh position={[0, 3.2, 0]}>
        <coneGeometry args={[1.8, 2.5, 6]} />
        <meshStandardMaterial color="#243B36" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <coneGeometry args={[1.4, 2.2, 6]} />
        <meshStandardMaterial color="#2F4F46" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.5, 0]}>
        <coneGeometry args={[0.9, 1.8, 6]} />
        <meshStandardMaterial color="#3E655B" roughness={0.8} />
      </mesh>
    </group>
  );
}

function LanternPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Aged Bronze Post */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2.4, 6]} />
        <meshStandardMaterial color="#6E5A3B" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Lantern Housing */}
      <mesh position={[0, 2.3, 0]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#C89B52" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Warm Golden Glow Core */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#D9C28F" />
      </mesh>
      <pointLight position={[0, 2.3, 0]} color="#C89B52" intensity={2} distance={8} />
    </group>
  );
}

function RobotGuardianModel({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.75}>
      {/* Body Torso */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.7, 0.8, 0.5]} />
        <meshStandardMaterial color="#243B36" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Brass Trim */}
      <mesh position={[0, 1.1, 0.26]}>
        <boxGeometry args={[0.5, 0.6, 0.05]} />
        <meshStandardMaterial color="#C89B52" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.7, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.4]} />
        <meshStandardMaterial color="#6E5A3B" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Glowing Eye Lens */}
      <mesh position={[0, 1.7, 0.22]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#D9C28F" />
      </mesh>
      <pointLight position={[0, 1.7, 0.3]} color="#D9C28F" intensity={1.2} distance={4} />

      {/* Floating Gear base */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
        <meshStandardMaterial color="#6E5A3B" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function FantasyCastleGeometry({ scrollProgress }: { scrollProgress: number }) {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Doors open smoothly when user approaches gate (progress > 0.5)
  const doorOpenAmount = useMemo(() => {
    if (scrollProgress < 0.48) return 0;
    return Math.min(1, (scrollProgress - 0.48) / 0.32);
  }, [scrollProgress]);

  // Warm golden motes & spores buffer
  const particleCount = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 1] = Math.random() * 22 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 55;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    // Animate heavy castle doors
    if (leftDoorRef.current && rightDoorRef.current) {
      const targetRotation = doorOpenAmount * (Math.PI * 0.42);
      leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        leftDoorRef.current.rotation.y,
        -targetRotation,
        delta * 4
      );
      rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(
        rightDoorRef.current.rotation.y,
        targetRotation,
        delta * 4
      );
    }

    // Gentle particles drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group>
      {/* Distant Clouds */}
      <Cloud position={[-20, 22, -15]} scale={1.8} />
      <Cloud position={[15, 25, -20]} scale={2.2} />
      <Cloud position={[0, 18, -30]} scale={2.5} />
      <Cloud position={[-28, 16, 5]} scale={1.5} />
      <Cloud position={[25, 20, 10]} scale={1.6} />

      {/* Main Castle Gatehouse & Fortress Arch */}
      <group position={[0, 0, 0]}>
        {/* Stone Arch Left Pillar */}
        <mesh position={[-3.8, 5, 0]}>
          <boxGeometry args={[2.6, 10, 3.5]} />
          <meshStandardMaterial color="#202D28" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Stone Arch Right Pillar */}
        <mesh position={[3.8, 5, 0]}>
          <boxGeometry args={[2.6, 10, 3.5]} />
          <meshStandardMaterial color="#202D28" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Arch Lintel Header */}
        <mesh position={[0, 9.5, 0]}>
          <boxGeometry args={[10.2, 2.2, 3.5]} />
          <meshStandardMaterial color="#1A2622" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Antique Bronze Inscriptions on Arch */}
        <mesh position={[0, 9.5, 1.8]}>
          <boxGeometry args={[7.5, 0.4, 0.1]} />
          <meshStandardMaterial color="#C89B52" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Grand Timber & Bronze Castle Doors */}
        <group position={[-2.5, 0, 0]}>
          <group ref={leftDoorRef} position={[0, 4, 0]}>
            <mesh position={[1.25, 0, 0]}>
              <boxGeometry args={[2.5, 8, 0.4]} />
              <meshStandardMaterial color="#4A3822" roughness={0.8} />
            </mesh>
            {/* Bronze Door Bands & Rivets */}
            <mesh position={[1.25, 2, 0.22]}>
              <boxGeometry args={[2.4, 0.25, 0.06]} />
              <meshStandardMaterial color="#C89B52" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[1.25, -2, 0.22]}>
              <boxGeometry args={[2.4, 0.25, 0.06]} />
              <meshStandardMaterial color="#C89B52" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[2, 0, 0.24]}>
              <torusGeometry args={[0.3, 0.06, 8, 16]} />
              <meshStandardMaterial color="#C89B52" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>

        <group position={[2.5, 0, 0]}>
          <group ref={rightDoorRef} position={[0, 4, 0]}>
            <mesh position={[-1.25, 0, 0]}>
              <boxGeometry args={[2.5, 8, 0.4]} />
              <meshStandardMaterial color="#4A3822" roughness={0.8} />
            </mesh>
            {/* Bronze Door Bands & Rivets */}
            <mesh position={[-1.25, 2, 0.22]}>
              <boxGeometry args={[2.4, 0.25, 0.06]} />
              <meshStandardMaterial color="#C89B52" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[-1.25, -2, 0.22]}>
              <boxGeometry args={[2.4, 0.25, 0.06]} />
              <meshStandardMaterial color="#C89B52" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[-2, 0, 0.24]}>
              <torusGeometry args={[0.3, 0.06, 8, 16]} />
              <meshStandardMaterial color="#C89B52" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* Inner Observatory Hall Warm Light */}
        <pointLight position={[0, 5, -6]} color="#D9C28F" intensity={5} distance={18} />
      </group>

      {/* Flanking Stone Bastion Towers */}
      <group position={[-8.5, 0, 2]}>
        <mesh position={[0, 8, 0]}>
          <cylinderGeometry args={[2.4, 3, 16, 10]} />
          <meshStandardMaterial color="#1E2A25" roughness={0.8} />
        </mesh>
        {/* Conical Aged Bronze Roof */}
        <mesh position={[0, 18, 0]}>
          <coneGeometry args={[2.8, 5, 10]} />
          <meshStandardMaterial color="#557A72" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      <group position={[8.5, 0, 2]}>
        <mesh position={[0, 8, 0]}>
          <cylinderGeometry args={[2.4, 3, 16, 10]} />
          <meshStandardMaterial color="#1E2A25" roughness={0.8} />
        </mesh>
        {/* Conical Aged Bronze Roof */}
        <mesh position={[0, 18, 0]}>
          <coneGeometry args={[2.8, 5, 10]} />
          <meshStandardMaterial color="#557A72" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Distant Castle Spire Keeps */}
      <group position={[-14, 0, -12]}>
        <mesh position={[0, 12, 0]}>
          <cylinderGeometry args={[2.2, 3.2, 24, 8]} />
          <meshStandardMaterial color="#16201C" roughness={0.9} />
        </mesh>
        <mesh position={[0, 26, 0]}>
          <coneGeometry args={[2.5, 6, 8]} />
          <meshStandardMaterial color="#35534A" roughness={0.7} />
        </mesh>
      </group>

      <group position={[14, 0, -12]}>
        <mesh position={[0, 12, 0]}>
          <cylinderGeometry args={[2.2, 3.2, 24, 8]} />
          <meshStandardMaterial color="#16201C" roughness={0.9} />
        </mesh>
        <mesh position={[0, 26, 0]}>
          <coneGeometry args={[2.5, 6, 8]} />
          <meshStandardMaterial color="#35534A" roughness={0.7} />
        </mesh>
      </group>

      {/* Natural Hillside Ground Terrain */}
      <mesh position={[0, -0.1, 15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#18221F" roughness={0.95} />
      </mesh>

      {/* Stone Paved Pathway to Fortress */}
      <mesh position={[0, 0.02, 16]}>
        <boxGeometry args={[4.2, 0.08, 32]} />
        <meshStandardMaterial color="#2B3D37" roughness={0.85} />
      </mesh>
      {/* Weathered Bronze Pathway Curbs */}
      <mesh position={[-2.15, 0.08, 16]}>
        <boxGeometry args={[0.15, 0.06, 32]} />
        <meshStandardMaterial color="#6E5A3B" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[2.15, 0.08, 16]}>
        <boxGeometry args={[0.15, 0.06, 32]} />
        <meshStandardMaterial color="#6E5A3B" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Lantern Posts along the Path */}
      <LanternPost position={[-2.8, 0, 7]} />
      <LanternPost position={[2.8, 0, 7]} />
      <LanternPost position={[-2.8, 0, 15]} />
      <LanternPost position={[2.8, 0, 15]} />
      <LanternPost position={[-2.8, 0, 23]} />
      <LanternPost position={[2.8, 0, 23]} />

      {/* Guardian Robot stationed by the Path */}
      <RobotGuardianModel position={[-3.8, 0, 11]} />

      {/* Stylized Forest Trees flanking the mountain pathway */}
      <StylizedTree position={[-6.5, 0, 5]} scale={1.3} />
      <StylizedTree position={[-8.5, 0, 12]} scale={1.5} />
      <StylizedTree position={[-6, 0, 20]} scale={1.2} />
      <StylizedTree position={[-9, 0, 26]} scale={1.6} />

      <StylizedTree position={[6.5, 0, 5]} scale={1.2} />
      <StylizedTree position={[8.5, 0, 13]} scale={1.6} />
      <StylizedTree position={[6, 0, 21]} scale={1.4} />
      <StylizedTree position={[9.5, 0, 27]} scale={1.5} />

      {/* Floating Golden Particles (Spores / Fireflies) */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#D9C28F"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state) => {
    const t = THREE.MathUtils.clamp(scrollProgress, 0, 1);

    // Camera travels smoothly from the distant hillside pathway through the gate into the observatory hall
    const targetX = 0;
    const targetY = 7.5 - t * 4.2;
    const targetZ = 34 - t * 38; // 34 down to -4 (inside the fortress)
    const lookY = 5.5 - t * 2.5;
    const lookZ = 0 - t * 10;

    // Subtle natural mouse parallax
    const mouseX = (state.pointer.x * 1.2) * (1 - t * 0.7);
    const mouseY = (state.pointer.y * 0.8) * (1 - t * 0.7);

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX + mouseX, 0.07);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY + mouseY, 0.07);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.07);

    state.camera.lookAt(0, lookY, lookZ);
  });

  return null;
}

export const CastleScene: React.FC<CastleProps> = ({ scrollProgress }) => {
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 7.5, 34], fov: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Atmospheric watercolor background & fog */}
        <color attach="background" args={['#18221F']} />
        <fog attach="fog" args={['#18221F', 14, 52]} />

        {/* Ambient & Directional Warm Light */}
        <ambientLight intensity={0.45} color="#EEE7D4" />
        <directionalLight position={[12, 18, 14]} intensity={1.1} color="#D9C28F" />
        <directionalLight position={[-12, 14, -8]} intensity={0.5} color="#557A72" />

        <FantasyCastleGeometry scrollProgress={scrollProgress} />
        <CameraRig scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};
