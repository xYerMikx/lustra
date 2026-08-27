import { ButtonLink } from '@/shared/ui/button'
import styles from '@/features/master-profile-edit/ui/master-profile-edit.module.css'

export function ProfileLedgerHint() {
  return (
    <div className={styles.ledgerHint}>
      <h2 className={styles.ledgerHintTitle}>Касса</h2>
      <p className={styles.copy}>
        Доход с визитов считается сам. Чаевые и расходы на материалы или аренду
        мастер записывает в кассе — клиенты эти цифры не видят.
      </p>
      <ButtonLink href="/app/master/ledger" variant="ghost">
        Открыть кассу
      </ButtonLink>
    </div>
  )
}
