import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  hpText,
  loadAllCategories,
  matchesQuery,
  normalizedName,
  type CatalogItem,
  type CategoryData,
  type CategoryId,
  type Card,
  type Enchantment,
  type Modifier,
  type Monster,
  type Potion,
  type Power,
  type Relic,
} from '../data';
import { CategoryGlyph, CloseIcon, SearchIcon } from './Icons';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (category: CategoryId, itemId: string) => void;
}

type Result = { category: CategoryId; item: CatalogItem; score: number };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (!terms.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${terms.join('|')})`, 'ig'));
  const lower = terms.map((term) => term.toLowerCase());
  return (
    <>
      {parts.map((part, index) =>
        lower.includes(part.toLowerCase()) ? (
          <mark key={`${part}-${index}`}>{part}</mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function itemMeta(category: CategoryId, item: CatalogItem): string {
  switch (category) {
    case 'cards': {
      const card = item as Card;
      return `${card.classLabel} · ${card.typeLabel} · ${card.rarityLabel} · ${card.costLabel} 费`;
    }
    case 'monsters': {
      const monster = item as Monster;
      return `${monster.actLabel} · ${monster.tierLabel} · ${hpText(monster.hp)} HP`;
    }
    case 'relics': {
      const relic = item as Relic;
      return `${relic.rarityLabel} · ${relic.poolLabel}`;
    }
    case 'powers': {
      const power = item as Power;
      return `${power.typeLabel} · ${power.stackLabel}`;
    }
    case 'enchantments': {
      const enchantment = item as Enchantment;
      return `${enchantment.cardTypeLabel || '任意卡牌'} · ${enchantment.stackable ? '可叠加' : '不可叠加'}`;
    }
    case 'potions': {
      const potion = item as Potion;
      return `${potion.rarityLabel} · ${potion.poolLabel}`;
    }
    case 'modifiers': {
      const modifier = item as Modifier;
      return `每日挑战 · ${modifier.typeLabel}`;
    }
  }
}

export default function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [data, setData] = useState<Record<CategoryId, CategoryData> | null>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    if (!data) {
      loadAllCategories()
        .then((loaded) => setData(loaded))
        .catch((reason: Error) => setError(reason.message));
    }
    return () => window.clearTimeout(timer);
  }, [open, data]);

  const results = useMemo<Result[]>(() => {
    if (!data || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const normalized = normalizedName(q);
    const output: Result[] = [];
    for (const category of CATEGORIES) {
      for (const item of data[category.id]) {
        if (!matchesQuery(item, query)) continue;
        const name = item.name.toLowerCase();
        const normalizedItemName = normalizedName(item.name);
        const score = name === q ? 0 : name.startsWith(q) ? 1 : normalizedItemName.startsWith(normalized) ? 2 : name.includes(q) ? 3 : 4;
        output.push({ category: category.id, item, score });
      }
    }
    output.sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name, 'zh-Hans-CN'));
    return output.slice(0, 60);
  }, [data, query]);

  const flatResults = results;

  const navigate = (category: CategoryId, itemId: string) => {
    onNavigate(category, itemId);
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(flatResults.length - 1, 0)));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const result = flatResults[activeIndex] ?? flatResults[0];
      if (result) navigate(result.category, result.item.id);
    }
  };

  if (!open) return null;

  return (
    <div className="palette-layer" role="presentation">
      <button className="palette-backdrop" onClick={onClose} aria-label="关闭全局检索" tabIndex={-1} />
      <div className="palette" role="dialog" aria-modal="true" aria-label="全局检索" onKeyDown={onKeyDown}>
        <div className="palette-search">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="搜索全部档案：卡牌、遗物、生物、状态、附魔、道具、每日挑战…"
            aria-label="搜索全部档案"
          />
          <button className="icon-button" onClick={onClose} aria-label="关闭">
            <CloseIcon />
          </button>
        </div>

        {error && <div className="palette-message">{error}</div>}

        {!query.trim() ? (
          <div className="palette-index">
            <div className="palette-label">按分类进入</div>
            <div className="palette-categories">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  className="palette-category"
                  onClick={() => {
                    onNavigate(category.id, '');
                    onClose();
                  }}
                >
                  <span className="palette-category-glyph">
                    <CategoryGlyph id={category.glyph} />
                  </span>
                  <span>
                    <strong>{category.label}</strong>
                    <small>{category.latin}</small>
                  </span>
                  <span className="palette-category-count">
                    {data ? data[category.id].length : '—'}
                  </span>
                </button>
              ))}
            </div>
            <div className="palette-label">试试搜索</div>
            <div className="palette-suggestions">
              {['消耗', '首领', '格挡', '附魔', '稀有', '先古'].map((term) => (
                <button key={term} onClick={() => setQuery(term)}>
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="palette-results">
            <div className="palette-result-meta">
              {data ? (
                <>
                  共 <strong>{results.length >= 60 ? '60+' : results.length}</strong> 条匹配
                  <span>· 使用 ↑ ↓ 选择，Enter 打开</span>
                </>
              ) : (
                '正在翻阅档案…'
              )}
            </div>
            {flatResults.map((result, index) => {
              const category = CATEGORY_BY_ID.get(result.category)!;
              return (
                <button
                  key={`${result.category}-${result.item.id}`}
                  className={`palette-result ${index === activeIndex ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigate(result.category, result.item.id)}
                >
                  <span className="palette-result-art">
                    {'art' in result.item && result.item.art ? (
                      <img src={result.item.art} alt="" loading="lazy" />
                    ) : (
                      <CategoryGlyph id={category.glyph} />
                    )}
                  </span>
                  <span className="palette-result-copy">
                    <strong>
                      <Highlight text={result.item.name} query={query} />
                    </strong>
                    <small>{itemMeta(result.category, result.item)}</small>
                  </span>
                  <span className="palette-result-category">{category.label}</span>
                </button>
              );
            })}
            {data && flatResults.length === 0 && (
              <div className="palette-empty">
                没有找到与「{query}」有关的档案。
                <br />
                试试更短的关键词，或只搜索名称。
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
