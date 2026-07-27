// Category (table) glossary — per-row metadata for the 262 Liber 777 rows.
// Ported from open777Native/constants/categoryGlossary.ts.
import categoryData from '../data/categoryGlossary.json';

export interface CategoryEntry {
  row: number;
  table: string;
  label: string;
  kind: string;
  definable: boolean;
  type: string;
  visualValue: number;
  description: string;
  status: 'complete' | 'auto' | 'stub';
}

const data = categoryData as unknown as { _meta: Record<string, unknown>; categories: CategoryEntry[] };
export const CategoryGlossary: CategoryEntry[] = data.categories;

const byRow = new Map<number, CategoryEntry>();
for (const c of CategoryGlossary) byRow.set(c.row, c);

export const getCategoryByRow = (row: number): CategoryEntry | undefined => byRow.get(row);
