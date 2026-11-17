#!/usr/bin/env node
/**
 * 从《停摆之钟》游戏仓库同步资料库数据与美术资源。
 *
 * 默认读取 ../sljt-demo，可通过 GAME_ROOT 指定游戏仓库位置。
 * 产物写入 public/data 与 public/art，均为可独立部署的静态文件。
 */
import fs from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME_ROOT = path.resolve(process.env.GAME_ROOT || path.join(ROOT, '..', 'sljt-demo'));
const CONTENT = path.join(GAME_ROOT, 'data', 'content');
const ART = path.join(GAME_ROOT, 'client', 'assets', 'resources', 'art');
const OUT_DATA = path.join(ROOT, 'public', 'data');
const OUT_ART = path.join(ROOT, 'public', 'art');
const CACHE = path.join(ROOT, '.cache', 'remote');
const FORCE = process.argv.includes('--force');
const artIndex = { cards: {}, relics: {}, monsters: {}, statuses: {}, enchantments: {}, potions: {}, heroes: {} };
const MOTION_ACTIONS = ['idle', 'attack', 'defense', 'hit', 'cast', 'death'];
const MOTION_MANIFEST_DIRS = ['monster-frames-v3', 'expanded-actions-v1', 'boss-frames-v1', 'elite-frames-v1'];
const MOTION_CORE_ACTIONS = ['idle', 'attack', 'hit', 'death', 'cast'];
/** 动作精灵图单帧边长；256 在抽屉预览清晰度与仓库体积之间取平衡。 */
const MOTION_FRAME_SIZE = 256;
const motionIndex = { version: 1, frameSize: MOTION_FRAME_SIZE, monsters: {} };

await fs.mkdir(OUT_DATA, { recursive: true });
await fs.mkdir(CACHE, { recursive: true });
sharp.cache(false);

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const writeJson = async (file, value) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
};

/** 上一次同步的 art.json，用于在文件未重建时保留图片来源标记。 */
const previousArt = await readJson(path.join(OUT_DATA, 'art.json')).catch(() => null);

const CLASS_LABELS = {
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
/** 游戏 heroes.json 使用 hero id 作为 className，卡牌数据使用职业 id。 */
const HERO_CLASS_BY_ID = {
  emberforged: 'ironclad',
  apothecary: 'silent',
  clockwright: 'defect',
  lamplighter: 'necrobinder',
  regent: 'regent',
};
const CARD_TYPE_LABELS = {
  attack: '攻击',
  skill: '技能',
  power: '能力',
  curse: '诅咒',
  status: '状态',
  quest: '任务',
};
const CARD_RARITY_LABELS = {
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
  special: '特殊',
};
const RELIC_RARITY_LABELS = {
  basic: '初始',
  common: '普通',
  uncommon: '罕见',
  rare: '稀有',
  ancient: '先古',
  shop: '商店',
  event: '事件',
  special: '特殊',
};
const POTION_RARITY_LABELS = {
  common: '普通',
  uncommon: '罕见',
  rare: '稀有',
  special: '特殊',
};
const TARGET_LABELS = {
  self: '自身',
  enemy: '单体敌人',
  all: '全体敌人',
  random: '随机敌人',
  none: '无目标',
  ally: '盟友',
  allAllies: '全体盟友',
};
const KEYWORD_LABELS = {
  sly: '狡黠',
  exhaust: '消耗',
  innate: '固有',
  ethereal: '虚无',
  unplayable: '无法打出',
  eternal: '永恒',
  retain: '保留',
};
const TAG_LABELS = {
  Strike: '打击',
  OstyAttack: '奥斯提攻击',
  Defend: '防御',
  Shiv: '小刀',
  Minion: '随从',
};
const POWER_TYPE_LABELS = { buff: '增益', debuff: '减益' };
const STACK_LABELS = { counter: '可叠加', single: '唯一', none: '无层数' };
const MODIFIER_TYPE_LABELS = { positive: '增益', negative: '减益' };
const TIER_LABELS = { normal: '普通', elite: '精英', boss: '首领' };
const ACT_LABELS = {
  1: '第一幕',
  2: '第二幕',
  3: '第三幕',
};
const ACT_SUBTITLES = {
  1: '翠蚀林海 · 潮蚀港',
  2: '蛀蚀巢窟',
  3: '夜蚀王都',
};
const TRIGGER_LABELS = {
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
const PATTERN_LABELS = {
  cycle: '固定循环',
  random: '随机权重',
  conditional: '条件分支',
  mixed: '混合模式',
};
const INTENT_LABELS = {
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
  sleep: '沉睡',
  status: '状态牌',
  stun: '击晕',
  summon: '召唤',
  unknown: '未知',
};
const ENCHANT_CARD_TYPE_LABELS = {
  Attack: '攻击牌',
  Skill: '技能牌',
  Power: '能力牌',
  'Attack, Skill': '攻击牌 / 技能牌',
};
const APPLICABLE_LABELS = {
  'Defend cards': '防御牌',
  'cards that gain Block': '获得格挡的牌',
  'Basic Strike or Defend cards': '基础打击或防御牌',
};

const label = (map, key, fallback = String(key)) => map[key] ?? fallback;

function powerNameMap(powers) {
  const map = new Map();
  for (const p of powers) {
    map.set(p.id, p.name);
    map.set(p.id.replace(/^sts2_/, ''), p.name);
    if (p.sourceId) {
      map.set(String(p.sourceId), p.name);
      map.set(String(p.sourceId).toLowerCase(), p.name);
      map.set(`sts2_${String(p.sourceId).toLowerCase()}`, p.name);
    }
  }
  return (id) => {
    if (!id) return '未知状态';
    return map.get(id) || map.get(String(id).toLowerCase()) || String(id).replace(/^sts2_/, '');
  };
}

function slugArt(id) {
  return encodeURIComponent(id);
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

async function download(url) {
  const key = Buffer.from(url).toString('base64url');
  const file = path.join(CACHE, key);
  if (existsSync(file)) return fs.readFile(file);
  const res = await fetch(url, {
    headers: { 'user-agent': 'clock-of-fate-web/0.1 (+content archive)' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(file, buffer);
  return buffer;
}

/**
 * 单张图片：从本地源或远程参考图生成 WebP。
 * 本地源比产物新时会自动重建，避免替换美术后因跳过已有文件而继续用旧图。
 */
async function produceImage({ output, localCandidates = [], remoteUrl, width, fit = 'inside', quality = 82, label: name }) {
  const file = path.join(OUT_ART, output);
  const source = localCandidates.find((candidate) => existsSync(candidate));
  const fileExists = existsSync(file);
  const sourceIsNewer = source && fileExists && statSync(source).mtimeMs > statSync(file).mtimeMs;
  if (!FORCE && fileExists && !sourceIsNewer) {
    const [kind, fileName] = output.split('/');
    const previousCredit = previousArt?.[kind]?.[fileName.replace(/\.webp$/, '')]?.credit;
    return { path: `/art/${output}`, credit: previousCredit || (source || !remoteUrl ? 'local' : 'reference') };
  }
  try {
    let pipeline;
    let credit = 'local';
    if (source) {
      pipeline = sharp(source);
    } else if (remoteUrl) {
      credit = 'reference';
      pipeline = sharp(await download(remoteUrl));
    } else {
      return null;
    }
    await fs.mkdir(path.dirname(file), { recursive: true });
    await pipeline
      .resize({ width, height: fit === 'contain' ? width : undefined, fit, withoutEnlargement: true, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality, alphaQuality: 92, effort: 4 })
      .toFile(file);
    return { path: `/art/${output}`, credit };
  } catch (error) {
    console.warn(`  ! 图片失败 ${name}: ${error.message}`);
    return null;
  }
}

/** 动作清单里的帧路径有两种写法：带 `art/` 前缀或相对于 art 目录。 */
function motionFramePath(value) {
  const relative = value.startsWith('art/') ? value.slice(4) : value;
  return path.join(ART, relative);
}

function hasMotionCoreActions(actor) {
  return MOTION_CORE_ACTIONS.every((action) => {
    const frames = actor.actions?.[action]?.frames;
    return Array.isArray(frames) && frames.length > 0;
  });
}

/**
 * 把一组动作帧拼成一张精灵图，前端用 background-position 逐帧播放。
 * 同一个生物的各个动作共用同一画布尺寸，避免切换动作时角色跳动。
 */
async function produceMonsterMotion(monster, motionActors) {
  const entry = motionActors.get(monster.id);
  if (!entry) return null;
  const { actor, dir } = entry;
  const sourceWidth = Number(actor.width || actor.frameWidth || 512);
  const sourceHeight = Number(actor.height || actor.frameHeight || 512);
  if (!(sourceWidth > 0) || !(sourceHeight > 0)) return null;
  const scale = Math.min(1, MOTION_FRAME_SIZE / Math.max(sourceWidth, sourceHeight));
  const frameWidth = Math.max(1, Math.round(sourceWidth * scale));
  const frameHeight = Math.max(1, Math.round(sourceHeight * scale));
  const actions = {};

  for (const actionName of MOTION_ACTIONS) {
    const action = actor.actions?.[actionName];
    if (!action?.frames?.length) continue;
    const order = Array.isArray(action.order) && action.order.length
      ? action.order
      : action.frames.map((_, index) => index);
    const sequence = order.map((index) => action.frames[index]).filter(Boolean);
    if (!sequence.length) continue;

    const cols = Math.min(4, sequence.length);
    const rows = Math.ceil(sequence.length / cols);
    const output = `motion/${monster.id}/${actionName}.webp`;
    const file = path.join(OUT_ART, output);

    if (FORCE || !existsSync(file)) {
      try {
        const composites = [];
        for (let index = 0; index < sequence.length; index += 1) {
          const source = motionFramePath(sequence[index]);
          if (!existsSync(source)) throw new Error(`缺少帧 ${sequence[index]}`);
          const frame = await sharp(source)
            .resize(frameWidth, frameHeight, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toBuffer();
          composites.push({
            input: frame,
            left: (index % cols) * frameWidth,
            top: Math.floor(index / cols) * frameHeight,
          });
        }
        await fs.mkdir(path.dirname(file), { recursive: true });
        await sharp({
          create: {
            width: cols * frameWidth,
            height: rows * frameHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          },
        })
          .composite(composites)
          .webp({ quality: 76, alphaQuality: 88, effort: 5 })
          .toFile(file);
      } catch (error) {
        console.warn(`  ! 动作失败 ${monster.name} / ${actionName}: ${error.message}`);
        continue;
      }
    }

    actions[actionName] = {
      sheet: `/art/${output}`,
      cols,
      rows,
      frameCount: sequence.length,
      fps: Number(action.fps) > 0 ? Number(action.fps) : 8,
      loop: !!action.loop,
      holdLast: !!(action.holdLastFrame ?? action.holdLast),
    };
  }

  if (!Object.keys(actions).length) return null;
  return {
    source: dir,
    frameWidth,
    frameHeight,
    width: sourceWidth,
    height: sourceHeight,
    actions,
  };
}

const [heroes, acts, intents, encounters, cards, relics, monsters, powers, enchantments, potions, modifiers, manifest] = await Promise.all([
  readJson(path.join(GAME_ROOT, 'data', 'heroes', 'heroes.json')),
  readJson(path.join(CONTENT, 'acts.json')),
  readJson(path.join(CONTENT, 'intents.json')),
  readJson(path.join(CONTENT, 'encounters.json')),
  readJson(path.join(CONTENT, 'cards.json')),
  readJson(path.join(CONTENT, 'relics.json')),
  readJson(path.join(CONTENT, 'monsters.json')),
  readJson(path.join(CONTENT, 'powers.json')),
  readJson(path.join(CONTENT, 'enchantments.json')),
  readJson(path.join(CONTENT, 'potions.json')),
  readJson(path.join(CONTENT, 'modifiers.json')),
  readJson(path.join(GAME_ROOT, 'server', 'content', 'manifest.json')).catch(() => null),
]);

const assetsManifest = await readJson(path.join(GAME_ROOT, 'docs', 'assets', 'asset-manifest.json')).catch(() => []);
const referenceFor = (category, id) => assetsManifest.find((x) => x.category === category && x.asset_id === id)?.reference_url || '';

/* ---------------------------------------------------------------- 生物动作 */
const motionManifests = new Map(await Promise.all(
  MOTION_MANIFEST_DIRS.map(async (dir) => [
    dir,
    await readJson(path.join(ART, dir, 'manifest.json')).catch(() => null),
  ]),
));
/** 与游戏内 BattleAssets 的合并规则一致：基础帧优先，专用帧具备完整核心动作时覆盖。 */
const motionActors = new Map();
for (const dir of ['monster-frames-v3', 'expanded-actions-v1']) {
  for (const actor of motionManifests.get(dir)?.monsters ?? []) {
    motionActors.set(actor.id, { actor, dir });
  }
}
for (const dir of ['boss-frames-v1', 'elite-frames-v1']) {
  for (const actor of motionManifests.get(dir)?.monsters ?? []) {
    if (hasMotionCoreActions(actor) || !motionActors.has(actor.id)) {
      motionActors.set(actor.id, { actor, dir });
    }
  }
}

const powerName = powerNameMap(powers);
const intentMap = new Map(intents.map((x) => [x.id, x]));
const encounterMap = new Map(encounters.map((x) => [x.id, x.name]));
const heroClassName = (hero) => HERO_CLASS_BY_ID[hero.className] || hero.className;
const cardClassName = (className) => HERO_CLASS_BY_ID[className] || className;
const heroByClass = new Map();
for (const hero of heroes) {
  heroByClass.set(hero.className, hero);
  heroByClass.set(heroClassName(hero), hero);
}
const actNameMap = new Map(acts.map((a) => [a.index, a.name]));

console.log(`游戏仓库: ${GAME_ROOT}`);
console.log(`内容: ${cards.length} 卡 / ${relics.length} 遗物 / ${monsters.length} 生物 / ${powers.length} 状态 / ${enchantments.length} 附魔 / ${potions.length} 道具 / ${modifiers.length} 每日`);

/* ---------------------------------------------------------------- 英雄头像 */
const heroItems = await mapLimit(heroes, 2, async (hero) => {
  const art = await produceImage({
    output: `heroes/${slugArt(hero.id)}.webp`,
    localCandidates: [
      path.join(ART, 'hero-motion-v4-runtime', 'selection-v2', hero.id, 'portrait.png'),
      path.join(ART, 'hero-avatars-v1', `${hero.id}.png`),
    ],
    width: 192,
    quality: 86,
    label: hero.name,
  });
  if (art) artIndex.heroes[hero.id] = art;
  return {
    id: hero.id,
    name: hero.name,
    className: heroClassName(hero),
    accent: hero.accent,
    portrait: art?.path || null,
  };
});

/* ---------------------------------------------------------------- 卡牌 */
const cardItems = await mapLimit(cards, 4, async (card) => {
  const fallback = card.id.includes('mad_science') ? path.join(ART, 'card_faces', 'sts2_mad_science.png') : null;
  const art = await produceImage({
    output: `cards/${slugArt(card.id)}.webp`,
    localCandidates: [path.join(ART, 'card_faces', `${card.id}.png`), ...(fallback ? [fallback] : [])],
    remoteUrl: referenceFor('card', card.id),
    width: 640,
    quality: 80,
    label: card.name,
  });
  if (art) artIndex.cards[card.id] = art;
  const keywords = (card.keywords || []).map((k) => ({ id: k, label: label(KEYWORD_LABELS, k) }));
  const className = cardClassName(card.class);
  const hero = heroByClass.get(card.class) || heroByClass.get(className);
  return {
    id: card.id,
    name: card.name,
    type: card.type,
    typeLabel: label(CARD_TYPE_LABELS, card.type),
    rarity: card.rarity,
    rarityLabel: label(CARD_RARITY_LABELS, card.rarity),
    cost: card.cost,
    costLabel: card.xCost ? 'X' : String(card.cost),
    starCost: card.starCost ?? null,
    class: className,
    classLabel: hero?.name || label(CLASS_LABELS, className),
    classAccent: hero?.accent || null,
    target: card.target,
    targetLabel: label(TARGET_LABELS, card.target),
    description: card.description,
    upgraded: {
      description: card.upgraded?.description ?? card.description,
      cost: card.upgraded?.cost ?? card.cost,
      costLabel: card.xCost ? 'X' : String(card.upgraded?.cost ?? card.cost),
    },
    keywords,
    tags: (card.tags || []).map((t) => ({ id: t, label: label(TAG_LABELS, t) })),
    exhaust: !!card.exhaust,
    ethereal: !!card.ethereal,
    unplayable: !!card.unplayable,
    innate: (card.keywords || []).includes('innate'),
    retain: (card.keywords || []).includes('retain'),
    multiplayerOnly: !!card.multiplayerOnly,
    flavor: card.flavor || '',
    special: card.special || null,
    art: art?.path || null,
    artCredit: art?.credit || null,
    referenceUrl: card.image ? `https://spire-codex.com${card.image}` : '',
  };
});

/* ---------------------------------------------------------------- 遗物 */
const relicItems = await mapLimit(relics, 4, async (relic) => {
  const art = await produceImage({
    output: `relics/${slugArt(relic.id)}.webp`,
    localCandidates: [
      path.join(ART, 'relics', `${relic.icon}.png`),
      path.join(ART, 'relics', `${relic.id}.png`),
    ],
    remoteUrl: referenceFor('relic', relic.id),
    width: 256,
    quality: 84,
    label: relic.name,
  });
  if (art) artIndex.relics[relic.id] = art;
  const triggers = (relic.triggers || []).map((t) => ({
    trigger: t.trigger,
    label: label(TRIGGER_LABELS, t.trigger, t.trigger),
    effects: (t.effects || []).length,
  }));
  const pool = relic.pool === 'shared' ? 'shared' : cardClassName(relic.pool);
  return {
    id: relic.id,
    name: relic.name,
    rarity: relic.rarity,
    rarityLabel: relic.rarityLabel || label(RELIC_RARITY_LABELS, relic.rarity),
    description: relic.description,
    flavor: relic.flavor || '',
    price: relic.price ?? 0,
    pool,
    poolLabel: pool === 'shared' ? '通用' : heroByClass.get(relic.pool)?.name || label(CLASS_LABELS, pool),
    triggers,
    art: art?.path || null,
    artCredit: art?.credit || null,
    referenceUrl: relic.image ? `https://spire-codex.com${relic.image}` : '',
  };
});

/* ---------------------------------------------------------------- 生物 */
const monsterLookup = new Map(monsters.map((m) => [m.id, m]));
const monsterItems = await mapLimit(monsters, 4, async (monster) => {
  const segmentBase = 'expanded-actions-v1/sts2_decimillipede_segment/idle_00.png';
  const localCandidates = [
    path.join(ART, 'monster-frames-v3', monster.id, 'still.png'),
    path.join(ART, 'units', `${monster.id}.png`),
    path.join(ART, 'expanded-actions-v1', monster.id, 'idle_00.png'),
    ...(monster.id.includes('decimillipede_segment') ? [path.join(ART, segmentBase)] : []),
  ];
  const art = await produceImage({
    output: `monsters/${slugArt(monster.id)}.webp`,
    localCandidates,
    remoteUrl: referenceFor('monster', monster.id) || (monster.image ? `https://spire-codex.com${monster.image}` : ''),
    width: 512,
    fit: 'contain',
    quality: 84,
    label: monster.name,
  });
  if (art) artIndex.monsters[monster.id] = art;

  const motion = await produceMonsterMotion(monster, motionActors);
  if (motion) motionIndex.monsters[monster.id] = motion;

  const moves = (monster.moves || []).map((move) => {
    const intent = intentMap.get(move.intent);
    return {
      id: move.id,
      name: move.name,
      intent: move.intent,
      intentLabel: intent?.name || label(INTENT_LABELS, move.intent, move.intent || '未知'),
      damage: move.damage || [],
      damageAscension: move.damageAscension || [],
      block: move.block ?? null,
      powers: (move.powers || []).map((p) => ({ id: p.status, name: powerName(p.status), stacks: p.stacks ?? 1 })),
      effects: (move.effects || []).length,
    };
  });
  const moveName = new Map(moves.map((m) => [m.id, m.name]));

  const pattern = monster.attackPattern;
  let sequence = [];
  if (pattern?.type === 'cycle' && pattern.states?.length) {
    const byId = new Map(pattern.states.map((s) => [s.id, s]));
    let state = byId.get(pattern.initialState) || pattern.states.find((s) => s.type === 'move') || pattern.states[0];
    const seen = new Set();
    for (let i = 0; i < 12 && state; i += 1) {
      if (seen.has(state.id)) break;
      seen.add(state.id);
      if (state.moveId) sequence.push(moveName.get(state.moveId) || state.moveId);
      state = state.next ? byId.get(state.next) : undefined;
    }
  } else if (pattern?.states?.length) {
    sequence = [...new Set(pattern.states.filter((s) => s.moveId).map((s) => moveName.get(s.moveId) || s.moveId))];
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
    innatePowers: (monster.innatePowers || []).map((p) => ({ id: p.status, name: powerName(p.status), stacks: p.stacks ?? 1 })),
    innatePowersAscension: (monster.innatePowersAscension || []).map((p) => ({ id: p.status, name: powerName(p.status), stacks: p.stacks ?? 1 })),
    pattern: pattern
      ? {
          type: pattern.type,
          typeLabel: label(PATTERN_LABELS, pattern.type, pattern.type),
          description: pattern.description || '',
          sequence,
        }
      : null,
    encounters: (monster.encounters || []).map((id) => ({ id, name: encounterMap.get(id) || id })),
    art: art?.path || null,
    artCredit: art?.credit || null,
    referenceUrl: monster.image ? `https://spire-codex.com${monster.image}` : '',
  };
});

/* ---------------------------------------------------------------- 状态 */
const powerItems = await mapLimit(powers, 4, async (power) => {
  const art = await produceImage({
    output: `statuses/${slugArt(power.id)}.webp`,
    localCandidates: [
      path.join(ART, 'ui', `status_${power.id}.png`),
      path.join(ART, 'ui', `status_sts2_${power.id}.png`),
      path.join(ART, 'ui', `status_sts2_${power.id.replace(/_/g, '')}.png`),
    ],
    remoteUrl: referenceFor('status', power.id),
    width: 128,
    quality: 86,
    label: power.name,
  });
  if (art) artIndex.statuses[power.id] = art;
  return {
    id: power.id,
    name: power.name,
    type: power.type,
    typeLabel: label(POWER_TYPE_LABELS, power.type),
    stackType: power.stackType,
    stackLabel: label(STACK_LABELS, power.stackType),
    description: power.description,
    art: art?.path || null,
    artCredit: art?.credit || null,
    referenceUrl: power.image ? `https://spire-codex.com${power.image}` : '',
  };
});

/* ---------------------------------------------------------------- 附魔 */
const enchantItems = await mapLimit(enchantments, 4, async (enchant) => {
  const art = await produceImage({
    output: `enchantments/${slugArt(enchant.id)}.webp`,
    localCandidates: [path.join(ART, 'enchantments', `${enchant.id}.png`)],
    remoteUrl: referenceFor('enchantment', enchant.id),
    width: 192,
    quality: 86,
    label: enchant.name,
  });
  if (art) artIndex.enchantments[enchant.id] = art;
  return {
    id: enchant.id,
    name: enchant.name,
    description: enchant.description,
    extraCardText: enchant.extraCardText || '',
    stackable: !!enchant.stackable,
    cardType: enchant.cardType || '',
    cardTypeLabel: enchant.cardType ? label(ENCHANT_CARD_TYPE_LABELS, enchant.cardType, enchant.cardType) : '',
    applicableTo: enchant.applicableTo || '',
    applicableLabel: enchant.applicableTo ? label(APPLICABLE_LABELS, enchant.applicableTo, enchant.applicableTo) : '',
    art: art?.path || null,
    artCredit: art?.credit || null,
    referenceUrl: enchant.image ? `https://spire-codex.com${enchant.image}` : '',
  };
});

/* ---------------------------------------------------------------- 道具 */
const potionItems = await mapLimit(potions, 4, async (potion) => {
  const art = await produceImage({
    output: `potions/${slugArt(potion.id)}.webp`,
    localCandidates: [
      path.join(ART, 'potions', `${potion.icon}.png`),
      path.join(ART, 'potions', `${potion.id}.png`),
    ],
    remoteUrl: referenceFor('potion', potion.id),
    width: 192,
    quality: 86,
    label: potion.name,
  });
  if (art) artIndex.potions[potion.id] = art;
  const pool = potion.pool === 'shared' ? 'shared' : cardClassName(potion.pool);
  return {
    id: potion.id,
    name: potion.name,
    rarity: potion.rarity,
    rarityLabel: potion.rarityLabel || label(POTION_RARITY_LABELS, potion.rarity),
    price: potion.price ?? 0,
    description: potion.description,
    target: potion.target,
    targetLabel: label(TARGET_LABELS, potion.target),
    pool,
    poolLabel: pool === 'shared' ? '通用' : heroByClass.get(potion.pool)?.name || label(CLASS_LABELS, pool),
    usableOutsideBattle: !!potion.usableOutsideBattle,
    art: art?.path || null,
    artCredit: art?.credit || null,
    referenceUrl: potion.image ? `https://spire-codex.com${potion.image}` : '',
  };
});

/* ---------------------------------------------------------------- 每日挑战 */
const modifierItems = modifiers.map((modifier) => ({
  id: modifier.id,
  name: modifier.name,
  description: modifier.description,
  type: modifier.type,
  typeLabel: label(MODIFIER_TYPE_LABELS, modifier.type),
}));

const meta = {
  version: manifest?.version || new Date().toISOString().slice(0, 10),
  contentHash: manifest?.hash || null,
  builtAt: new Date().toISOString(),
  gameVersion: cards[0]?.source?.version || 'v0.111.0',
  counts: {
    cards: cardItems.length,
    relics: relicItems.length,
    monsters: monsterItems.length,
    powers: powerItems.length,
    enchantments: enchantItems.length,
    potions: potionItems.length,
    modifiers: modifierItems.length,
  },
  heroes: heroItems,
  acts: acts.map((a) => ({ id: a.id, name: a.name, index: a.index })),
};

await Promise.all([
  writeJson(path.join(OUT_DATA, 'meta.json'), meta),
  writeJson(path.join(OUT_DATA, 'art.json'), artIndex),
  writeJson(path.join(OUT_DATA, 'motions.json'), { ...motionIndex, generatedAt: new Date().toISOString() }),
  writeJson(path.join(OUT_DATA, 'cards.json'), cardItems),
  writeJson(path.join(OUT_DATA, 'relics.json'), relicItems),
  writeJson(path.join(OUT_DATA, 'monsters.json'), monsterItems),
  writeJson(path.join(OUT_DATA, 'powers.json'), powerItems),
  writeJson(path.join(OUT_DATA, 'enchantments.json'), enchantItems),
  writeJson(path.join(OUT_DATA, 'potions.json'), potionItems),
  writeJson(path.join(OUT_DATA, 'modifiers.json'), modifierItems),
]);

const artCount = async (dir) => {
  try {
    const entries = await fs.readdir(path.join(OUT_ART, dir));
    return entries.filter((x) => x.endsWith('.webp')).length;
  } catch {
    return 0;
  }
};
console.log('图片:', {
  cards: await artCount('cards'),
  heroes: await artCount('heroes'),
  relics: await artCount('relics'),
  monsters: await artCount('monsters'),
  statuses: await artCount('statuses'),
  enchantments: await artCount('enchantments'),
  potions: await artCount('potions'),
});
console.log('动作:', {
  monsters: Object.keys(motionIndex.monsters).length,
  actions: Object.values(motionIndex.monsters).reduce((sum, entry) => sum + Object.keys(entry.actions).length, 0),
  frameSize: MOTION_FRAME_SIZE,
});
console.log('完成:', path.relative(ROOT, OUT_DATA), path.relative(ROOT, OUT_ART));
