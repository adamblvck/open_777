import type { ReactNode } from 'react';
import IsoGrid from './IsoGrid';

export interface IsoCtx {
  originX: number;
  originY: number;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
}

export default function IsometricSection({
  cols = 10, rows = 10, tileWidth = 60, tileHeight = 30, width, height, dimmed = false, children,
}: {
  cols?: number; rows?: number; tileWidth?: number; tileHeight?: number; width: number; height: number; dimmed?: boolean; children?: (ctx: IsoCtx) => ReactNode;
}) {
  const originX = width / 2;
  const originY = tileHeight * 0.5;
  return (
    <div style={{ width, height, marginTop: -tileHeight, position: 'relative', overflow: 'visible', opacity: dimmed ? 0.35 : 1 }}>
      <IsoGrid cols={cols} rows={rows} tileWidth={tileWidth} tileHeight={tileHeight} width={width} height={height} originX={originX} originY={originY} />
      {children?.({ originX, originY, width, height, tileWidth, tileHeight })}
    </div>
  );
}
