export interface SolarFlareRecord {
  zurichClass: string;
  largestSpotSize: string;
  spotDistribution: string;
  activity: number;
  evolution: number;
  previousFlareActivity: number;
  historicallyComplex: number;
  becameComplex: number;
  area: number;
  areaLargestSpot: number;
  commonFlares: number;
  moderateFlares: number;
  severeFlares: number;
}

export async function parseCSV(): Promise<SolarFlareRecord[]> {
  const res = await fetch('/data/solar_flare.csv');
  const text = await res.text();
  const lines = text.trim().split('\n');
  // skip header
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    return {
      zurichClass: cols[0],
      largestSpotSize: cols[1],
      spotDistribution: cols[2],
      activity: parseInt(cols[3]),
      evolution: parseInt(cols[4]),
      previousFlareActivity: parseInt(cols[5]),
      historicallyComplex: parseInt(cols[6]),
      becameComplex: parseInt(cols[7]),
      area: parseInt(cols[8]),
      areaLargestSpot: parseInt(cols[9]),
      commonFlares: parseInt(cols[10]),
      moderateFlares: parseInt(cols[11]),
      severeFlares: parseInt(cols[12]),
    };
  });
}

export function getFlareStats(records: SolarFlareRecord[]) {
  const zurichDist: Record<string, number> = {};
  const spotSizeDist: Record<string, number> = {};
  let totalCommon = 0, totalModerate = 0, totalSevere = 0;
  
  records.forEach(r => {
    zurichDist[r.zurichClass] = (zurichDist[r.zurichClass] || 0) + 1;
    spotSizeDist[r.largestSpotSize] = (spotSizeDist[r.largestSpotSize] || 0) + 1;
    totalCommon += r.commonFlares;
    totalModerate += r.moderateFlares;
    totalSevere += r.severeFlares;
  });

  return { zurichDist, spotSizeDist, totalCommon, totalModerate, totalSevere, total: records.length };
}
