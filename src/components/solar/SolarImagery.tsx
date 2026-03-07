import { useState } from 'react';
import { Sun } from 'lucide-react';
import { SDO_IMAGES } from '@/lib/noaa-api';

export const SolarImagery = () => {
  const imageKeys = Object.keys(SDO_IMAGES) as (keyof typeof SDO_IMAGES)[];
  const [selected, setSelected] = useState<keyof typeof SDO_IMAGES>('aia193');
  const current = SDO_IMAGES[selected];

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wider">SDO SOLAR IMAGERY — LIVE</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
        <div className="relative rounded-lg overflow-hidden bg-background aspect-square max-h-[400px]">
          <img
            src={`${current.url}?t=${Date.now()}`}
            alt={current.label}
            className="w-full h-full object-contain"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
            <p className="text-sm font-display font-semibold text-primary">{current.label}</p>
            <p className="text-xs text-muted-foreground">{current.description}</p>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
          {imageKeys.map(key => {
            const img = SDO_IMAGES[key];
            const isActive = key === selected;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${isActive ? 'border-primary glow-primary' : 'border-transparent hover:border-border'}`}
              >
                <div className="w-16 h-16 md:w-full md:h-16 relative">
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-background/40 flex items-end p-1">
                    <span className="text-[9px] font-medium truncate">{img.label}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
