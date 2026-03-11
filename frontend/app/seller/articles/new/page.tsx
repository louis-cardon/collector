"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createArticle } from "@/lib/api/articles";
import { ApiError } from "@/lib/api/client";
import { fetchCategories } from "@/lib/api/catalog";
import { getAccessToken } from "@/lib/auth/token-storage";
import type { Category, CreateArticlePayload } from "@/lib/types/api";
import styles from "./page.module.css";

const createArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caracteres")
    .max(140, "Le titre ne peut pas depasser 140 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caracteres")
    .max(5000, "La description ne peut pas depasser 5000 caracteres"),
  price: z
    .string()
    .trim()
    .min(1, "Le prix est requis")
    .regex(/^\d+(\.\d{1,2})?$/, "Le prix doit etre un nombre valide (2 decimales max)")
    .refine((value) => Number(value) >= 0.01, "Le prix doit etre superieur ou egal a 0.01"),
  shippingCost: z
    .string()
    .trim()
    .min(1, "Les frais de port sont requis")
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Les frais de port doivent etre un nombre valide (2 decimales max)",
    )
    .refine(
      (value) => Number(value) >= 0,
      "Les frais de port doivent etre superieurs ou egaux a 0",
    ),
  categoryId: z.string().min(1, "La categorie est requise"),
});

type CreateArticleFormValues = {
  title: string;
  description: string;
  price: string;
  shippingCost: string;
  categoryId: string;
};

export default function SellerArticleCreatePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateArticleFormValues>({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      shippingCost: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!isAuthChecked || !hasToken) {
      return;
    }

    let ignore = false;

    const loadCategories = async () => {
      setIsCategoriesLoading(true);
      setCategoriesError(null);

      try {
        const data = await fetchCategories();

        if (!ignore) {
          setCategories(data);
        }
      } catch (error) {
        if (!ignore) {
          if (error instanceof ApiError) {
            setCategoriesError(error.message);
          } else {
            setCategoriesError("Impossible de charger les categories.");
          }
          setCategories([]);
        }
      } finally {
        if (!ignore) {
          setIsCategoriesLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      ignore = true;
    };
  }, [hasToken, isAuthChecked]);

  const onSubmit = async (values: CreateArticleFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const parsedValues = createArticleSchema.safeParse(values);

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0];

        if (
          fieldName === "title" ||
          fieldName === "description" ||
          fieldName === "price" ||
          fieldName === "shippingCost" ||
          fieldName === "categoryId"
        ) {
          setError(fieldName, {
            type: "validate",
            message: issue.message,
          });
        }
      }
      return;
    }

    const payload: CreateArticlePayload = {
      title: parsedValues.data.title,
      description: parsedValues.data.description,
      price: Number(parsedValues.data.price),
      shippingCost: Number(parsedValues.data.shippingCost),
      categoryId: parsedValues.data.categoryId,
    };

    try {
      await createArticle(payload);
      setSubmitSuccess("Annonce creee avec succes. Statut: PENDING_REVIEW.");
      reset({
        title: "",
        description: "",
        price: "",
        shippingCost: "",
        categoryId: "",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("La creation de l'annonce a echoue.");
      }
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
          <h1>Creation d&apos;annonce seller</h1>
          <p className={styles.error}>
            Cette page necessite une connexion. Connecte-toi avant de creer une annonce.
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
      <section className={styles.card}>
        <h1>Creation d&apos;annonce seller</h1>
        <p>
          Le statut est applique automatiquement par le backend a la creation:
          <code> PENDING_REVIEW</code>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <label htmlFor="title">Titre</label>
          <input id="title" type="text" {...register("title")} />
          {errors.title?.message ? (
            <p className={styles.fieldError} role="alert">
              {errors.title.message}
            </p>
          ) : null}

          <label htmlFor="description">Description</label>
          <textarea id="description" rows={5} {...register("description")} />
          {errors.description?.message ? (
            <p className={styles.fieldError} role="alert">
              {errors.description.message}
            </p>
          ) : null}

          <label htmlFor="price">Prix (EUR)</label>
          <input id="price" type="number" step="0.01" min="0.01" {...register("price")} />
          {errors.price?.message ? (
            <p className={styles.fieldError} role="alert">
              {errors.price.message}
            </p>
          ) : null}

          <label htmlFor="shippingCost">Frais de port (EUR)</label>
          <input
            id="shippingCost"
            type="number"
            step="0.01"
            min="0"
            {...register("shippingCost")}
          />
          {errors.shippingCost?.message ? (
            <p className={styles.fieldError} role="alert">
              {errors.shippingCost.message}
            </p>
          ) : null}

          <label htmlFor="categoryId">Categorie</label>
          <select id="categoryId" {...register("categoryId")}>
            <option value="">
              {isCategoriesLoading ? "Chargement des categories..." : "Selectionner une categorie"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId?.message ? (
            <p className={styles.fieldError} role="alert">
              {errors.categoryId.message}
            </p>
          ) : null}

          {categoriesError ? (
            <p className={styles.error} role="alert">
              {categoriesError}
            </p>
          ) : null}

          {!isCategoriesLoading && categories.length === 0 && !categoriesError ? (
            <p className={styles.status}>
              Aucune categorie disponible. Demande a un admin de creer une categorie.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isCategoriesLoading || categories.length === 0}
          >
            {isSubmitting ? "Creation..." : "Creer l'annonce"}
          </button>
        </form>

        {submitError ? (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        ) : null}

        {submitSuccess ? <p className={styles.success}>{submitSuccess}</p> : null}
      </section>
    </main>
  );
}
