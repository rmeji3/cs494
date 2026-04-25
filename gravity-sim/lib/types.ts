export enum BodyType {
  Planet = 0,
  Sun = 1,
  Moon = 2,
  Spaceship = 3,
  Meteorite = 4,
}

export interface BodyConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  type: BodyType;
}

export interface SimStats {
  fps: number;
  bodyCount: number;
  simTime: number;
}

export interface PendingBodyCfg {
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  type: BodyType;
}

export const BODY_DEFAULTS: Record<BodyType, PendingBodyCfg> = {
  [BodyType.Planet]:    { vx: 0, vy: 50, mass: 100,  radius: 12, type: BodyType.Planet },
  [BodyType.Sun]:       { vx: 0, vy: 0,  mass: 10000, radius: 40, type: BodyType.Sun },
  [BodyType.Moon]:      { vx: 0, vy: 66, mass: 5,    radius: 6,  type: BodyType.Moon },
  [BodyType.Spaceship]: { vx: 0, vy: 85, mass: 1,    radius: 4,  type: BodyType.Spaceship },
  [BodyType.Meteorite]: { vx: -20, vy: 30, mass: 10,  radius: 8,  type: BodyType.Meteorite },
};
