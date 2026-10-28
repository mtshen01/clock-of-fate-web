export type CategoryId =
  | 'cards'
  | 'relics'
  | 'monsters'
  | 'powers'
  | 'enchantments'
  | 'potions'
  | 'modifiers';

export interface Meta {
  version: string;
  contentHash: string | null;
  builtAt: string;
  gameVersion: string;
  counts: Record<CategoryId, number>;
  heroes: Array<{ id: string; name: string; className: string; accent: number[] }>;
  acts: Array<{ id: string; name: string; index: number }>;
}

export interface Card {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  rarity: string;
  rarityLabel: string;
  cost: number;
  costLabel: string;
  starCost: number | null;
  class: string;
  classLabel: string;
  classAccent: number[] | null;
  target: string;
  targetLabel: string;
  description: string;
  upgraded: { description: string; cost: number; costLabel: string };
  keywords: Array<{ id: string; label: string }>;
  tags: Array<{ id: string; label: string }>;
  exhaust: boolean;
  ethereal: boolean;
  unplayable: boolean;
  innate: boolean;
  retain: boolean;
  multiplayerOnly: boolean;
  flavor: string;
  special: string | null;
  art: string | null;
  artCredit: 'local' | 'reference' | null;
  referenceUrl: string;
}

export interface Relic {
  id: string;
  name: string;
  rarity: string;
  rarityLabel: string;
  description: string;
  flavor: string;
  price: number;
  pool: string;
  poolLabel: string;
  triggers: Array<{ trigger: string; label: string; effects: number }>;
  art: string | null;
  artCredit: 'local' | 'reference' | null;
  referenceUrl: string;
}

export interface MonsterMove {
  id: string;
  name: string;
  intent: string;
  intentLabel: string;
  damage: number[];
  damageAscension: number[];
  block: number | null;
  powers: Array<{ id: string; name: string; stacks: number }>;
  effects: number;
}

export interface Monster {
  id: string;
  name: string;
  act: number;
  actLabel: string;
  actSubtitle: string;
  tier: string;
  tierLabel: string;
  hp: { min: number; max: number };
  hpAscension: { min: number; max: number } | null;
  moves: MonsterMove[];
  innatePowers: Array<{ id: string; name: string; stacks: number }>;
  innatePowersAscension: Array<{ id: string; name: string; stacks: number }>;
  pattern: {
    type: string;
    typeLabel: string;
    description: string;
    sequence: string[];
  } | null;
  encounters: Array<{ id: string; name: string }>;
  art: string | null;
  artCredit: 'local' | 'reference' | null;
  referenceUrl: string;
}

export interface Power {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  stackType: string;
  stackLabel: string;
  description: string;
  art: string | null;
  artCredit: 'local' | 'reference' | null;
  referenceUrl: string;
}

export interface Enchantment {
  id: string;
  name: string;
  description: string;
  extraCardText: string;
  stackable: boolean;
  cardType: string;
  cardTypeLabel: string;
  applicableTo: string;
  applicableLabel: string;
  art: string | null;
  artCredit: 'local' | 'reference' | null;
  referenceUrl: string;
}

export interface Potion {
  id: string;
  name: string;
  rarity: string;
  rarityLabel: string;
  price: number;
  description: string;
  target: string;
  targetLabel: string;
  pool: string;
  poolLabel: string;
  usableOutsideBattle: boolean;
  art: string | null;
  artCredit: 'local' | 'reference' | null;
  referenceUrl: string;
}

export interface Modifier {
  id: string;
  name: string;
  description: string;
  type: string;
  typeLabel: string;
}

export type CatalogItem = Card | Monster | Relic | Power | Enchantment | Potion | Modifier;

export type CategoryData = Card[] | Monster[] | Relic[] | Power[] | Enchantment[] | Potion[] | Modifier[];

export interface CategoryDef {
  id: CategoryId;
  label: string;
  latin: string;
  glyph: string;
  description: string;
  numeral: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'cards',
    label: '卡牌',
    latin: 'CARDS',
    glyph: 'cards',
    description: '每一次出牌，都是向停摆的钟借来的一秒。',
    numeral: 'I',
  },
  {
    id: 'relics',
    label: '遗物',
    latin: 'RELICS',
    glyph: 'relics',
    description: '旧时代的残片，仍在暗处低声运转。',
    numeral: 'II',
  },
  {
    id: 'monsters',
    label: '生物',
    latin: 'BESTIARY',
    glyph: 'monsters',
    description: '林海、港口与王都深处，所有会呼吸的东西。',
    numeral: 'III',
  },
  {
    id: 'powers',
    label: '状态',
    latin: 'STATES',
    glyph: 'powers',
    description: '增益与减益，在回合之间留下持久的刻痕。',
    numeral: 'IV',
  },
  {
    id: 'enchantments',
    label: '附魔',
    latin: 'ENCHANTMENTS',
    glyph: 'enchantments',
    description: '刻进卡面的咒文，改变一张牌的命运。',
    numeral: 'V',
  },
  {
    id: 'potions',
    label: '道具',
    latin: 'ITEMS',
    glyph: 'potions',
    description: '瓶中封存的最后一口气，或最后一次机会。',
    numeral: 'VI',
  },
  {
    id: 'modifiers',
    label: '每日挑战',
    latin: 'DAILY RITES',
    glyph: 'modifiers',
    description: '每日重置的规则变体，让同一座钟楼走向不同的夜。',
    numeral: 'VII',
  },
];

export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export const CLASS_ORDER = [
  'ironclad',
  'silent',
  'defect',
  'necrobinder',
  'regent',
  'colorless',
  'curse',
  'status',
  'event',
  'quest',
  'token',
];

export const CLASS_LABELS: Record<string, string> = {
  ironclad: '铸火者',
  silent: '丛林猎手',
  defect: '元素魔法师',
  necrobinder: '客',
  regent: '储君',
  colorless: '无色',
  curse: '诅咒',
  status: '状态',
  event: '事件',
  quest: '任务',
  token: '衍生',
};

export const CARD_TYPE_LABELS: Record<string, string> = {
  attack: '攻击',
  skill: '技能',
  power: '能力',
  curse: '诅咒',
  status: '状态',
  quest: '任务',
};

export const CARD_RARITY_LABELS: Record<string, string> = {
  basic: '基础',
  common: '普通',
  uncommon: '罕见',
  rare: '稀有',
  ancient: '先古',
  event: '事件',
  curse: '诅咒',
  status: '状态',
  quest: '任务',
  token: '衍生',
};

export const RELIC_RARITY_LABELS: Record<string, string> = {
  basic: '初始',
  common: '普通',
  uncommon: '罕见',
  rare: '稀有',
  ancient: '先古',
  shop: '商店',
  event: '事件',
  special: '特殊',
};

export const POTION_RARITY_LABELS: Record<string, string> = {
  common: '普通',
  uncommon: '罕见',
  rare: '稀有',
  special: '特殊',
};

export const TIER_LABELS: Record<string, string> = {
  normal: '普通',
  elite: '精英',
  boss: '首领',
};

export const POWER_TYPE_LABELS: Record<string, string> = {
  buff: '增益',
  debuff: '减益',
};

export const STACK_LABELS: Record<string, string> = {
  counter: '可叠加',
  single: '唯一',
  none: '无层数',
};

export const MODIFIER_TYPE_LABELS: Record<string, string> = {
  positive: '增益',
  negative: '减益',
};

export const ACT_LABELS: Record<number, string> = {
  1: '第一幕',
  2: '第二幕',
  3: '第三幕',
};

export const POOL_LABELS: Record<string, string> = {
  shared: '通用',
  ...CLASS_LABELS,
};

export const CATEGORY_FILE: Record<CategoryId, string> = {
  cards: 'cards',
  relics: 'relics',
  monsters: 'monsters',
  powers: 'powers',
  enchantments: 'enchantments',
  potions: 'potions',
  modifiers: 'modifiers',
};

const cache = new Map<CategoryId, Promise<CategoryData>>();

export async function loadMeta(): Promise<Meta> {
  const response = await fetch('/data/meta.json');
  if (!response.ok) throw new Error(`资料版本读取失败: ${response.status}`);
  return response.json();
}

export function loadCategory<T extends CategoryData>(category: CategoryId): Promise<T> {
  if (!cache.has(category)) {
    const promise = fetch(`/data/${CATEGORY_FILE[category]}.json`).then((response) => {
      if (!response.ok) throw new Error(`资料读取失败: ${response.status}`);
      return response.json() as Promise<CategoryData>;
    });
    cache.set(category, promise);
  }
  return cache.get(category) as Promise<T>;
}

export function loadAllCategories(): Promise<Record<CategoryId, CategoryData>> {
  const entries = CATEGORIES.map(async (c) => [c.id, await loadCategory(c.id)] as const);
  return Promise.all(entries).then((pairs) => Object.fromEntries(pairs) as Record<CategoryId, CategoryData>);
}

export function itemName(item: CatalogItem): string {
  return item.name;
}

export function searchText(item: CatalogItem): string {
  const parts: string[] = [item.name];
  if ('description' in item && item.description) parts.push(item.description);
  if ('flavor' in item && item.flavor) parts.push(item.flavor);
  if ('classLabel' in item) parts.push(item.classLabel);
  if ('typeLabel' in item) parts.push(item.typeLabel);
  if ('rarityLabel' in item) parts.push(item.rarityLabel);
  if ('poolLabel' in item) parts.push(item.poolLabel);
  if ('tierLabel' in item) parts.push(item.tierLabel);
  if ('actLabel' in item) parts.push(item.actLabel, item.actSubtitle);
  if ('stackLabel' in item) parts.push(item.stackLabel);
  if ('keywords' in item) parts.push(...item.keywords.map((k) => k.label));
  if ('tags' in item) parts.push(...item.tags.map((t) => t.label));
  if ('moves' in item) parts.push(...item.moves.flatMap((m) => [m.name, m.intentLabel]));
  if ('triggers' in item) parts.push(...item.triggers.map((t) => t.label));
  if ('upgraded' in item) parts.push(item.upgraded.description);
  if ('extraCardText' in item) parts.push(item.extraCardText);
  if ('applicableLabel' in item) parts.push(item.applicableLabel);
  if ('cardTypeLabel' in item) parts.push(item.cardTypeLabel);
  if ('targetLabel' in item) parts.push(item.targetLabel);
  return parts.join(' ').toLowerCase();
}

export function matchesQuery(item: CatalogItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const terms = q.split(/\s+/).filter(Boolean);
  const text = searchText(item);
  return terms.every((term) => text.includes(term));
}

export function normalizedName(value: string): string {
  return value.replace(/[\s·・\-—:：,，.。'"“”‘’()（）]/g, '').toLowerCase();
}

export function sortItems<T extends CatalogItem>(items: T[], sort: string): T[] {
  const copy = [...items];
  if (sort === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    return copy;
  }
  if (sort === 'name-desc') {
    copy.sort((a, b) => b.name.localeCompare(a.name, 'zh-Hans-CN'));
    return copy;
  }
  if (sort === 'rarity' || sort === 'tier' || sort === 'act') {
    const order: Record<string, number> = {
      token: 0,
      basic: 1,
      common: 2,
      uncommon: 3,
      rare: 4,
      ancient: 5,
      event: 6,
      shop: 7,
      special: 8,
      normal: 1,
      elite: 2,
      boss: 3,
    };
    const field = sort === 'rarity' ? 'rarity' : sort === 'tier' ? 'tier' : 'act';
    copy.sort((a, b) => {
      const av = (a as unknown as Record<string, string | number>)[field];
      const bv = (b as unknown as Record<string, string | number>)[field];
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return (order[String(av)] ?? 99) - (order[String(bv)] ?? 99);
    });
    return copy;
  }
  if (sort === 'cost') {
    copy.sort((a, b) => {
      const av = (a as unknown as { cost?: number }).cost ?? 99;
      const bv = (b as unknown as { cost?: number }).cost ?? 99;
      return av - bv;
    });
    return copy;
  }
  if (sort === 'hp') {
    copy.sort((a, b) => {
      const av = (a as unknown as Monster).hp?.max ?? 0;
      const bv = (b as unknown as Monster).hp?.max ?? 0;
      return av - bv;
    });
    return copy;
  }
  return copy;
}

export function accentForClass(className: string): string | null {
  const accents: Record<string, string> = {
    ironclad: '#e4b669',
    silent: '#7ac480',
    defect: '#70a4e0',
    necrobinder: '#ac84d6',
    regent: '#ceb05a',
    colorless: '#b8b0a0',
    curse: '#a05a5a',
    status: '#8f9a8a',
    event: '#7fa6a0',
    quest: '#b58ad4',
    token: '#9a8f7a',
  };
  return accents[className] ?? null;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

export function hpText(hp: { min: number; max: number }): string {
  return hp.min === hp.max ? String(hp.min) : `${hp.min}–${hp.max}`;
}

export function damageText(values: number[]): string {
  if (!values.length) return '';
  if (values.length === 1) return String(values[0]);
  if (values.every((v) => v === values[0])) return `${values[0]} × ${values.length}`;
  return values.join(' + ');
}
