import { FLARE_CLASSES } from '@/lib/noaa-api';
import { Info } from 'lucide-react';

export const FlareClassInfo = () => {
  const classes = Object.entries(FLARE_CLASSES);

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wider">FLARE CLASSIFICATION</h2>
      </div>
      <div className="space-y-3">
        {classes.map(([key, info]) => (
          <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: info.color, color: key === 'A' || key === 'B' ? '#fff' : '#000' }}
            >
              {key}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{info.label}</span>
                <span className="mono text-xs text-muted-foreground">{info.intensity}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
              <span className={`inline-block mt-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                info.risk === 'Severe' ? 'bg-solar-danger/20 text-solar-danger' :
                info.risk === 'Moderate' ? 'bg-primary/20 text-primary' :
                info.risk === 'Low' ? 'bg-solar-warning/20 text-solar-warning' :
                'bg-solar-safe/20 text-solar-safe'
              }`}>
                Risk: {info.risk}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
