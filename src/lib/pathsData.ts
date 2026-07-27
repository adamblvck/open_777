// Tree-of-Life path lore (32 sephiroth/paths) — title, Hebrew name, description.
// Ported from open777Native/constants/paths.ts (reads data/paths.json).
import pathsJson from '../data/paths.json';

export type PathInfo = { title: string; name: string; description: string };
export const pathsData = pathsJson as Record<string, PathInfo>;
