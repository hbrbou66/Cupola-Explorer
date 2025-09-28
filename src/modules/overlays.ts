import * as THREE from 'three';

const CLOUD_TEXTURE_URL = 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png';
const EARTH_DAY_URL = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
const EARTH_NIGHT_URL = 'https://threejs.org/examples/textures/planets/earth_at_night_2048.jpg';
const CITY_LIGHTS_URL = 'https://threejs.org/examples/textures/planets/earth_lights_2048.png';

export const loadEarthTextures = (loader: THREE.TextureLoader) => {
  const dayTexture = loader.load(EARTH_DAY_URL);
  const nightTexture = loader.load(EARTH_NIGHT_URL);
  const cityTexture = loader.load(CITY_LIGHTS_URL);
  return { dayTexture, nightTexture, cityTexture };
};

export const loadCloudTexture = (loader: THREE.TextureLoader) => loader.load(CLOUD_TEXTURE_URL);

export const createCloudMaterial = (texture: THREE.Texture, opacity = 0.35) => {
  texture.anisotropy = 4;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshPhongMaterial({
    map: texture,
    transparent: true,
    opacity,
    depthWrite: false,
  });
};

export const createAuroraTexture = (width = 512, height = 256) => {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const v = y / (height - 1);
    const latitude = (1 - v) * Math.PI - Math.PI / 2;
    const polarDistance = Math.abs(latitude) - THREE.MathUtils.degToRad(67);
    const band = Math.max(0, 1 - Math.abs(polarDistance) * 4);
    const falloff = Math.exp(-Math.pow(Math.abs(polarDistance) * 4, 1.4));
    const intensity = THREE.MathUtils.clamp(band * falloff * 1.4, 0, 1);

    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const flicker = 0.85 + 0.15 * Math.sin((x / width) * Math.PI * 6 + y * 0.1);
      const value = intensity * flicker;
      data[idx] = 60;
      data[idx + 1] = Math.round(200 * value);
      data[idx + 2] = Math.round(120 * value);
      data[idx + 3] = Math.round(255 * value * 0.85);
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

export const createAuroraMaterial = (texture: THREE.Texture, opacity = 0.75) =>
  new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

export interface OverlayHandles {
  clouds: THREE.Mesh | null;
  aurora: THREE.Mesh | null;
}

export const setOverlayVisibility = (object: THREE.Object3D | null, visible: boolean) => {
  if (!object) return;
  object.visible = visible;
};
