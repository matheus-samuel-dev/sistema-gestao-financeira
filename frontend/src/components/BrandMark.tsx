import { useId, type CSSProperties } from 'react';

interface BrandMarkProps {
  className?: string;
  size?: number;
  style?: CSSProperties;
  title?: string;
}

export function BrandMark({ className, size = 44, style, title }: BrandMarkProps) {
  const id = useId().replace(/:/g, '');
  const bgId = `brand-bg-${id}`;
  const accentId = `brand-accent-${id}`;

  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      height={size}
      role={title ? 'img' : undefined}
      style={style}
      viewBox="0 0 512 512"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={bgId} x1="64" x2="448" y1="64" y2="448" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E7490" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id={accentId} x1="128" x2="390" y1="362" y2="148" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#FACC15" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" fill={`url(#${bgId})`} />
      <path
        d="M128 332c56-70 98-88 138-70 47 22 68 0 118-82"
        fill="none"
        stroke={`url(#${accentId})`}
        strokeWidth="42"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M352 168h44v44"
        fill="none"
        stroke="#FACC15"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="118" y="364" width="276" height="38" rx="19" fill="#ECFEFF" opacity=".92" />
      <rect x="118" y="110" width="276" height="64" rx="32" fill="#ECFEFF" opacity=".18" />
    </svg>
  );
}
