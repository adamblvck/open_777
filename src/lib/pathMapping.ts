import { PATHWAYS } from '../components/TreeOfLife';

/**
 * Path-number mapping, in one place.
 *
 * The recorder offers 0-34 where 0 means "General" and 33/34 are the "bis"
 * paths ("32 bis" / "31 bis"). The glyph only draws 11-32 for paths and 1-10
 * for sephiroth. This was duplicated across the journey map and the recorder,
 * and getting it wrong silently drops recordings off the Tree.
 */

export const isSephira = (n: number): boolean => n >= 1 && n <= 10;
export const isPath = (n: number): boolean => n >= 11 && n <= 32;

/** Number to draw on the glyph, or null when it has no node (0, 33, 34). */
export function toTreePath(pathNumber: number): number | null {
  if (isPath(pathNumber) || isSephira(pathNumber)) return pathNumber;
  // "32 bis" and "31 bis" ride on the paths they extend.
  if (pathNumber === 33) return 32;
  if (pathNumber === 34) return 31;
  return null;
}

/** True when a recording belongs nowhere on the glyph and needs its own tray. */
export function isUnplaced(pathNumber: number): boolean {
  return toTreePath(pathNumber) === null;
}

export function sephirotForPath(pathNumber: number): [number, number] | null {
  const mapped = toTreePath(pathNumber);
  if (mapped === null || !isPath(mapped)) return null;
  const edge = PATHWAYS[mapped];
  return edge ? [edge.from, edge.to] : null;
}

/** Every path that touches a sephira — derived, never a second hand-written table. */
export function pathsTouchingSephira(sephira: number): number[] {
  return Object.entries(PATHWAYS)
    .filter(([, e]) => e.from === sephira || e.to === sephira)
    .map(([n]) => Number(n))
    .sort((a, b) => a - b);
}

export const PATH_LABEL: Record<number, string> = { 0: 'General' , 33: '32 bis', 34: '31 bis' };

export function pathLabel(pathNumber: number, letter?: string | null, trump?: string | null): string {
  const special = PATH_LABEL[pathNumber];
  if (special) return special;
  const bits = [`Path ${pathNumber}`];
  if (letter) bits.push(letter);
  if (trump) bits.push(trump);
  return bits.join(' · ');
}
