import { bboxPolygon } from '@turf/turf';

type BBox = [number, number, number, number];

export const CAMPUS_BOUNDS: BBox = [-93.158634, 44.460488, -93.146167, 44.466659];
export const CAMPUS_AREA = bboxPolygon(CAMPUS_BOUNDS);

export const FOG_EXTENT = bboxPolygon([-93.162, 44.455, -93.143, 44.468]);

export const CAMPUS_CENTER: [number, number] = [-93.1534, 44.4613];
