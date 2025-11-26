interface IconButtonProps {
  icon?: string;
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  selectedBorderColor: string;
  onClick: () => void;
  iconSize?: 'sm' | 'md';
  textAlign?: 'left' | 'center';
}

export function IconButton({
  icon,
  label,
  isSelected,
  isDisabled,
  selectedBorderColor,
  onClick,
  iconSize = 'md',
  textAlign = 'center',
}: IconButtonProps) {
  const isClickable = isSelected || !isDisabled;
  const iconSizeClass = iconSize === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textAlignClass = textAlign === 'left' ? 'text-left' : '';
  const selectedBorderStyle = { borderLeftColor: selectedBorderColor };

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`flex items-center gap-2 px-3 py-2 rounded border bg-card hover:bg-accent transition-colors text-sm font-medium ${textAlignClass} ${
        isSelected ? 'border-l-4' : ''
      } ${!isClickable ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={isSelected ? selectedBorderStyle : undefined}
    >
      {icon && (
        <img
          src={icon}
          alt={label}
          className={`${iconSizeClass} object-contain flex-shrink-0`}
        />
      )}
      <span className={textAlign === 'left' ? 'flex-1' : ''}>{label}</span>
    </button>
  );
}
