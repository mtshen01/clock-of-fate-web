import { CATEGORIES, formatNumber, type CategoryId, type Meta } from '../data';
import { CategoryGlyph, ClockMark, CloseIcon } from './Icons';

interface SidebarProps {
  active: CategoryId;
  counts: Record<CategoryId, number>;
  meta: Meta | null;
  open: boolean;
  onClose: () => void;
  onNavigate: (category: CategoryId) => void;
}

export default function Sidebar({ active, counts, meta, open, onClose, onNavigate }: SidebarProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return (
    <>
      <div className={`sidebar-scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="资料库目录">
        <div className="sidebar-mobile-head">
          <span className="sidebar-mobile-brand">
            <ClockMark />
            万象档案
          </span>
          <button className="icon-button" onClick={onClose} aria-label="关闭目录">
            <CloseIcon />
          </button>
        </div>

        <div className="sidebar-heading">
          <span>目录</span>
          <span className="sidebar-heading-en">INDEX</span>
        </div>

        <nav className="category-nav">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`category-link ${active === category.id ? 'is-active' : ''}`}
              onClick={() => onNavigate(category.id)}
              aria-current={active === category.id ? 'page' : undefined}
            >
              <span className="category-numeral">{category.numeral}</span>
              <span className="category-glyph">
                <CategoryGlyph id={category.glyph} />
              </span>
              <span className="category-link-copy">
                <span className="category-link-label">{category.label}</span>
                <span className="category-link-latin">{category.latin}</span>
              </span>
              <span className="category-count">{formatNumber(counts[category.id] ?? 0)}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-rule" />
          <div className="sidebar-version">
            <span>档案版本</span>
            <strong>{meta?.version ?? '读取中'}</strong>
          </div>
          <div className="sidebar-total">{total ? `共 ${formatNumber(total)} 条档案` : '正在读取档案'}</div>
          <p>
            数据整理自社区资料库
            <br />
            内容仅供研究与展示
          </p>
          <div className="sidebar-seal" aria-hidden="true">
            <span>EST.</span>
            <strong>MMXXVI</strong>
          </div>
        </div>
      </aside>
    </>
  );
}
