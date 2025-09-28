import * as THREE from 'three';

export type ViewMode = 'map' | 'cupola';

export interface CupolaOptions {
  enableSway: boolean;
  swayAmplitude: number;
  swaySpeed: number;
  reducedMotion: boolean;
  headOffset: THREE.Vector2;
  maxHeadAngle: number;
}

export const createDefaultCupolaOptions = (): CupolaOptions => ({
  enableSway: true,
  swayAmplitude: 0.6,
  swaySpeed: 0.18,
  reducedMotion: false,
  headOffset: new THREE.Vector2(0, 0),
  maxHeadAngle: THREE.MathUtils.degToRad(30),
});

export class CupolaSwayController {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly targetQuaternion: THREE.Quaternion;
  private readonly swayQuaternion: THREE.Quaternion;
  private readonly tempQuaternion: THREE.Quaternion;
  private time = 0;
  private options: CupolaOptions;

  constructor(camera: THREE.PerspectiveCamera, options: Partial<CupolaOptions> = {}) {
    this.camera = camera;
    this.targetQuaternion = new THREE.Quaternion();
    this.swayQuaternion = new THREE.Quaternion();
    this.tempQuaternion = new THREE.Quaternion();
    this.options = { ...createDefaultCupolaOptions(), ...options };
  }

  updateOptions(options: Partial<CupolaOptions>) {
    this.options = { ...this.options, ...options };
  }

  setHeadOffset(offset: THREE.Vector2) {
    this.options.headOffset = offset.clone();
  }

  reset(time = 0) {
    this.time = time;
  }

  update(delta: number) {
    this.time += delta * this.options.swaySpeed;
    const { swayAmplitude, reducedMotion, enableSway, headOffset, maxHeadAngle } = this.options;

    this.targetQuaternion.copy(this.camera.quaternion);

    if (!reducedMotion && enableSway) {
      const swayX = Math.sin(this.time * 0.6) * swayAmplitude;
      const swayY = Math.cos(this.time * 0.4) * swayAmplitude * 0.6;
      this.tempQuaternion.setFromEuler(new THREE.Euler(swayY * 0.005, swayX * 0.005, 0, 'YXZ'));
      this.swayQuaternion.copy(this.tempQuaternion);
    } else {
      this.swayQuaternion.identity();
    }

    const offsetX = THREE.MathUtils.clamp(headOffset.x, -1, 1) * maxHeadAngle;
    const offsetY = THREE.MathUtils.clamp(headOffset.y, -1, 1) * maxHeadAngle;
    const headQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(offsetY, offsetX, 0, 'YXZ'));

    this.tempQuaternion.copy(this.swayQuaternion).multiply(headQuaternion);
    this.camera.quaternion.slerp(this.tempQuaternion.multiply(this.targetQuaternion), 0.04);
  }
}

export const setMapView = (camera: THREE.PerspectiveCamera, radius: number) => {
  camera.near = 0.1;
  camera.far = radius * 80;
  camera.updateProjectionMatrix();
};

export interface CupolaPlacementOptions {
  altitude: number;
  interiorOffset: number;
}

export const placeCupolaCamera = (
  camera: THREE.PerspectiveCamera,
  issPosition: THREE.Vector3,
  { altitude, interiorOffset }: CupolaPlacementOptions
) => {
  const direction = issPosition.clone().normalize();
  const target = direction.clone().multiplyScalar(altitude + interiorOffset);
  camera.position.lerp(target, 0.25);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
};
