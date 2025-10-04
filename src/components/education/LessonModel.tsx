import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import type { Group, Mesh, Material } from 'three';

type OpacityMaterial = Material & { opacity: number; transparent: boolean };

interface LessonModelProps {
  modelPath: string;
  baseScale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onHoverChange?: (hovered: boolean) => void;
}

const setMaterialOpacity = (mesh: Mesh, opacity: number) => {
  const material = mesh.material as Material | Material[] | undefined;
  if (!material) {
    return;
  }

  if (Array.isArray(material)) {
    material.forEach((mat) => {
      if (!mat) {
        return;
      }
      const opacityMaterial = mat as OpacityMaterial;
      opacityMaterial.transparent = opacity < 1;
      opacityMaterial.opacity = opacity;
    });
    return;
  }

  const singleMaterial = material as OpacityMaterial;
  singleMaterial.transparent = opacity < 1;
  singleMaterial.opacity = opacity;
};

const LessonModel = ({
  modelPath,
  baseScale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onHoverChange,
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

  const [spring, api] = useSpring(() => ({
    scale: baseScale * 0.85,
    opacity: 0,
    config: {
      scale: { mass: 1.2, tension: 180, friction: 24 },
      opacity: { mass: 1, tension: 120, friction: 30 },
    },
  }));

  useEffect(() => {
    api.start({
      from: { scale: baseScale * 0.88, opacity: 0 },
      to: { scale: baseScale, opacity: 1 },
      reset: true,
    });
  }, [api, baseScale, modelPath]);

  useEffect(() => {
    api.start({
      scale: hovered ? baseScale * 1.06 : baseScale,
    });
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
      setMaterialOpacity(mesh, spring.opacity.get());
    });
  }, [scene, spring.opacity]);

  useEffect(() => {
    const unsubscribe = spring.opacity.onChange((value) => {
      scene.traverse((child) => {
        const mesh = child as Mesh;
        setMaterialOpacity(mesh, value);
      });
    });
    return () => {
      unsubscribe();
    };
  }, [scene, spring.opacity]);

  return (
    <a.group
      ref={groupRef}
      position={position}
      scale={spring.scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        onHoverChange?.(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        onHoverChange?.(false);
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
