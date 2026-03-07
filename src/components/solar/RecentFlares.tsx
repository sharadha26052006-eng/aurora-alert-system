import { Zap } from 'lucide-react';
import type { XRayFlare } from '@/lib/noaa-api';
import { getFlareClass, getFlareColor } from '@/lib/noaa-api';

interface RecentFlaresProps {
  flares: XRayFlare[];
}

export const RecentFlares = ({ flares }: RecentFlaresProps) => {
  const sorted = [...flares].sort((a, b) => new Date(b.begin_time).getTime() - new Date(a.begin_time).getTime()).slice(0, 15);

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wider">RECENT FLARES</h2>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent flare data</p>
        ) : (
          sorted.map((flare, i) => {
            const cls = getFlareClass(flare.max_class);
            const color = getFlareColor(flare.max_class);
            return (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: color, color: cls === 'A' || cls === 'B' ? '#fff' : '#000' }}
                >
                  {cls}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{flare.max_class || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground mono">
                      {flare.max_xrlong ? flare.max_xrlong.toExponential(1) : '—'} W/m²
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mono truncate">
                    {flare.begin_time ? new Date(flare.begin_time).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
