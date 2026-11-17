export interface FilterState {
  hero: string;
  cls: string;
  type: string;
  rarity: string;
  cost: string;
  keyword: string;
  pool: string;
  tier: string;
  act: string;
  stack: string;
}

export type FilterKey = keyof FilterState;

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  accent?: string;
  portrait?: string;
}

export interface FilterGroup {
  key: FilterKey;
  label: string;
  options: FilterOption[];
  quick?: boolean;
  variant?: 'hero';
}

export const EMPTY_FILTERS: FilterState = {
  hero: '',
  cls: '',
  type: '',
  rarity: '',
  cost: '',
  keyword: '',
  pool: '',
  tier: '',
  act: '',
  stack: '',
};

export function countActiveFilters(filters: FilterState): number {
  return Object.values(filters).filter(Boolean).length;
}
