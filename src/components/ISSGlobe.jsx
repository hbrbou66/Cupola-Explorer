import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CupolaSwayController, placeCupolaCamera, setMapView } from '../modules/cameraModes.ts';
import { createEarthMaterial, toggleCityLights, toggleTerminator, updateSunUniform } from '../modules/lighting.ts';
import {
  createAuroraMaterial,
  createAuroraTexture,
  createCloudMaterial,
  loadCloudTexture,
  loadEarthTextures,
  setOverlayVisibility,
} from '../modules/overlays.ts';
import { EARTH_RADIUS_SCENE } from '../utils/iss.ts';

const EARTH_SEGMENTS = 128;
const PARTICLE_COUNT = 280;
const PARTICLE_RADIUS = 14;

const createStars = () => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const radius = 200;
  for (let i = 0; i < 1800; i += 1) {
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);
    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(theta);
    vertices.push(x, y, z);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({
    color: 0x99c8ff,
    size: 0.9,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
};

const createWeightlessField = (count) => {
  const geometry = new THREE.PlaneGeometry(0.18, 0.18);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#7dd3fc'),
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const dummy = new THREE.Object3D();
  const positions = Array.from({ length: count }, () => new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(PARTICLE_RADIUS),
    THREE.MathUtils.randFloatSpread(PARTICLE_RADIUS),
    THREE.MathUtils.randFloatSpread(PARTICLE_RADIUS)
  ));
  const velocities = Array.from({ length: count }, () => new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(0.02),
    THREE.MathUtils.randFloatSpread(0.02),
    THREE.MathUtils.randFloatSpread(0.02)
  ));

  positions.forEach((position, index) => {
    dummy.position.copy(position);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return { mesh, geometry, material, positions, velocities, dummy };
};

const updateLineGeometry = (geometry, points) => {
  const positionArray = new Float32Array(points.length * 3);
  points.forEach((point, index) => {
    positionArray[index * 3] = point.x;
    positionArray[index * 3 + 1] = point.y;
    positionArray[index * 3 + 2] = point.z;
  });
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
  geometry.setDrawRange(0, points.length);
  geometry.attributes.position.needsUpdate = true;
  geometry.computeBoundingSphere();
};

const ISSGlobe = ({
  viewMode,
  onViewInteraction,
  issPosition,
  trailPoints,
  futurePoints,
  showTerminator,
  showCityLights,
  showClouds,
  showAurora,
  weightlessnessEnabled,
  weightlessnessIntensity,
  reducedMotion,
  currentTime,
  playbackSpeed,
  mode,
  interactionPaused,
}) => {
  const mountRef = useRef(null);
  const stateRef = useRef(null);
  const interactionCallbackRef = useRef(onViewInteraction);
  const viewModeRef = useRef(viewMode);
  const issVectorRef = useRef(new THREE.Vector3());
  const motionRef = useRef({
    enabled: weightlessnessEnabled,
    intensity: weightlessnessIntensity,
    reducedMotion,
    interactionPaused,
  });

  useEffect(() => {
    interactionCallbackRef.current = onViewInteraction;
  }, [onViewInteraction]);

  useEffect(() => {
    viewModeRef.current = viewMode;
    const state = stateRef.current;
    if (!state) return;
    if (state.controls) {
      state.controls.enabled = viewMode === 'map';
    }
    if (viewMode === 'map') {
      setMapView(state.camera, EARTH_RADIUS_SCENE);
    }
  }, [viewMode]);

  useEffect(() => {
    motionRef.current = {
      enabled: weightlessnessEnabled,
      intensity: weightlessnessIntensity,
      reducedMotion,
      interactionPaused,
    };
  }, [interactionPaused, reducedMotion, weightlessnessEnabled, weightlessnessIntensity]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return () => {};

    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);
    scene.add(camera);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const rimLight = new THREE.DirectionalLight(0x87cefa, 0.7);
    rimLight.position.set(-8, 6, 12);
    scene.add(rimLight);

    const loader = new THREE.TextureLoader();
    const textures = loadEarthTextures(loader);
    const earthMaterial = createEarthMaterial(textures);
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS_SCENE, EARTH_SEGMENTS, EARTH_SEGMENTS);
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    const cloudTexture = loadCloudTexture(loader);
    const cloudMaterial = createCloudMaterial(cloudTexture);
    const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS_SCENE + 0.08, EARTH_SEGMENTS, EARTH_SEGMENTS);
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    const auroraTexture = createAuroraTexture();
    const auroraMaterial = createAuroraMaterial(auroraTexture, 0.7);
    const auroraGeometry = new THREE.SphereGeometry(EARTH_RADIUS_SCENE + 0.15, EARTH_SEGMENTS, EARTH_SEGMENTS);
    const auroraMesh = new THREE.Mesh(auroraGeometry, auroraMaterial);
    auroraMesh.visible = false;
    scene.add(auroraMesh);

    const starField = createStars();
    scene.add(starField);

    const issMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xff6b9a, toneMapped: false })
    );
    scene.add(issMarker);

    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.85 });
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trailLine);

    const futureGeometry = new THREE.BufferGeometry();
    const futureMaterial = new THREE.LineDashedMaterial({
      color: 0x7dd3fc,
      dashSize: 0.4,
      gapSize: 0.2,
      transparent: true,
      opacity: 0.6,
    });
    const futureLine = new THREE.Line(futureGeometry, futureMaterial);
    futureLine.computeLineDistances();
    scene.add(futureLine);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = 26;
    controls.rotateSpeed = 0.35;
    controls.addEventListener('start', () => interactionCallbackRef.current?.(true));
    controls.addEventListener('end', () => interactionCallbackRef.current?.(false));

    const particles = createWeightlessField(PARTICLE_COUNT);
    camera.add(particles.mesh);

    const swayController = new CupolaSwayController(camera, { reducedMotion });

    const clock = new THREE.Clock();
    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    let cleanupResize;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const resizeObserver = new window.ResizeObserver(handleResize);
      resizeObserver.observe(container);
      cleanupResize = () => resizeObserver.disconnect();
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      cleanupResize = () => window.removeEventListener('resize', handleResize);
    }

    handleResize();

    const pointerVector = new THREE.Vector2();
    const headOffset = new THREE.Vector2();
    const handlePointerMove = (event) => {
      if (viewModeRef.current !== 'cupola') return;
      const rect = container.getBoundingClientRect();
      pointerVector.set((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
      headOffset.set(pointerVector.x * 2 - 1, (1 - pointerVector.y) * 2 - 1);
      swayController.setHeadOffset(headOffset);
    };

    const handlePointerLeave = () => {
      headOffset.set(0, 0);
      swayController.setHeadOffset(headOffset);
    };

    const handlePointerDown = () => interactionCallbackRef.current?.(true);
    const handlePointerUp = () => interactionCallbackRef.current?.(false);

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const state = {
      renderer,
      scene,
      camera,
      controls,
      earth: { mesh: earthMesh, material: earthMaterial, geometry: earthGeometry },
      clouds: { mesh: cloudMesh, material: cloudMaterial, geometry: cloudGeometry },
      aurora: { mesh: auroraMesh, material: auroraMaterial },
      issMarker,
      trail: { geometry: trailGeometry, line: trailLine },
      future: { geometry: futureGeometry, line: futureLine },
      particles,
      swayController,
      clock,
      animationFrame: null,
      fastOverlaySuspended: false,
    };
    stateRef.current = state;

    const animate = () => {
      state.animationFrame = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (controls.enabled) {
        controls.update();
      }

      if (viewModeRef.current === 'cupola' && issVectorRef.current) {
        placeCupolaCamera(camera, issVectorRef.current, {
          altitude: issVectorRef.current.length(),
          interiorOffset: 0.18,
        });
        swayController.update(delta);
      }

      const { positions, velocities, mesh: particleMesh } = particles;
      const { enabled, intensity: storedIntensity, reducedMotion: reduceMotion, interactionPaused: paused } =
        motionRef.current;
      const intensity = enabled && !reduceMotion && !paused ? storedIntensity : 0;
      const damping = 0.985;
      if (intensity > 0) {
        let needsUpdate = false;
        for (let i = 0; i < positions.length; i += 1) {
          const position = positions[i];
          const velocity = velocities[i];
          velocity.x += THREE.MathUtils.randFloatSpread(0.0004) * (0.5 + intensity);
          velocity.y += THREE.MathUtils.randFloatSpread(0.0004) * (0.5 + intensity);
          velocity.z += THREE.MathUtils.randFloatSpread(0.0004) * (0.5 + intensity);
          velocity.multiplyScalar(damping);
          position.addScaledVector(velocity, 1 + intensity * 0.6);
          if (position.length() > PARTICLE_RADIUS) {
            position.set(
              THREE.MathUtils.randFloatSpread(PARTICLE_RADIUS * 0.8),
              THREE.MathUtils.randFloatSpread(PARTICLE_RADIUS * 0.8),
              THREE.MathUtils.randFloatSpread(PARTICLE_RADIUS * 0.8)
            );
          }
          particles.dummy.position.copy(position);
          particles.dummy.rotation.set(velocity.y * 6, velocity.x * 6, velocity.z * 6);
          particles.dummy.updateMatrix();
          particleMesh.setMatrixAt(i, particles.dummy.matrix);
          needsUpdate = true;
        }
        if (needsUpdate) {
          particleMesh.instanceMatrix.needsUpdate = true;
        }
        particleMesh.visible = true;
      } else {
        if (particleMesh.visible) {
          particleMesh.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(state.animationFrame);
      cleanupResize?.();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      camera.remove(particles.mesh);
      particles.geometry.dispose();
      particles.material.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      auroraGeometry.dispose();
      auroraMaterial.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
      futureGeometry.dispose();
      futureMaterial.dispose();
      issMarker.geometry.dispose();
      issMarker.material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      stateRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = stateRef.current;
    if (!state || !issPosition) return;
    issVectorRef.current.copy(issPosition.vector);
    state.issMarker.position.copy(issPosition.vector);
  }, [issPosition]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    if (trailPoints?.length) {
      updateLineGeometry(state.trail.geometry, trailPoints);
    }
  }, [trailPoints]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    if (futurePoints && futurePoints.length > 1) {
      updateLineGeometry(state.future.geometry, futurePoints);
      state.future.line.computeLineDistances();
      state.future.line.visible = true;
    } else if (state.future) {
      state.future.line.visible = false;
    }
  }, [futurePoints]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    toggleTerminator(state.earth.material, showTerminator);
  }, [showTerminator]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    toggleCityLights(state.earth.material, showCityLights);
  }, [showCityLights]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    setOverlayVisibility(state.clouds.mesh, showClouds);
  }, [showClouds]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    setOverlayVisibility(state.aurora.mesh, showAurora && !reducedMotion);
  }, [reducedMotion, showAurora]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    updateSunUniform(state.earth.material, currentTime);
  }, [currentTime]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    state.swayController.updateOptions({
      reducedMotion,
      enableSway: !reducedMotion && weightlessnessIntensity > 0.05,
      swayAmplitude: 0.45 + weightlessnessIntensity * 0.9,
    });
  }, [reducedMotion, weightlessnessIntensity]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    const fastPlayback = mode === 'simulated' && playbackSpeed >= 600;
    const shouldHide = fastPlayback;
    setOverlayVisibility(state.clouds.mesh, showClouds && !shouldHide);
    setOverlayVisibility(state.aurora.mesh, showAurora && !reducedMotion && !shouldHide);
  }, [mode, playbackSpeed, reducedMotion, showAurora, showClouds]);

  return <div ref={mountRef} className="h-[520px] min-h-[320px] w-full rounded-2xl bg-slate-950/40" aria-label="Earth visualisation" role="presentation" />;
};

export default ISSGlobe;
