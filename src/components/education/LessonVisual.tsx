import { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { Lesson } from '../../data/lessons';
import LessonModel from './LessonModel';

interface LessonVisualProps {
  lesson: Lesson;
}

type Vector3Tuple = [number, number, number];

interface CameraConfig {
  position: Vector3Tuple;
  target: Vector3Tuple;
  parallax: { x: number; y: number };
}

interface ModelConfig {
  scale: number;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  rotationSpeed: number;
}

interface BloomConfig {
  intensity: number;
  threshold: number;
  smoothing: number;
}

interface ContactShadowConfig {
  scale: number;
  blur: number;
  opacity: number;
  far: number;
  position: Vector3Tuple;
}

interface DirectionalLightConfig {
  position: Vector3Tuple;
  intensity: number;
  color?: string;
}

interface LightConfig {
  ambient: number;
  directional: DirectionalLightConfig[];
}

interface SceneConfig {
  camera: CameraConfig;
  model: ModelConfig;
  bloom: BloomConfig;
  lights: LightConfig;
  contactShadow: ContactShadowConfig;
  environment: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse';
}

interface PartialSceneConfig {
  camera?: Partial<CameraConfig>;
  model?: Partial<ModelConfig>;
  bloom?: Partial<BloomConfig>;
  lights?: Partial<LightConfig>;
  contactShadow?: Partial<ContactShadowConfig>;
  environment?: SceneConfig['environment'];
}

const baseSceneConfig: SceneConfig = {
  camera: {
    position: [0.15, 0.3, 4.2],
    target: [0, 0, 0],
    parallax: { x: 0.32, y: 0.22 },
  },
  model: {
    scale: 1,
    position: [0, -0.3, 0],
    rotation: [0, Math.PI / 6, 0],
    rotationSpeed: 0.002,
  },
  bloom: {
    intensity: 0.55,
    threshold: 0.22,
    smoothing: 0.75,
  },
  lights: {
    ambient: 0.65,
    directional: [
      { position: [4, 6, 8], intensity: 1.6, color: '#9ec5ff' },
      { position: [-5, -2, -4], intensity: 0.8, color: '#1e2a4a' },
    ],
  },
  contactShadow: {
    scale: 6,
    blur: 2.5,
    opacity: 0.45,
    far: 6,
    position: [0, -1.2, 0],
  },
  environment: 'city',
};

const sceneOverrides: Record<Lesson['visual'], PartialSceneConfig> = {
  orbit: {
    camera: {
      position: [0.25, 0.4, 4.6],
      parallax: { x: 0.34, y: 0.24 },
    },
    model: {
      scale: 1.1,
      rotationSpeed: 0.0024,
    },
    bloom: {
      intensity: 0.62,
      threshold: 0.2,
    },
  },
  dayNight: {
    environment: 'sunset',
    lights: {
      ambient: 0.55,
      directional: [
        { position: [5, 4, 6], intensity: 1.4, color: '#ffd29d' },
        { position: [-4, -3, -4], intensity: 0.7, color: '#18314f' },
      ],
    },
    model: {
      scale: 1.05,
      rotation: [0.1, Math.PI / 4, 0],
    },
    bloom: {
      intensity: 0.48,
      threshold: 0.26,
    },
  },
  cupola: {
    environment: 'night',
    camera: {
      position: [-0.2, 0.25, 4],
      parallax: { x: 0.28, y: 0.2 },
    },
    lights: {
      ambient: 0.5,
      directional: [
        { position: [3, 5, 6], intensity: 1.3, color: '#6ca8ff' },
        { position: [-3, -3, -4], intensity: 0.65, color: '#1f2937' },
      ],
    },
    model: {
      scale: 1.15,
      position: [0, -0.4, 0],
      rotationSpeed: 0.0021,
    },
  },
  aurora: {
    environment: 'night',
    lights: {
      ambient: 0.45,
      directional: [
        { position: [3, 5, 5], intensity: 1.5, color: '#8ff0c0' },
        { position: [-4, -2, -4], intensity: 0.75, color: '#14203b' },
      ],
    },
    bloom: {
      intensity: 0.78,
      threshold: 0.18,
    },
    model: {
      scale: 1.22,
      rotationSpeed: 0.0018,
    },
  },
  life: {
    environment: 'studio',
    lights: {
      ambient: 0.7,
      directional: [
        { position: [5, 4, 6], intensity: 1.4, color: '#f9d6ff' },
        { position: [-4, -3, -5], intensity: 0.85, color: '#1f2a44' },
      ],
    },
    model: {
      scale: 1.1,
      position: [0, -0.2, 0],
      rotation: [0, Math.PI / 8, 0],
      rotationSpeed: 0.0025,
    },
  },
  orbitPhysics: {
    camera: {
      position: [0.3, 0.35, 4.4],
    },
    model: {
      scale: 1.12,
      rotationSpeed: 0.0028,
    },
    lights: {
      ambient: 0.6,
      directional: [
        { position: [4.5, 5, 7], intensity: 1.6, color: '#8bd0ff' },
        { position: [-5, -3, -4.5], intensity: 0.9, color: '#162035' },
      ],
    },
  },
  international: {
    environment: 'apartment',
    lights: {
      ambient: 0.75,
      directional: [
        { position: [4, 6, 8], intensity: 1.45, color: '#ffe58f' },
        { position: [-6, -3, -4], intensity: 0.82, color: '#273149' },
      ],
    },
    model: {
      scale: 1.05,
      rotationSpeed: 0.0022,
    },
  },
  microgravity: {
    environment: 'studio',
    bloom: {
      intensity: 0.68,
      threshold: 0.2,
    },
    model: {
      scale: 1.18,
      rotation: [0.15, Math.PI / 3, 0.05],
    },
  },
  earthObservation: {
    environment: 'sunset',
    lights: {
      ambient: 0.6,
      directional: [
        { position: [5, 5, 7], intensity: 1.5, color: '#ffe1a8' },
        { position: [-5, -2, -5], intensity: 0.8, color: '#1a2538' },
      ],
    },
    model: {
      scale: 1.16,
      rotation: [0.05, Math.PI / 5, 0],
      rotationSpeed: 0.0023,
    },
  },
  communications: {
    environment: 'studio',
    lights: {
      ambient: 0.65,
      directional: [
        { position: [4, 6, 7], intensity: 1.55, color: '#8bbcff' },
        { position: [-4, -2, -4], intensity: 0.85, color: '#1a2a45' },
      ],
    },
    bloom: {
      intensity: 0.7,
      threshold: 0.21,
    },
    model: {
      scale: 1.08,
      rotationSpeed: 0.0026,
    },
  },
  docking: {
    environment: 'warehouse',
    lights: {
      ambient: 0.6,
      directional: [
        { position: [6, 4, 7], intensity: 1.65, color: '#9ecaff' },
        { position: [-4, -3, -4], intensity: 0.95, color: '#141d2e' },
      ],
    },
    model: {
      scale: 1.12,
      rotation: [0.08, Math.PI / 3.2, 0],
    },
  },
  future: {
    environment: 'dawn',
    lights: {
      ambient: 0.7,
      directional: [
        { position: [5, 5, 6], intensity: 1.6, color: '#ffd1ff' },
        { position: [-4, -3, -4], intensity: 0.9, color: '#18243a' },
      ],
    },
    bloom: {
      intensity: 0.75,
      threshold: 0.19,
    },
    model: {
      scale: 1.14,
      rotationSpeed: 0.0021,
    },
  },
};

const mergeSceneConfig = (override: PartialSceneConfig | undefined): SceneConfig => {
  if (!override) {
    return baseSceneConfig;
  }

  return {
    camera: {
      position: override.camera?.position ?? baseSceneConfig.camera.position,
      target: override.camera?.target ?? baseSceneConfig.camera.target,
      parallax: override.camera?.parallax ?? baseSceneConfig.camera.parallax,
    },
    model: {
      scale: override.model?.scale ?? baseSceneConfig.model.scale,
      position: override.model?.position ?? baseSceneConfig.model.position,
      rotation: override.model?.rotation ?? baseSceneConfig.model.rotation,
      rotationSpeed: override.model?.rotationSpeed ?? baseSceneConfig.model.rotationSpeed,
    },
    bloom: {
      intensity: override.bloom?.intensity ?? baseSceneConfig.bloom.intensity,
      threshold: override.bloom?.threshold ?? baseSceneConfig.bloom.threshold,
      smoothing: override.bloom?.smoothing ?? baseSceneConfig.bloom.smoothing,
    },
    lights: {
      ambient: override.lights?.ambient ?? baseSceneConfig.lights.ambient,
      directional: override.lights?.directional ?? baseSceneConfig.lights.directional,
    },
    contactShadow: {
      scale: override.contactShadow?.scale ?? baseSceneConfig.contactShadow.scale,
      blur: override.contactShadow?.blur ?? baseSceneConfig.contactShadow.blur,
      opacity: override.contactShadow?.opacity ?? baseSceneConfig.contactShadow.opacity,
      far: override.contactShadow?.far ?? baseSceneConfig.contactShadow.far,
      position: override.contactShadow?.position ?? baseSceneConfig.contactShadow.position,
    },
    environment: override.environment ?? baseSceneConfig.environment,
  };
};

const ParallaxCameraRig = ({ config }: { config: SceneConfig['camera'] }) => {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(...config.target), [config.target]);
  const basePosition = useMemo(() => new THREE.Vector3(...config.position), [config.position]);

  useEffect(() => {
    camera.position.set(basePosition.x, basePosition.y, basePosition.z);
    camera.lookAt(target);
  }, [basePosition, camera, target]);

  useFrame(({ mouse }) => {
    const nextX = basePosition.x + mouse.x * config.parallax.x;
    const nextY = basePosition.y + mouse.y * config.parallax.y;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, nextX, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, nextY, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, basePosition.z, 0.06);
    camera.lookAt(target);
  });

  return null;
};

const CinematicLights = ({ lights }: { lights: LightConfig }) => (
  <>
    <ambientLight intensity={lights.ambient} />
    {lights.directional.map((light, index) => (
      <directionalLight key={`dir-${index}`} position={light.position} intensity={light.intensity} color={light.color} />
    ))}
  </>
);

const CanvasFallback = () => (
  <div className="flex h-full w-full items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-[10px] uppercase tracking-[0.4em] text-slate-500/70">
    Loading scene…
  </div>
);

const LessonVisual = ({ lesson }: LessonVisualProps) => {
  const config = useMemo(() => mergeSceneConfig(sceneOverrides[lesson.visual]), [lesson.visual]);

  return (
    <div className="relative h-[26rem] w-full overflow-hidden rounded-[1.75rem] border border-slate-800/60 bg-slate-950/80 shadow-[0_35px_120px_-60px_rgba(56,189,248,0.9)]">
      <Suspense fallback={<CanvasFallback />}>
        <Canvas
          camera={{ position: config.camera.position, fov: 50 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={["#020617"]} />
          <CinematicLights lights={config.lights} />
          <Suspense fallback={null}>
            <LessonModel
              modelPath={lesson.model}
              baseScale={config.model.scale}
              position={config.model.position}
              rotation={config.model.rotation}
              rotationSpeed={config.model.rotationSpeed}
            />
            <Environment preset={config.environment} />
          </Suspense>
          <ContactShadows
            opacity={config.contactShadow.opacity}
            scale={config.contactShadow.scale}
            blur={config.contactShadow.blur}
            far={config.contactShadow.far}
            position={config.contactShadow.position}
          />
          <EffectComposer disableNormalPass>
            <Bloom intensity={config.bloom.intensity} luminanceThreshold={config.bloom.threshold} luminanceSmoothing={config.bloom.smoothing} />
          </EffectComposer>
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
          <ParallaxCameraRig config={config.camera} />
        </Canvas>
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/10 to-slate-950/60" />
      <div className="pointer-events-none absolute inset-x-6 bottom-4 flex justify-end text-[10px] uppercase tracking-[0.45em] text-slate-400/70">
        {lesson.title}
      </div>
    </div>
  );
};

export default LessonVisual;
