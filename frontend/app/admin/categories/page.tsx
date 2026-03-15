"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  createCategory,
  fetchAdminCategories,
  updateCategory,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/token-storage";
import type { Category } from "@/lib/types/api";
import styles from "./page.module.css";

function normalizeCategoryName(value: string): string {
  return value.trim();
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

export default function AdminCategoriesPage() {
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [createName, setCreateName] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [activeSaveCategoryId, setActiveSaveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsAuthChecked(true);
  }, []);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Impossible de charger les categories.");
      }
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthChecked || !hasToken) {
      return;
    }

    void loadCategories();
  }, [hasToken, isAuthChecked, loadCategories]);

  const handleCreateCategory = async () => {
    const normalizedName = normalizeCategoryName(createName);

    if (!normalizedName) {
      setErrorMessage("Le nom de la categorie est requis.");
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      await createCategory({ name: normalizedName });
      setCreateName("");
      setFeedbackMessage("Categorie creee.");
      await loadCategories();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Impossible de creer la categorie.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setErrorMessage(null);
    setFeedbackMessage(null);
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditingName("");
  };

  const handleUpdateCategory = async (categoryId: string) => {
    const normalizedName = normalizeCategoryName(editingName);

    if (!normalizedName) {
      setErrorMessage("Le nom de la categorie est requis.");
      return;
    }

    setActiveSaveCategoryId(categoryId);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      await updateCategory(categoryId, { name: normalizedName });
      setFeedbackMessage("Categorie mise a jour.");
      setEditingCategoryId(null);
      setEditingName("");
      await loadCategories();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Impossible de mettre a jour la categorie.");
      }
    } finally {
      setActiveSaveCategoryId(null);
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
          <h1>Gestion des categories</h1>
          <p className={styles.error}>
            Cette page necessite une connexion admin. Connecte-toi avant d&apos;acceder a la
            gestion des categories.
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
        <h1>Gestion des categories</h1>
        <p>Creation et mise a jour des categories disponibles pour les vendeurs.</p>
      </header>

      <section className={styles.card}>
        <h2>Nouvelle categorie</h2>
        <div className={styles.createRow}>
          <input
            type="text"
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            placeholder="Exemple: Vinyles"
            aria-label="Nom de la nouvelle categorie"
          />
          <button type="button" onClick={handleCreateCategory} disabled={isCreating}>
            {isCreating ? "Creation..." : "Creer la categorie"}
          </button>
        </div>
      </section>

      {feedbackMessage ? <p className={styles.success}>{feedbackMessage}</p> : null}

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? <p className={styles.status}>Chargement des categories...</p> : null}

      {!isLoading && !errorMessage && categories.length === 0 ? (
        <p className={styles.status}>Aucune categorie disponible.</p>
      ) : null}

      {!isLoading && !errorMessage && categories.length > 0 ? (
        <ul className={styles.grid}>
          {categories.map((category) => {
            const isEditing = editingCategoryId === category.id;
            const isSaving = activeSaveCategoryId === category.id;

            return (
              <li key={category.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>{category.name}</h2>
                  <span className={styles.badge}>ID {category.id}</span>
                </div>

                <dl className={styles.meta}>
                  <div>
                    <dt>Creee le</dt>
                    <dd>{formatDate(category.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Mise a jour</dt>
                    <dd>{formatDate(category.updatedAt)}</dd>
                  </div>
                </dl>

                {isEditing ? (
                  <div className={styles.editPanel}>
                    <label htmlFor={`category-name-${category.id}`}>Nouveau nom</label>
                    <input
                      id={`category-name-${category.id}`}
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                    />

                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => handleUpdateCategory(category.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className={styles.secondaryButton}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <button type="button" onClick={() => startEditing(category)}>
                      Renommer
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
