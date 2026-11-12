import { area, buffer, featureCollection, intersect, lineString, union } from '@turf/turf';
import type { Feature, MultiPolygon, Polygon } from 'geojson';

import { CAMPUS_AREA } from '@/constants/campus';

export type ClearedArea = Feature<Polygon | MultiPolygon> | null;

const CAMPUS_SQ_METERS = area(CAMPUS_AREA);

export function getExploredPercent(cleared: ClearedArea): number {
  if (!cleared) return 0;

  const overlap = intersect(featureCollection([CAMPUS_AREA, cleared]));
  if (!overlap) return 0;

  return Math.min(100, (area(overlap) / CAMPUS_SQ_METERS) * 100);
}

export function clearAlong(cleared: ClearedArea, from: [number, number], to: [number, number]): ClearedArea {
  const strip = buffer(lineString([from, to]), 5, { units: 'meters' });
  if (!strip) return cleared;

  if (!cleared) return strip;
  return union(featureCollection([cleared, strip])) ?? cleared;
}
