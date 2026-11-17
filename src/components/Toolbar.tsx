import type { CSSProperties } from 'react';
import type { CategoryDef } from '../data';
import { ChevronIcon, CloseIcon, FilterIcon, SearchIcon, ShuffleIcon } from './Icons';
import type { FilterGroup, FilterKey, FilterOption, FilterState } from '../filters';

interface ToolbarProps {
  category: CategoryDef;
  query: string;
  onQueryChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  sort: string;
  sortOptions: Array<{ value: string; label: string }>;
  onSortChange: (value: string) => void;
  groups: FilterGroup[];
  filters: FilterState;
  onFilterChange: (key: FilterKey, value: string) => void;
  onClearFilters: () => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  onRandom: () => void;
}

function OptionChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button className={`chip ${active ? 'is-active' : ''}`} onClick={onClick} aria-pressed={active}>
      {label}
      {typeof count === 'number' && <span className="chip-count">{count}</span>}
    </button>
  );
}

function HeroChip({
  active,
  option,
  onClick,
}: {
  active: boolean;
  option: FilterOption;
  onClick: () => void;
}) {
  const style = { '--hero-accent': option.accent || 'var(--brass)' } as CSSProperties;
  return (
    <button
      className={`hero-chip ${active ? 'is-active' : ''}`}
      style={style}
      onClick={onClick}
      aria-pressed={active}
      title={`${option.label}${typeof option.count === 'number' ? ` · ${option.count} 张卡牌` : ''}`}
    >
      <span className="hero-chip-avatar" aria-hidden="true">
        <span className="hero-chip-initial">{option.label.slice(0, 1)}</span>
        {option.portrait && (
          <img
            src={option.portrait}
            alt=""
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        )}
      </span>
      <span className="hero-chip-copy">
        <strong>{option.label}</strong>
        {typeof option.count === 'number' && <small>{option.count}</small>}
      </span>
    </button>
  );
}

export default function Toolbar({
  category,
  query,
  onQueryChange,
  resultCount,
  totalCount,
  sort,
  sortOptions,
  onSortChange,
  groups,
  filters,
  onFilterChange,
  onClearFilters,
  filtersOpen,
  onToggleFilters,
  onRandom,
}: ToolbarProps) {
  const quick = groups.find((group) => group.quick);
  const advancedGroups = groups.filter((group) => !group.quick);
  const activeAdvanced = advancedGroups.flatMap((group) =>
    group.options
      .filter((option) => option.value && filters[group.key] === option.value)
      .map((option) => ({ group, option })),
  );
  const hasActive = activeAdvanced.length > 0 || Object.values(filters).some(Boolean);
  const hasAdvanced = advancedGroups.length > 0;

  return (
    <div className="toolbar-sticky">
      <div className="toolbar">
        <label className="search-field">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
            placeholder={`在${category.label}中筛选…`}
            aria-label={`在${category.label}中筛选`}
            enterKeyHint="search"
            inputMode="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            data-global-search
          />
          {query && (
            <button className="search-clear" onClick={() => onQueryChange('')} aria-label="清空搜索">
              <CloseIcon />
            </button>
          )}
          <kbd className="search-kbd">/</kbd>
        </label>

        <div className="result-count" aria-live="polite">
          <strong>{resultCount}</strong>
          <span>/ {totalCount}</span>
        </div>

        <label className="sort-control">
          <span>排序</span>
          <select value={sort} onChange={(event) => onSortChange(event.target.value)} aria-label="排序方式">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </label>

        {hasAdvanced && (
          <button
            className={`filter-button ${filtersOpen ? 'is-active' : ''}`}
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
          >
            <FilterIcon />
            筛选
            {activeAdvanced.length > 0 && <span className="filter-badge">{activeAdvanced.length}</span>}
          </button>
        )}

        <button className="random-button" onClick={onRandom} title="随机打开一条档案">
          <ShuffleIcon />
          <span>随机</span>
        </button>
      </div>

      {(quick || activeAdvanced.length > 0) && (
        <div className="quick-row">
          {quick && (
            <div
              className={`quick-group ${quick.variant === 'hero' ? 'quick-group--hero' : ''}`}
              role="group"
              aria-label={quick.label}
            >
              <span className="quick-label">{quick.label}</span>
              <OptionChip
                active={!filters[quick.key]}
                label="全部"
                onClick={() => onFilterChange(quick.key, '')}
              />
              {quick.options
                .filter((option) => option.value)
                .map((option) =>
                  quick.variant === 'hero' ? (
                    <HeroChip
                      key={option.value}
                      active={filters[quick.key] === option.value}
                      option={option}
                      onClick={() => onFilterChange(quick.key, option.value)}
                    />
                  ) : (
                    <OptionChip
                      key={option.value}
                      active={filters[quick.key] === option.value}
                      label={option.label}
                      count={option.count}
                      onClick={() => onFilterChange(quick.key, option.value)}
                    />
                  ),
                )}
            </div>
          )}

          {activeAdvanced.map(({ group, option }) => (
            <button
              key={`${group.key}-${option.value}`}
              className="active-filter-chip"
              onClick={() => onFilterChange(group.key, '')}
              title={`取消筛选：${option.label}`}
            >
              <span className="active-filter-group">{group.label}</span>
              {option.label}
              <CloseIcon />
            </button>
          ))}

          {hasActive && (
            <button className="clear-filters" onClick={onClearFilters}>
              清除
            </button>
          )}
        </div>
      )}

      {hasAdvanced && filtersOpen && (
        <div className="filter-panel">
          <div className="filter-panel-head">
            <span>
              精炼索引 <small>REFINE</small>
            </span>
            <button onClick={onClearFilters} disabled={!hasActive}>
              清除全部
            </button>
          </div>
          {advancedGroups.map((group) => (
            <div className="filter-group" key={group.key}>
              <div className="filter-group-label">{group.label}</div>
              <div className="filter-options">
                <OptionChip
                  active={!filters[group.key]}
                  label="全部"
                  onClick={() => onFilterChange(group.key, '')}
                />
                {group.options
                  .filter((option) => option.value)
                  .map((option) => (
                    <OptionChip
                      key={option.value}
                      active={filters[group.key] === option.value}
                      label={option.label}
                      count={option.count}
                      onClick={() => onFilterChange(group.key, option.value)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
