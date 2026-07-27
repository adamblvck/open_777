import { isoProject } from '../coords';

export default function Road({
  width, height, tileWidth, tileHeight, originX, originY, points, color = '#C4B5FD', strokeWidth,
}: {
  width: number; height: number; tileWidth: number; tileHeight: number; originX: number; originY: number; points: { x: number; y: number }[]; color?: string; strokeWidth?: number;
}) {
  if (!points.length) return null;
  const sw = strokeWidth ?? tileWidth / 6;
  const d = points
    .map((pt, idx) => {
      const p = isoProject(pt.x + 0.5, pt.y + 0.5, { tileWidth, tileHeight });
      return `${idx === 0 ? 'M' : 'L'} ${originX + p.x} ${originY + p.y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <path fill="none" d={d} stroke={color} strokeWidth={sw} strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}
