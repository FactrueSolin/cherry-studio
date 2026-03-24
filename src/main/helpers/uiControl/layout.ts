import { screen } from 'electron'

export interface NormalizedPointInput {
  x: number
  y: number
}

export interface GlobalPoint {
  x: number
  y: number
}

export function normalizedToGlobal({ x, y }: NormalizedPointInput): GlobalPoint {
  const displays = screen.getAllDisplays()
  if (displays.length === 0) {
    throw new Error('No display available for UI control')
  }

  const minX = Math.min(...displays.map((display) => display.bounds.x))
  const minY = Math.min(...displays.map((display) => display.bounds.y))
  const maxX = Math.max(...displays.map((display) => display.bounds.x + display.bounds.width))
  const maxY = Math.max(...displays.map((display) => display.bounds.y + display.bounds.height))

  const width = maxX - minX
  const height = maxY - minY

  if (width <= 0 || height <= 0) {
    throw new Error('Invalid display layout for UI control')
  }

  const normalizedX = Math.max(0, Math.min(999, Number(x))) / 999
  const normalizedY = Math.max(0, Math.min(999, Number(y))) / 999

  return {
    x: Math.round(minX + width * normalizedX),
    y: Math.round(minY + height * normalizedY)
  }
}
