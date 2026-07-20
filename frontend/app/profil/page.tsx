"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./profil.module.css";

interface Profil {
  pseudo: string;
  pseudo_mc: string | null;
  email: string;
  created_at: string;
}

export default function ProfilPage() {
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL;

  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [alerte, setAlerte] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [editPseudo, setEditPseudo] = useState("");
  const [editPseudoMc, setEditPseudoMc] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");

  function authHeader() {
    const jwt = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };
  }

  useEffect(() => {
    const jwt = localStorage.getItem("token");
    if (!jwt) {
      router.push("/login");
      return;
    }
    fetchProfil();
  }, []);

  async function fetchProfil() {
    setLoading(true);
    try {
      const profilRes = await fetch(`${API}/api/profil`, {
        headers: authHeader(),
      });

      const ProfilData = await profilRes.json();
      if (ProfilData.success) setProfil(ProfilData.user);
    } catch {
      console.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  function handleDashboard() {
    router.push("/dashboard");
  }

  function handleEdit() {
    if (!profil) return;

    setEditOldPassword("");
    setEditPassword("");
    setEditConfirmPassword("");

    setEditEmail(profil.email);
    setEditPseudo(profil.pseudo);
    if (profil.pseudo_mc == null) {
      setEditPseudoMc("");
    } else {
      setEditPseudoMc(profil.pseudo_mc);
    }
    setIsEditing(true);
  }

  async function handleSave() {
    if (editPassword && editPassword !== editConfirmPassword) {
      setAlerte({
        message: "Les mots de passe ne correspondent pas",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(`${API}/api/profil`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({
          pseudo: editPseudo,
          pseudo_mc: editPseudoMc || null,
          email: editEmail,
          old_password: editOldPassword || undefined,
          password: editPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (!profil) return;

        //...profil récupère les propriétés de l'ancien objet profil
        setProfil({
          ...profil,
          pseudo: editPseudo,
          pseudo_mc: editPseudoMc,
          email: editEmail,
        });

        setAlerte({ message: "Information modifiées !", type: "success" });
        setIsEditing(false);
      } else {
        setAlerte({
          message: data.message || "Erreur lors de la modification",
          type: "error",
        });
      }
    } catch {
      setAlerte({ message: "Impossible de joindre le serveur", type: "error" });
    }
  }

  if (loading) {
    return (
      <main className={styles.wrap}>
        <div className={styles.loading}>Chargement...</div>
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img
            src="/voxelbingo_logo.png"
            alt="VoxelBingo"
            className={styles.logo}
          />
        </div>
        <h1 className={styles.headerTitle}>Profil</h1>
        <div className={styles.headerRight}>
          <button onClick={handleDashboard} className={styles.backBtn}>
            Retour →
          </button>
        </div>
      </header>
      <div className={styles.content}>
        {alerte && (
          <div className={`${styles.alert} ${styles[alerte.type]}`}>
            {alerte.message}
          </div>
        )}

        {profil &&
          (isEditing ? (
            <div className={styles.form}>
              <label className={styles.label}>Pseudo</label>
              <input
                className={`${styles.input}`}
                id="pseudo"
                type="text"
                value={editPseudo}
                onChange={(e) => setEditPseudo(e.target.value)}
              />
              <label className={styles.label}>Pseudo Minecraft</label>
              <input
                className={`${styles.input}`}
                id="pseudo_mc"
                type="text"
                value={editPseudoMc}
                onChange={(e) => setEditPseudoMc(e.target.value)}
              />
              <label className={styles.label}>Adresse e-mail</label>
              <input
                className={`${styles.input}`}
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />

              <label className={styles.label}>Ancien mot de passe</label>
              <input
                className={styles.input}
                id="old_password"
                type="password"
                placeholder="Laisse vide pour ne pas changer"
                value={editOldPassword}
                onChange={(e) => setEditOldPassword(e.target.value)}
              />

              <label className={styles.label}>Nouveau mot de passe</label>
              <input
                className={styles.input}
                id="password"
                type="password"
                placeholder="8 caractères minimum"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />

              <label className={styles.label}>Confirmer le mot de passe</label>
              <input
                className={`${styles.input} ${editConfirmPassword && editPassword !== editConfirmPassword ? styles.inputError : ""}`}
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                value={editConfirmPassword}
                onChange={(e) => setEditConfirmPassword(e.target.value)}
              />
              {editConfirmPassword && editPassword !== editConfirmPassword && (
                <p className={styles.fieldError}>
                  Les mots de passe ne correspondent pas.
                </p>
              )}

              <button
                onClick={() => setIsEditing(false)}
                className={styles.btnSecondary}
              >
                Annuler
              </button>

              <button onClick={handleSave} className={styles.btnPrimary}>
                Enregistrer
              </button>
            </div>
          ) : (
            <div className={styles.card}>
              <div className={styles.profilTop}>
                {/* avatar */}
                <div className={styles.avatarWrap}>
                  {profil.pseudo_mc ? (
                    <img
                      src={`https://mc-heads.net/avatar/${profil.pseudo_mc}/80`}
                      className={styles.avatar}
                      alt="Avatar"
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>🎮</div>
                  )}
                </div>
                {/* infos */}
                <div className={styles.profilInfos}>
                  <p className={styles.pseudo}>Pseudo: {profil.pseudo}</p>
                  <p className={styles.pseudoMc}>
                    Pseudo Minecraft: {profil.pseudo_mc ?? "Aucun pseudo MC"}
                  </p>
                  <p className={styles.email}>Email: {profil.email}</p>
                </div>
              </div>
              <div className={styles.divider} />
              <div className={styles.actions}>
                <button onClick={handleEdit} className={styles.btnPrimary}>
                  Modifier
                </button>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
