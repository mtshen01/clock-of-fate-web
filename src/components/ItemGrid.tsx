import type { CSSProperties } from 'react';
import {
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
import { CategoryGlyph } from './Icons';

interface ItemGridProps {
  category: CategoryId;
  items: Array<Card | Monster | Relic | Power | Enchantment | Potion | Modifier>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function delayStyle(index: number): CSSProperties {
  return { '--i': Math.min(index, 18) } as CSSProperties;
}

function ArtFallback({ glyph }: { glyph: string }) {
  return (
    <span className="art-fallback" aria-hidden="true">
      <CategoryGlyph id={glyph} />
    </span>
  );
}

function CardTile({ card, index, onSelect, selected }: { card: Card; index: number; onSelect: () => void; selected: boolean }) {
  return (
    <button
      className={`card-tile item-reveal ${selected ? 'is-selected' : ''}`}
      style={delayStyle(index)}
      onClick={onSelect}
      aria-label={`查看卡牌 ${card.name}`}
    >
      <div className="card-art" data-rarity={card.rarity}>
        {card.art ? (
          <img
            src={card.art}
            alt=""
            loading={index < 12 ? 'eager' : 'lazy'}
            fetchPriority={index < 6 ? 'high' : 'auto'}
            decoding="async"
          />
        ) : (
          <ArtFallback glyph="cards" />
        )}
        <span className="cost-gem" aria-label={`费用 ${card.costLabel}`}>
          {card.costLabel}
        </span>
        {card.starCost !== null && card.starCost > 0 && (
          <span className="star-gem" aria-label={`星辉 ${card.starCost}`}>
            ✦{card.starCost}
          </span>
        )}
        <span className="rarity-pip" data-rarity={card.rarity} />
        {card.multiplayerOnly && <span className="multiplayer-mark">多人</span>}
      </div>
      <div className="card-body">
        <div className="card-heading">
          <h3>{card.name}</h3>
          <span className="card-class">{card.classLabel}</span>
        </div>
        <div className="card-meta">
          <span data-type={card.type}>{card.typeLabel}</span>
          <span className="meta-separator">·</span>
          <span data-rarity={card.rarity}>{card.rarityLabel}</span>
          {card.keywords.slice(0, 2).map((keyword) => (
            <span className="mini-tag" key={keyword.id}>
              {keyword.label}
            </span>
          ))}
        </div>
        <p>{card.description || '这张牌没有留下文字说明。'}</p>
      </div>
    </button>
  );
}

function IconTile({
  item,
  category,
  index,
  onSelect,
  selected,
}: {
  item: Relic | Power | Enchantment | Potion;
  category: 'relics' | 'powers' | 'enchantments' | 'potions';
  index: number;
  onSelect: () => void;
  selected: boolean;
}) {
  let metaLeft = '';
  let metaRight = '';
  let extra = '';
  if (category === 'relics') {
    const relic = item as Relic;
    metaLeft = relic.rarityLabel;
    metaRight = relic.poolLabel;
    extra = relic.triggers.length ? `${relic.triggers.length} 个触发` : '无触发';
  } else if (category === 'potions') {
    const potion = item as Potion;
    metaLeft = potion.rarityLabel;
    metaRight = potion.price ? `${potion.price} 金` : potion.poolLabel;
    extra = potion.poolLabel;
  } else if (category === 'powers') {
    const power = item as Power;
    metaLeft = power.typeLabel;
    metaRight = power.stackLabel;
  } else {
    const enchantment = item as Enchantment;
    metaLeft = enchantment.cardTypeLabel || '任意卡牌';
    metaRight = enchantment.stackable ? '可叠加' : '不可叠加';
    extra = enchantment.applicableLabel;
  }

  return (
    <button
      className={`icon-tile icon-tile--${category} item-reveal ${selected ? 'is-selected' : ''}`}
      style={delayStyle(index)}
      onClick={onSelect}
      aria-label={`查看${category === 'relics' ? '遗物' : category === 'potions' ? '道具' : category === 'powers' ? '状态' : '附魔'} ${item.name}`}
    >
      <div className="icon-frame" data-rarity={'rarity' in item ? item.rarity : undefined}>
        {item.art ? (
          <img
            src={item.art}
            alt=""
            loading={index < 12 ? 'eager' : 'lazy'}
            fetchPriority={index < 6 ? 'high' : 'auto'}
            decoding="async"
          />
        ) : (
          <ArtFallback glyph={category} />
        )}
      </div>
      <div className="icon-copy">
        <h3>{item.name}</h3>
        <div className="icon-meta">
          <span className="icon-meta-left" data-type={'type' in item ? item.type : undefined} data-rarity={'rarity' in item ? item.rarity : undefined}>
            {metaLeft}
          </span>
          <span>{metaRight}</span>
        </div>
        <p>{item.description || '暂无说明。'}</p>
        {'triggers' in item && item.triggers.length > 0 && (
          <span className="icon-extra">{extra}</span>
        )}
        {'extraCardText' in item && item.extraCardText && (
          <span className="icon-extra">{item.extraCardText}</span>
        )}
        {'applicableLabel' in item && item.applicableLabel && (
          <span className="icon-extra">{item.applicableLabel}</span>
        )}
      </div>
    </button>
  );
}

function MonsterTile({ monster, index, onSelect, selected }: { monster: Monster; index: number; onSelect: () => void; selected: boolean }) {
  const hp = hpText(monster.hp);
  return (
    <button
      className={`beast-tile item-reveal ${selected ? 'is-selected' : ''}`}
      style={delayStyle(index)}
      onClick={onSelect}
      aria-label={`查看生物 ${monster.name}`}
    >
      <div className="beast-art" data-tier={monster.tier}>
        <span className="beast-halo" aria-hidden="true" />
        {monster.art ? (
          <img
            src={monster.art}
            alt=""
            loading={index < 8 ? 'eager' : 'lazy'}
            fetchPriority={index < 4 ? 'high' : 'auto'}
            decoding="async"
          />
        ) : (
          <ArtFallback glyph="monsters" />
        )}
        <span className="beast-act">{monster.actLabel}</span>
        <span className="beast-tier" data-tier={monster.tier}>
          {monster.tierLabel}
        </span>
        {monster.artCredit === 'reference' && <span className="reference-mark">参考图</span>}
      </div>
      <div className="beast-body">
        <div className="beast-heading">
          <h3>{monster.name}</h3>
          <span className="beast-hp">{hp} HP</span>
        </div>
        <div className="beast-meta">
          <span>{monster.actSubtitle}</span>
          <span className="meta-separator">·</span>
          <span>{monster.moves.length} 个招式</span>
        </div>
        {monster.moves.length > 0 && (
          <div className="beast-moves">
            {monster.moves.slice(0, 3).map((move) => (
              <span key={move.id} className="move-chip" data-intent={move.intent}>
                {move.name}
                {move.damage.length > 0 && <b>{damageText(move.damage)}</b>}
              </span>
            ))}
            {monster.moves.length > 3 && <span className="move-more">+{monster.moves.length - 3}</span>}
          </div>
        )}
      </div>
    </button>
  );
}

function ModifierTile({ modifier, index, onSelect, selected }: { modifier: Modifier; index: number; onSelect: () => void; selected: boolean }) {
  return (
    <button
      className={`rite-tile item-reveal ${selected ? 'is-selected' : ''}`}
      style={delayStyle(index)}
      onClick={onSelect}
      aria-label={`查看每日挑战 ${modifier.name}`}
      data-type={modifier.type}
    >
      <span className="rite-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="rite-glyph">
        <CategoryGlyph id="modifiers" />
      </span>
      <span className="rite-copy">
        <span className="rite-heading">
          <strong>{modifier.name}</strong>
          <span className="rite-type" data-type={modifier.type}>
            {modifier.typeLabel}
          </span>
        </span>
        <span className="rite-description">{modifier.description}</span>
      </span>
    </button>
  );
}

export default function ItemGrid({ category, items, selectedId, onSelect }: ItemGridProps) {
  return (
    <div className={`item-grid item-grid--${category}`}>
      {items.map((item, index) => {
        const selected = item.id === selectedId;
        if (category === 'cards') {
          return <CardTile key={item.id} card={item as Card} index={index} selected={selected} onSelect={() => onSelect(item.id)} />;
        }
        if (category === 'monsters') {
          return <MonsterTile key={item.id} monster={item as Monster} index={index} selected={selected} onSelect={() => onSelect(item.id)} />;
        }
        if (category === 'modifiers') {
          return <ModifierTile key={item.id} modifier={item as Modifier} index={index} selected={selected} onSelect={() => onSelect(item.id)} />;
        }
        return (
          <IconTile
            key={item.id}
            item={item as Relic | Power | Enchantment | Potion}
            category={category}
            index={index}
            selected={selected}
            onSelect={() => onSelect(item.id)}
          />
        );
      })}
    </div>
  );
}
