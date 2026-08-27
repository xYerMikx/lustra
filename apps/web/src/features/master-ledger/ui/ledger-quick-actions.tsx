import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'

type LedgerQuickActionsProps = {
  onTip: () => void
  onExpense: () => void
}

export function LedgerQuickActions({ onTip, onExpense }: LedgerQuickActionsProps) {
  return (
    <div className={styles.quick}>
      <Button
        type="button"
        onClick={onTip}
        data-testid={TEST_ID.ledgerQuickTip}
        fullWidth
      >
        Чаевые
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onExpense}
        data-testid={TEST_ID.ledgerQuickExpense}
        fullWidth
      >
        Расход
      </Button>
    </div>
  )
}
