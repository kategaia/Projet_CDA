"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./grille.module.css";
import { getMinecraftIcon } from "@/lib/minecraftIcons";
import { filterItems } from "@/lib/minecraftData";

interface Case {
  type: string;
  cible: string;
  quantite: number;
}

export default function GrillePage() {
  const router = useRouter();

  const [cases, setCases] = useState<Case[]>(
    Array(25).fill({ type: "", cible: "", quantite: 1 }),
  );
  const [nom, setNom] = useState("");
  const [index, setIndex] = useState<number | null>(null);
  const [type, setType] = useState("");
  const [cible, setCible] = useState("");
  const [quantite, setQuantite] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [alert, setAlert] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  useEffect(() => {
    const jwt = localStorage.getItem("token");
    if (!jwt) {
      router.push("/login");
      return;
    }
  }, []);

  function remplirCase(type: string, cible: string, quantite: number) {
    if (index == null) return;
    const tempcases = [...cases];
    tempcases[index] = { type, cible, quantite };
    setCases(tempcases);
    setIndex(null);
    setType("");
    setCible("");
    setQuantite(1);
  }

  function authHeader() {
    const jwt = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    };
  }

  async function handleSave() {
    if (nom == "") return;
    if (!cases.every((c) => c.cible !== "")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/grilles`,
        {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({ nom, cases }),
        },
      );

      const data = await res.json();
      if (data.success) {
        setAlert({ message: "Grille créée !", type: "success" });
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setAlert({
          message: data.message || "Une erreur est survenue",
          type: "error",
        });
      }
    } catch {
      setAlert({ message: "Impossible de joindre le serveur", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
    <div className={styles.headerLeft}>
        <img src="/voxelbingo_logo.png" alt="VoxelBingo" className={styles.logo} />
    </div>
    <span className={styles.headerTitle}>Créer une grille</span>
    <div className={styles.headerRight}>
        <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
            Retour →
        </button>
    </div>
</header>

      <div className={styles.content}>
        {alert && (
          <div className={`${styles.alert} ${styles[alert.type]}`}>
            {alert.message}
          </div>
        )}

        <input
          id="nom"
          type="text"
          placeholder="Nom de la grille..."
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className={styles.inputNom}
        />

        <div className={styles.grille}>
          {cases.map((caseValue, i) => (
            <div
              key={i}
              className={`${styles.case} ${caseValue.cible ? styles.caseRemplie : ""}`}
              onClick={() => setIndex(i)}
            >
              {caseValue.cible ? (
                <>
                  <img
                    src={getMinecraftIcon(caseValue.cible, caseValue.type)}
                    alt=""
                    className={styles.caseIcon}
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://minecraft.wiki/images/Barrier.png")
                    }
                  />
                  <span className={styles.caseText}>
                    {caseValue.type}{" "}
                    {caseValue.quantite > 1 ? caseValue.quantite : ""}{" "}
                    {caseValue.cible}
                  </span>
                </>
              ) : (
                <span className={styles.casePlus}>+</span>
              )}
            </div>
          ))}
        </div>

        {index !== null && (
          <div className={styles.panneau}>
            <p className={styles.panneauTitre}>Remplir la case</p>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={styles.inputCase}
            >
              <option value="">-- Type --</option>
              <option value="OBTENIR">Obtenir</option>
              <option value="TUER">Tuer</option>
              <option value="CRAFTER">Crafter</option>
              <option value="TROUVER">Trouver</option>
              <option value="SUCCES">Succès</option>
            </select>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Cible (ex: diamant, poulet...)"
                value={cible}
                onChange={(e) => {
                  setCible(e.target.value);
                  setSuggestions(filterItems(e.target.value, type));
                }}
                className={styles.inputCase}
                autoFocus
              />
              {/* Liste de suggestions — apparaît sous l'input */}
              {suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  {suggestions.map((item) => (
                    <div
                      key={item}
                      className={styles.suggestionItem}
                      onClick={() => {
                        setCible(item); // remplit l'input
                        setSuggestions([]); // ferme la liste
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              className={styles.inputCase}
            />

            <div className={styles.panneauActions}>
              <button
                onClick={() => remplirCase(type, cible, quantite)}
                className={styles.btnPrimary}
              >
                Valider
              </button>
              <button
                onClick={() => {
                  setIndex(null);
                  setType("");
                  setCible("");
                  setQuantite(1);
                }}
                className={styles.btnSecondary}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className={styles.saveBar}>
          <button onClick={handleSave} className={styles.btnPrimary}>
            Enregistrer la grille
          </button>
        </div>
      </div>
    </main>
  );
}
