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
    <div className="flex items-center rounded-md border border-border overflow-hidden w-[88px]">
      <button
        className="w-7 h-7 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed border-r border-border"
        onMouseDown={onDecreaseMouseDown}
        onMouseUp={onDecreaseMouseUp}
        onMouseLeave={onDecreaseMouseUp}
        onClick={onDecreaseClick}
        disabled={decreaseDisabled}
      >
        -
      </button>
      <span className="font-mono flex-1 text-center text-xs">{value}</span>
      <button
        className="w-7 h-7 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed border-l border-border"
        onMouseDown={onIncreaseMouseDown}
        onMouseUp={onIncreaseMouseUp}
        onMouseLeave={onIncreaseMouseUp}
        onClick={onIncreaseClick}
        disabled={increaseDisabled}
      >
        +
      </button>
    </div>
  );
}