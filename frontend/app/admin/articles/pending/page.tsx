"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { approveArticle, fetchPendingArticles, rejectArticle } from "@/lib/api/admin";
import { getAccessToken } from "@/lib/auth/token-storage";
import type { CreatedArticle } from "@/lib/types/api";
import styles from "./page.module.css";

type Decision = "approve" | "reject";

function formatDate(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export default function AdminPendingArticlesPage() {
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [articles, setArticles] = useState<CreatedArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activeDecisionArticleId, setActiveDecisionArticleId] = useState<string | null>(null);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsAuthChecked(true);
  }, []);

  const loadPendingArticles = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchPendingArticles();
      setArticles(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Impossible de charger les annonces en attente.");
      }
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthChecked || !hasToken) {
      return;
    }

    void loadPendingArticles();
  }, [hasToken, isAuthChecked, loadPendingArticles]);

  const handleDecision = async (articleId: string, decision: Decision) => {
    setFeedbackMessage(null);
    setErrorMessage(null);
    setActiveDecisionArticleId(articleId);

    try {
      if (decision === "approve") {
        await approveArticle(articleId);
        setFeedbackMessage("Annonce approuvee.");
      } else {
        await rejectArticle(articleId);
        setFeedbackMessage("Annonce rejetee.");
      }

      await loadPendingArticles();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Impossible de traiter l'annonce.");
      }
    } finally {
      setActiveDecisionArticleId(null);
    }
  };

  if (!isAuthChecked) {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Verification de la session...</p>
      </main>
    );
  }

  if (!hasToken) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Validation admin des annonces</h1>
          <p className={styles.error}>
            Cette page necessite une connexion. Connecte-toi avant d&apos;acceder a l&apos;espace
            admin.
          </p>
          <Link href="/login" className={styles.link}>
            Aller a la page de connexion
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Validation admin des annonces</h1>
        <p>Seules les annonces en attente de validation sont affichees.</p>
      </header>

      {feedbackMessage ? <p className={styles.success}>{feedbackMessage}</p> : null}

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? <p className={styles.status}>Chargement des annonces en attente...</p> : null}

      {!isLoading && !errorMessage && articles.length === 0 ? (
        <p className={styles.status}>Aucune annonce en attente de validation.</p>
      ) : null}

      {!isLoading && !errorMessage && articles.length > 0 ? (
        <ul className={styles.grid}>
          {articles.map((article) => {
            const isActionLoading = activeDecisionArticleId === article.id;

            return (
              <li key={article.id} className={styles.card}>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <dl>
                  <div>
                    <dt>Prix</dt>
                    <dd>{article.price} EUR</dd>
                  </div>
                  <div>
                    <dt>Frais de port</dt>
                    <dd>{article.shippingCost} EUR</dd>
                  </div>
                  <div>
                    <dt>Categorie</dt>
                    <dd>{article.categoryId}</dd>
                  </div>
                  <div>
                    <dt>Creee le</dt>
                    <dd>{formatDate(article.createdAt)}</dd>
                  </div>
                </dl>

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => handleDecision(article.id, "approve")}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? "Traitement..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(article.id, "reject")}
                    disabled={isActionLoading}
                    className={styles.rejectButton}
                  >
                    {isActionLoading ? "Traitement..." : "Reject"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
