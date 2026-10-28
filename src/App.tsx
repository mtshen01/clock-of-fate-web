import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ACT_LABELS,
  CARD_RARITY_LABELS,
  CARD_TYPE_LABELS,
  CATEGORIES,
  CATEGORY_BY_ID,
  CLASS_LABELS,
  CLASS_ORDER,
  MODIFIER_TYPE_LABELS,
  POOL_LABELS,
  POTION_RARITY_LABELS,
  POWER_TYPE_LABELS,
  RELIC_RARITY_LABELS,
  STACK_LABELS,
  TIER_LABELS,
  formatNumber,
  loadCategory,
  loadMeta,
  matchesQuery,
  sortItems,
  type Card,
  type CatalogItem,
  type CategoryId,
  type Enchantment,
  type Meta,
  type Modifier,
  type Monster,
  type Potion,
  type Power,
  type Relic,
} from './data';
import { EMPTY_FILTERS, countActiveFilters, type FilterGroup, type FilterKey, type FilterOption, type FilterState } from './filters';
import { ChevronIcon, ClockMark, SearchIcon } from './components/Icons';
import CategoryHero from './components/CategoryHero';
import CommandPalette from './components/CommandPalette';
import DetailDrawer from './components/DetailDrawer';
import Header from './components/Header';
import ItemGrid from './components/ItemGrid';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';

const PAGE_SIZES: Record<CategoryId, number> = {
  cards: 48,
  relics: 72,
  monsters: 36,
  powers: 120,
  enchantments: 30,
  potions: 48,
  modifiers: 16,
};

const SORT_OPTIONS: Record<CategoryId, Array<{ value: string; label: string }>> = {
  cards: [
    { value: 'name', label: '名称 A→Z' },
    { value: 'name-desc', label: '名称 Z→A' },
    { value: 'cost', label: '费用从低到高' },
    { value: 'rarity', label: '稀有度' },
    { value: 'archive', label: '档案顺序' },
  ],
  relics: [
    { value: 'name', label: '名称 A→Z' },
    { value: 'name-desc', label: '名称 Z→A' },
    { value: 'rarity', label: '稀有度' },
    { value: 'archive', label: '档案顺序' },
  ],
  monsters: [
    { value: 'name', label: '名称 A→Z' },
    { value: 'hp', label: '生命从低到高' },
    { value: 'act', label: '按幕数' },
    { value: 'tier', label: '按等级' },
    { value: 'archive', label: '档案顺序' },
  ],
  powers: [
    { value: 'name', label: '名称 A→Z' },
    { value: 'name-desc', label: '名称 Z→A' },
    { value: 'archive', label: '档案顺序' },
  ],
  enchantments: [
    { value: 'name', label: '名称 A→Z' },
    { value: 'archive', label: '档案顺序' },
  ],
  potions: [
    { value: 'name', label: '名称 A→Z' },
    { value: 'name-desc', label: '名称 Z→A' },
    { value: 'rarity', label: '稀有度' },
    { value: 'archive', label: '档案顺序' },
  ],
  modifiers: [
    { value: 'name', label: '名称 A→Z' },
    { value: 'archive', label: '档案顺序' },
  ],
};

const ZERO_COUNTS: Record<CategoryId, number> = {
  cards: 0,
  relics: 0,
  monsters: 0,
  powers: 0,
  enchantments: 0,
  potions: 0,
  modifiers: 0,
};

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((category) => category.id));
const EMPTY_ITEMS: CatalogItem[] = [];

function readRoute(): { category: CategoryId; itemId: string | null } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [categoryRaw, ...rest] = raw.split('/');
  const category = CATEGORY_IDS.has(categoryRaw) ? (categoryRaw as CategoryId) : 'cards';
  const itemId = rest.length ? decodeURIComponent(rest.join('/')) : null;
  return { category, itemId };
}

function countBy<T>(items: T[], get: (item: T) => string | number | undefined): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = get(item);
    if (key === undefined || key === '') continue;
    const stringKey = String(key);
    map.set(stringKey, (map.get(stringKey) ?? 0) + 1);
  }
  return map;
}

function optionsFrom(entries: Array<[string, string]>, counts: Map<string, number>): FilterOption[] {
  return entries
    .filter(([value]) => (counts.get(value) ?? 0) > 0)
    .map(([value, label]) => ({ value, label, count: counts.get(value) }));
}

function buildFilterGroups(category: CategoryId, items: CatalogItem[]): FilterGroup[] {
  if (category === 'cards') {
    const cards = items as Card[];
    const classCounts = countBy(cards, (card) => card.class);
    const typeCounts = countBy(cards, (card) => card.type);
    const rarityCounts = countBy(cards, (card) => card.rarity);
    const costCounts = new Map<string, number>();
    const keywordCounts = new Map<string, { label: string; count: number }>();
    for (const card of cards) {
      if (card.costLabel === 'X') costCounts.set('X', (costCounts.get('X') ?? 0) + 1);
      else if (card.cost >= 4) costCounts.set('4+', (costCounts.get('4+') ?? 0) + 1);
      else costCounts.set(String(card.cost), (costCounts.get(String(card.cost)) ?? 0) + 1);
      for (const keyword of card.keywords) {
        const current = keywordCounts.get(keyword.id) ?? { label: keyword.label, count: 0 };
        current.count += 1;
        keywordCounts.set(keyword.id, current);
      }
    }
    const classOptions = optionsFrom(
      CLASS_ORDER.map((id) => [id, CLASS_LABELS[id] ?? id]),
      classCounts,
    );
    const keywordOptions = [...keywordCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([value, { label, count }]) => ({ value, label, count }));
    return [
      { key: 'cls', label: '职业', options: classOptions, quick: true },
      { key: 'type', label: '类型', options: optionsFrom(Object.entries(CARD_TYPE_LABELS), typeCounts) },
      { key: 'rarity', label: '稀有度', options: optionsFrom(Object.entries(CARD_RARITY_LABELS), rarityCounts) },
      {
        key: 'cost',
        label: '费用',
        options: [
          ...optionsFrom(
            [
              ['0', '0 费'],
              ['1', '1 费'],
              ['2', '2 费'],
              ['3', '3 费'],
              ['4+', '4 费以上'],
            ],
            costCounts,
          ),
          ...(costCounts.has('X') ? [{ value: 'X', label: 'X 费', count: costCounts.get('X') }] : []),
        ],
      },
      { key: 'keyword', label: '关键词', options: keywordOptions },
    ];
  }

  if (category === 'relics') {
    const relics = items as Relic[];
    const rarityCounts = countBy(relics, (relic) => relic.rarity);
    const poolCounts = countBy(relics, (relic) => relic.pool);
    return [
      { key: 'rarity', label: '稀有度', options: optionsFrom(Object.entries(RELIC_RARITY_LABELS), rarityCounts), quick: true },
      {
        key: 'pool',
        label: '所属池',
        options: optionsFrom(
          ['shared', ...CLASS_ORDER].filter((id) => POOL_LABELS[id]).map((id) => [id, POOL_LABELS[id]]),
          poolCounts,
        ),
      },
    ];
  }

  if (category === 'monsters') {
    const monsters = items as Monster[];
    const tierCounts = countBy(monsters, (monster) => monster.tier);
    const actCounts = countBy(monsters, (monster) => monster.act);
    return [
      { key: 'tier', label: '等级', options: optionsFrom(Object.entries(TIER_LABELS), tierCounts), quick: true },
      {
        key: 'act',
        label: '幕',
        options: optionsFrom(
          Object.entries(ACT_LABELS).map(([value, label]) => [value, label]),
          actCounts,
        ),
      },
    ];
  }

  if (category === 'powers') {
    const powers = items as Power[];
    const typeCounts = countBy(powers, (power) => power.type);
    const stackCounts = countBy(powers, (power) => power.stackType);
    return [
      { key: 'type', label: '类型', options: optionsFrom(Object.entries(POWER_TYPE_LABELS), typeCounts), quick: true },
      { key: 'stack', label: '叠层', options: optionsFrom(Object.entries(STACK_LABELS), stackCounts) },
    ];
  }

  if (category === 'potions') {
    const potions = items as Potion[];
    const rarityCounts = countBy(potions, (potion) => potion.rarity);
    const poolCounts = countBy(potions, (potion) => potion.pool);
    return [
      { key: 'rarity', label: '稀有度', options: optionsFrom(Object.entries(POTION_RARITY_LABELS), rarityCounts), quick: true },
      {
        key: 'pool',
        label: '所属池',
        options: optionsFrom(
          ['shared', ...CLASS_ORDER].filter((id) => POOL_LABELS[id]).map((id) => [id, POOL_LABELS[id]]),
          poolCounts,
        ),
      },
    ];
  }

  if (category === 'enchantments') {
    const enchantments = items as Enchantment[];
    const typeCounts = countBy(enchantments, (enchantment) => enchantment.cardType || 'any');
    return [
      {
        key: 'type',
        label: '适用卡牌',
        quick: true,
        options: optionsFrom(
          [
            ['Attack', '攻击牌'],
            ['Skill', '技能牌'],
            ['Power', '能力牌'],
            ['any', '任意卡牌'],
          ],
          typeCounts,
        ),
      },
    ];
  }

  const modifiers = items as Modifier[];
  const typeCounts = countBy(modifiers, (modifier) => modifier.type);
  return [
    { key: 'type', label: '类型', options: optionsFrom(Object.entries(MODIFIER_TYPE_LABELS), typeCounts), quick: true },
  ];
}

function filterItems(category: CategoryId, items: CatalogItem[], filters: FilterState): CatalogItem[] {
  return items.filter((item) => {
    if (category === 'cards') {
      const card = item as Card;
      if (filters.cls && card.class !== filters.cls) return false;
      if (filters.type && card.type !== filters.type) return false;
      if (filters.rarity && card.rarity !== filters.rarity) return false;
      if (filters.keyword && !card.keywords.some((keyword) => keyword.id === filters.keyword)) return false;
      if (filters.cost) {
        if (filters.cost === 'X') {
          if (card.costLabel !== 'X') return false;
        } else if (filters.cost === '4+') {
          if (card.costLabel === 'X' || card.cost < 4) return false;
        } else if (card.costLabel !== filters.cost) {
          return false;
        }
      }
      return true;
    }

    if (category === 'relics') {
      const relic = item as Relic;
      if (filters.rarity && relic.rarity !== filters.rarity) return false;
      if (filters.pool && relic.pool !== filters.pool) return false;
      return true;
    }

    if (category === 'monsters') {
      const monster = item as Monster;
      if (filters.tier && monster.tier !== filters.tier) return false;
      if (filters.act && String(monster.act) !== filters.act) return false;
      return true;
    }

    if (category === 'powers') {
      const power = item as Power;
      if (filters.type && power.type !== filters.type) return false;
      if (filters.stack && power.stackType !== filters.stack) return false;
      return true;
    }

    if (category === 'potions') {
      const potion = item as Potion;
      if (filters.rarity && potion.rarity !== filters.rarity) return false;
      if (filters.pool && potion.pool !== filters.pool) return false;
      return true;
    }

    if (category === 'enchantments') {
      const enchantment = item as Enchantment;
      if (filters.type) {
        if (filters.type === 'any') {
          if (enchantment.cardType) return false;
        } else if (enchantment.cardType !== filters.type) return false;
      }
      return true;
    }

    const modifier = item as Modifier;
    if (filters.type && modifier.type !== filters.type) return false;
    return true;
  });
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return !!target.closest('input, textarea, select, [contenteditable="true"]');
}

export default function App() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [route, setRoute] = useState(readRoute);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [dataCategory, setDataCategory] = useState<CategoryId | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [sort, setSort] = useState('name');
  const [visible, setVisible] = useState(PAGE_SIZES[route.category]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const category = route.category;
  const categoryDef = CATEGORY_BY_ID.get(category)!;
  const categoryItems = dataCategory === category ? items : EMPTY_ITEMS;

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/cards');
    }
  }, []);

  useEffect(() => {
    loadMeta()
      .then(setMeta)
      .catch(() => setMeta(null));
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError('');
    setItems([]);
    setDataCategory(null);
    loadCategory(category)
      .then((data) => {
        if (!alive) return;
        setItems(data as CatalogItem[]);
        setDataCategory(category);
        setLoading(false);
      })
      .catch((error: Error) => {
        if (!alive) return;
        setLoadError(error.message);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [category]);

  useEffect(() => {
    setFilters({ ...EMPTY_FILTERS });
    setQuery('');
    setSort('name');
    setFiltersOpen(false);
    setVisible(PAGE_SIZES[category]);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category]);

  useEffect(() => {
    setVisible(PAGE_SIZES[category]);
  }, [category, query, filters, sort]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (isEditableTarget(event.target)) return;
      if (event.key === '/') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('[data-global-search]')?.focus();
      }
      if (event.key === 'Escape' && navOpen) setNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [navOpen]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 720);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const selectedName = route.itemId ? categoryItems.find((item) => item.id === route.itemId)?.name : null;
    document.title = selectedName
      ? `${selectedName} · ${categoryDef.label} | 停摆之钟`
      : `${categoryDef.label} · 万象档案 | 停摆之钟`;
  }, [route.itemId, categoryItems, categoryDef.label]);

  const navigate = useCallback((nextCategory: CategoryId, itemId?: string) => {
    const target = itemId ? `#/${nextCategory}/${encodeURIComponent(itemId)}` : `#/${nextCategory}`;
    if (window.location.hash === target) {
      setRoute({ category: nextCategory, itemId: itemId || null });
    } else {
      window.location.hash = target;
    }
  }, []);

  const goCategory = useCallback(
    (nextCategory: CategoryId) => {
      setNavOpen(false);
      navigate(nextCategory);
    },
    [navigate],
  );

  const filtersGroups = useMemo(() => buildFilterGroups(category, categoryItems), [category, categoryItems]);

  const searched = useMemo(() => categoryItems.filter((item) => matchesQuery(item, query)), [categoryItems, query]);
  const filtered = useMemo(() => sortItems(filterItems(category, searched, filters), sort), [category, searched, filters, sort]);
  const visibleItems = filtered.slice(0, visible);
  const activeFilterCount = countActiveFilters(filters);
  const counts = meta?.counts ?? ZERO_COUNTS;

  const selected = route.itemId ? categoryItems.find((item) => item.id === route.itemId) ?? null : null;
  const navList = selected && !filtered.some((item) => item.id === selected.id) ? categoryItems : filtered;
  const selectedIndex = selected ? navList.findIndex((item) => item.id === selected.id) : -1;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < navList.length - 1;

  const closeDrawer = useCallback(() => navigate(category), [navigate, category]);
  const prevItem = useCallback(() => {
    if (selectedIndex > 0) navigate(category, navList[selectedIndex - 1].id);
  }, [selectedIndex, navList, navigate, category]);
  const nextItem = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < navList.length - 1) navigate(category, navList[selectedIndex + 1].id);
  }, [selectedIndex, navList, navigate, category]);

  const onFilterChange = useCallback((key: FilterKey, value: string) => {
    setFilters((current) => ({ ...current, [key]: current[key] === value ? '' : value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
    setQuery('');
  }, []);

  const randomItem = useCallback(() => {
    if (!categoryItems.length) return;
    const pick = categoryItems[Math.floor(Math.random() * categoryItems.length)];
    navigate(category, pick.id);
  }, [categoryItems, category, navigate]);

  const onPaletteNavigate = useCallback(
    (nextCategory: CategoryId, itemId: string) => {
      navigate(nextCategory, itemId || undefined);
    },
    [navigate],
  );

  return (
    <div className="app-shell">
      <Header meta={meta} onOpenSearch={() => setPaletteOpen(true)} onOpenMenu={() => setNavOpen(true)} />
      <Sidebar active={category} counts={counts} meta={meta} open={navOpen} onClose={() => setNavOpen(false)} onNavigate={goCategory} />

      <main className="main">
        <nav className="mobile-tabs" aria-label="资料分类">
          {CATEGORIES.map((entry) => (
            <button
              key={entry.id}
              className={entry.id === category ? 'is-active' : ''}
              onClick={() => goCategory(entry.id)}
            >
              {entry.label}
              <span>{counts[entry.id] ?? 0}</span>
            </button>
          ))}
        </nav>

        <CategoryHero category={categoryDef} count={meta ? counts[category] : categoryItems.length} />

        <Toolbar
          category={categoryDef}
          query={query}
          onQueryChange={setQuery}
          resultCount={filtered.length}
          totalCount={categoryItems.length}
          sort={sort}
          sortOptions={SORT_OPTIONS[category]}
          onSortChange={setSort}
          groups={filtersGroups}
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={clearFilters}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((open) => !open)}
          onRandom={randomItem}
        />

        {loadError ? (
          <div className="empty-state">
            <span className="empty-glyph">
              <ClockMark />
            </span>
            <h2>档案暂时无法读取</h2>
            <p>{loadError}</p>
            <button className="primary-button" onClick={() => window.location.reload()}>
              重新翻阅
            </button>
          </div>
        ) : loading || dataCategory !== category ? (
          <div className={`item-grid item-grid--${category}`} aria-label="正在读取档案">
            {Array.from({ length: category === 'cards' ? 12 : 8 }, (_, index) => (
              <div className="skeleton-tile" key={index} style={{ animationDelay: `${index * 40}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-glyph">
              <SearchIcon />
            </span>
            <h2>这一页没有留下记录</h2>
            <p>换一个关键词，或放宽筛选条件，也许能在别的抽屉里找到它。</p>
            <button className="primary-button" onClick={clearFilters}>
              清除筛选
            </button>
          </div>
        ) : (
          <>
            <ItemGrid
              category={category}
              items={visibleItems}
              selectedId={selected?.id ?? null}
              onSelect={(id) => navigate(category, id)}
            />
            {filtered.length > visible && (
              <div className="load-more-wrap">
                <button className="load-more" onClick={() => setVisible((value) => value + PAGE_SIZES[category])}>
                  <span>载入更多</span>
                  <small>还剩 {formatNumber(filtered.length - visible)} 条</small>
                </button>
              </div>
            )}
            <div className="result-foot">
              已展示 {formatNumber(visibleItems.length)} / {formatNumber(filtered.length)} 条
              {activeFilterCount > 0 && <span> · {activeFilterCount} 项筛选生效</span>}
            </div>
          </>
        )}

        <footer className="site-footer">
          <div className="footer-mark">
            <ClockMark />
            <span>停摆之钟 · 万象档案</span>
          </div>
          <div className="footer-meta">
            <span>资料库版本 {meta?.version ?? '—'}</span>
            <span>游戏内容 {meta?.gameVersion ?? '—'}</span>
            <span>更新于 {meta ? new Date(meta.builtAt).toLocaleDateString('zh-CN') : '—'}</span>
          </div>
          <p>数据整理自社区资料库，仅供研究与展示。所有美术与文字内容的权利归原权利人所有。</p>
        </footer>
      </main>

      {showTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="回到顶部">
          <ChevronIcon />
        </button>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={onPaletteNavigate} />
      {selected && (
        <DetailDrawer
          category={category}
          item={selected}
          onClose={closeDrawer}
          onPrev={prevItem}
          onNext={nextItem}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}
    </div>
  );
}
