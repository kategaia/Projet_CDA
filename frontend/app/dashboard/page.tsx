"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import { getMinecraftIcon } from "@/lib/minecraftIcons";

interface Case {
  type: string;
  cible: string;
  quantite: number;
}

// Type pour une grille
interface Grille {
  id: number;
  nom: string;
  cases: Case[];
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [grilles, setGrilles] = useState<Grille[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [pseudoMc, setPseudoMc] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // Récupère le header Authorization avec le JWT stocké au login
  function authHeader() {
    const jwt = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };
  }

  // Vérifie que l'utilisateur est connecté, sinon redirige vers /login
  useEffect(() => {
    const jwt = localStorage.getItem("token");
    if (!jwt) {
      router.push("/login");
      return;
    }
    fetchAll();
  }, []);

  // Charge les grilles et le token plugin en parallèle
  async function fetchAll() {
    setLoading(true);
    try {
      const [grillesRes, tokenRes, profilRes] = await Promise.all([
        fetch(`${API}/api/grilles`, { headers: authHeader() }),
        fetch(`${API}/api/token`, { headers: authHeader() }),
        fetch(`${API}/api/profil`, { headers: authHeader() }),
      ]);

      const grillesData = await grillesRes.json();
      if (grillesData.success) setGrilles(grillesData.grilles);

      // Le token peut ne pas exister encore (404), c'est normal
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        if (tokenData.success) setToken(tokenData.token.valeur);
      }

      const profilData = await profilRes.json();
      if (profilData.success) setPseudoMc(profilData.user.pseudo_mc);
    } catch {
      console.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  // Génère ou régénère le token plugin
  async function handleGenerateToken() {
    const res = await fetch(`${API}/api/token/generate`, {
      method: "POST",
      headers: authHeader(),
    });
    const data = await res.json();
    if (data.success) setToken(data.token.valeur);
  }

  // Copie le token dans le presse-papier
  async function handleCopyToken() {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  }

  // Supprime une grille
  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette grille ?")) return;
    await fetch(`${API}/api/grilles/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    setGrilles((prev) => prev.filter((g) => g.id !== id));
  }

  // Déconnexion — supprime le JWT et redirige
  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className={styles.wrap}>
        <div className={styles.loading}>Chargement…</div>
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="/voxelbingo_logo.png" alt="VoxelBingo" className={styles.logo} />
        </div>
        <div className={styles.headerRight}>
          {pseudoMc && (
            <img
              src={`https://mc-heads.net/avatar/${pseudoMc}/32`}
              alt="Avatar"
              className={styles.avatar}
            />
          )}
          <button
            onClick={() => router.push("/profil")}
            className={styles.profileBtn}
          >
            Profil
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* Section token plugin */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Token plugin</h2>
              <p className={styles.sectionSub}>
                Colle ce token dans à la fin de la commande /bg login pour
                lié ton compte et récupérer tes grilles en jeu
              </p>
            </div>
          </div>

          <div className={styles.tokenCard}>
            {showToken === false ? (
              <button onClick={() => setShowToken(true)}>
                Afficher le token
              </button>
            ) : (
              <>
                <button onClick={() => setShowToken(false)}>
                  Masquer le token
                </button>

                {token ? (
                  <>
                    {/* Affiche le token tronqué pour ne pas prendre trop de place */}
                    <code className={styles.tokenValue}>
                      {token.slice(0, 16)}…{token.slice(-8)}
                    </code>
                    <div className={styles.tokenActions}>
                      <button
                        onClick={handleCopyToken}
                        className={styles.btnSecondary}
                      >
                        {tokenCopied ? "Copié ✓" : "Copier le token"}
                      </button>
                      <button
                        onClick={handleGenerateToken}
                        className={styles.btnGhost}
                      >
                        Régénérer
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.tokenEmpty}>Aucun token généré.</p>
                    <button
                      onClick={handleGenerateToken}
                      className={styles.btnPrimary}
                    >
                      Générer un token
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* Section grilles */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Mes grilles</h2>
              <p className={styles.sectionSub}>
                {grilles.length} grille{grilles.length !== 1 ? "s" : ""} créée
                {grilles.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => router.push("/grilles/new")}
              className={styles.btnPrimary}
            >
              + Nouvelle grille
            </button>
          </div>

          {/* Liste vide */}
          {grilles.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>
                Aucune grille pour l&apos;instant.
              </p>
              <p className={styles.emptySub}>
                Crée ta première grille de bingo Minecraft.
              </p>
              <button
                onClick={() => router.push("/grilles/new")}
                className={styles.btnPrimary}
              >
                Créer une grille
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {grilles.map((grille) => (
                <div key={grille.id} className={styles.grillCard}>
                  {/* Aperçu 5x5 miniature */}
                  <div className={styles.preview}>
                    {grille.cases.slice(0, 25).map((c, i) => (
                      <div
                        key={i}
                        className={styles.previewCell}
                        title={c.cible}
                      >
                        <img
                          src={getMinecraftIcon(c.cible, c.type)}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            imageRendering: "pixelated",
                          }}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className={styles.grillInfo}>
                    <h3 className={styles.grillName}>{grille.nom}</h3>
                    <p className={styles.grillDate}>
                      {new Date(grille.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className={styles.grillActions}>
                    <button
                      onClick={() => router.push(`/grilles/${grille.id}`)}
                      className={styles.btnSecondary}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(grille.id)}
                      className={styles.btnDanger}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
