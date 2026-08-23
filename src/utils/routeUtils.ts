export interface RoutablePoint {
  id: string
  x: number
  y: number
}

const BAND_HEIGHT = 80

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
