import { isoProject } from './coords';

export default function IsoGrid({
  cols, rows, tileWidth, tileHeight, width, height, originX = width / 2, originY = tileHeight,
}: {
  cols: number; rows: number; tileWidth: number; tileHeight: number; width: number; height: number; originX?: number; originY?: number;
}) {
  const gridColor = '#7C3AED55';
  const lines: string[] = [];
  for (let x = 0; x <= cols; x++) {
    const p1 = isoProject(x, 0, { tileWidth, tileHeight });
    const p2 = isoProject(x, rows, { tileWidth, tileHeight });
    lines.push(`M ${originX + p1.x} ${originY + p1.y} L ${originX + p2.x} ${originY + p2.y}`);
  }
  for (let y = 0; y <= rows; y++) {
    const p1 = isoProject(0, y, { tileWidth, tileHeight });
    const p2 = isoProject(cols, y, { tileWidth, tileHeight });
    lines.push(`M ${originX + p1.x} ${originY + p1.y} L ${originX + p2.x} ${originY + p2.y}`);
  }
  return (
    <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {lines.map((d, i) => (
        <path key={i} d={d} stroke={gridColor} strokeWidth={1} strokeLinecap="square" />
      ))}
    </svg>
  );
}
