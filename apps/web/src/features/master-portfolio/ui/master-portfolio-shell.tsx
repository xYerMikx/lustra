'use client'

import { MasterPortfolioBody } from '@/features/master-portfolio/ui/master-portfolio-body'
import { useMasterPortfolio } from '@/features/master-portfolio/model/use-master-portfolio'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'

export function MasterPortfolioShell() {
  const portfolio = useMasterPortfolio()

  return (
    <div className={styles.wrap}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Кабинет мастера</p>
        <h1 className={styles.title}>Портфолио</h1>
        <p className={styles.copy}>
          До 60 фото. Перед загрузкой сжимаем до 2000 px и WebP. Первое фото
          становится обложкой.
        </p>
        <MasterPortfolioBody {...portfolio} />
      </section>
    </div>
  )
}
