// NOAA Space Weather Prediction Center API utilities

export interface XRayFlare {
  time_tag: string;
  satellite: number;
  current_class: string;
  current_ratio: number;
  current_int_xrlong: number;
  begin_time: string;
  begin_class: string;
  max_time: string;
  max_class: string;
  max_xrlong: number;
  end_time: string;
  end_class: string;
}

export interface XRayData {
  time_tag: string;
  satellite: number;
  flux: number;
  observed_flux: number;
  electron_correction: number;
  electron_contaminaton: boolean;
  energy: string;
}

export interface GeomagData {
  time_tag: string;
  Kp: number;
  Kp_fraction: number;
  a_running: number;
  station_count: number;
}

export interface SolarWindData {
  time_tag: string;
  speed: number;
  density: number;
  temperature: number;
  bz: number;
  bt: number;
}

export interface FlareAlert {
  serial_number: number;
  product_id: string;
  issue_datetime: string;
  message: string;
}

const NOAA_BASE = 'https://services.swpc.noaa.gov';

export async function fetchXRayFlux(): Promise<XRayData[]> {
  const res = await fetch(`${NOAA_BASE}/json/goes/primary/xrays-7-day.json`);
  if (!res.ok) throw new Error('Failed to fetch X-Ray data');
  return res.json();
}

export async function fetchXRayFlares(): Promise<XRayFlare[]> {
  const res = await fetch(`${NOAA_BASE}/json/goes/primary/xray-flares-7-day.json`);
  if (!res.ok) throw new Error('Failed to fetch flare data');
  return res.json();
}

export async function fetchGeomagData(): Promise<GeomagData[]> {
  const res = await fetch(`${NOAA_BASE}/products/noaa-planetary-k-index.json`);
  if (!res.ok) throw new Error('Failed to fetch geomag data');
  const raw = await res.json();
  // Skip header row
  return raw.slice(1).map((row: string[]) => ({
    time_tag: row[0],
    Kp: parseFloat(row[1]),
    Kp_fraction: parseFloat(row[2]),
    a_running: parseFloat(row[3]),
    station_count: parseInt(row[4]),
  }));
}

export async function fetchSolarWind(): Promise<SolarWindData[]> {
  const res = await fetch(`${NOAA_BASE}/products/solar-wind/plasma-7-day.json`);
  if (!res.ok) throw new Error('Failed to fetch solar wind data');
  const raw = await res.json();
  return raw.slice(1).map((row: string[]) => ({
    time_tag: row[0],
    density: parseFloat(row[1]),
    speed: parseFloat(row[2]),
    temperature: parseFloat(row[3]),
  }));
}

export async function fetchSolarWindMag(): Promise<SolarWindData[]> {
  const res = await fetch(`${NOAA_BASE}/products/solar-wind/mag-7-day.json`);
  if (!res.ok) throw new Error('Failed to fetch solar wind mag data');
  const raw = await res.json();
  return raw.slice(1).map((row: string[]) => ({
    time_tag: row[0],
    bz: parseFloat(row[1]),
    bt: parseFloat(row[3]),
  }));
}

// SDO Solar Images
export const SDO_IMAGES = {
  aia171: { url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg', label: 'AIA 171Å (Corona)', description: 'Extreme ultraviolet showing the quiet corona and coronal loops' },
  aia193: { url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg', label: 'AIA 193Å (Corona/Flares)', description: 'Shows the corona and hot flare plasma' },
  aia304: { url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg', label: 'AIA 304Å (Chromosphere)', description: 'Shows the chromosphere and transition region' },
  aia131: { url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0131.jpg', label: 'AIA 131Å (Flare Detection)', description: 'Designed to study solar flares - shows very hot material in flares' },
  hmiMag: { url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIBC.jpg', label: 'HMI Magnetogram', description: 'Magnetic field map of the solar surface' },
  hmiInt: { url: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg', label: 'HMI Intensitygram', description: 'Visible light image showing sunspots' },
};

// Flare classification info
export const FLARE_CLASSES = {
  A: { color: 'hsl(150, 60%, 45%)', label: 'A-class', intensity: '< 10⁻⁷ W/m²', description: 'Background level, no significant effect', risk: 'None' },
  B: { color: 'hsl(150, 60%, 45%)', label: 'B-class', intensity: '10⁻⁷ to 10⁻⁶ W/m²', description: 'Minor flare with negligible effects', risk: 'Minimal' },
  C: { color: 'hsl(45, 100%, 55%)', label: 'C-class', intensity: '10⁻⁶ to 10⁻⁵ W/m²', description: 'Small flare with few noticeable consequences', risk: 'Low' },
  M: { color: 'hsl(32, 95%, 55%)', label: 'M-class', intensity: '10⁻⁵ to 10⁻⁴ W/m²', description: 'Medium flare causing brief radio blackouts at poles', risk: 'Moderate' },
  X: { color: 'hsl(0, 80%, 55%)', label: 'X-class', intensity: '> 10⁻⁴ W/m²', description: 'Major flare causing planet-wide radio blackouts and radiation storms', risk: 'Severe' },
};

export function getFlareClass(classStr: string): string {
  if (!classStr) return 'A';
  return classStr.charAt(0).toUpperCase();
}

export function getFlareColor(classStr: string): string {
  const cls = getFlareClass(classStr);
  return FLARE_CLASSES[cls as keyof typeof FLARE_CLASSES]?.color || FLARE_CLASSES.A.color;
}
