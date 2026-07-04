"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import styles from "./grille.module.css"

export default function GrillePage() {

    const router = useRouter();

    const [cases, setCases] = useState<string[]>(Array(25).fill(""));
    const [nom, setNom] = useState("");
    const [index, setIndex] = useState<number | null>(null);
    const exemple = ["Obtenir un diamant", "Tuer un poulet", "Fabriquer un enclume", "Réaliser le succès 'Fin ?' ", "Trouver le biome Jungle"];
    const [textLibre, setTextLibre] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{message : string, type: "error" | "success"} | null>(null);

    function remplirCase(valeur: string) {
        if (index == null) return;

        const tempcases = [...cases];
        tempcases[index] = valeur;
        setCases(tempcases);
        setIndex(null);
        setTextLibre("");
    }

    function authHeader() {
        const jwt = localStorage.getItem("token");
        return { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json"};
    }

    async function handleSave() {
        if (nom == "") return;

        if (!cases.every((c) => c !=="")) return;

        try{
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grilles`, {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({nom, cases})
            });

            const data = await res.json();
            if(data.success) {
                setAlert({message: "Grille créée ! ", type: "success"});
                router.push("/dashboard");
            } else {
                setAlert({message: data.message || "Une erreur est survenue", type:"error"});
            }
        } catch {
            setAlert({ message : "Impossible de joindre le serveur", type: "error"});
        } finally {
            setLoading(false);
        }

    }


    return (
        <main>
            <h1>
                Créer une grille
            </h1>

            <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
            />

            <div className={styles.grille}>
                {cases.map((caseValue, i) => (
                    <div key={i} 
                    onClick={() => setIndex(i)}
                    className={`${styles.case} ${caseValue ? styles.caseRemplie : ""}`}>
                        {caseValue || "+"}
                    </div>
                ))}
            </div>

            {index !== null && (
                <div>
                    <p>Exemples: {exemple.join(", ")}</p>
                    <input
                        id="case"
                        type="text"
                        value={textLibre}
                        onChange={(e) => setTextLibre(e.target.value)}
                    />

                    <button onClick={() => remplirCase(textLibre)}>Valider</button>

                    <button onClick={() => {
                        setIndex(null);
                        setTextLibre("");
                    }}>
                        Annuler
                    </button>
                </div>
            )}
            <div>
                <button onClick={handleSave}>
                    Enregistrer la grille
                </button>
            </div>

            <div>
                {alert && (
                    <div className={`${styles.alert} ${styles[alert.type]}`}>
                        {alert.message}
                    </div>
                )}
            </div>
        </main>
    );

}

