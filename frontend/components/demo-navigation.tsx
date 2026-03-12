"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthSession, getAuthUser } from "@/lib/auth/token-storage";
import type { AuthUser } from "@/lib/types/api";
import styles from "./demo-navigation.module.css";

const LINKS = [
  { href: "/catalog", label: "Catalogue public" },
  { href: "/login", label: "Login" },
  { href: "/seller/articles/new", label: "Creation seller" },
  { href: "/admin/articles/pending", label: "Validation admin" },
];

export default function DemoNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setCurrentUser(getAuthUser());
    };

    syncUser();
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/">Collector.shop</Link>
          {currentUser ? (
            <p className={styles.session}>
              Connecte: {currentUser.email} ({currentUser.role})
            </p>
          ) : (
            <p className={styles.session}>Non connecte</p>
          )}
        </div>

        <nav className={styles.nav}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? styles.active : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {currentUser ? (
            <button type="button" onClick={handleLogout}>
              Se deconnecter
            </button>
          ) : (
            <Link href="/login">Se connecter</Link>
          )}
        </div>
      </div>
    </header>
  );
}
