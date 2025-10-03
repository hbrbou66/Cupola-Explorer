import * as THREE from 'three';

const ISS_TLE_URL = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE';

export const FALLBACK_TLE: TleSet = {
  line1: '1 25544U 98067A   24103.43211991  .00018476  00000+0  32968-3 0  9993',
  line2: '2 25544  51.6405  60.2146 0004116 162.5696 274.5025 15.50060690552077',
};

export interface TleSet {
  line1: string;
  line2: string;
}

export interface IssGeodeticPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  speedKmh: number;
}

export const FALLBACK_SPEED_KMH = 27600;

export const EARTH_RADIUS_KM = 6371;
export const EARTH_RADIUS_SCENE = 5;
export const ISS_ALTITUDE_SCENE_OFFSET = 0.4;

const RAD_PER_REV = 2 * Math.PI;
const SECONDS_PER_DAY = 86400;
const MU = 398600.4418; // km^3 / s^2
const EARTH_RADIUS_EQUATOR = 6378.137;
const EARTH_RADIUS_POLAR = 6356.752314245;
const EARTH_FLATTENING = 1 - EARTH_RADIUS_POLAR / EARTH_RADIUS_EQUATOR;

const scaleToScene = (altitudeKm: number) => {
  const scale = EARTH_RADIUS_SCENE / EARTH_RADIUS_KM;
  return EARTH_RADIUS_SCENE + altitudeKm * scale;
};

const toSceneVector = (latitude: number, longitude: number, radius: number) => {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  const x = radius * Math.cos(lat) * Math.sin(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.cos(lon);
  return new THREE.Vector3(x, y, z);
};

const toJulianDate = (date: Date) => date.getTime() / 86400000 + 2440587.5;

const getGmst = (date: Date) => {
  const jd = toJulianDate(date);
  const t = (jd - 2451545.0) / 36525.0;
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000.0;
  const normalized = ((gmst % 360) + 360) % 360;
  return THREE.MathUtils.degToRad(normalized);
};

const parseEpoch = (line1: string) => {
  const yearPart = parseInt(line1.slice(18, 20), 10);
  const dayPart = parseFloat(line1.slice(20, 32));
  const year = yearPart < 57 ? yearPart + 2000 : yearPart + 1900;
  const dayOfYear = Math.floor(dayPart);
  const fractionalDay = dayPart - dayOfYear;

  const date = new Date(Date.UTC(year, 0));
  date.setUTCDate(dayOfYear);
  date.setUTCHours(0, 0, 0, 0);
  const seconds = fractionalDay * SECONDS_PER_DAY;
  date.setUTCSeconds(seconds);
  return date;
};

export interface SimpleSatRec {
  inclination: number;
  raan: number;
  eccentricity: number;
  argPerigee: number;
  meanAnomaly: number;
  meanMotion: number;
  meanMotionRad: number;
  semiMajorAxis: number;
  epoch: Date;
}

const parseLine = (value: string) => parseFloat(value.trim());

export const createSatrec = (tle: TleSet): SimpleSatRec => {
  const inclination = THREE.MathUtils.degToRad(parseLine(tle.line2.slice(8, 16)));
  const raan = THREE.MathUtils.degToRad(parseLine(tle.line2.slice(17, 25)));
  const eccentricity = parseFloat(`0.${tle.line2.slice(26, 33).trim()}`);
  const argPerigee = THREE.MathUtils.degToRad(parseLine(tle.line2.slice(34, 42)));
  const meanAnomaly = THREE.MathUtils.degToRad(parseLine(tle.line2.slice(43, 51)));
  const meanMotion = parseLine(tle.line2.slice(52, 63));
  const meanMotionRad = (meanMotion * RAD_PER_REV) / SECONDS_PER_DAY;
  const semiMajorAxis = Math.pow(MU / (meanMotionRad * meanMotionRad), 1 / 3);
  const epoch = parseEpoch(tle.line1);

  return {
    inclination,
    raan,
    eccentricity,
    argPerigee,
    meanAnomaly,
    meanMotion,
    meanMotionRad,
    semiMajorAxis,
    epoch,
  };
};

const normalizeAngle = (angle: number) => {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
};

const solveKepler = (meanAnomaly: number, eccentricity: number) => {
  let E = meanAnomaly;
  for (let i = 0; i < 12; i += 1) {
    const delta = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-8) break;
  }
  return E;
};

const eciToGeodetic = (positionEci: THREE.Vector3, gmst: number) => {
  const cosGmst = Math.cos(gmst);
  const sinGmst = Math.sin(gmst);

  const x = positionEci.x * cosGmst + positionEci.y * sinGmst;
  const y = -positionEci.x * sinGmst + positionEci.y * cosGmst;
  const z = positionEci.z;

  const longitude = Math.atan2(y, x);
  const r = Math.sqrt(x * x + y * y);

  let latitude = Math.atan2(z, r);
  let prevLatitude = 0;
  const e2 = EARTH_FLATTENING * (2 - EARTH_FLATTENING);
  let iteration = 0;
  while (Math.abs(latitude - prevLatitude) > 1e-10 && iteration < 10) {
    prevLatitude = latitude;
    const sinLat = Math.sin(latitude);
    const N = EARTH_RADIUS_EQUATOR / Math.sqrt(1 - e2 * sinLat * sinLat);
    latitude = Math.atan2(z + e2 * N * sinLat, r);
    iteration += 1;
  }

  const sinLat = Math.sin(latitude);
  const N = EARTH_RADIUS_EQUATOR / Math.sqrt(1 - e2 * sinLat * sinLat);
  const altitude = r / Math.cos(latitude) - N;

  return {
    longitude,
    latitude,
    altitude,
  };
};

export const fetchLatestTle = async (): Promise<TleSet> => {
  const response = await fetch(ISS_TLE_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ISS TLE: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const [line1 = '', line2 = ''] = lines.slice(-2);
  if (!line1 || !line2) {
    throw new Error('Unable to retrieve ISS TLE');
  }
  if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) {
    throw new Error('Received malformed ISS TLE');
  }
  return { line1, line2 };
};

export const getIssPositionAt = (satrec: SimpleSatRec, timestamp: number): IssGeodeticPosition | null => {
  const targetDate = new Date(timestamp);
  const deltaSeconds = (targetDate.getTime() - satrec.epoch.getTime()) / 1000;

  const meanAnomaly = normalizeAngle(satrec.meanAnomaly + satrec.meanMotionRad * deltaSeconds);
  const eccentricity = satrec.eccentricity;
  const eccentricAnomaly = solveKepler(meanAnomaly, eccentricity);
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
  );

  const radius = satrec.semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
  const safeRadius = radius > 0 ? radius : satrec.semiMajorAxis;
  const visVivaTerm = MU * (2 / safeRadius - 1 / satrec.semiMajorAxis);
  const speedKms = visVivaTerm > 0 ? Math.sqrt(visVivaTerm) : 0;
  const speedKmh = Number.isFinite(speedKms) && speedKms > 0 ? speedKms * 3600 : FALLBACK_SPEED_KMH;
  const argumentOfLatitude = normalizeAngle(satrec.argPerigee + trueAnomaly);

  const cosU = Math.cos(argumentOfLatitude);
  const sinU = Math.sin(argumentOfLatitude);
  const cosRAAN = Math.cos(satrec.raan);
  const sinRAAN = Math.sin(satrec.raan);
  const cosI = Math.cos(satrec.inclination);
  const sinI = Math.sin(satrec.inclination);

  const xEci = radius * (cosRAAN * cosU - sinRAAN * sinU * cosI);
  const yEci = radius * (sinRAAN * cosU + cosRAAN * sinU * cosI);
  const zEci = radius * (sinU * sinI);

  const gmst = getGmst(targetDate);
  const geodetic = eciToGeodetic(new THREE.Vector3(xEci, yEci, zEci), gmst);

  return {
    latitude: THREE.MathUtils.radToDeg(geodetic.latitude),
    longitude: THREE.MathUtils.radToDeg(geodetic.longitude),
    altitude: geodetic.altitude,
    speedKmh,
  };
};

export const getScenePositionAt = (satrec: SimpleSatRec, timestamp: number) => {
  const geo = getIssPositionAt(satrec, timestamp);
  if (!geo) return null;
  const radius = scaleToScene(geo.altitude);
  const vector = toSceneVector(geo.latitude, geo.longitude, radius);
  return { ...geo, vector };
};

export const getIssSpeed = (satrec: SimpleSatRec | null, timestamp: number) => {
  if (!satrec) {
    return FALLBACK_SPEED_KMH;
  }
  const state = getIssPositionAt(satrec, timestamp);
  if (!state) {
    return FALLBACK_SPEED_KMH;
  }
  return state.speedKmh;
};

export const buildGroundTrack = (
  satrec: SimpleSatRec,
  centerTime: number,
  points = 480,
  stepSeconds = 10
) => {
  const output: THREE.Vector3[] = [];
  for (let i = points - 1; i >= 0; i -= 1) {
    const timestamp = centerTime - i * stepSeconds * 1000;
    const scenePosition = getScenePositionAt(satrec, timestamp);
    if (scenePosition) {
      output.push(scenePosition.vector);
    }
  }
  return output;
};

export const buildFutureTrack = (
  satrec: SimpleSatRec,
  centerTime: number,
  durationMinutes = 30,
  stepSeconds = 30
) => {
  const output: THREE.Vector3[] = [];
  const steps = Math.floor((durationMinutes * 60) / stepSeconds);
  for (let i = 1; i <= steps; i += 1) {
    const timestamp = centerTime + i * stepSeconds * 1000;
    const scenePosition = getScenePositionAt(satrec, timestamp);
    if (scenePosition) {
      output.push(scenePosition.vector);
    }
  }
  return output;
};
