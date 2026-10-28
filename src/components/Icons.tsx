import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.35,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

export function ClockMark(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <path d="M12 7.2V12l3.3 2" />
      <path d="M12 3v1.4M21 12h-1.4M12 21v-1.4M3 12h1.4" opacity=".7" />
      <path d="M6.2 6.2 7.2 7.2M17.8 6.2 16.8 7.2M6.2 17.8 7.2 16.8M17.8 17.8 16.8 16.8" opacity=".45" />
    </svg>
  );
}

export function CategoryGlyph({ id, ...props }: IconProps & { id: string }) {
  switch (id) {
    case 'cards':
      return (
        <svg {...base} {...props}>
          <rect x="7.5" y="4" width="11" height="15" rx="1.2" transform="rotate(6 13 11.5)" />
          <rect x="4.5" y="5.5" width="11" height="15" rx="1.2" />
          <path d="M7.5 9h5M7.5 12h3.5" opacity=".65" />
        </svg>
      );
    case 'relics':
      return (
        <svg {...base} {...props}>
          <path d="m12 3 3.2 3.4L19 8.8l-2 7.7-5 4.5-5-4.5-2-7.7 3.8-2.4L12 3Z" />
          <path d="m12 3-.4 7.2L6.4 8.8M12 3l.4 7.2 5.2-1.4M12 10.2l-1.5 4.5 1.5 2.3 1.5-2.3-1.5-4.5Z" opacity=".75" />
        </svg>
      );
    case 'monsters':
      return (
        <svg {...base} {...props}>
          <path d="M5.2 9.8c0-3.2 2.8-5.4 6.8-5.4s6.8 2.2 6.8 5.4c0 2.2-1 3.4-2.2 4.2v2.3l-2.1-1.2c-.8.2-1.6.3-2.5.3s-1.7-.1-2.5-.3L7.4 16.3V14c-1.2-.8-2.2-2-2.2-4.2Z" />
          <path d="M9.2 10.2h.1M14.7 10.2h.1" strokeWidth="2.4" />
          <path d="M10.5 13.4c.9.6 2.1.6 3 0M8 6.6 6.2 4.2M16 6.6l1.8-2.4" opacity=".8" />
        </svg>
      );
    case 'powers':
      return (
        <svg {...base} {...props}>
          <path d="M2.8 12s3.4-5.4 9.2-5.4S21.2 12 21.2 12s-3.4 5.4-9.2 5.4S2.8 12 2.8 12Z" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 2.6v2M12 19.4v2M4.6 5l1.4 1.4M18 17.6l1.4 1.4M4.6 19l1.4-1.4M18 6.4 19.4 5" opacity=".55" />
        </svg>
      );
    case 'enchantments':
      return (
        <svg {...base} {...props}>
          <circle cx="12" cy="12" r="8.3" />
          <circle cx="12" cy="12" r="3.1" />
          <path d="M12 3.7v3M12 17.3v3M3.7 12h3M17.3 12h3M6.1 6.1l2.1 2.1M15.8 15.8l2.1 2.1M17.9 6.1l-2.1 2.1M8.2 15.8l-2.1 2.1" opacity=".65" />
        </svg>
      );
    case 'potions':
      return (
        <svg {...base} {...props}>
          <path d="M9.2 3.5h5.6M10.2 3.5v5.1L5.8 16c-.8 1.5.2 3.2 1.9 3.2h8.6c1.7 0 2.7-1.7 1.9-3.2l-4.4-7.4V3.5" />
          <path d="M8 14.5h8M10.5 17.6h.1M13.5 17.1h.1" opacity=".7" />
          <path d="M11.8 6.8h.4" strokeWidth="2.6" />
        </svg>
      );
    case 'modifiers':
      return (
        <svg {...base} {...props}>
          <path d="M20 14.4A8.4 8.4 0 1 1 9.6 4a6.7 6.7 0 0 0 10.4 10.4Z" />
          <path d="M15.8 3.8v2.4M14.6 5h2.4" opacity=".8" />
        </svg>
      );
    default:
      return <ClockMark {...props} />;
  }
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.6 15.6 4.3 4.3" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 6h17M6.5 12h11M10 18h4" />
      <circle cx="8" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13 5h6v6M19 5l-8 8M17.5 13.5V19h-12V7h5.5" />
    </svg>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 7h3.2c1.4 0 2.2.7 3 2l4.6 6c.8 1.3 1.6 2 3 2h3.2M17.5 14l3 3-3 3M3.5 17h3.2c1.4 0 2.2-.7 3-2l.8-1M13 9l.8-1c.8-1.3 1.6-2 3-2h3.2M17.5 3l3 3-3 3" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m7 9.5 5 5 5-5" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.8c.4 4.7 2.5 6.8 7.2 7.2-4.7.4-6.8 2.5-7.2 7.2-.4-4.7-2.5-6.8-7.2-7.2 4.7-.4 6.8-2.5 7.2-7.2Z" />
      <path d="M18.8 16.4c.2 1.8 1 2.6 2.8 2.8-1.8.2-2.6 1-2.8 2.8-.2-1.8-1-2.6-2.8-2.8 1.8-.2 2.6-1 2.8-2.8Z" opacity=".7" />
    </svg>
  );
}
