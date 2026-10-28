import { formatNumber, type CategoryDef } from '../data';

function ClockDial() {
  return (
    <svg className="hero-dial" viewBox="0 0 240 240" aria-hidden="true">
      <circle cx="120" cy="120" r="116" className="dial-rim" />
      <circle cx="120" cy="120" r="104" className="dial-rim-thin" />
      <circle cx="120" cy="120" r="78" className="dial-rim-faint" />
      {Array.from({ length: 48 }, (_, index) => {
        const angle = (index / 48) * Math.PI * 2 - Math.PI / 2;
        const inner = index % 4 === 0 ? 92 : 98;
        const outer = 104;
        return (
          <line
            key={index}
            x1={120 + Math.cos(angle) * inner}
            y1={120 + Math.sin(angle) * inner}
            x2={120 + Math.cos(angle) * outer}
            y2={120 + Math.sin(angle) * outer}
            className={index % 4 === 0 ? 'dial-tick major' : 'dial-tick'}
          />
        );
      })}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((numeral) => {
        const angle = (numeral / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <text
            key={numeral}
            x={120 + Math.cos(angle) * 68}
            y={120 + Math.sin(angle) * 68 + 4}
            textAnchor="middle"
            className="dial-numeral"
          >
            {numeral}
          </text>
        );
      })}
      <line x1="120" y1="120" x2="120" y2="76" className="dial-hand" />
      <line x1="120" y1="120" x2="156" y2="139" className="dial-hand thin" />
      <circle cx="120" cy="120" r="4" className="dial-pin" />
    </svg>
  );
}

interface CategoryHeroProps {
  category: CategoryDef;
  count: number;
}

export default function CategoryHero({ category, count }: CategoryHeroProps) {
  return (
    <section className="category-hero" aria-labelledby="category-title">
      <div className="hero-glow" aria-hidden="true" />
      <ClockDial />
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="hero-index">{category.numeral}</span>
          <span className="hero-eyebrow-line" />
          <span>{category.latin}</span>
        </div>
        <h1 id="category-title">
          {category.label}
          <span className="hero-title-mark">/</span>
          <em>{category.latin}</em>
        </h1>
        <p>{category.description}</p>
      </div>
      <div className="hero-count">
        <strong>{formatNumber(count)}</strong>
        <span>收录条目</span>
      </div>
    </section>
  );
}
