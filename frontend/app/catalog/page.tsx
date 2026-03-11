"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCatalog, fetchCategories } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import type { CatalogArticle, Category } from "@/lib/types/api";
import styles from "./page.module.css";

function formatPrice(value: string): string {
  return `${value} EUR`;
}

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

export default function CatalogPage() {
  const [articles, setArticles] = useState<CatalogArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      try {
        const data = await fetchCategories();

        if (!ignore) {
          setCategories(data);
        }
      } catch {
        if (!ignore) {
          setCategories([]);
        }
      }
    };

    void loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadCatalog = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchCatalog(selectedCategoryId || undefined);

        if (!ignore) {
          setArticles(data);
        }
      } catch (error) {
        if (!ignore) {
          if (error instanceof ApiError) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage("Impossible de charger le catalogue.");
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      ignore = true;
    };
  }, [selectedCategoryId]);

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Catalogue public</h1>
        <p>Annonces approuvees visibles sans authentification.</p>
      </header>

      <section className={styles.filters}>
        <label htmlFor="categoryFilter">Filtrer par categorie</label>
        <select
          id="categoryFilter"
          value={selectedCategoryId}
          onChange={(event) => setSelectedCategoryId(event.target.value)}
        >
          <option value="">Toutes les categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </section>

      {isLoading ? (
        <p className={styles.status}>Chargement du catalogue...</p>
      ) : null}

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && articles.length === 0 ? (
        <p className={styles.status}>Aucune annonce approuvee pour ce filtre.</p>
      ) : null}

      {!isLoading && !errorMessage && articles.length > 0 ? (
        <ul className={styles.grid}>
          {articles.map((article) => (
            <li key={article.id} className={styles.card}>
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <dl>
                <div>
                  <dt>Prix</dt>
                  <dd>{formatPrice(article.price)}</dd>
                </div>
                <div>
                  <dt>Frais de port</dt>
                  <dd>{formatPrice(article.shippingCost)}</dd>
                </div>
                <div>
                  <dt>Categorie</dt>
                  <dd>
                    {categoryNameById.get(article.categoryId) ?? article.categoryId}
                  </dd>
                </div>
                <div>
                  <dt>Publiee le</dt>
                  <dd>{formatDate(article.createdAt)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
