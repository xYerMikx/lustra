import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./master.module.css";

type Service = {
  title: string;
  durationMin: number;
  price: number;
};

type Master = {
  slug: string;
  name: string;
  district: string;
  bio: string;
  rating: number;
  services: Service[];
};

const MASTERS: Record<string, Master> = {
  "anna-nails": {
    slug: "anna-nails",
    name: "Анна Кравцова",
    district: "Центр",
    bio: "Чистый маникюр и спокойный студийный ритм. Работаю с натуральной пластиной и бережными покрытиями.",
    rating: 4.9,
    services: [
      { title: "Маникюр + покрытие", durationMin: 90, price: 55 },
      { title: "Снятие + маникюр", durationMin: 60, price: 35 },
      { title: "Педикюр комплекс", durationMin: 105, price: 70 },
    ],
  },
  "masha-brows": {
    slug: "masha-brows",
    name: "Мария Светлова",
    district: "Немига",
    bio: "Форма бровей под лицо и мягкое ламинирование без жёсткого эффекта.",
    rating: 4.8,
    services: [
      { title: "Коррекция бровей", durationMin: 40, price: 40 },
      { title: "Ламинирование", durationMin: 70, price: 65 },
    ],
  },
  "kira-lash": {
    slug: "kira-lash",
    name: "Кира Орлова",
    district: "Уручье",
    bio: "Лёгкие объёмы и естественная линия ресниц под ваш разрез глаз.",
    rating: 5.0,
    services: [
      { title: "Классика 1:1", durationMin: 120, price: 70 },
      { title: "2D объём", durationMin: 140, price: 90 },
    ],
  },
  "olga-skin": {
    slug: "olga-skin",
    name: "Ольга Ветрова",
    district: "Грушевка",
    bio: "Уходовые протоколы для чувствительной кожи без агрессивных пилингов.",
    rating: 4.7,
    services: [
      { title: "Чистка лица", durationMin: 75, price: 90 },
      { title: "Увлажняющий уход", durationMin: 60, price: 75 },
    ],
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const master = MASTERS[slug];
  return {
    title: master?.name ?? "Мастер",
  };
}

export default async function MasterPage({ params }: PageProps) {
  const { slug } = await params;
  const master = MASTERS[slug];
  if (!master) notFound();

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

        <section className={styles.hero}>
          <p className={styles.place}>
            {master.district} · рейтинг {master.rating.toFixed(1)}
          </p>
          <h1 className={styles.name}>{master.name}</h1>
          <p className={styles.bio}>{master.bio}</p>
          <a className="btn btn-primary" href="#services">
            Записаться
          </a>
        </section>

        <section id="services" className={styles.services}>
          <h2 className={styles.sectionTitle}>Услуги</h2>
          <ul className={styles.serviceList}>
            {master.services.map((service) => (
              <li key={service.title} className={styles.serviceRow}>
                <div>
                  <p className={styles.serviceTitle}>{service.title}</p>
                  <p className={styles.serviceMeta}>{service.durationMin} мин</p>
                </div>
                <p className={styles.price}>{service.price} BYN</p>
              </li>
            ))}
          </ul>
          <div className={styles.ctaWrap}>
            <button type="button" className="btn btn-primary">
              Записаться
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
