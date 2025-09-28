import * as THREE from 'three';

type DateLike = number | Date;

export const EARTH_TILT = THREE.MathUtils.degToRad(23.4397);

const toJulianDate = (date: Date) => {
  return date.getTime() / 86400000 + 2440587.5;
};

const getGMST = (date: Date) => {
  const jd = toJulianDate(date);
  const t = (jd - 2451545.0) / 36525.0;
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000.0;
  return THREE.MathUtils.degToRad(((gmst % 360) + 360) % 360);
};

export const computeSunDirectionEci = (date: DateLike) => {
  const d = typeof date === 'number' ? new Date(date) : date;
  const jd = toJulianDate(d);
  const n = jd - 2451545.0;
  const L = THREE.MathUtils.degToRad((280.46 + 0.9856474 * n) % 360);
  const g = THREE.MathUtils.degToRad((357.528 + 0.9856003 * n) % 360);
  const lambda = L + THREE.MathUtils.degToRad(1.915) * Math.sin(g) + THREE.MathUtils.degToRad(0.02) * Math.sin(2 * g);
  const epsilon = EARTH_TILT;

  const x = Math.cos(lambda);
  const y = Math.cos(epsilon) * Math.sin(lambda);
  const z = Math.sin(epsilon) * Math.sin(lambda);

  return new THREE.Vector3(x, y, z).normalize();
};

export const computeSunDirectionEcef = (date: DateLike) => {
  const d = typeof date === 'number' ? new Date(date) : date;
  const gmst = getGMST(d);
  const eci = computeSunDirectionEci(d);
  const cos = Math.cos(gmst);
  const sin = Math.sin(gmst);
  const x = eci.x * cos + eci.y * sin;
  const y = -eci.x * sin + eci.y * cos;
  const z = eci.z;
  return new THREE.Vector3(x, y, z).normalize();
};

export interface EarthMaterialUniforms {
  dayTexture: THREE.Texture;
  nightTexture: THREE.Texture;
  cityTexture: THREE.Texture;
}

export const createEarthMaterial = ({ dayTexture, nightTexture, cityTexture }: EarthMaterialUniforms) => {
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  cityTexture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      cityTexture: { value: cityTexture },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      showTerminator: { value: 1 },
      showCityLights: { value: 1 },
      nightBoost: { value: 1.15 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform sampler2D cityTexture;
      uniform vec3 sunDirection;
      uniform float showTerminator;
      uniform float showCityLights;
      uniform float nightBoost;

      varying vec2 vUv;
      varying vec3 vWorldNormal;

      void main() {
        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = texture2D(nightTexture, vUv).rgb;
        vec3 cityColor = texture2D(cityTexture, vUv).rgb;
        float diffuse = max(dot(normalize(vWorldNormal), normalize(sunDirection)), 0.0);
        float dusk = smoothstep(-0.15, 0.1, diffuse);

        vec3 color = dayColor;
        if (showTerminator < 0.5) {
          color = dayColor;
        } else {
          color = mix(nightColor * nightBoost, dayColor, dusk);
          if (showCityLights > 0.5) {
            float lightsFactor = smoothstep(0.0, 0.3, 1.0 - diffuse);
            color += cityColor * lightsFactor * 1.1;
          }
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
};

export const updateSunUniform = (material: THREE.ShaderMaterial, date: DateLike) => {
  const sunDirection = computeSunDirectionEcef(date);
  material.uniforms.sunDirection.value.copy(sunDirection);
};

export const toggleTerminator = (material: THREE.ShaderMaterial, enabled: boolean) => {
  material.uniforms.showTerminator.value = enabled ? 1 : 0;
};

export const toggleCityLights = (material: THREE.ShaderMaterial, enabled: boolean) => {
  material.uniforms.showCityLights.value = enabled ? 1 : 0;
};
