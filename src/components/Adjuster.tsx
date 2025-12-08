interface AdjusterProps {
  value: string | number;
  onDecreaseMouseDown?: () => void;
  onDecreaseMouseUp?: () => void;
  onDecreaseClick?: () => void;
  onIncreaseMouseDown?: () => void;
  onIncreaseMouseUp?: () => void;
  onIncreaseClick?: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
}

export function Adjuster({
  value,
  onDecreaseMouseDown,
  onDecreaseMouseUp,
  onDecreaseClick,
  onIncreaseMouseDown,
  onIncreaseMouseUp,
  onIncreaseClick,
  decreaseDisabled = false,
  increaseDisabled = false,
}: AdjusterProps) {
  return (
    <div className="flex items-center w-[88px]">
      {decreaseDisabled ? (
        <span className="w-7 h-7 flex items-center justify-center text-xs">Min</span>
      ) : (
        <button
          className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-l-md border-l border-t border-b border-border"
          onMouseDown={onDecreaseMouseDown}
          onMouseUp={onDecreaseMouseUp}
          onMouseLeave={onDecreaseMouseUp}
          onClick={onDecreaseClick}
        >
          -
        </button>
      )}
      <span className="font-mono w-8 h-7 flex items-center justify-center text-xs border border-border">{value}</span>
      {increaseDisabled ? (
        <span className="w-7 h-7 flex items-center justify-center text-xs">Max</span>
      ) : (
        <button
          className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-r-md border-r border-t border-b border-border"
          onMouseDown={onIncreaseMouseDown}
          onMouseUp={onIncreaseMouseUp}
          onMouseLeave={onIncreaseMouseUp}
          onClick={onIncreaseClick}
        >
          +
        </button>
      )}
    </div>
  );
}