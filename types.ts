
export enum AppState {
  LANDING = 'LANDING',
  WORKSPACE = 'WORKSPACE',
  RESULTS = 'RESULTS',
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedFace {
  id: string;
  box: BoundingBox;
  thumbnailUrl: string;
}
