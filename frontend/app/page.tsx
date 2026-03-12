import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>Collector.shop - Demo POC</h1>
        <p>
          Cette page sert de point d&apos;entree pour demontrer le flux principal:
          login, creation seller, validation admin, publication catalogue.
        </p>
      </section>

      <section className={styles.steps}>
        <h2>Parcours recommande pour la soutenance</h2>
        <ol>
          <li>Connecte-toi avec un compte seller ou admin.</li>
          <li>Seller: cree une annonce depuis l&apos;espace de creation.</li>
          <li>Admin: valide ou rejette l&apos;annonce en attente.</li>
          <li>Verifie le resultat sur le catalogue public.</li>
        </ol>
      </section>

      <section className={styles.accounts}>
        <h2>Comptes de demonstration</h2>
        <p>
          <code>seller@collector.local</code> / <code>Seller123!</code>
        </p>
        <p>
          <code>admin@collector.local</code> / <code>Admin123!</code>
        </p>
      </section>
    </main>
  );
}
