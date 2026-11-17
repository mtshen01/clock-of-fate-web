import { useEffect, useRef, useState } from 'react';
import {
  CATEGORY_BY_ID,
  damageText,
  hpText,
  type Card,
  type CategoryId,
  type Enchantment,
  type Modifier,
  type Monster,
  type MotionActionId,
  type Potion,
  type Power,
  type Relic,
} from '../data';
import { MOTION_LABELS, availableMotionActions, motionActionForIntent } from '../motion';
import { ArrowLeftIcon, ArrowRightIcon, CategoryGlyph, CloseIcon, ExternalIcon, PlayIcon, ReplayIcon } from './Icons';
import { MonsterMotionStage, useMonsterMotion } from './MonsterMotion';

type DrawerItem = Card | Monster | Relic | Power | Enchantment | Potion | Modifier;

const ITEM_UNITS: Record<CategoryId, string> = {
  cards: '张',
  relics: '件',
  monsters: '只',
  powers: '个',
  enchantments: '个',
  potions: '瓶',
  modifiers: '条',
};

interface DetailDrawerProps {
  category: CategoryId;
  item: DrawerItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  index: number;
  total: number;
}

function SourceLink({ url, credit }: { url?: string; credit?: 'local' | 'reference' | null }) {
  return (
    <div className="detail-source">
      <span>
        资料来源：社区整理 · 游戏内容版本 {credit === 'reference' ? '（配图为原始参考图）' : ''}
      </span>
      {url && (
        <a href={url} target="_blank" rel="noreferrer">
          查看原始条目
          <ExternalIcon />
        </a>
      )}
    </div>
  );
}

function DataGrid({ rows }: { rows: Array<{ label: string; value: React.ReactNode }> }) {
  const visible = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '');
  if (!visible.length) return null;
  return (
    <dl className="data-grid">
      {visible.map((row) => (
        <div key={row.label} className="data-row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function TagRow({ children }: { children: React.ReactNode }) {
  return <div className="tag-row">{children}</div>;
}

function CardDetail({ card }: { card: Card }) {
  const flags = [
    card.exhaust && '消耗',
    card.ethereal && '虚无',
    card.innate && '固有',
    card.retain && '保留',
    card.unplayable && '无法打出',
    card.multiplayerOnly && '多人限定',
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="drawer-hero drawer-hero--card" data-rarity={card.rarity}>
        <div className="drawer-art">
          {card.art ? <img src={card.art} alt={card.name} /> : <CategoryGlyph id="cards" />}
        </div>
        <span className="drawer-cost" aria-label={`费用 ${card.costLabel}`}>
          {card.costLabel}
        </span>
        {card.starCost !== null && card.starCost > 0 && <span className="drawer-star">✦ {card.starCost} 星辉</span>}
      </div>

      <header className="drawer-header">
        <div className="drawer-eyebrow">
          {card.classLabel} <span>/</span> {card.typeLabel} <span>/</span> {card.rarityLabel}
        </div>
        <h2>{card.name}</h2>
        <TagRow>
          <span className="tag tag--type" data-type={card.type}>
            {card.typeLabel}
          </span>
          <span className="tag tag--rarity" data-rarity={card.rarity}>
            {card.rarityLabel}
          </span>
          <span className="tag">{card.costLabel} 费</span>
          {flags.map((flag) => (
            <span className="tag" key={flag}>
              {flag}
            </span>
          ))}
        </TagRow>
      </header>

      <div className="compare-grid">
        <section className="text-panel">
          <h3>
            基础 <small>BASE</small>
          </h3>
          <p>{card.description || '这张牌没有文字说明。'}</p>
        </section>
        <section className="text-panel is-upgraded">
          <h3>
            升级 <small>UPGRADED</small>
          </h3>
          <p>{card.upgraded.description || card.description || '升级后没有额外变化。'}</p>
          {card.upgraded.costLabel !== card.costLabel && <span className="panel-note">费用变为 {card.upgraded.costLabel}</span>}
          {card.upgraded.costLabel === card.costLabel && card.upgraded.description === card.description && (
            <span className="panel-note">升级不改变卡面文字与费用</span>
          )}
        </section>
      </div>

      <DataGrid
        rows={[
          { label: '职业', value: card.classLabel },
          { label: '类型', value: card.typeLabel },
          { label: '稀有度', value: card.rarityLabel },
          { label: '目标', value: card.targetLabel },
          { label: '关键词', value: card.keywords.map((k) => k.label).join(' · ') },
          { label: '标签', value: card.tags.map((t) => t.label).join(' · ') },
          { label: '特殊机制', value: card.special ? '有（运行时特殊结算）' : '' },
        ]}
      />

      {card.flavor && <blockquote className="flavor-text">“{card.flavor}”</blockquote>}
      <SourceLink url={card.referenceUrl} credit={card.artCredit} />
    </>
  );
}

function MonsterDetail({ monster }: { monster: Monster }) {
  const motion = useMonsterMotion(monster.id);
  const actions = motion ? availableMotionActions(motion) : [];
  const [action, setAction] = useState<MotionActionId>('idle');
  const [playToken, setPlayToken] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const activeDefinition = motion?.actions[action] ?? null;

  useEffect(() => {
    if (!motion || motion.actions[action]) return;
    const first = availableMotionActions(motion)[0];
    if (first) setAction(first);
  }, [motion, action]);

  useEffect(() => {
    if (!motion) return;
    for (const definition of Object.values(motion.actions)) {
      if (!definition) continue;
      const image = new Image();
      image.src = definition.sheet;
    }
  }, [motion]);

  const play = (next: MotionActionId, scrollToHero = false) => {
    if (!motion?.actions[next]) return;
    setAction(next);
    setPlayToken((value) => value + 1);
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, window.innerHeight);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    if (scrollToHero || visibleHeight < rect.height * 0.4) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <div ref={heroRef} className="drawer-hero drawer-hero--monster" data-tier={monster.tier}>
        <span className="monster-drawer-halo" aria-hidden="true" />
        <div className="drawer-art">
          {motion && activeDefinition ? (
            <MonsterMotionStage
              key={`${monster.id}-${action}-${playToken}`}
              motion={motion}
              action={action}
              playToken={playToken}
              name={monster.name}
            />
          ) : monster.art ? (
            <img src={monster.art} alt={monster.name} />
          ) : (
            <CategoryGlyph id="monsters" />
          )}
        </div>
        <span className="drawer-act">{monster.actLabel}</span>
        <span className="drawer-tier" data-tier={monster.tier}>
          {monster.tierLabel}
        </span>
        {monster.artCredit === 'reference' && !(motion && activeDefinition) && (
          <span className="drawer-reference">参考图</span>
        )}
        {motion && activeDefinition && (
          <div className="monster-motion-caption">
            <span className="monster-motion-caption-label">动作 · {MOTION_LABELS[action].label}</span>
            <small>
              {activeDefinition.frameCount} 帧 · {activeDefinition.fps} FPS
            </small>
            <button
              type="button"
              className="monster-motion-replay"
              onClick={() => play(action)}
              aria-label={`重播${MOTION_LABELS[action].label}动作`}
              title="重播当前动作"
            >
              <ReplayIcon />
            </button>
          </div>
        )}
      </div>

      <header className="drawer-header">
        <div className="drawer-eyebrow">
          {monster.actLabel} <span>/</span> {monster.actSubtitle} <span>/</span> {monster.tierLabel}
        </div>
        <h2>{monster.name}</h2>
        <TagRow>
          <span className="tag tag--tier" data-tier={monster.tier}>
            {monster.tierLabel}
          </span>
          <span className="tag">{hpText(monster.hp)} 生命</span>
          <span className="tag">{monster.moves.length} 个招式</span>
        </TagRow>
      </header>

      {actions.length > 0 && (
        <section className="detail-section motion-section">
          <h3>
            动作 <small>MOTION</small>
          </h3>
          <div className="motion-tabs" role="group" aria-label={`${monster.name} 的动作`}>
            {actions.map((id) => {
              const definition = motion?.actions[id];
              if (!definition) return null;
              const meta = MOTION_LABELS[id];
              const selected = action === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`motion-tab${selected ? ' is-active' : ''}`}
                  data-action={id}
                  aria-pressed={selected}
                  onClick={() => play(id)}
                  title={`${meta.note} · ${definition.frameCount} 帧 / ${definition.fps} FPS`}
                >
                  <span className="motion-tab-play" aria-hidden="true">
                    <PlayIcon />
                  </span>
                  <span className="motion-tab-copy">
                    <strong>{meta.label}</strong>
                    <small>
                      {definition.frameCount} 帧 · {definition.fps} FPS
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="motion-hint">点击动作，在上方预览动画；待机动作会持续循环。</p>
        </section>
      )}

      <DataGrid
        rows={[
          { label: '幕', value: `${monster.actLabel} · ${monster.actSubtitle}` },
          { label: '等级', value: monster.tierLabel },
          { label: '生命', value: hpText(monster.hp) },
          {
            label: '进阶生命',
            value: monster.hpAscension ? hpText(monster.hpAscension) : '',
          },
          { label: '行动规律', value: monster.pattern?.typeLabel },
        ]}
      />

      {(monster.innatePowers.length > 0 || monster.innatePowersAscension.length > 0) && (
        <section className="detail-section">
          <h3>
            固有状态 <small>INNATE</small>
          </h3>
          <div className="status-chip-list">
            {monster.innatePowers.map((power) => (
              <span className="status-chip" key={power.id}>
                {power.name}
                <b>×{power.stacks}</b>
              </span>
            ))}
          </div>
          {monster.innatePowersAscension.length > 0 && (
            <div className="ascension-powers">
              <span>进阶</span>
              <div className="status-chip-list">
                {monster.innatePowersAscension.map((power) => (
                  <span className="status-chip small" key={power.id}>
                    {power.name}
                    <b>×{power.stacks}</b>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="detail-section">
        <h3>
          招式 <small>MOVES</small>
        </h3>
        <div className="move-list">
          {monster.moves.map((move) => {
            const previewAction = motionActionForIntent(move.intent);
            const canPreview = !!motion?.actions[previewAction];
            return (
              <div className="move-row" key={move.id}>
                <div className="move-row-head">
                  <span className="intent-badge" data-intent={move.intent}>
                    {move.intentLabel}
                  </span>
                  <h4>{move.name}</h4>
                  <div className="move-numbers">
                    {move.damage.length > 0 && <span>伤害 {damageText(move.damage)}</span>}
                    {move.damageAscension.length > 0 && (
                      <small>进阶 {damageText(move.damageAscension)}</small>
                    )}
                    {move.block !== null && <span>格挡 {move.block}</span>}
                  </div>
                </div>
                {(move.powers.length > 0 || move.effects > 0 || canPreview) && (
                  <div className="move-row-foot">
                    {move.powers.map((power) => (
                      <span className="status-chip small" key={power.id}>
                        {power.name}
                        <b>×{power.stacks}</b>
                      </span>
                    ))}
                    {move.effects > 0 && <span className="move-note">特殊效果 ×{move.effects}</span>}
                    {canPreview && (
                      <button
                        type="button"
                        className="move-preview"
                        onClick={() => play(previewAction, true)}
                        title={`预览「${move.name}」对应的${MOTION_LABELS[previewAction].label}动作`}
                      >
                        <PlayIcon />
                        <span>预览动作</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {monster.pattern && (
        <section className="detail-section">
          <h3>
            行动规律 <small>PATTERN</small>
          </h3>
          <p className="pattern-description">
            <span className="pattern-type">{monster.pattern.typeLabel}</span>
            {monster.pattern.description || '根据战斗状态选择招式。'}
          </p>
          {monster.pattern.sequence.length > 0 && (
            <div className="pattern-sequence">
              {monster.pattern.sequence.map((step, index) => (
                <span className="sequence-step" key={`${step}-${index}`}>
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  {step}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {monster.encounters.length > 0 && (
        <section className="detail-section">
          <h3>
            出没遭遇 <small>ENCOUNTERS</small>
          </h3>
          <div className="encounter-list">
            {monster.encounters.map((encounter) => (
              <span key={encounter.id}>{encounter.name}</span>
            ))}
          </div>
        </section>
      )}

      <SourceLink url={monster.referenceUrl} credit={monster.artCredit} />
    </>
  );
}

function RelicDetail({ relic }: { relic: Relic }) {
  return (
    <>
      <div className="drawer-hero drawer-hero--icon" data-rarity={relic.rarity}>
        <div className="drawer-art">{relic.art ? <img src={relic.art} alt={relic.name} /> : <CategoryGlyph id="relics" />}</div>
      </div>
      <header className="drawer-header">
        <div className="drawer-eyebrow">
          遗物 <span>/</span> {relic.rarityLabel} <span>/</span> {relic.poolLabel}
        </div>
        <h2>{relic.name}</h2>
        <TagRow>
          <span className="tag tag--rarity" data-rarity={relic.rarity}>
            {relic.rarityLabel}
          </span>
          <span className="tag">{relic.poolLabel}</span>
          {relic.price > 0 && <span className="tag">{relic.price} 金</span>}
        </TagRow>
      </header>
      <p className="lead-text">{relic.description || '这件遗物没有留下说明。'}</p>
      <DataGrid
        rows={[
          { label: '稀有度', value: relic.rarityLabel },
          { label: '池', value: relic.poolLabel },
          { label: '价格', value: relic.price ? `${relic.price} 金` : '' },
          { label: '触发', value: relic.triggers.map((t) => `${t.label}（${t.effects} 个效果）`).join(' · ') },
        ]}
      />
      {relic.flavor && <blockquote className="flavor-text">“{relic.flavor}”</blockquote>}
      <SourceLink url={relic.referenceUrl} credit={relic.artCredit} />
    </>
  );
}

function PowerDetail({ power }: { power: Power }) {
  return (
    <>
      <div className="drawer-hero drawer-hero--icon drawer-hero--status" data-type={power.type}>
        <div className="drawer-art">{power.art ? <img src={power.art} alt={power.name} /> : <CategoryGlyph id="powers" />}</div>
      </div>
      <header className="drawer-header">
        <div className="drawer-eyebrow">
          状态 <span>/</span> {power.typeLabel} <span>/</span> {power.stackLabel}
        </div>
        <h2>{power.name}</h2>
        <TagRow>
          <span className="tag tag--power" data-type={power.type}>
            {power.typeLabel}
          </span>
          <span className="tag">{power.stackLabel}</span>
        </TagRow>
      </header>
      <p className="lead-text">{power.description || '这个状态没有文字说明。'}</p>
      <DataGrid
        rows={[
          { label: '类型', value: power.typeLabel },
          { label: '叠层', value: power.stackLabel },
          { label: '标识', value: power.id },
        ]}
      />
      <SourceLink url={power.referenceUrl} credit={power.artCredit} />
    </>
  );
}

function EnchantmentDetail({ enchantment }: { enchantment: Enchantment }) {
  return (
    <>
      <div className="drawer-hero drawer-hero--icon">
        <div className="drawer-art">
          {enchantment.art ? <img src={enchantment.art} alt={enchantment.name} /> : <CategoryGlyph id="enchantments" />}
        </div>
      </div>
      <header className="drawer-header">
        <div className="drawer-eyebrow">附魔 <span>/</span> {enchantment.cardTypeLabel || '任意卡牌'}</div>
        <h2>{enchantment.name}</h2>
        <TagRow>
          <span className="tag">{enchantment.cardTypeLabel || '任意卡牌'}</span>
          <span className="tag">{enchantment.stackable ? '可叠加' : '不可叠加'}</span>
        </TagRow>
      </header>
      <p className="lead-text">{enchantment.description || '这段附魔没有文字说明。'}</p>
      {enchantment.extraCardText && (
        <section className="text-panel">
          <h3>
            附加卡面文字 <small>CARD TEXT</small>
          </h3>
          <p>{enchantment.extraCardText}</p>
        </section>
      )}
      <DataGrid
        rows={[
          { label: '适用卡牌', value: enchantment.applicableLabel || enchantment.cardTypeLabel || '任意卡牌' },
          { label: '叠加', value: enchantment.stackable ? '可叠加' : '不可叠加' },
        ]}
      />
      <SourceLink url={enchantment.referenceUrl} credit={enchantment.artCredit} />
    </>
  );
}

function PotionDetail({ potion }: { potion: Potion }) {
  return (
    <>
      <div className="drawer-hero drawer-hero--icon" data-rarity={potion.rarity}>
        <div className="drawer-art">{potion.art ? <img src={potion.art} alt={potion.name} /> : <CategoryGlyph id="potions" />}</div>
      </div>
      <header className="drawer-header">
        <div className="drawer-eyebrow">
          道具 <span>/</span> {potion.rarityLabel} <span>/</span> {potion.poolLabel}
        </div>
        <h2>{potion.name}</h2>
        <TagRow>
          <span className="tag tag--rarity" data-rarity={potion.rarity}>
            {potion.rarityLabel}
          </span>
          <span className="tag">{potion.poolLabel}</span>
          {potion.price > 0 && <span className="tag">{potion.price} 金</span>}
          <span className="tag">{potion.targetLabel}</span>
        </TagRow>
      </header>
      <p className="lead-text">{potion.description || '这瓶道具没有文字说明。'}</p>
      <DataGrid
        rows={[
          { label: '稀有度', value: potion.rarityLabel },
          { label: '池', value: potion.poolLabel },
          { label: '价格', value: potion.price ? `${potion.price} 金` : '' },
          { label: '目标', value: potion.targetLabel },
          { label: '战斗外可用', value: potion.usableOutsideBattle ? '是' : '否' },
        ]}
      />
      <SourceLink url={potion.referenceUrl} credit={potion.artCredit} />
    </>
  );
}

function ModifierDetail({ modifier }: { modifier: Modifier }) {
  return (
    <>
      <div className="drawer-hero drawer-hero--modifier" data-type={modifier.type}>
        <div className="drawer-modifier-sigil">
          <CategoryGlyph id="modifiers" />
        </div>
        <span className="drawer-tier" data-type={modifier.type}>
          {modifier.typeLabel}
        </span>
      </div>
      <header className="drawer-header">
        <div className="drawer-eyebrow">每日挑战 <span>/</span> DAILY RITE</div>
        <h2>{modifier.name}</h2>
        <TagRow>
          <span className="tag tag--modifier" data-type={modifier.type}>
            {modifier.typeLabel}
          </span>
        </TagRow>
      </header>
      <p className="lead-text">{modifier.description || '这条每日规则没有文字说明。'}</p>
      <DataGrid
        rows={[
          { label: '类型', value: modifier.typeLabel },
          { label: '标识', value: modifier.id },
        ]}
      />
      <div className="detail-note">
        <span>每日挑战效果会在每日重置时改变一局游戏的规则。具体组合以游戏内当日内容为准。</span>
      </div>
    </>
  );
}

export default function DetailDrawer({
  category,
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  index,
  total,
}: DetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousIndexRef = useRef(index);
  const initialFocusRef = useRef(false);
  const gestureRef = useRef<{ startX: number; startY: number; dx: number; active: boolean } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const categoryDef = CATEGORY_BY_ID.get(category)!;
  const unit = ITEM_UNITS[category];
  const direction = index < previousIndexRef.current ? 'prev' : 'next';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [item.id]);

  useEffect(() => {
    previousIndexRef.current = index;
  }, [index]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!initialFocusRef.current && window.matchMedia('(pointer: fine)').matches) {
      closeRef.current?.focus();
      initialFocusRef.current = true;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && hasPrev) onPrev();
      if (event.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, [data-no-swipe]')) return;
    const touch = event.touches[0];
    // 避开屏幕边缘，防止和系统返回手势冲突。
    if (touch.clientX < 24 || touch.clientX > window.innerWidth - 24) return;
    gestureRef.current = { startX: touch.clientX, startY: touch.clientY, dx: 0, active: false };
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const dx = touch.clientX - gesture.startX;
    const dy = touch.clientY - gesture.startY;
    if (!gesture.active) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        gestureRef.current = null;
        setDragX(0);
        setDragging(false);
        return;
      }
      gesture.active = true;
      setDragging(true);
    }
    gesture.dx = dx;
    const blocked = (dx > 0 && !hasPrev) || (dx < 0 && !hasNext);
    const offset = blocked ? dx * 0.12 : dx * 0.45;
    setDragX(Math.max(-96, Math.min(96, offset)));
  };

  const endGesture = () => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    setDragging(false);
    if (!gesture || !gesture.active) {
      setDragX(0);
      return;
    }
    const distance = gesture.dx;
    setDragX(0);
    const threshold = Math.min(88, Math.max(46, window.innerWidth * 0.14));
    if (distance <= -threshold && hasNext) onNext();
    else if (distance >= threshold && hasPrev) onPrev();
  };

  return (
    <div className="drawer-layer">
      <button className="drawer-backdrop" onClick={onClose} aria-label="关闭详情" tabIndex={-1} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header className="drawer-top">
          <div className="drawer-top-copy">
            <span className="drawer-category">{categoryDef.label}</span>
            <span className="drawer-category-latin">{categoryDef.latin}</span>
          </div>
          {index > 0 && (
            <div className="drawer-position" aria-label={`第 ${index} ${unit}，共 ${total} ${unit}`}>
              <strong>{index}</strong>
              <span>/ {total}</span>
            </div>
          )}
          <div className="drawer-controls">
            <button className="icon-button" onClick={onPrev} disabled={!hasPrev} aria-label={`上一${unit}`}>
              <ArrowLeftIcon />
            </button>
            <button className="icon-button" onClick={onNext} disabled={!hasNext} aria-label={`下一${unit}`}>
              <ArrowRightIcon />
            </button>
            <button ref={closeRef} className="icon-button drawer-close" onClick={onClose} aria-label="关闭详情">
              <CloseIcon />
            </button>
          </div>
        </header>

        <div
          ref={scrollRef}
          className={`drawer-scroll${dragging ? ' is-dragging' : ''}`}
          style={dragX ? { transform: `translateX(${dragX}px)` } : undefined}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={endGesture}
          onTouchCancel={endGesture}
        >
          <div key={`${category}-${item.id}`} className={`drawer-scroll-inner drawer-slide-${direction}`}>
            <div id="drawer-title" className="sr-only" aria-live="polite">
              {item.name}
            </div>
            {category === 'cards' && <CardDetail card={item as Card} />}
            {category === 'monsters' && <MonsterDetail key={(item as Monster).id} monster={item as Monster} />}
            {category === 'relics' && <RelicDetail relic={item as Relic} />}
            {category === 'powers' && <PowerDetail power={item as Power} />}
            {category === 'enchantments' && <EnchantmentDetail enchantment={item as Enchantment} />}
            {category === 'potions' && <PotionDetail potion={item as Potion} />}
            {category === 'modifiers' && <ModifierDetail modifier={item as Modifier} />}
          </div>
        </div>

        {total > 1 && (
          <div className="drawer-swipe-hint" aria-hidden="true">
            <ArrowLeftIcon />
            <span>左右滑动切换</span>
            <ArrowRightIcon />
          </div>
        )}
      </aside>
    </div>
  );
}
