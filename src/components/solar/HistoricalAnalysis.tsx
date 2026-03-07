import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Database } from 'lucide-react';
import type { SolarFlareRecord } from '@/lib/solar-data';

interface HistoricalAnalysisProps {
  stats: {
    zurichDist: Record<string, number>;
    spotSizeDist: Record<string, number>;
    totalCommon: number;
    totalModerate: number;
    totalSevere: number;
    total: number;
  };
  records: SolarFlareRecord[];
}

const COLORS = ['hsl(150, 60%, 45%)', 'hsl(45, 100%, 55%)', 'hsl(32, 95%, 55%)', 'hsl(200, 90%, 60%)', 'hsl(0, 80%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(170, 60%, 50%)'];

export const HistoricalAnalysis = ({ stats, records }: HistoricalAnalysisProps) => {
  const zurichData = useMemo(() =>
    Object.entries(stats.zurichDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    [stats.zurichDist]
  );

  const spotData = useMemo(() =>
    Object.entries(stats.spotSizeDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    [stats.spotSizeDist]
  );

  const flareTypeData = [
    { name: 'Common', value: stats.totalCommon, color: 'hsl(45, 100%, 55%)' },
    { name: 'Moderate', value: stats.totalModerate, color: 'hsl(32, 95%, 55%)' },
    { name: 'Severe', value: stats.totalSevere, color: 'hsl(0, 80%, 55%)' },
  ].filter(d => d.value > 0);

  // Activity by complexity
  const complexityData = useMemo(() => {
    const complex = records.filter(r => r.historicallyComplex === 2).length;
    const simple = records.filter(r => r.historicallyComplex === 1).length;
    return [
      { name: 'Simple', value: simple },
      { name: 'Complex', value: complex },
    ];
  }, [records]);

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-wider">KAGGLE DATASET ANALYSIS</h2>
        <span className="mono text-xs text-muted-foreground">({stats.total.toLocaleString()} records)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Zurich Classification Distribution */}
        <div className="bg-secondary/30 rounded-lg p-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Modified Zurich Class</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zurichData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 18%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 40%, 10%)', border: '1px solid hsl(222, 25%, 18%)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="hsl(32, 95%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spot Size Distribution */}
        <div className="bg-secondary/30 rounded-lg p-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Largest Spot Size</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spotData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 18%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222, 40%, 10%)', border: '1px solid hsl(222, 25%, 18%)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="hsl(200, 90%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flare Severity Pie */}
        <div className="bg-secondary/30 rounded-lg p-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Flare Severity Distribution</h3>
          <div className="h-[200px]">
            {flareTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flareTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {flareTypeData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(222, 40%, 10%)', border: '1px solid hsl(222, 25%, 18%)', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                No flare events in dataset
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
        {[
          { label: 'Total Records', value: stats.total.toLocaleString() },
          { label: 'Common Flares', value: stats.totalCommon },
          { label: 'Moderate Flares', value: stats.totalModerate },
          { label: 'Severe Flares', value: stats.totalSevere },
          { label: 'Zurich Classes', value: Object.keys(stats.zurichDist).length },
        ].map((s, i) => (
          <div key={i} className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-display font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
