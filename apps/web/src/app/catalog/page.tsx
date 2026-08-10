import type { Metadata } from "next";
import Link from "next/link";
import styles from "./catalog.module.css";

export const metadata: Metadata = {
  title: "Каталог",
};

type MasterCard = {
  slug: string;
  name: string;
  district: string;
  priceFrom: number;
  rating: number;
  specialty: string;
};

const MASTERS: MasterCard[] = [
  {
    slug: "anna-nails",
    name: "Анна Кравцова",
    district: "Центр",
    priceFrom: 55,
    rating: 4.9,
    specialty: "Маникюр · педикюр",
  },
  {
    slug: "masha-brows",
    name: "Мария Светлова",
    district: "Немига",
    priceFrom: 40,
    rating: 4.8,
    specialty: "Брови · ламинирование",
  },
  {
    slug: "kira-lash",
    name: "Кира Орлова",
    district: "Уручье",
    priceFrom: 70,
    rating: 5.0,
    specialty: "Наращивание ресниц",
  },
  {
    slug: "olga-skin",
    name: "Ольга Ветрова",
    district: "Грушевка",
    priceFrom: 90,
    rating: 4.7,
    specialty: "Уход за лицом",
  },
];

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

export default async function CatalogPage() {
  const health = await getApiHealth();

  return (
    <main className={styles.page}>
      <div className="shell">
        <header className="site-header">
          <Link href="/" className="brand">
            Lustra
          </Link>
          <nav className="nav" aria-label="Основная навигация">
            <Link href="/catalog">Каталог</Link>
            <Link href="/app">Кабинет</Link>
          </nav>
        </header>

        <section className={styles.intro}>
          <h1 className={styles.heading}>Мастера рядом</h1>
          <p className={styles.sub}>
            Подборка для демо — статические карточки до подключения API.
          </p>
          <p className="status" role="status">
            <span
              className={`status-dot ${health === "ok" ? "ok" : "offline"}`}
              aria-hidden
            />
            API {health === "ok" ? "ok" : "offline"} · localhost:3333
          </p>
        </section>

        <ul className={styles.list}>
          {MASTERS.map((master) => (
            <li key={master.slug}>
              <Link href={`/m/${master.slug}`} className={styles.card}>
                <div className={styles.cardTop}>
                  <h2 className={styles.name}>{master.name}</h2>
                  <span className={styles.rating}>{master.rating.toFixed(1)}</span>
                </div>
                <p className={styles.specialty}>{master.specialty}</p>
                <div className={styles.cardMeta}>
                  <span>{master.district}</span>
                  <span>от {master.priceFrom} BYN</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
