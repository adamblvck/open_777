import TreeOfLife from '../../TreeOfLife';
import { isoProject } from '../coords';

export default function TreeOfLifeTile({
  tileWidth, tileHeight, originX, originY, x, y, selectedPath,
}: {
  tileWidth: number; tileHeight: number; originX: number; originY: number; x: number; y: number; selectedPath?: number;
}) {
  const p = isoProject(x, y, { tileWidth, tileHeight });
  const cx = originX + p.x;
  const cy = originY + p.y;
  const size = 124;
  return (
    <div style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2 - tileHeight * 1.5, width: size, height: size, display: 'flex', justifyContent: 'center' }}>
      <TreeOfLife height={size} radiusSephira={size / 15} selected={selectedPath ? [selectedPath] : []} pathwayColor="#C4B5FD" />
    </div>
  );
}
