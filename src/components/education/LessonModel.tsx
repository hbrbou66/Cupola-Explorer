import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import type { Group, Mesh } from 'three';

interface LessonModelProps {
  modelPath: string;
  baseScale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  rotationSpeed?: number;
}

const LessonModel = ({
  modelPath,
  baseScale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  rotationSpeed = 0.002,
}: LessonModelProps) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const gltf = useGLTF(modelPath);
  const { actions, names } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    setHovered(false);
  }, [modelPath]);

  useEffect(() => {
    if (!groupRef.current) {
      return;
    }
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
  }, [rotation]);

  useEffect(() => {
    names.forEach((name) => {
      const action = actions[name];
      action?.reset().fadeIn(0.6).play();
    });

    return () => {
      names.forEach((name) => {
        const action = actions[name];
        if (!action) {
          return;
        }
        action.fadeOut(0.3);
        action.stop();
      });
    };
  }, [actions, names]);

  useFrame(() => {
    if (!groupRef.current) {
      return;
    }
    groupRef.current.rotation.y += rotationSpeed;
  });

  const [spring, api] = useSpring(() => ({
    scale: baseScale * 0.7,
    config: { tension: 120, friction: 18, mass: 1.1 },
  }));

  useEffect(() => {
    api.start({ scale: baseScale });
  }, [api, baseScale, modelPath]);

  useEffect(() => {
    api.start({ scale: hovered ? baseScale * 1.06 : baseScale });
  }, [api, baseScale, hovered]);

  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (typeof mesh.castShadow === 'boolean') {
        mesh.castShadow = true;
      }
      if (typeof mesh.receiveShadow === 'boolean') {
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <a.group
      ref={groupRef}
      position={position}
      scale={spring.scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
    >
      <primitive object={scene} dispose={null} />
    </a.group>
  );
};

export const preloadLessonModel = (path: string) => {
  useGLTF.preload(path);
};

export default LessonModel;
