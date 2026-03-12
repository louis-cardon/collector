"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { saveAuthSession } from "@/lib/auth/token-storage";
import type { LoginCredentials } from "@/lib/types/api";
import styles from "./page.module.css";

const loginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const parsedValues = loginSchema.safeParse(values);

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0];

        if (fieldName === "email" || fieldName === "password") {
          setError(fieldName, {
            type: "validate",
            message: issue.message,
          });
        }
      }
      return;
    }

    try {
      const payload: LoginCredentials = {
        email: parsedValues.data.email,
        password: parsedValues.data.password,
      };

      const response = await login(payload);
      saveAuthSession(response.accessToken, response.user);
      setSubmitSuccess(`Connecte en tant que ${response.user.role}. Redirection...`);
      reset({
        email: parsedValues.data.email,
        password: "",
      });

      const targetPath =
        response.user.role === "admin"
          ? "/admin/articles/pending"
          : "/seller/articles/new";
      router.push(targetPath);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("La connexion a echoue. Merci de reessayer.");
      }
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>Connexion</h1>
        <p>Authentifie-toi pour acceder aux futures pages seller/admin.</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email?.message ? (
            <p className={styles.fieldError} role="alert">
              {errors.email.message}
            </p>
          ) : null}

          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password?.message ? (
            <p className={styles.fieldError} role="alert">
              {errors.password.message}
            </p>
          ) : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : null}

        {submitSuccess ? <p className={styles.submitSuccess}>{submitSuccess}</p> : null}

        <div className={styles.hint}>
          <p>Comptes de demonstration :</p>
          <p>
            <code>seller@collector.local</code> / <code>Seller123!</code>
          </p>
          <p>
            <code>admin@collector.local</code> / <code>Admin123!</code>
          </p>
        </div>
      </section>
    </main>
  );
}
