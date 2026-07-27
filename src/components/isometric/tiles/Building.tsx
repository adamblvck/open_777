import { isoProject } from '../coords';

export default function Building({
  width, height, tileWidth, tileHeight, originX, originY, x, y, spanX = 1, spanY = 1, heightUnits = 18,
  colorTop = '#2E3357', colorLeft = '#242942', colorRight = '#1E2338',
}: {
  width: number; height: number; tileWidth: number; tileHeight: number; originX: number; originY: number; x: number; y: number;
  spanX?: number; spanY?: number; heightUnits?: number; colorTop?: string; colorLeft?: string; colorRight?: string;
}) {
  const p = isoProject(x, y, { tileWidth, tileHeight });
  const cx = originX + p.x;
  const cy = originY + p.y;
  const hw = (tileWidth / 2) * spanX;
  const hh = (tileHeight / 2) * spanY;
  const top: [number, number][] = [[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]];
  const e = heightUnits;
  const rightFace: [number, number][] = [top[1], top[2], [top[2][0], top[2][1] + e], [top[1][0], top[1][1] + e]];
  const leftFace: [number, number][] = [top[3], top[2], [top[2][0], top[2][1] + e], [top[3][0], top[3][1] + e]];
  const pts = (a: [number, number][]) => a.map((q) => q.join(',')).join(' ');
  return (
    <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <polygon points={pts(top)} fill={colorTop} />
      <polygon points={pts(rightFace)} fill={colorRight} />
      <polygon points={pts(leftFace)} fill={colorLeft} />
    </svg>
  );
}
