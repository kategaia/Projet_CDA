"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

export default function RegisterPage() {
  const [pseudo, setPseudo]       = useState("");
  const [pseudoMc, setPseudoMc]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [alert, setAlert]         = useState<{ message: string; type: "error" | "success" } | null>(null);

  const router = useRouter();

  async function handleRegister() {
    if (!pseudo || !email || !password || !confirm) {
      setAlert({ message: "Merci de remplir tous les champs obligatoires.", type: "error" });
      return;
    }
    if (password !== confirm) {
      setAlert({ message: "Les mots de passe ne correspondent pas.", type: "error" });
      return;
    }
    if (password.length < 8) {
      setAlert({ message: "Le mot de passe doit faire au moins 8 caractères.", type: "error" });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo, pseudo_mc: pseudoMc || null, email, password }),
      });

      const data = await res.json();
      if (data.success) {
        setAlert({ message: "Compte créé ! Redirection…", type: "success" });
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setAlert({ message: data.message || "Une erreur est survenue.", type: "error" });
      }
    } catch {
      setAlert({ message: "Impossible de joindre le serveur.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleRegister();
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <img src="/voxelbingo_logo.png" alt="VoxelBingo" className={styles.logo} />
        <h1 className={styles.title}>Créer un compte.</h1>
        <p className={styles.subtitle}>Rejoins ton espace en quelques secondes.</p>

        {alert && (
          <div className={`${styles.alert} ${styles[alert.type]}`}>
            {alert.message}
          </div>
        )}

        {/* Pseudo interface — obligatoire */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pseudo">
            Pseudo <span className={styles.required}>*</span>
          </label>
          <input
            id="pseudo"
            type="text"
            placeholder="Ton pseudo affiché dans l'interface"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.input}
          />
        </div>

        {/* Pseudo Minecraft — optionnel */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pseudoMc">
            Pseudo Minecraft <span className={styles.optional}>(optionnel)</span>
          </label>
          <div className={styles.inputWrap}>
            <input
              id="pseudoMc"
              type="text"
              placeholder="Ton pseudo en jeu"
              value={pseudoMc}
              onChange={(e) => setPseudoMc(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={16}
              className={`${styles.input} ${styles.inputWithAvatar}`}
            />
            {/* Aperçu de l'avatar Minecraft en temps réel */}
            {pseudoMc && (
              <img
                src={`https://mc-heads.net/avatar/${pseudoMc}/32`}
                alt="Avatar MC"
                className={styles.mcAvatar}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Adresse e-mail <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="toi@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
            className={styles.input}
          />
        </div>

        {/* Mot de passe */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Mot de passe <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
              className={`${styles.input} ${styles.inputWithBtn}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.toggleBtn}
              aria-label={showPassword ? "Masquer" : "Afficher"}
            >
              {showPassword ? "👁" : "👁"}
            </button>
          </div>
          <div className={styles.strengthBar}>
            <div
              className={styles.strengthFill}
              style={{
                width: `${Math.min((password.length / 12) * 100, 100)}%`,
                backgroundColor:
                  password.length === 0 ? "transparent" :
                  password.length < 8 ? "#ef4444" :
                  password.length < 10 ? "#f97316" : "#22c55e",
              }}
            />
          </div>
          <p className={styles.strengthLabel}>
            {password.length === 0 ? "" :
             password.length < 8 ? "Trop court" :
             password.length < 10 ? "Correct" : "Fort ✓"}
          </p>
        </div>

        {/* Confirmation mot de passe */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirm">
            Confirmer le mot de passe <span className={styles.required}>*</span>
          </label>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="new-password"
            className={`${styles.input} ${confirm && password !== confirm ? styles.inputError : ""}`}
          />
          {confirm && password !== confirm && (
            <p className={styles.fieldError}>Les mots de passe ne correspondent pas.</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className={`${styles.submitBtn} ${loading ? styles.loading : ""}`}
        >
          {loading ? "Création…" : "Créer mon compte →"}
        </button>

        <p className={styles.loginText}>
          Déjà un compte ?{" "}
          <a href="/login" className={styles.loginLink}>Se connecter</a>
        </p>
      </div>
    </main>
  );
}