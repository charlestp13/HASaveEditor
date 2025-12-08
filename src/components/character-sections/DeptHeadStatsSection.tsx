import { Adjuster } from '@/components/Adjuster';
import { SelfEsteemAdjuster } from '@/components/SelfEsteemAdjuster';
import { useHoldAcceleration } from '@/hooks/useHoldAcceleration';

interface DeptHeadStatsSectionProps {
  selfEsteem: number;
  bonusCardMoney: number;
  bonusCardInfluencePoints: number;
  onUpdate?: (field: string, value: number | null) => void;
}

export function DeptHeadStatsSection({
  selfEsteem,
  bonusCardMoney,
  bonusCardInfluencePoints,
  onUpdate,
}: DeptHeadStatsSectionProps) {
  const { startHold: startMoneyHold, stopHold: stopMoneyHold } = useHoldAcceleration(
    bonusCardMoney,
    (v) => onUpdate?.('bonusCardMoney', v),
    { initialStep: 1, acceleratedStep: 1 },
    0,
    4
  );

  const { startHold: startInfluenceHold, stopHold: stopInfluenceHold } = useHoldAcceleration(
    bonusCardInfluencePoints,
    (v) => onUpdate?.('bonusCardInfluencePoints', v),
    { initialStep: 1, acceleratedStep: 1 },
    0,
    4
  );

  return (
    <div className="space-y-2">
      <SelfEsteemAdjuster
        value={selfEsteem}
        onChange={(v) => onUpdate?.('selfEsteem', v)}
      />
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">Budget Bonus</div>
        <Adjuster
          value={`${bonusCardMoney * 10}%`}
          onDecreaseMouseDown={() => startMoneyHold(-1)}
          onDecreaseMouseUp={stopMoneyHold}
          onIncreaseMouseDown={() => startMoneyHold(1)}
          onIncreaseMouseUp={stopMoneyHold}
          decreaseDisabled={bonusCardMoney <= 0}
          increaseDisabled={bonusCardMoney >= 4}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">Influence Bonus</div>
        <Adjuster
          value={`${bonusCardInfluencePoints * 10}%`}
          onDecreaseMouseDown={() => startInfluenceHold(-1)}
          onDecreaseMouseUp={stopInfluenceHold}
          onIncreaseMouseDown={() => startInfluenceHold(1)}
          onIncreaseMouseUp={stopInfluenceHold}
          decreaseDisabled={bonusCardInfluencePoints <= 0}
          increaseDisabled={bonusCardInfluencePoints >= 4}
        />
      </div>
    </div>
  );
}
