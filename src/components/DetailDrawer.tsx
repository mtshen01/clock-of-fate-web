import { useEffect, useRef } from 'react';
import {
  CATEGORY_BY_ID,
  damageText,
  hpText,
  type Card,
  type CategoryId,
  type Enchantment,
  type Modifier,
  type Monster,
  type Potion,
  type Power,
  type Relic,
} from '../data';
import { ArrowLeftIcon, ArrowRightIcon, CategoryGlyph, CloseIcon, ExternalIcon } from './Icons';

type DrawerItem = Card | Monster | Relic | Power | Enchantment | Potion | Modifier;

interface DetailDrawerProps {
  category: CategoryId;
  item: DrawerItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
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
  return (
    <>
      <div className="drawer-hero drawer-hero--monster" data-tier={monster.tier}>
        <span className="monster-drawer-halo" aria-hidden="true" />
        <div className="drawer-art">
          {monster.art ? <img src={monster.art} alt={monster.name} /> : <CategoryGlyph id="monsters" />}
        </div>
        <span className="drawer-act">{monster.actLabel}</span>
        <span className="drawer-tier" data-tier={monster.tier}>
          {monster.tierLabel}
        </span>
        {monster.artCredit === 'reference' && <span className="drawer-reference">参考图</span>}
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

      {monster.innatePowers.length > 0 && (
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
        </section>
      )}

      <section className="detail-section">
        <h3>
          招式 <small>MOVES</small>
        </h3>
        <div className="move-list">
          {monster.moves.map((move) => (
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
              {(move.powers.length > 0 || move.effects > 0) && (
                <div className="move-row-foot">
                  {move.powers.map((power) => (
                    <span className="status-chip small" key={power.id}>
                      {power.name}
                      <b>×{power.stacks}</b>
                    </span>
                  ))}
                  {move.effects > 0 && <span className="move-note">特殊效果 ×{move.effects}</span>}
                </div>
              )}
            </div>
          ))}
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

export default function DetailDrawer({ category, item, onClose, onPrev, onNext, hasPrev, hasNext }: DetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const categoryDef = CATEGORY_BY_ID.get(category)!;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
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

  return (
    <div className="drawer-layer">
      <button className="drawer-backdrop" onClick={onClose} aria-label="关闭详情" tabIndex={-1} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header className="drawer-top">
          <div className="drawer-top-copy">
            <span className="drawer-category">{categoryDef.label}</span>
            <span className="drawer-category-latin">{categoryDef.latin}</span>
          </div>
          <div className="drawer-controls">
            <button className="icon-button" onClick={onPrev} disabled={!hasPrev} aria-label="上一条">
              <ArrowLeftIcon />
            </button>
            <button className="icon-button" onClick={onNext} disabled={!hasNext} aria-label="下一条">
              <ArrowRightIcon />
            </button>
            <button ref={closeRef} className="icon-button drawer-close" onClick={onClose} aria-label="关闭详情">
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="drawer-scroll">
          <div id="drawer-title" className="sr-only">
            {item.name}
          </div>
          {category === 'cards' && <CardDetail card={item as Card} />}
          {category === 'monsters' && <MonsterDetail monster={item as Monster} />}
          {category === 'relics' && <RelicDetail relic={item as Relic} />}
          {category === 'powers' && <PowerDetail power={item as Power} />}
          {category === 'enchantments' && <EnchantmentDetail enchantment={item as Enchantment} />}
          {category === 'potions' && <PotionDetail potion={item as Potion} />}
          {category === 'modifiers' && <ModifierDetail modifier={item as Modifier} />}
        </div>
      </aside>
    </div>
  );
}
