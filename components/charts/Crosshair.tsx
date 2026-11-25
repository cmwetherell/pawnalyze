interface CrosshairProps { x: number; top: number; bottom: number; /** The selected position, when nothing is pointed at. */ quiet?: boolean }

export function Crosshair({ x, top, bottom, quiet = false }: CrosshairProps) {
  return <line x1={x} x2={x} y1={top} y2={bottom} strokeWidth={1} shapeRendering="crispEdges" pointerEvents="none" className={quiet ? 'stroke-control' : 'stroke-ink-3'} />;
}
