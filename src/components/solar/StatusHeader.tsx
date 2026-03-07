import { Activity, Zap, Shield, Radio } from 'lucide-react';
import type { XRayData, XRayFlare } from '@/lib/noaa-api';
import { getFlareClass } from '@/lib/noaa-api';

interface StatusHeaderProps {
  currentFlux: XRayData | null;
  alert: { level: string; color: string; glow: string };
  flares: XRayFlare[];
}

export const StatusHeader = ({ currentFlux, alert, flares }: StatusHeaderProps) => {
  const recentMXFlares = flares.filter(f => {
    const cls = getFlareClass(f.max_class);
    return cls === 'M' || cls === 'X';
  }).length;

  const fluxValue = currentFlux ? currentFlux.flux.toExponential(2) : '—';

  const cards = [
    {
      icon: Activity,
      label: 'X-Ray Flux',
      value: fluxValue,
      unit: 'W/m²',
      sub: `Class: ${currentFlux ? getFlareClass(currentFlux.energy || '') || 'Monitoring' : '—'}`,
      highlight: false,
    },
    {
      icon: Shield,
      label: 'Alert Level',
      value: alert.level,
      unit: '',
      sub: 'Current threat assessment',
      highlight: true,
      glowClass: alert.glow,
    },
    {
      icon: Zap,
      label: 'M/X Flares (7d)',
      value: String(recentMXFlares),
      unit: 'events',
      sub: `Total flares: ${flares.length}`,
      highlight: false,
    },
    {
      icon: Radio,
      label: 'Prediction Window',
      value: '24-48',
      unit: 'hours',
      sub: 'Active monitoring range',
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`glass-card rounded-lg p-4 ${card.highlight ? card.glowClass : ''}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-display font-bold ${card.highlight ? `text-${card.label === 'Alert Level' ? (alert.level === 'LOW' ? 'solar-safe' : alert.level === 'EXTREME' ? 'solar-danger' : 'primary') : 'foreground'}` : 'text-foreground'}`}>
              {card.value}
            </span>
            {card.unit && <span className="text-xs text-muted-foreground mono">{card.unit}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
};
