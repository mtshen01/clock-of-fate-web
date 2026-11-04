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
  ironclad: '誓火骑士',
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

const TARGET_LABELS: Record<string, string> = {
  self: '自身',
  enemy: '单体敌人',
  all: '全体敌人',
  random: '随机敌人',
  none: '无目标',
  ally: '盟友',
  allAllies: '全体盟友',
};

const KEYWORD_LABELS: Record<string, string> = {
  sly: '狡黠',
  exhaust: '消耗',
  innate: '固有',
  ethereal: '虚无',
  unplayable: '无法打出',
  eternal: '永恒',
  retain: '保留',
};

const TAG_LABELS: Record<string, string> = {
  Strike: '打击',
  OstyAttack: '奥斯提攻击',
  Defend: '防御',
  Shiv: '小刀',
  Minion: '随从',
};

const ACT_SUBTITLES: Record<number, string> = {
  1: '翠蚀林海 · 潮蚀港',
  2: '蛀蚀巢窟',
  3: '夜蚀王都',
};

const TRIGGER_LABELS: Record<string, string> = {
  onBattleStart: '战斗开始',
  onPlayerTurnEnd: '玩家回合结束',
  onPlayerTurnStart: '玩家回合开始',
  onShuffle: '牌堆洗牌',
  onBattleVictory: '战斗胜利',
  onCardResolved: '卡牌结算',
  onEnemyDoomDeath: '敌人灾厄死亡',
  onExhausted: '卡牌消耗',
  onDamaged: '受到伤害',
  onHpLost: '失去生命',
  onStarSpent: '消耗星辉',
  onEnemyDeath: '敌人死亡',
  onBlockBroken: '格挡破碎',
  onOrbChanneled: '充能球激发',
  onCardPlayStarted: '开始打出卡牌',
  onCardGenerated: '生成卡牌',
  onPotionUsed: '使用药水',
  onCardDiscarded: '弃牌',
};

const PATTERN_LABELS: Record<string, string> = {
  cycle: '固定循环',
  random: '随机权重',
  conditional: '条件分支',
  mixed: '混合模式',
};

const INTENT_LABELS: Record<string, string> = {
  attack: '攻击',
  attack_block: '攻击 · 格挡',
  attack_debuff: '攻击 · 减益',
  attack_defend: '攻击 · 防御',
  block: '格挡',
  defend: '格挡',
  buff: '强化',
  debuff: '减益',
  debuff_strong: '强减益',
  card_debuff: '侵蚀',
  death_blow: '濒死一击',
  escape: '逃跑',
  heal: '回复',
  summon: '召唤',
  stun: '击晕',
};

const ENCHANT_CARD_TYPE_LABELS: Record<string, string> = {
  Attack: '攻击牌',
  Skill: '技能牌',
  Power: '能力牌',
  'Attack, Skill': '攻击牌 / 技能牌',
};

const APPLICABLE_LABELS: Record<string, string> = {
  'Defend cards': '防御牌',
  'cards that gain Block': '获得格挡的牌',
  'Basic Strike or Defend cards': '基础打击或防御牌',
};

function label(map: Record<string | number, string>, key: string | number, fallback = String(key)): string {
  return map[key] ?? fallback;
}

function section<T>(data: Record<string, unknown>, key: string): T[] {
  const value = data[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

function artPath(kind: string, id: string): string {
  return `/art/${kind}/${encodeURIComponent(id)}.webp`;
}

function sourceUrl(image?: string): string {
  return image ? `https://spire-codex.com${image}` : '';
}

interface RawCardUpgrade {
  description?: string;
  cost?: number;
}

interface RawCard {
  id: string;
  name: string;
  type: string;
  rarity: string;
  cost: number;
  target: string;
  class: string;
  description: string;
  keywords?: string[];
  tags?: string[];
  exhaust?: boolean;
  ethereal?: boolean;
  unplayable?: boolean;
  multiplayerOnly?: boolean;
  flavor?: string;
  special?: string;
  xCost?: boolean;
  starCost?: number;
  upgraded?: RawCardUpgrade;
  image?: string;
  source?: { version?: string };
}

interface RawRelicTrigger {
  trigger: string;
  effects?: unknown[];
}

interface RawRelic {
  id: string;
  name: string;
  rarity: string;
  rarityLabel?: string;
  description: string;
  flavor?: string;
  price?: number;
  pool: string;
  triggers?: RawRelicTrigger[];
  image?: string;
}

interface RawPowerRef {
  status: string;
  stacks?: number;
}

interface RawMonsterMove {
  id: string;
  name: string;
  intent: string;
  damage?: number[];
  damageAscension?: number[];
  block?: number | null;
  powers?: RawPowerRef[];
  effects?: unknown[];
}

interface RawAttackPatternState {
  id: string;
  type?: string;
  moveId?: string;
  next?: string;
}

interface RawAttackPattern {
  type: string;
  description?: string;
  initialState?: string;
  states?: RawAttackPatternState[];
}

interface RawMonster {
  id: string;
  name: string;
  act: number;
  tier: string;
  hp: { min: number; max: number };
  hpAscension?: { min: number; max: number };
  moves?: RawMonsterMove[];
  innatePowers?: RawPowerRef[];
  innatePowersAscension?: RawPowerRef[];
  attackPattern?: RawAttackPattern;
  encounters?: string[];
  image?: string;
}

interface RawPower {
  id: string;
  name: string;
  type: string;
  stackType: string;
  description: string;
  image?: string;
  sourceId?: string;
}

interface RawEnchantment {
  id: string;
  name: string;
  description: string;
  extraCardText?: string;
  stackable?: boolean;
  cardType?: string;
  applicableTo?: string;
  image?: string;
}

interface RawPotion {
  id: string;
  name: string;
  rarity: string;
  rarityLabel?: string;
  price?: number;
  description: string;
  target: string;
  pool: string;
  usableOutsideBattle?: boolean;
  image?: string;
}

interface RawModifier {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface RawHero {
  id: string;
  name: string;
  className: string;
  accent: number[];
}

interface RawAct {
  id: string;
  name: string;
  index: number;
}

interface RawIntent {
  id: string;
  name: string;
}

interface RawEncounter {
  id: string;
  name: string;
}

interface ContentBundle {
  schema: number;
  version: string;
  hash: string;
  builtAt: string;
  counts: Record<string, number>;
  data: Record<string, unknown>;
}

interface NormalizedContent {
  meta: Meta;
  categories: Record<CategoryId, CategoryData>;
}

type ArtCredit = 'local' | 'reference';
type ArtIndex = Record<string, Record<string, { path: string; credit: ArtCredit }>>;

function artInfo(
  index: ArtIndex | undefined,
  kind: string,
  id: string,
): { art: string | null; artCredit: ArtCredit | null } {
  if (!index) return { art: artPath(kind, id), artCredit: 'local' };
  const entry = index[kind]?.[id];
  return entry ? { art: entry.path, artCredit: entry.credit } : { art: null, artCredit: null };
}

function powerNameMap(powers: RawPower[]): (id: string) => string {
  const map = new Map<string, string>();
  for (const power of powers) {
    map.set(power.id, power.name);
    map.set(power.id.replace(/^sts2_/, ''), power.name);
    if (power.sourceId) {
      map.set(String(power.sourceId), power.name);
      map.set(String(power.sourceId).toLowerCase(), power.name);
      map.set(`sts2_${String(power.sourceId).toLowerCase()}`, power.name);
    }
  }
  return (id) => {
    if (!id) return '未知状态';
    return map.get(id) || map.get(String(id).toLowerCase()) || String(id).replace(/^sts2_/, '');
  };
}

/**
 * 服务端 /api/content/bundle 返回的是游戏原始数据；这里做与
 * scripts/sync-content.mjs 相同的展示层归一化，保证线上资料库
 * 的卡名、文案、数值始终以接口为准。
 */
export function normalizeContentBundle(bundle: ContentBundle, artIndex?: ArtIndex): NormalizedContent {
  if (bundle.schema !== 1 || !bundle.data) {
    throw new Error('内容接口返回格式不正确');
  }

  const cards = section<RawCard>(bundle.data, 'content/cards');
  const relics = section<RawRelic>(bundle.data, 'content/relics');
  const monsters = section<RawMonster>(bundle.data, 'content/monsters');
  const powers = section<RawPower>(bundle.data, 'content/powers');
  const enchantments = section<RawEnchantment>(bundle.data, 'content/enchantments');
  const potions = section<RawPotion>(bundle.data, 'content/potions');
  const modifiers = section<RawModifier>(bundle.data, 'content/modifiers');
  const heroes = section<RawHero>(bundle.data, 'heroes/heroes');
  const acts = section<RawAct>(bundle.data, 'content/acts');
  const intents = section<RawIntent>(bundle.data, 'content/intents');
  const encounters = section<RawEncounter>(bundle.data, 'content/encounters');

  const heroByClass = new Map(heroes.map((hero) => [hero.className, hero]));
  const actNameMap = new Map(acts.map((act) => [act.index, act.name]));
  const intentMap = new Map(intents.map((intent) => [intent.id, intent]));
  const encounterMap = new Map(encounters.map((encounter) => [encounter.id, encounter.name]));
  const powerName = powerNameMap(powers);

  const cardItems: Card[] = cards.map((card) => ({
    id: card.id,
    name: card.name,
    type: card.type,
    typeLabel: label(CARD_TYPE_LABELS, card.type),
    rarity: card.rarity,
    rarityLabel: label(CARD_RARITY_LABELS, card.rarity),
    cost: card.cost,
    costLabel: card.xCost ? 'X' : String(card.cost),
    starCost: card.starCost ?? null,
    class: card.class,
    classLabel: heroByClass.get(card.class)?.name || label(CLASS_LABELS, card.class),
    classAccent: heroByClass.get(card.class)?.accent || null,
    target: card.target,
    targetLabel: label(TARGET_LABELS, card.target),
    description: card.description,
    upgraded: {
      description: card.upgraded?.description ?? card.description,
      cost: card.upgraded?.cost ?? card.cost,
      costLabel: card.xCost ? 'X' : String(card.upgraded?.cost ?? card.cost),
    },
    keywords: (card.keywords ?? []).map((keyword) => ({ id: keyword, label: label(KEYWORD_LABELS, keyword) })),
    tags: (card.tags ?? []).map((tag) => ({ id: tag, label: label(TAG_LABELS, tag) })),
    exhaust: !!card.exhaust,
    ethereal: !!card.ethereal,
    unplayable: !!card.unplayable,
    innate: (card.keywords ?? []).includes('innate'),
    retain: (card.keywords ?? []).includes('retain'),
    multiplayerOnly: !!card.multiplayerOnly,
    flavor: card.flavor || '',
    special: card.special || null,
    art: artInfo(artIndex, 'cards', card.id).art,
    artCredit: artInfo(artIndex, 'cards', card.id).artCredit,
    referenceUrl: sourceUrl(card.image),
  }));

  const relicItems: Relic[] = relics.map((relic) => ({
    id: relic.id,
    name: relic.name,
    rarity: relic.rarity,
    rarityLabel: relic.rarityLabel || label(RELIC_RARITY_LABELS, relic.rarity),
    description: relic.description,
    flavor: relic.flavor || '',
    price: relic.price ?? 0,
    pool: relic.pool,
    poolLabel: relic.pool === 'shared' ? '通用' : heroByClass.get(relic.pool)?.name || label(CLASS_LABELS, relic.pool),
    triggers: (relic.triggers ?? []).map((trigger) => ({
      trigger: trigger.trigger,
      label: label(TRIGGER_LABELS, trigger.trigger, trigger.trigger),
      effects: (trigger.effects ?? []).length,
    })),
    art: artInfo(artIndex, 'relics', relic.id).art,
    artCredit: artInfo(artIndex, 'relics', relic.id).artCredit,
    referenceUrl: sourceUrl(relic.image),
  }));

  const monsterItems: Monster[] = monsters.map((monster) => {
    const moves = (monster.moves ?? []).map((move) => {
      const intent = intentMap.get(move.intent);
      return {
        id: move.id,
        name: move.name,
        intent: move.intent,
        intentLabel: intent?.name || label(INTENT_LABELS, move.intent, move.intent || '未知'),
        damage: move.damage || [],
        damageAscension: move.damageAscension || [],
        block: move.block ?? null,
        powers: (move.powers ?? []).map((power) => ({
          id: power.status,
          name: powerName(power.status),
          stacks: power.stacks ?? 1,
        })),
        effects: (move.effects ?? []).length,
      };
    });
    const moveName = new Map(moves.map((move) => [move.id, move.name]));
    const pattern = monster.attackPattern;
    let sequence: string[] = [];
    if (pattern?.type === 'cycle' && pattern.states?.length) {
      const byId = new Map(pattern.states.map((state) => [state.id, state]));
      let state: RawAttackPatternState | undefined =
        byId.get(pattern.initialState ?? '') || pattern.states.find((entry) => entry.type === 'move') || pattern.states[0];
      const seen = new Set<string>();
      for (let index = 0; index < 12 && state; index += 1) {
        if (seen.has(state.id)) break;
        seen.add(state.id);
        if (state.moveId) sequence.push(moveName.get(state.moveId) || state.moveId);
        state = state.next ? byId.get(state.next) : undefined;
      }
    } else if (pattern?.states?.length) {
      sequence = [
        ...new Set(
          pattern.states
            .filter((state) => !!state.moveId)
            .map((state) => moveName.get(state.moveId!) || state.moveId!),
        ),
      ];
    }

    return {
      id: monster.id,
      name: monster.name,
      act: monster.act,
      actLabel: label(ACT_LABELS, monster.act, `第 ${monster.act} 幕`),
      actSubtitle: label(ACT_SUBTITLES, monster.act, actNameMap.get(monster.act - 1) || ''),
      tier: monster.tier,
      tierLabel: label(TIER_LABELS, monster.tier),
      hp: monster.hp,
      hpAscension: monster.hpAscension || null,
      moves,
      innatePowers: (monster.innatePowers ?? []).map((power) => ({
        id: power.status,
        name: powerName(power.status),
        stacks: power.stacks ?? 1,
      })),
      innatePowersAscension: (monster.innatePowersAscension ?? []).map((power) => ({
        id: power.status,
        name: powerName(power.status),
        stacks: power.stacks ?? 1,
      })),
      pattern: pattern
        ? {
            type: pattern.type,
            typeLabel: label(PATTERN_LABELS, pattern.type, pattern.type),
            description: pattern.description || '',
            sequence,
          }
        : null,
      encounters: (monster.encounters ?? []).map((id) => ({ id, name: encounterMap.get(id) || id })),
      art: artInfo(artIndex, 'monsters', monster.id).art,
      artCredit: artInfo(artIndex, 'monsters', monster.id).artCredit,
      referenceUrl: sourceUrl(monster.image),
    };
  });

  const powerItems: Power[] = powers.map((power) => ({
    id: power.id,
    name: power.name,
    type: power.type,
    typeLabel: label(POWER_TYPE_LABELS, power.type),
    stackType: power.stackType,
    stackLabel: label(STACK_LABELS, power.stackType),
    description: power.description,
    art: artInfo(artIndex, 'statuses', power.id).art,
    artCredit: artInfo(artIndex, 'statuses', power.id).artCredit,
    referenceUrl: sourceUrl(power.image),
  }));

  const enchantmentItems: Enchantment[] = enchantments.map((enchantment) => ({
    id: enchantment.id,
    name: enchantment.name,
    description: enchantment.description,
    extraCardText: enchantment.extraCardText || '',
    stackable: !!enchantment.stackable,
    cardType: enchantment.cardType || '',
    cardTypeLabel: enchantment.cardType
      ? label(ENCHANT_CARD_TYPE_LABELS, enchantment.cardType, enchantment.cardType)
      : '',
    applicableTo: enchantment.applicableTo || '',
    applicableLabel: enchantment.applicableTo
      ? label(APPLICABLE_LABELS, enchantment.applicableTo, enchantment.applicableTo)
      : '',
    art: artInfo(artIndex, 'enchantments', enchantment.id).art,
    artCredit: artInfo(artIndex, 'enchantments', enchantment.id).artCredit,
    referenceUrl: sourceUrl(enchantment.image),
  }));

  const potionItems: Potion[] = potions.map((potion) => ({
    id: potion.id,
    name: potion.name,
    rarity: potion.rarity,
    rarityLabel: potion.rarityLabel || label(POTION_RARITY_LABELS, potion.rarity),
    price: potion.price ?? 0,
    description: potion.description,
    target: potion.target,
    targetLabel: label(TARGET_LABELS, potion.target),
    pool: potion.pool,
    poolLabel: potion.pool === 'shared' ? '通用' : heroByClass.get(potion.pool)?.name || label(CLASS_LABELS, potion.pool),
    usableOutsideBattle: !!potion.usableOutsideBattle,
    art: artInfo(artIndex, 'potions', potion.id).art,
    artCredit: artInfo(artIndex, 'potions', potion.id).artCredit,
    referenceUrl: sourceUrl(potion.image),
  }));

  const modifierItems: Modifier[] = modifiers.map((modifier) => ({
    id: modifier.id,
    name: modifier.name,
    description: modifier.description,
    type: modifier.type,
    typeLabel: label(MODIFIER_TYPE_LABELS, modifier.type),
  }));

  return {
    meta: {
      version: bundle.version,
      contentHash: bundle.hash,
      builtAt: bundle.builtAt,
      gameVersion: cards[0]?.source?.version || 'v0.111.0',
      counts: {
        cards: cardItems.length,
        relics: relicItems.length,
        monsters: monsterItems.length,
        powers: powerItems.length,
        enchantments: enchantmentItems.length,
        potions: potionItems.length,
        modifiers: modifierItems.length,
      },
      heroes: heroes.map((hero) => ({
        id: hero.id,
        name: hero.name,
        className: hero.className,
        accent: hero.accent,
      })),
      acts: acts.map((act) => ({ id: act.id, name: act.name, index: act.index })),
    },
    categories: {
      cards: cardItems,
      relics: relicItems,
      monsters: monsterItems,
      powers: powerItems,
      enchantments: enchantmentItems,
      potions: potionItems,
      modifiers: modifierItems,
    },
  };
}

const staticCache = new Map<CategoryId, Promise<CategoryData>>();
const API_BASE = ((import.meta.env?.VITE_CONTENT_API as string | undefined) || '/api/content').replace(/\/$/, '');
let apiContent: Promise<NormalizedContent> | null = null;

async function loadArtIndex(): Promise<ArtIndex | undefined> {
  try {
    const response = await fetch('/data/art.json');
    if (!response.ok) return undefined;
    return (await response.json()) as ArtIndex;
  } catch {
    return undefined;
  }
}

function loadApiContent(): Promise<NormalizedContent> {
  if (!apiContent) {
    apiContent = Promise.all([
      fetch(`${API_BASE}/bundle`, { headers: { accept: 'application/json' } }),
      loadArtIndex(),
    ])
      .then(async ([response, artIndex]) => {
        if (!response.ok) throw new Error(`内容接口读取失败: ${response.status}`);
        return normalizeContentBundle((await response.json()) as ContentBundle, artIndex);
      })
      .catch((error: unknown) => {
        apiContent = null;
        throw error;
      });
  }
  return apiContent;
}

function loadStaticCategory<T extends CategoryData>(category: CategoryId): Promise<T> {
  if (!staticCache.has(category)) {
    const promise = fetch(`/data/${CATEGORY_FILE[category]}.json`).then((response) => {
      if (!response.ok) throw new Error(`资料读取失败: ${response.status}`);
      return response.json() as Promise<CategoryData>;
    });
    staticCache.set(category, promise);
  }
  return staticCache.get(category) as Promise<T>;
}

export async function loadMeta(): Promise<Meta> {
  try {
    return (await loadApiContent()).meta;
  } catch {
    const response = await fetch('/data/meta.json');
    if (!response.ok) throw new Error(`资料版本读取失败: ${response.status}`);
    return response.json() as Promise<Meta>;
  }
}

export function loadCategory<T extends CategoryData>(category: CategoryId): Promise<T> {
  return loadApiContent()
    .then((content) => content.categories[category] as T)
    .catch(() => loadStaticCategory<T>(category));
}

export function loadAllCategories(): Promise<Record<CategoryId, CategoryData>> {
  return loadApiContent()
    .then((content) => content.categories)
    .catch(() =>
      Promise.all(CATEGORIES.map(async (category) => [category.id, await loadStaticCategory(category.id)] as const)).then(
        (pairs) => Object.fromEntries(pairs) as Record<CategoryId, CategoryData>,
      ),
    );
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
