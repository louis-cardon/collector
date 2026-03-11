import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <h1>Collector.shop</h1>
      <p>Socle initial du prototype v1.</p>
      <ul>
        <li>Frontend: Next.js + TypeScript + App Router</li>
        <li>Backend: NestJS + TypeScript + Prisma</li>
        <li>Tests: Jest, Supertest, Playwright</li>
      </ul>
    </main>
  );
}
