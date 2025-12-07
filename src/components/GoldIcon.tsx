interface GoldIconProps {
  src: string;
  alt: string;
  className?: string;
}

const GOLD_FILTER = 'brightness(0) saturate(100%) invert(76%) sepia(29%) saturate(616%) hue-rotate(357deg) brightness(95%) contrast(89%) drop-shadow(0 0 3px rgba(212, 168, 85, 0.8))';

export function GoldIcon({ src, alt, className = 'h-5 w-5' }: GoldIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      title={alt}
      className={className}
      style={{ filter: GOLD_FILTER }}
    />
  );
}
