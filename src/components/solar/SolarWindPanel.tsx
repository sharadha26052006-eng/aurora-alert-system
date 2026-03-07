import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wind } from 'lucide-react';
import type { SolarWindData } from '@/lib/noaa-api';

interface SolarWindPanelProps {
  data: SolarWindData[];
}

export const SolarWindPanel = ({ data }: SolarWindPanelProps) => {
  const chartData = useMemo(() => {
    const sampled = data.filter((_, i) => i % 15 === 0);
    return sampled.map(d => ({
      time: new Date(d.time_tag).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
      speed: d.speed || null,
      density: d.density || null,
    }));
  }, [data]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-solar-xray" />
          <h2 className="font-display text-sm font-semibold tracking-wider">SOLAR WIND</h2>
        </div>
        {latest && (
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase">Speed</p>
              <p className="mono text-sm font-semibold text-foreground">{latest.speed ? `${Math.round(latest.speed)} km/s` : '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase">Density</p>
              <p className="mono text-sm font-semibold text-foreground">{latest.density ? `${latest.density.toFixed(1)} p/cm³` : '—'}</p>
            </div>
          </div>
        )}
      </div>
      <div className="h-[250px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 18%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickCount={5} />
              <YAxis yAxisId="speed" tick={{ fontSize: 10 }} label={{ value: 'km/s', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'hsl(220, 15%, 55%)' } }} />
              <YAxis yAxisId="density" orientation="right" tick={{ fontSize: 10 }} label={{ value: 'p/cm³', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: 'hsl(220, 15%, 55%)' } }} />
              <Tooltip
                contentStyle={{ background: 'hsl(222, 40%, 10%)', border: '1px solid hsl(222, 25%, 18%)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'hsl(220, 15%, 55%)' }}
              />
              <Line yAxisId="speed" type="monotone" dataKey="speed" stroke="hsl(200, 90%, 60%)" strokeWidth={1.5} dot={false} name="Speed" />
              <Line yAxisId="density" type="monotone" dataKey="density" stroke="hsl(32, 95%, 55%)" strokeWidth={1.5} dot={false} name="Density" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading solar wind data...</div>
        )}
      </div>
    </div>
  );
};
