interface IconBadgeProps {
  iconPath: string;
  text: string;
  color: string;
  title?: string;
  variant?: 'pill' | 'rounded';
  inactive?: boolean;
  size?: 'sm' | 'md';
}

export function IconBadge({ 
  iconPath, 
  text, 
  color, 
  title, 
  variant = 'pill',
  inactive = false,
  size = 'md'
}: IconBadgeProps) {
  const roundedClass = variant === 'pill' ? 'rounded-full' : 'rounded';
  const paddingClass = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textColor = inactive ? 'text-muted-foreground' : undefined;
  const borderColor = inactive ? 'border-muted' : color;
  const bgColor = inactive ? undefined : `${color}20`;

  return (
    <div 
      className={`flex items-center gap-2 ${paddingClass} ${roundedClass} border w-fit`}
      style={{ 
        borderColor,
        backgroundColor: bgColor
      }}
      title={title}
    >
      <img 
        src={iconPath} 
        alt={text} 
        className="w-4 h-4 object-contain"
      />
      <span 
        className={`text-xs font-medium ${textColor || ''}`}
        style={!inactive ? { color } : undefined}
      >
        {text}
      </span>
    </div>
  );
}