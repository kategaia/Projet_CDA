"use client"

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react"; 
import styles from "./grille.module.css"
import { getMinecraftIcon } from "@/lib/minecraftIcons";

export default function ModifierGrille(){

    const router = useRouter();

    const params = useParams();
    const id = params.id;

    const exemple = ["Obtenir un diamant", "Tuer un poulet", "Fabriquer une enclume", "Réaliser le succès 'Fin ?' ", "Trouver le biome Jungle"];

    const API = process.env.NEXT_PUBLIC_API_URL;

    const [nom, setNom] = useState("");
    const [cases, setCases] = useState<string[]>(Array(25).fill(""));
    const [textLibre, setTextLibre] = useState("");
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<{message: string, type: "error" | "success"} | null>(null);
    const [index, setIndex] = useState<number | null>(null);

    function authHeader() {
        const jwt = localStorage.getItem("token");
        return { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json"};
    }

    useEffect(() => {
        const jwt = localStorage.getItem("token");
        if (!jwt) {
            router.push("/login");
            return;
        }
        fetchGrille();
    }, []);

    async function fetchGrille() {
        setLoading(true);
        try {
            const grilleRes = await fetch(
                `${API}/api/grilles/${id}`, {headers: authHeader()}
            );
            const GrilleData = await grilleRes.json();
            if (GrilleData.success){
                setNom(GrilleData.grille.nom); 
                setCases(GrilleData.grille.cases);
            } 
        } catch {
            console.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    }

    function remplirCase(valeur: string) {
        if (index == null) return;
        const tempcases = [...cases];
        tempcases[index] = valeur;
        setCases(tempcases);
        setIndex(null);
        setTextLibre("");
    }

    async function handleSave() {
        if (nom == "") return;
        if (!cases.every((c) => c !== "")) return;

        try {
            const res = await fetch(`${API}/api/grilles/${id}`, {
                method: "PUT",
                headers: authHeader(),
                body: JSON.stringify({nom, cases})
            });
            const data = await res.json();
            if (data.success) {
                setAlert({message: "Grille sauvegardée !", type: "success"});
                setTimeout(() => router.push("/dashboard"), 1000);
            } else {
                setAlert({message: data.message || "Une erreur est survenue", type: "error"});
            }
        } catch {
            setAlert({ message: "Impossible de joindre le serveur", type: "error"});
        } finally {
            setLoading(false);
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
            {/* Header */}
            <header className={styles.header}>
                <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
                    ← Retour
                </button>
                <span className={styles.headerTitle}>Modifier la grille</span>
            </header>

            <div className={styles.content}>

                {/* Alerte */}
                {alert && (
                    <div className={`${styles.alert} ${styles[alert.type]}`}>
                        {alert.message}
                    </div>
                )}

                {/* Input nom */}
                <input
                    id="nom"
                    type="text"
                    placeholder="Nom de la grille..."
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={styles.inputNom}
                />

                {/* Grille 5x5 */}
                <div className={styles.grille}>
                    {cases.map((caseValue, i) => (
                        <div
                            key={i}
                            className={`${styles.case} ${caseValue ? styles.caseRemplie : ""}`}
                            onClick={() => setIndex(i)}
                        >
                            {caseValue ? (
                                <>
                                    <img
                                        src={getMinecraftIcon(caseValue)}
                                        alt=""
                                        className={styles.caseIcon}
                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                    <span className={styles.caseText}>{caseValue}</span>
                                </>
                            ) : (
                                <span className={styles.casePlus}>+</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Panneau de saisie */}
                {index !== null && (
                    <div className={styles.panneau}>
                        <p className={styles.panneauTitre}>Remplir la case</p>
                        <p className={styles.panneauExemples}>Exemples : {exemple.join(", ")}</p>
                        <input
                            id="case"
                            type="text"
                            placeholder="Tape ton objectif..."
                            value={textLibre}
                            onChange={(e) => setTextLibre(e.target.value)}
                            className={styles.inputCase}
                            onKeyDown={(e) => e.key === "Enter" && remplirCase(textLibre)}
                            autoFocus
                        />
                        <div className={styles.panneauActions}>
                            <button onClick={() => remplirCase(textLibre)} className={styles.btnPrimary}>
                                Valider
                            </button>
                            <button onClick={() => { setIndex(null); setTextLibre(""); }} className={styles.btnSecondary}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* Bouton enregistrer */}
                <div className={styles.saveBar}>
                    <button onClick={handleSave} className={styles.btnPrimary}>
                        Enregistrer la grille
                    </button>
                </div>

            </div>
        </main>
    );
}