import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <h1>Collector.shop</h1>
      <p>Prototype v1 - frontend minimal connecte au backend.</p>

      <nav className={styles.nav}>
        <Link href="/catalog">Voir le catalogue public</Link>
        <Link href="/login">Se connecter</Link>
        <Link href="/seller/articles/new">Creer une annonce seller</Link>
      </nav>
    </main>
  );
}
