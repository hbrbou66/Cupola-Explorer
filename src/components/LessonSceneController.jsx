import { Suspense, cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { a, useSpring } from '@react-spring/three';
import * as THREE from 'three';

const computeApproachPosition = (position, target) => {
  const positionVector = new THREE.Vector3(...position);
  const targetVector = new THREE.Vector3(...target);
  const direction = positionVector.clone().sub(targetVector);
  return targetVector.clone().add(direction.multiplyScalar(0.86)).toArray();
};

const CameraRig = ({ cameraSpring, target, cameraRef }) => {
  const { camera } = useThree();
  const targetVector = useMemo(() => new THREE.Vector3(...target), [target]);

  useEffect(() => {
    cameraRef.current = camera;
    const initialPosition = cameraSpring.position.get();
    if (Array.isArray(initialPosition)) {
      camera.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
    }
    camera.fov = cameraSpring.fov.get();
    camera.updateProjectionMatrix();
    camera.lookAt(targetVector);
  }, [camera, cameraRef, cameraSpring.fov, cameraSpring.position, targetVector]);

  useEffect(() => {
    const unsubscribePosition = cameraSpring.position.onChange((value) => {
      camera.position.set(value[0], value[1], value[2]);
    });
    const unsubscribeFov = cameraSpring.fov.onChange((value) => {
      camera.fov = value;
      camera.updateProjectionMatrix();
    });
    return () => {
      unsubscribePosition();
      unsubscribeFov();
    };
  }, [camera, cameraSpring.fov, cameraSpring.position]);

  useFrame(() => {
    camera.lookAt(targetVector);
  });

  return null;
};

const AnimatedAmbientLight = ({ intensity, color }) => {
  const [spring, api] = useSpring(() => ({ intensity, color: color ?? '#ffffff' }));

  useEffect(() => {
    api.start({ intensity, color: color ?? '#ffffff', config: { mass: 1, tension: 120, friction: 30 } });
  }, [api, color, intensity]);

  return <a.ambientLight intensity={spring.intensity} color={spring.color} />;
};

const AnimatedDirectionalLight = ({ light }) => {
  const [spring, api] = useSpring(() => ({
    position: light.position,
    intensity: light.intensity,
    color: light.color ?? '#ffffff',
  }));

  useEffect(() => {
    api.start({
      position: light.position,
      intensity: light.intensity,
      color: light.color ?? '#ffffff',
      config: { mass: 1.05, tension: 130, friction: 32 },
    });
  }, [api, light.color, light.intensity, light.position]);

  return <a.directionalLight position={spring.position} intensity={spring.intensity} color={spring.color} />;
};

const BackgroundColor = ({ color }) => {
  const { scene } = useThree();
  const [spring, api] = useSpring(() => ({ color }));

  useEffect(() => {
    api.start({ color, config: { mass: 1, tension: 80, friction: 26 } });
  }, [api, color]);

  useEffect(() => {
    const unsubscribe = spring.color.onChange((value) => {
      scene.background = new THREE.Color(value);
    });
    return () => {
      unsubscribe();
    };
  }, [scene, spring.color]);

  return null;
};

const LessonSceneController = ({ lessonId, config, children }) => {
  const cameraRef = useRef(null);
  const orbitRef = useRef(null);
  const [isModelHovered, setIsModelHovered] = useState(false);
  const target = useMemo(() => config.camera.target, [config.camera.target]);

  const [cameraSpring, cameraApi] = useSpring(() => ({
    position: config.camera.position,
    fov: config.camera.fov,
  }));

  useEffect(() => {
    const fromPosition = computeApproachPosition(config.camera.position, config.camera.target);
    cameraApi.start({
      from: { position: fromPosition, fov: config.camera.fov - 3 },
      to: { position: config.camera.position, fov: config.camera.fov },
      reset: true,
      config: {
        position: { mass: 1.2, tension: 140, friction: 32 },
        fov: { mass: 1.1, tension: 110, friction: 28 },
      },
    });
  }, [cameraApi, config.camera.fov, config.camera.position, config.camera.target, lessonId]);

  useEffect(() => {
    if (!orbitRef.current) {
      return;
    }
    orbitRef.current.target.set(target[0], target[1], target[2]);
    orbitRef.current.update();
  }, [lessonId, target]);

  const enhancedChild = useMemo(() => {
    if (!isValidElement(children)) {
      return children;
    }
    const existingOnHoverChange = children.props?.onHoverChange;
    return cloneElement(children, {
      onHoverChange: (hovered) => {
        setIsModelHovered(hovered);
        if (typeof existingOnHoverChange === 'function') {
          existingOnHoverChange(hovered);
        }
      },
    });
  }, [children]);

  return (
    <Canvas
      camera={{ position: config.camera.position, fov: config.camera.fov }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ camera }) => {
        cameraRef.current = camera;
        camera.position.set(config.camera.position[0], config.camera.position[1], config.camera.position[2]);
        camera.lookAt(config.camera.target[0], config.camera.target[1], config.camera.target[2]);
      }}
    >
      <BackgroundColor color={config.background} />
      <CameraRig cameraSpring={cameraSpring} target={target} cameraRef={cameraRef} />
      <Stars
        radius={45}
        depth={60}
        count={1800}
        factor={4}
        saturation={0}
        fade
        speed={0.35}
      />
      <AnimatedAmbientLight intensity={config.lights.ambient} color={config.lights.ambientColor} />
      {config.lights.directional.map((light, index) => (
        <AnimatedDirectionalLight key={`lesson-light-${lessonId}-${index}`} light={light} />
      ))}
      <Suspense fallback={null}>{enhancedChild}</Suspense>
      <Environment preset={config.environment} />
      <ContactShadows
        opacity={config.contactShadow.opacity}
        scale={config.contactShadow.scale}
        blur={config.contactShadow.blur}
        far={config.contactShadow.far}
        position={config.contactShadow.position}
      />
      <EffectComposer disableNormalPass>
        <Bloom
          intensity={config.bloom.intensity}
          luminanceThreshold={config.bloom.threshold}
          luminanceSmoothing={config.bloom.smoothing}
          mipmapBlur
        />
        <Vignette eskil offset={0.22} darkness={0.75} />
      </EffectComposer>
      <OrbitControls
        ref={orbitRef}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={!isModelHovered}
        autoRotateSpeed={config.camera.autoRotateSpeed}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={(Math.PI * 2) / 3}
      />
    </Canvas>
  );
};

export default LessonSceneController;
