import Link from "next/link";
import styles from "./page.module.css";

async function getApiHealth(): Promise<"ok" | "offline"> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
  try {
    const res = await fetch(`${base}/health`, {
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(2500),
    });
    return res.ok ? "ok" : "offline";
  } catch {
    return "offline";
  }
}

export default async function HomePage() {
  const health = await getApiHealth();

  return (
    <main className={styles.page}>
      <div className="shell">
        <header className="site-header">
          <span className="brand">Lustra</span>
          <nav className="nav" aria-label="Основная навигация">
            <Link href="/catalog">Каталог</Link>
            <Link href="/app">Кабинет</Link>
          </nav>
        </header>

        <section className={styles.hero}>
          <p className={styles.kicker}>Минск · бьюти-мастера</p>
          <h1 className={styles.title}>Lustra</h1>
          <p className={styles.lead}>
            Находите проверенных мастеров и записывайтесь без лишних переписок.
          </p>
          <div className={styles.actions}>
            <Link className="btn btn-primary" href="/catalog">
              Смотреть каталог
            </Link>
            <Link className="btn btn-ghost" href="/m/anna-nails">
              Пример профиля
            </Link>
          </div>
          <p className={styles.meta}>
            API: <code>localhost:3333</code>
            <span className="status" role="status">
              <span
                className={`status-dot ${health === "ok" ? "ok" : "offline"}`}
                aria-hidden
              />
              {health === "ok" ? "ok" : "offline"}
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}
