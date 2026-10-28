import type { Meta } from '../data';
import { ClockMark, ExternalIcon, MenuIcon, SearchIcon } from './Icons';

interface HeaderProps {
  meta: Meta | null;
  onOpenSearch: () => void;
  onOpenMenu: () => void;
}

export default function Header({ meta, onOpenSearch, onOpenMenu }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onOpenMenu} aria-label="打开目录">
          <MenuIcon />
        </button>
        <a className="brand" href="#/cards" aria-label="停摆之钟 · 万象档案首页">
          <span className="brand-mark">
            <ClockMark />
          </span>
          <span className="brand-copy">
            <span className="brand-cn">停摆之钟</span>
            <span className="brand-en">THE STOPPED CLOCK</span>
          </span>
        </a>
      </div>

      <div className="topbar-center" aria-hidden="true">
        <span className="topbar-center-cn">万象档案</span>
        <span className="topbar-center-line" />
        <span className="topbar-center-en">ARCHIVE OF ALL THINGS</span>
      </div>

      <div className="topbar-right">
        <button className="global-search" onClick={onOpenSearch}>
          <SearchIcon />
          <span>全局检索</span>
          <kbd>
            <span className="kbd-mod">Ctrl</span>K
          </kbd>
        </button>
        <span className="topbar-version" title={`内容版本 ${meta?.version ?? '加载中'}`}>
          <span className="status-dot" />
          {meta?.version ?? '···'}
        </span>
        <a
          className="icon-button"
          href="https://github.com/mtshen01/clock-of-fate-web"
          target="_blank"
          rel="noreferrer"
          aria-label="查看网站源码"
        >
          <ExternalIcon />
        </a>
      </div>
    </header>
  );
}
