"use client"

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react"; 
import styles from "./grille.module.css"

export default function ModifierGrille(){

    const router = useRouter();

    const params = useParams();
    const id = params.id;

    const exemple = ["Obtenir un diamant", "Tuer un poulet", "Fabriquer un enclume", "Réaliser le succès 'Fin ?' ", "Trouver le biome Jungle"];

    const API = process.env.NEXT_PUBLIC_API_URL;

    const [nom, setNom] = useState("");
    const [cases, setCases] = useState<string[]>(Array(25).fill(""));
    const [textLibre, setTextLibre] = useState("");
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<{message: string, type: "error" |"success"} | null>(null);
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
            const grilleRes =  await fetch(
                `${API}/api/grilles/${id}`, {headers: authHeader()}
            )

            const GrilleData = await grilleRes.json();
            if (GrilleData.success){
                setNom(GrilleData.grille.nom); 
                setCases(GrilleData.grille.cases);
            } 
        } catch {
            console.error("Erreur lors du chargement des données ");
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

        if (!cases.every((c) => c !=="")) return;

        try{
            const res = await fetch(`${API}/api/grilles/${id}`, {
                method: "PUT",
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

    if (loading) {
        return(
            <main className={styles.wrap}>
                <div className={styles.loading}>Chargement...</div>
            </main>
        )
    }

    return (
        
        <main>
            <h1>
                Modifier la grille
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