import { Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Lesson } from '../../data/lessons';

interface LessonVisualProps {
  visual: Lesson['visual'];
}

const RotatingSphere = ({ color = '#38bdf8', emissive = '#0ea5e9' }: { color?: string; emissive?: string }) => {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    state.camera.position.x = Math.sin(t / 3) * 0.6;
    state.camera.position.z = 2.5;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} metalness={0.1} roughness={0.5} />
    </mesh>
  );
};

const OrbitRing = () => (
  <mesh rotation={[Math.PI / 2, 0, 0]}>
    <ringGeometry args={[1.4, 1.45, 64]} />
    <meshBasicMaterial color="#bae6fd" transparent opacity={0.4} />
  </mesh>
);

const Satellite = () => {
  useFrame((state, delta) => {
    const mesh = state.scene.getObjectByName('satellite');
    if (!mesh) {
      return;
    }
    mesh.rotation.z += delta * 1.5;
    mesh.position.x = Math.cos(state.clock.elapsedTime) * 1.4;
    mesh.position.y = Math.sin(state.clock.elapsedTime) * 0.8;
  });

  return (
    <mesh name="satellite">
      <boxGeometry args={[0.25, 0.25, 0.5]} />
      <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.6} />
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.02, 0.6, 0.4]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#f8fafc" emissiveIntensity={0.3} />
      </mesh>
    </mesh>
  );
};

const DayNightTerminator = () => (
  <mesh rotation={[0, Math.PI / 6, Math.PI / 9]}>
    <sphereGeometry args={[1.02, 32, 32]} />
    <meshStandardMaterial color="#020617" transparent opacity={0.6} />
  </mesh>
);

const AuroraRibbon = () => {
  useFrame((state) => {
    const mesh = state.scene.getObjectByName('aurora');
    if (!mesh) {
      return;
    }
    mesh.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
  });

  return (
    <mesh name="aurora" rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1.5, 64, 1, 0, Math.PI / 1.2]} />
      <meshStandardMaterial color="#86efac" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={0.5} />
    </mesh>
  );
};

const CommunicationBeams = () => (
  <group>
    {[0, 1, 2].map((index) => (
      <mesh key={index} rotation={[Math.PI / 2, 0, (Math.PI / 3) * index]} position={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.02, 0.06, 2, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
    ))}
  </group>
);

const DockingArms = () => (
  <group>
    {[0, 1, 2].map((index) => (
      <mesh key={index} rotation={[0, (Math.PI * 2 * index) / 3, 0]} position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 0.08, 0.08]} />
        <meshStandardMaterial color="#cbd5f5" emissive="#818cf8" emissiveIntensity={0.3} />
      </mesh>
    ))}
    <mesh>
      <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.2} />
    </mesh>
  </group>
);

const FutureHabitat = () => (
  <group>
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[1.4, 0.4, 1.4]} />
      <meshStandardMaterial color="#38bdf8" emissive="#22d3ee" emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, -0.4, 0]}>
      <boxGeometry args={[1.2, 0.4, 1.2]} />
      <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={0.25} />
    </mesh>
    <mesh>
      <cylinderGeometry args={[0.3, 0.3, 1.2, 32]} />
      <meshStandardMaterial color="#c4b5fd" emissive="#a855f7" emissiveIntensity={0.2} />
    </mesh>
  </group>
);

const FloatingCrystals = () => {
  useFrame((state) => {
    state.scene.children
      .filter((child) => child.name?.startsWith('crystal'))
      .forEach((child, index) => {
        child.rotation.x += 0.01 + index * 0.003;
        child.rotation.y += 0.015 + index * 0.002;
        child.position.y = Math.sin(state.clock.elapsedTime + index) * 0.4;
      });
  });

  return (
    <group>
      {[0, 1, 2].map((index) => (
        <mesh key={index} name={`crystal-${index}`} position={[index - 1, 0, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#f472b6" emissive="#ec4899" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
};

const InternationalOrbital = () => (
  <group>
    {[0, 1, 2, 3, 4].map((index) => (
      <mesh key={index} position={[Math.cos((index / 5) * Math.PI * 2) * 1.2, Math.sin((index / 5) * Math.PI * 2) * 1.2, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#facc15" emissive="#fde047" emissiveIntensity={0.4} />
      </mesh>
    ))}
    <RotatingSphere color="#60a5fa" emissive="#3b82f6" />
  </group>
);

const visualContentMap: Record<Lesson['visual'], JSX.Element> = {
  orbit: (
    <group>
      <RotatingSphere />
      <OrbitRing />
      <Satellite />
    </group>
  ),
  dayNight: (
    <group>
      <RotatingSphere color="#0ea5e9" emissive="#0284c7" />
      <DayNightTerminator />
    </group>
  ),
  cupola: (
    <group>
      <mesh>
        <sphereGeometry args={[1, 6, 12]} />
        <meshStandardMaterial color="#1e293b" wireframe opacity={0.8} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.4} wireframe />
      </mesh>
    </group>
  ),
  aurora: (
    <group>
      <RotatingSphere color="#1e293b" emissive="#0f172a" />
      <AuroraRibbon />
    </group>
  ),
  life: (
    <group>
      <RotatingSphere color="#a855f7" emissive="#c026d3" />
      <mesh position={[0, -1.3, 0]}>
        <torusGeometry args={[1.4, 0.05, 16, 64]} />
        <meshStandardMaterial color="#f472b6" emissive="#ec4899" emissiveIntensity={0.5} />
      </mesh>
    </group>
  ),
  orbitPhysics: (
    <group>
      <RotatingSphere color="#22d3ee" emissive="#06b6d4" />
      <OrbitRing />
    </group>
  ),
  international: <InternationalOrbital />,
  microgravity: (
    <group>
      <FloatingCrystals />
      <RotatingSphere color="#0ea5e9" emissive="#06b6d4" />
    </group>
  ),
  earthObservation: (
    <group>
      <RotatingSphere color="#38bdf8" emissive="#22d3ee" />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.25, 64]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} transparent opacity={0.5} />
      </mesh>
    </group>
  ),
  communications: (
    <group>
      <RotatingSphere color="#6366f1" emissive="#4338ca" />
      <CommunicationBeams />
    </group>
  ),
  docking: (
    <group>
      <RotatingSphere color="#38bdf8" emissive="#0ea5e9" />
      <DockingArms />
    </group>
  ),
  future: (
    <group>
      <RotatingSphere color="#a855f7" emissive="#7c3aed" />
      <FutureHabitat />
    </group>
  ),
};

const Placeholder = () => (
  <div className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-xs uppercase tracking-[0.35em] text-slate-400">
    Visual loading
  </div>
);

const LessonVisual = ({ visual }: LessonVisualProps) => {
  const canvas = useMemo(
    () => (
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }} className="h-full w-full">
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={1.2} />
        <Suspense fallback={null}>{visualContentMap[visual]}</Suspense>
      </Canvas>
    ),
    [visual],
  );

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-[1.75rem] border border-slate-800/60 bg-slate-950/80 shadow-[0_35px_120px_-60px_rgba(56,189,248,0.9)]">
      <Suspense fallback={<Placeholder />}>{canvas}</Suspense>
      <div className="pointer-events-none absolute inset-x-6 bottom-4 flex justify-end text-[10px] uppercase tracking-[0.45em] text-slate-400/70">
        {visual.replace(/([A-Z])/g, ' $1')}
      </div>
    </div>
  );
};

export default LessonVisual;
