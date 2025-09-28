import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const EARTH_RADIUS = 5;
const ISS_ALTITUDE_OFFSET = 0.4;
export const TRAIL_POINT_COUNT = 480;

const toCartesian = (latitude, longitude, radius = EARTH_RADIUS + ISS_ALTITUDE_OFFSET) => {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);

  const x = radius * Math.cos(lat) * Math.sin(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.cos(lon);

  return new THREE.Vector3(x, y, z);
};

const createStars = () => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const radius = 120;

  for (let i = 0; i < 1500; i += 1) {
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);

    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(theta);

    vertices.push(x, y, z);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const material = new THREE.PointsMaterial({
    color: 0x8fbffa,
    size: 0.6,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const stars = new THREE.Points(geometry, material);
  return { stars, geometry, material };
};

const updateTrailGeometry = (trail, points) => {
  const { geometry } = trail;
  const positions = new Float32Array(points.length * 3);
  points.forEach((point, index) => {
    positions[index * 3] = point.x;
    positions[index * 3 + 1] = point.y;
    positions[index * 3 + 2] = point.z;
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setDrawRange(0, points.length);
  geometry.attributes.position.needsUpdate = true;
  geometry.computeBoundingSphere();
};

const ISSGlobe = ({ position }) => {
  const mountRef = useRef(null);
  const animationRef = useRef(null);
  const markerRef = useRef(null);
  const globeRef = useRef({ earth: null, clouds: null });
  const starsRef = useRef({});
  const trailRef = useRef({ points: [], line: null, geometry: null });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      return () => {};
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(6, 4, 6);
    scene.add(directionalLight);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://threejs.org/examples/textures/earth_atmos_2048.jpg');
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: new THREE.Color('#1f2937'),
      shininess: 5,
    });
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 96, 96);
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    const cloudTexture = textureLoader.load('https://threejs.org/examples/textures/earth_clouds_1024.png');
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.08, 96, 96);
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    globeRef.current = { earth: earthMesh, clouds: cloudMesh, earthGeometry, earthMaterial, cloudGeometry, cloudMaterial };

    const { stars, geometry: starGeometry, material: starMaterial } = createStars();
    scene.add(stars);
    starsRef.current = { stars, starGeometry, starMaterial };

    const issMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xff4d6d, toneMapped: false })
    );
    scene.add(issMarker);
    markerRef.current = issMarker;

    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.9 });
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trailLine);
    trailRef.current = { points: [], line: trailLine, geometry: trailGeometry, material: trailMaterial };

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      if (globeRef.current.earth) {
        globeRef.current.earth.rotation.y += 0.0006;
      }
      if (globeRef.current.clouds) {
        globeRef.current.clouds.rotation.y += 0.0009;
      }
      if (starsRef.current.stars) {
        starsRef.current.stars.rotation.y += 0.0001;
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    const observer = new ResizeObserver(() => handleResize());
    observer.observe(container);

    return () => {
      cancelAnimationFrame(animationRef.current);
      observer.disconnect();
      renderer.dispose();
      container.removeChild(renderer.domElement);

      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();

      if (markerRef.current) {
        markerRef.current.geometry.dispose();
        markerRef.current.material.dispose();
      }

      if (trailRef.current.geometry) {
        trailRef.current.geometry.dispose();
      }
      if (trailRef.current.material) {
        trailRef.current.material.dispose();
      }

      if (starsRef.current.starGeometry) {
        starsRef.current.starGeometry.dispose();
      }
      if (starsRef.current.starMaterial) {
        starsRef.current.starMaterial.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!position || !markerRef.current || !trailRef.current.geometry) {
      return;
    }

    const vector = toCartesian(position.latitude, position.longitude);
    markerRef.current.position.copy(vector);

    const trail = trailRef.current;
    trail.points.push(vector.clone());
    if (trail.points.length > TRAIL_POINT_COUNT) {
      trail.points.shift();
    }

    updateTrailGeometry(trail, trail.points);
  }, [position]);

  return <div ref={mountRef} className="h-[480px] min-h-[320px] w-full rounded-2xl bg-slate-950/40" />;
};

export default ISSGlobe;
