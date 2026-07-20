"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./login.module.css";

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  const router = useRouter();

  async function handleLogin() {
  if (!identifiant || !password) {
    setAlert({ message: "Merci de remplir tous les champs.", type: "error" });
    return;
  }

  setLoading(true);
  setAlert(null);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifiant, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      setAlert({ message: "Connecté ! Redirection…", type: "success" });
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      setAlert({ message: data.message || "Identifiants incorrects.", type: "error" });
    }
  } catch {
    setAlert({ message: "Impossible de joindre le serveur.", type: "error" });
  } finally {
    setLoading(false);
  }
}

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key == "Enter") handleLogin();
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <img src="/voxelbingo_logo.png" alt="VoxelBingo" className={styles.logo} />
        <h1 className={styles.title}>Bon retour.</h1>
        <p className={styles.subtitle}>Connecte-toi à ton espace.</p>

        {/* On combine deux classes CSS avec un template string :
            la classe de base "alert" + la classe selon le type ("error" ou "success") */}
        {alert && (
          <div className={`${styles.alert} ${styles[alert.type]}`}>
            {alert.message}
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Identifiant
          </label>
          <input
            id="identifiant"
            type="text"
            placeholder="Pseudo ou adresse e-mail"
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="username"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Mot de passe
          </label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              className={`${styles.input} ${styles.inputWithBtn}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.toggleBtn}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? "👁" : "👁"}
            </button>
          </div>
          <a href="/forgot-password" className={styles.forgot}>
            Mot de passe oublié ?
          </a>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          // On ajoute la classe "loading" dynamiquement quand la requête est en cours
          className={`${styles.submitBtn} ${loading ? styles.loading : ""}`}
        >
          {loading ? "Connexion…" : "Se connecter →"}
        </button>

        <p className={styles.registerText}>
          Pas encore de compte ?{" "}
          <a href="/register" className={styles.registerLink}>
            S&apos;inscrire
          </a>
        </p>
      </div>
    </main>
  );
}
