export interface RoutablePoint {
  id: string
  x: number
  y: number
}

const BAND_HEIGHT = 80

// Devices sit at free-form x/y positions rather than on a grid, so sorting
// purely by y (or purely by x) would send an inspector zig-zagging across
// the hall between consecutive stops. Instead we group devices into
// horizontal bands ~80px tall (roughly "one row of equipment") and sweep
// each band left-to-right or right-to-left in alternation — a boustrofedon
// ("as the ox plows") pattern. That way every step continues from wherever
// the previous one left off, producing a walkable route instead of a
// mathematically-sorted but physically nonsensical order.
export function computeWalkingRoute<T extends RoutablePoint>(points: T[]): T[] {
  const sortedByY = [...points].sort((a, b) => a.y - b.y)

  const bands: T[][] = []
  for (const point of sortedByY) {
    const currentBand = bands[bands.length - 1]
    const bandStartY = currentBand?.[0].y
    if (currentBand && bandStartY !== undefined && point.y - bandStartY <= BAND_HEIGHT) {
      currentBand.push(point)
    } else {
      bands.push([point])
    }
  }

  return bands.flatMap((band, index) => {
    const sortedByX = [...band].sort((a, b) => a.x - b.x)
    return index % 2 === 0 ? sortedByX : sortedByX.reverse()
  })
}
