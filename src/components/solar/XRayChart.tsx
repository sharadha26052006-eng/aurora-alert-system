import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';
import type { XRayData } from '@/lib/noaa-api';

interface XRayChartProps {
  data: XRayData[];
}

export const XRayChart = ({ data }: XRayChartProps) => {
  const chartData = useMemo(() => {
    // Sample every 10th point for performance
    const sampled = data.filter((_, i) => i % 10 === 0);
    return sampled.map(d => ({
      time: new Date(d.time_tag).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      flux: d.flux,
      logFlux: d.flux > 0 ? Math.log10(d.flux) : -10,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const flux = payload[0].payload.flux;
    let cls = 'A';
    if (flux >= 1e-4) cls = 'X';
    else if (flux >= 1e-5) cls = 'M';
    else if (flux >= 1e-6) cls = 'C';
    else if (flux >= 1e-7) cls = 'B';

    return (
      <div className="glass-card rounded-lg p-3 border border-border/50 text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-foreground font-medium">Flux: <span className="mono text-primary">{flux.toExponential(2)}</span> W/m²</p>
        <p className="text-muted-foreground">Class: <span className="font-bold">{cls}</span></p>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wider">GOES X-RAY FLUX — 7 DAY</h2>
      </div>
      <div className="h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 18%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickCount={6} />
              <YAxis
                dataKey="logFlux"
                tick={{ fontSize: 10 }}
                domain={[-9, -3]}
                tickFormatter={(v) => `1e${v}`}
                label={{ value: 'W/m²', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'hsl(220, 15%, 55%)' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Flare class thresholds */}
              <ReferenceLine y={-4} stroke="hsl(0, 80%, 55%)" strokeDasharray="5 5" label={{ value: 'X', position: 'right', fill: 'hsl(0, 80%, 55%)', fontSize: 10 }} />
              <ReferenceLine y={-5} stroke="hsl(32, 95%, 55%)" strokeDasharray="5 5" label={{ value: 'M', position: 'right', fill: 'hsl(32, 95%, 55%)', fontSize: 10 }} />
              <ReferenceLine y={-6} stroke="hsl(45, 100%, 55%)" strokeDasharray="5 5" label={{ value: 'C', position: 'right', fill: 'hsl(45, 100%, 55%)', fontSize: 10 }} />
              <ReferenceLine y={-7} stroke="hsl(150, 60%, 45%)" strokeDasharray="5 5" label={{ value: 'B', position: 'right', fill: 'hsl(150, 60%, 45%)', fontSize: 10 }} />
              <Line type="monotone" dataKey="logFlux" stroke="hsl(32, 95%, 55%)" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading X-Ray data...</div>
        )}
      </div>
    </div>
  );
};
