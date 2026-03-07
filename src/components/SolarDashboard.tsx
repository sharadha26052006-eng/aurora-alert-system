import { useState, useEffect, useCallback } from 'react';
import { Activity, Satellite, Radio, Sun, AlertTriangle, RefreshCw, Zap, Shield } from 'lucide-react';
import { fetchXRayFlux, fetchXRayFlares, fetchSolarWind, fetchSolarWindMag, type XRayData, type XRayFlare, type SolarWindData, FLARE_CLASSES, getFlareClass } from '@/lib/noaa-api';
import { parseCSV, getFlareStats, type SolarFlareRecord } from '@/lib/solar-data';
import { XRayChart } from '@/components/solar/XRayChart';
import { SolarImagery } from '@/components/solar/SolarImagery';
import { FlareClassInfo } from '@/components/solar/FlareClassInfo';
import { RecentFlares } from '@/components/solar/RecentFlares';
import { PredictionPanel } from '@/components/solar/PredictionPanel';
import { HistoricalAnalysis } from '@/components/solar/HistoricalAnalysis';
import { SolarWindPanel } from '@/components/solar/SolarWindPanel';
import { StatusHeader } from '@/components/solar/StatusHeader';

const SolarDashboard = () => {
  const [xrayData, setXrayData] = useState<XRayData[]>([]);
  const [flares, setFlares] = useState<XRayFlare[]>([]);
  const [solarWind, setSolarWind] = useState<SolarWindData[]>([]);
  const [csvData, setCsvData] = useState<SolarFlareRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [xray, flareData, wind, csv] = await Promise.all([
        fetchXRayFlux().catch(() => []),
        fetchXRayFlares().catch(() => []),
        fetchSolarWind().catch(() => []),
        parseCSV().catch(() => []),
      ]);
      setXrayData(xray);
      setFlares(flareData);
      setSolarWind(wind);
      setCsvData(csv);
      setLastUpdate(new Date());
    } catch (e) {
      setError('Failed to fetch some data. Retrying...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchAll]);

  const currentFlux = xrayData.length > 0 ? xrayData[xrayData.length - 1] : null;
  const stats = csvData.length > 0 ? getFlareStats(csvData) : null;

  // Determine current alert level
  const getCurrentAlertLevel = () => {
    if (!currentFlux) return { level: 'Unknown', color: 'muted-foreground', glow: '' };
    const flux = currentFlux.flux;
    if (flux >= 1e-4) return { level: 'EXTREME', color: 'solar-danger', glow: 'glow-danger' };
    if (flux >= 1e-5) return { level: 'HIGH', color: 'primary', glow: 'glow-warning' };
    if (flux >= 1e-6) return { level: 'MODERATE', color: 'solar-warning', glow: 'glow-primary' };
    return { level: 'LOW', color: 'solar-safe', glow: 'glow-safe' };
  };

  const alert = getCurrentAlertLevel();

  return (
    <div className="min-h-screen solar-grid-bg">
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-solar flex items-center justify-center">
              <Sun className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold tracking-wider gradient-solar-text">SOLAR SENTINEL</h1>
              <p className="text-xs text-muted-foreground">Solar Flare Prediction & Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mono">
              <div className="w-2 h-2 rounded-full bg-solar-safe animate-pulse" />
              LIVE DATA
            </div>
            <div className="hidden md:block text-xs text-muted-foreground mono">
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        {error && (
          <div className="glass-card rounded-lg p-3 border-solar-warning/30 flex items-center gap-2 text-sm text-solar-warning">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Status Cards Row */}
        <StatusHeader currentFlux={currentFlux} alert={alert} flares={flares} />

        {/* Prediction + X-Ray Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PredictionPanel currentFlux={currentFlux} flares={flares} solarWind={solarWind} />
          <div className="lg:col-span-2">
            <XRayChart data={xrayData} />
          </div>
        </div>

        {/* Solar Imagery + Recent Flares */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SolarImagery />
          </div>
          <RecentFlares flares={flares} />
        </div>

        {/* Solar Wind + Flare Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SolarWindPanel data={solarWind} />
          <FlareClassInfo />
        </div>

        {/* Historical Analysis */}
        {stats && <HistoricalAnalysis stats={stats} records={csvData} />}
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-border/50 mt-8 px-4 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>Data sources: NOAA/SWPC, NASA SDO/HMI, Kaggle Solar Flare Dataset</p>
          <p className="mono">Solar Sentinel v1.0 — Real-time Space Weather Monitoring</p>
        </div>
      </footer>
    </div>
  );
};

export default SolarDashboard;
