import { Suspense, useEffect, useMemo } from 'react';
import type { Lesson } from '../../data/lessons';
import LessonSceneController from '../LessonSceneController';
import LessonModel from './LessonModel';

interface LessonVisualProps {
  lesson: Lesson;
}

type Vector3Tuple = [number, number, number];

interface CameraConfig {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
  autoRotateSpeed: number;
}

interface ModelConfig {
  scale: number;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
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
  ambientColor?: string;
  directional: DirectionalLightConfig[];
}

interface SceneConfig {
  camera: CameraConfig;
  model: ModelConfig;
  bloom: BloomConfig;
  lights: LightConfig;
  contactShadow: ContactShadowConfig;
  environment: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse';
  background: string;
}

interface PartialSceneConfig {
  camera?: Partial<CameraConfig>;
  model?: Partial<ModelConfig>;
  bloom?: Partial<BloomConfig>;
  lights?: Partial<LightConfig>;
  contactShadow?: Partial<ContactShadowConfig>;
  environment?: SceneConfig['environment'];
  background?: string;
}

const baseSceneConfig: SceneConfig = {
  camera: {
    position: [0.15, 0.3, 4.2],
    target: [0, 0, 0],
    fov: 48,
    autoRotateSpeed: 0.4,
  },
  model: {
    scale: 1,
    position: [0, -0.3, 0],
    rotation: [0, Math.PI / 6, 0],
  },
  bloom: {
    intensity: 0.6,
    threshold: 0.22,
    smoothing: 0.75,
  },
  lights: {
    ambient: 0.65,
    ambientColor: '#9ec5ff',
    directional: [
      { position: [4, 6, 8], intensity: 1.6, color: '#9ec5ff' },
      { position: [-5, -2, -4], intensity: 0.9, color: '#1e2a4a' },
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
  background: '#040b1a',
};

const sceneOverrides: Record<Lesson['visual'], PartialSceneConfig> = {
  orbit: {
    camera: {
      position: [0.2, 0.42, 4.4],
      autoRotateSpeed: 0.55,
    },
    model: {
      scale: 1.08,
      rotation: [0, Math.PI / 5, 0],
    },
    bloom: {
      intensity: 0.68,
      threshold: 0.19,
    },
    lights: {
      ambient: 0.72,
      ambientColor: '#8dd2ff',
      directional: [
        { position: [5, 6, 7], intensity: 1.85, color: '#b9ddff' },
        { position: [-4, -3, -5], intensity: 0.85, color: '#101c2e' },
      ],
    },
    environment: 'night',
    background: '#041a35',
  },
  dayNight: {
    camera: {
      position: [0.12, 0.38, 4.5],
      autoRotateSpeed: 0.5,
    },
    model: {
      scale: 1.04,
      rotation: [0, Math.PI / 4, 0],
    },
    bloom: {
      intensity: 0.64,
    },
    lights: {
      ambient: 0.6,
      ambientColor: '#7dd3fc',
      directional: [
        { position: [3, 5, 7], intensity: 1.7, color: '#ffe29f' },
        { position: [-6, -1.4, -5], intensity: 0.75, color: '#0f172a' },
      ],
    },
    environment: 'sunset',
    background: '#0a1636',
  },
  cupola: {
    camera: {
      position: [0.18, 0.34, 4.1],
      autoRotateSpeed: 0.46,
    },
    model: {
      scale: 1.12,
      rotation: [0, Math.PI / 3, 0],
    },
    bloom: {
      intensity: 0.7,
      smoothing: 0.82,
    },
    lights: {
      ambient: 0.58,
      ambientColor: '#8ea5ff',
      directional: [
        { position: [4, 5.5, 6], intensity: 1.55, color: '#b1c8ff' },
        { position: [-3, -2.5, -4], intensity: 0.8, color: '#101420' },
      ],
    },
    environment: 'studio',
    background: '#050f24',
  },
  aurora: {
    camera: {
      position: [0.25, 0.36, 4.5],
      autoRotateSpeed: 0.58,
    },
    model: {
      scale: 1.1,
      rotation: [0, Math.PI / 4.2, 0],
    },
    bloom: {
      intensity: 0.78,
      threshold: 0.16,
    },
    lights: {
      ambient: 0.75,
      ambientColor: '#4ee1a0',
      directional: [
        { position: [3, 7, 6], intensity: 1.6, color: '#6fffc7' },
        { position: [-5, -2, -5], intensity: 0.9, color: '#172a29' },
      ],
    },
    environment: 'forest',
    background: '#03241f',
  },
  life: {
    camera: {
      position: [0.1, 0.32, 4.3],
      autoRotateSpeed: 0.42,
    },
    model: {
      scale: 1.05,
      rotation: [0, Math.PI / 5.5, 0],
    },
    lights: {
      ambient: 0.62,
      ambientColor: '#ffd3a4',
      directional: [
        { position: [4, 4.5, 5.5], intensity: 1.5, color: '#ffe4b5' },
        { position: [-4.2, -2, -4.8], intensity: 0.78, color: '#2b1c10' },
      ],
    },
    environment: 'apartment',
    background: '#1b0f0b',
  },
  orbitPhysics: {
    camera: {
      position: [0.22, 0.46, 4.6],
      autoRotateSpeed: 0.6,
    },
    model: {
      scale: 1.16,
      rotation: [0, Math.PI / 3.5, 0],
    },
    bloom: {
      intensity: 0.72,
    },
    lights: {
      ambient: 0.68,
      ambientColor: '#6ac7ff',
      directional: [
        { position: [5.5, 6.5, 7], intensity: 1.9, color: '#7fbfff' },
        { position: [-4.5, -3.5, -5], intensity: 0.82, color: '#101529' },
      ],
    },
    environment: 'night',
    background: '#021227',
  },
  international: {
    camera: {
      position: [0.15, 0.3, 4.2],
      autoRotateSpeed: 0.44,
    },
    model: {
      scale: 1.02,
      rotation: [0, Math.PI / 4, 0],
    },
    lights: {
      ambient: 0.66,
      ambientColor: '#9ec5ff',
      directional: [
        { position: [4.5, 5.8, 6.5], intensity: 1.7, color: '#b9d8ff' },
        { position: [-5, -2.2, -4.6], intensity: 0.8, color: '#121c2e' },
      ],
    },
    environment: 'studio',
    background: '#061630',
  },
  microgravity: {
    camera: {
      position: [0.08, 0.28, 4.1],
      autoRotateSpeed: 0.48,
    },
    model: {
      scale: 1.08,
      rotation: [0, Math.PI / 5, 0],
    },
    bloom: {
      intensity: 0.74,
      smoothing: 0.8,
    },
    lights: {
      ambient: 0.7,
      ambientColor: '#c0a8ff',
      directional: [
        { position: [3.8, 6.4, 6.2], intensity: 1.65, color: '#e3ccff' },
        { position: [-3.5, -2.8, -4.2], intensity: 0.78, color: '#251236' },
      ],
    },
    environment: 'lobby',
    background: '#1a0f2b',
  },
  earthObservation: {
    camera: {
      position: [0.18, 0.35, 4.3],
      autoRotateSpeed: 0.52,
    },
    model: {
      scale: 1.1,
      rotation: [0, Math.PI / 4.3, 0],
    },
    lights: {
      ambient: 0.68,
      ambientColor: '#5fd8ff',
      directional: [
        { position: [4.6, 5.8, 6.3], intensity: 1.75, color: '#87e0ff' },
        { position: [-4.3, -2.1, -4.9], intensity: 0.82, color: '#082030' },
      ],
    },
    environment: 'park',
    background: '#031b29',
  },
  communications: {
    camera: {
      position: [0.2, 0.32, 4.2],
      autoRotateSpeed: 0.5,
    },
    model: {
      scale: 1.06,
      rotation: [0, Math.PI / 4.8, 0],
    },
    bloom: {
      intensity: 0.69,
    },
    lights: {
      ambient: 0.63,
      ambientColor: '#ffd580',
      directional: [
        { position: [4.8, 5.2, 6.5], intensity: 1.6, color: '#ffe5a0' },
        { position: [-4.6, -2.4, -4.4], intensity: 0.78, color: '#2c1404' },
      ],
    },
    environment: 'sunset',
    background: '#251307',
  },
  docking: {
    camera: {
      position: [0.24, 0.38, 4.5],
      autoRotateSpeed: 0.56,
    },
    model: {
      scale: 1.12,
      rotation: [0, Math.PI / 3.6, 0],
    },
    bloom: {
      intensity: 0.71,
      smoothing: 0.78,
    },
    lights: {
      ambient: 0.7,
      ambientColor: '#9ab0ff',
      directional: [
        { position: [5.4, 6.2, 6.8], intensity: 1.8, color: '#d0dcff' },
        { position: [-4.1, -3.1, -5], intensity: 0.84, color: '#0d1326' },
      ],
    },
    environment: 'warehouse',
    background: '#0a1331',
  },
  future: {
    camera: {
      position: [0.2, 0.34, 4.4],
      autoRotateSpeed: 0.54,
    },
    model: {
      scale: 1.14,
      rotation: [0, Math.PI / 3.2, 0],
    },
    bloom: {
      intensity: 0.76,
    },
    lights: {
      ambient: 0.74,
      ambientColor: '#ffc46b',
      directional: [
        { position: [5, 5.8, 6.4], intensity: 1.72, color: '#ffd27f' },
        { position: [-4.8, -2.6, -4.6], intensity: 0.82, color: '#1f0f04' },
      ],
    },
    environment: 'dawn',
    background: '#281204',
  },
};

const mergeSceneConfig = (override?: PartialSceneConfig): SceneConfig => {
  if (!override) {
    return baseSceneConfig;
  }

  return {
    camera: {
      position: override.camera?.position ?? baseSceneConfig.camera.position,
      target: override.camera?.target ?? baseSceneConfig.camera.target,
      fov: override.camera?.fov ?? baseSceneConfig.camera.fov,
      autoRotateSpeed: override.camera?.autoRotateSpeed ?? baseSceneConfig.camera.autoRotateSpeed,
    },
    model: {
      scale: override.model?.scale ?? baseSceneConfig.model.scale,
      position: override.model?.position ?? baseSceneConfig.model.position,
      rotation: override.model?.rotation ?? baseSceneConfig.model.rotation,
    },
    bloom: {
      intensity: override.bloom?.intensity ?? baseSceneConfig.bloom.intensity,
      threshold: override.bloom?.threshold ?? baseSceneConfig.bloom.threshold,
      smoothing: override.bloom?.smoothing ?? baseSceneConfig.bloom.smoothing,
    },
    lights: {
      ambient: override.lights?.ambient ?? baseSceneConfig.lights.ambient,
      ambientColor: override.lights?.ambientColor ?? baseSceneConfig.lights.ambientColor,
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
    background: override.background ?? baseSceneConfig.background,
  };
};

const CanvasFallback = () => (
  <div className="flex h-full w-full items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-[10px] uppercase tracking-[0.4em] text-slate-500/70">
    Loading scene…
  </div>
);

const MissingModelFallback = () => (
  <div className="flex h-full w-full items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-[11px] uppercase tracking-[0.4em] text-slate-400">
    Lesson visual unavailable
  </div>
);

const LessonVisual = ({ lesson }: LessonVisualProps) => {
  const config = useMemo(() => mergeSceneConfig(sceneOverrides[lesson.visual]), [lesson.visual]);
  const hasValidModel = typeof lesson.model === 'string' && lesson.model.trim().length > 0;

  useEffect(() => {
    if (!hasValidModel) {
      console.warn('Lesson is missing a valid model path; skipping 3D render.', {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
      });
    }
  }, [hasValidModel, lesson.id, lesson.title]);

  return (
    <div
      className="relative h-[26rem] w-full overflow-hidden rounded-[1.75rem] border border-slate-800/60 bg-slate-950/70 shadow-[0_35px_140px_-70px_rgba(56,189,248,0.95)]"
      style={{ backgroundImage: `radial-gradient(140% 120% at 50% 0%, ${config.background}66, rgba(2,6,23,0.92))` }}
    >
      {hasValidModel ? (
        <Suspense fallback={<CanvasFallback />}>
          <LessonSceneController lessonId={lesson.id} config={config}>
            <LessonModel
              modelPath={lesson.model}
              baseScale={config.model.scale}
              position={config.model.position}
              rotation={config.model.rotation}
            />
          </LessonSceneController>
        </Suspense>
      ) : (
        <MissingModelFallback />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/10 to-slate-950/60" />
      <div className="pointer-events-none absolute inset-x-6 bottom-4 flex justify-end text-[10px] uppercase tracking-[0.45em] text-slate-200/80">
        {lesson.title}
      </div>
    </div>
  );
};

export default LessonVisual;
