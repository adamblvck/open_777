// Isometric projection — ported verbatim from open777Native.
export type IsoProjectParams = { tileWidth: number; tileHeight: number };

export function isoProject(x: number, y: number, { tileWidth, tileHeight }: IsoProjectParams) {
  return { x: (x - y) * (tileWidth / 2), y: (x + y) * (tileHeight / 2) };
}
