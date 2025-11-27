import { CardSection } from '@/components/CardSection';
import { DateUtils } from '@/lib/utils';

interface ContractSectionProps {
  contract: {
    amount: number;
    contractType: number;
    initialFee: string;
    monthlySalary: string;
    dateOfSigning: string;
    weightToSalary: string;
  };
  contractDaysLeft: number | null;
}

export function ContractSection({
  contract,
  contractDaysLeft,
}: ContractSectionProps) {
  return (
    <CardSection title="Contract" collapsible defaultCollapsed>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">Years</div>
          <div className="font-mono">{contract.amount}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Days Left</div>
          <div className="font-mono">
            {contract.contractType === 2 ? '∞' : contractDaysLeft ?? '-'}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Initial Fee</div>
          <div className="font-mono">${contract.initialFee}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Monthly</div>
          <div className="font-mono">${contract.monthlySalary}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">Signed</div>
          <div className="font-mono text-xs">
            {DateUtils.fromDate(new Date(contract.dateOfSigning)).format()}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Weight/Salary</div>
          <div className="font-mono">{contract.weightToSalary}</div>
        </div>
      </div>
    </CardSection>
  );
}
