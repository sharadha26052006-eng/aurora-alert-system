import { AlertTriangle, Shield, Satellite } from 'lucide-react';
import type { XRayData, XRayFlare, SolarWindData } from '@/lib/noaa-api';
import { getFlareClass } from '@/lib/noaa-api';

interface PredictionPanelProps {
  currentFlux: XRayData | null;
  flares: XRayFlare[];
  solarWind: SolarWindData[];
}

export const PredictionPanel = ({ currentFlux, flares, solarWind }: PredictionPanelProps) => {
  // Simple heuristic prediction based on recent activity
  const recentMXCount = flares.filter(f => {
    const cls = getFlareClass(f.max_class);
    return (cls === 'M' || cls === 'X');
  }).length;

  const currentFluxVal = currentFlux?.flux || 0;
  const avgWindSpeed = solarWind.length > 0
    ? solarWind.slice(-50).reduce((s, d) => s + (d.speed || 0), 0) / Math.min(solarWind.length, 50)
    : 0;

  // Risk score 0-100
  let riskScore = 0;
  if (currentFluxVal >= 1e-4) riskScore += 50;
  else if (currentFluxVal >= 1e-5) riskScore += 35;
  else if (currentFluxVal >= 1e-6) riskScore += 15;
  else riskScore += 5;

  riskScore += Math.min(recentMXCount * 8, 30);
  if (avgWindSpeed > 600) riskScore += 15;
  else if (avgWindSpeed > 400) riskScore += 5;

  riskScore = Math.min(riskScore, 100);

  let riskLabel = 'LOW';
  let riskColor = 'text-solar-safe';
  let riskBg = 'bg-solar-safe/10';
  let riskBorder = 'border-solar-safe/30';
  let riskGlow = 'glow-safe';

  if (riskScore >= 70) {
    riskLabel = 'CRITICAL';
    riskColor = 'text-solar-danger';
    riskBg = 'bg-solar-danger/10';
    riskBorder = 'border-solar-danger/30';
    riskGlow = 'glow-danger';
  } else if (riskScore >= 45) {
    riskLabel = 'ELEVATED';
    riskColor = 'text-primary';
    riskBg = 'bg-primary/10';
    riskBorder = 'border-primary/30';
    riskGlow = 'glow-warning';
  } else if (riskScore >= 25) {
    riskLabel = 'MODERATE';
    riskColor = 'text-solar-warning';
    riskBg = 'bg-solar-warning/10';
    riskBorder = 'border-solar-warning/30';
    riskGlow = 'glow-primary';
  }

  const recommendations = [];
  if (riskScore >= 70) {
    recommendations.push('⚠️ Satellite operators: initiate protective measures immediately');
    recommendations.push('🛰️ Move satellites to safe mode or increase shielding');
    recommendations.push('📡 Expect HF radio blackouts and GPS degradation');
  } else if (riskScore >= 45) {
    recommendations.push('🛰️ Monitor satellite systems closely for anomalies');
    recommendations.push('📡 Prepare for potential HF radio disruptions');
    recommendations.push('⚡ Increased risk of radiation storms');
  } else if (riskScore >= 25) {
    recommendations.push('📊 Continue monitoring solar activity');
    recommendations.push('🛰️ Standard satellite operations with heightened awareness');
  } else {
    recommendations.push('✅ Normal space weather conditions');
    recommendations.push('🛰️ Standard satellite operations');
  }

  return (
    <div className={`glass-card rounded-lg p-4 border ${riskBorder} ${riskGlow}`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className={`w-5 h-5 ${riskColor}`} />
        <h2 className="font-display text-sm font-semibold tracking-wider">24-48H PREDICTION</h2>
      </div>

      {/* Risk gauge */}
      <div className={`rounded-lg p-4 ${riskBg} mb-4`}>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flare Risk Level</p>
          <p className={`text-4xl font-display font-bold ${riskColor} ${riskScore >= 70 ? 'pulse-warning' : ''}`}>
            {riskLabel}
          </p>
          <div className="mt-3 w-full h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${riskScore}%`,
                background: riskScore >= 70 ? 'hsl(0, 80%, 55%)' : riskScore >= 45 ? 'hsl(32, 95%, 55%)' : riskScore >= 25 ? 'hsl(45, 100%, 55%)' : 'hsl(150, 60%, 45%)',
              }}
            />
          </div>
          <p className="mono text-xs text-muted-foreground mt-1">Risk Score: {riskScore}/100</p>
        </div>
      </div>

      {/* Factors */}
      <div className="space-y-2 mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Contributing Factors</p>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex justify-between items-center p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">Current X-Ray Flux</span>
            <span className="mono text-foreground">{currentFluxVal.toExponential(2)} W/m²</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">M/X Flares (7d)</span>
            <span className="mono text-foreground">{recentMXCount}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-secondary/30">
            <span className="text-muted-foreground">Avg Wind Speed</span>
            <span className="mono text-foreground">{avgWindSpeed > 0 ? `${Math.round(avgWindSpeed)} km/s` : '—'}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Satellite Advisory</p>
        </div>
        <div className="space-y-1">
          {recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-secondary-foreground p-2 rounded bg-secondary/20">{rec}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
