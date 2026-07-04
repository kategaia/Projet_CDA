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
    const [alerte, setAlerte] = useState<{message : string; type: "error" | "success"} | null>(null);
    const [editPseudo, setEditPseudo] = useState("");
    const [editPseudoMc, setEditPseudoMc] = useState("");
    const [editEmail, setEditEmail] = useState("");
    
    function authHeader(){
        const jwt = localStorage.getItem("token");
        return { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json"};
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
        try{
            const profilRes = await fetch(
                `${API}/api/profil`, {headers: authHeader()}
            )

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

        setEditEmail(profil.email);
        setEditPseudo(profil.pseudo);
        if (profil.pseudo_mc == null) {
            setEditPseudoMc("");
        } else {
            setEditPseudoMc(profil.pseudo_mc);
        }
        setIsEditing(true);
    }

    async function handleSave(){
        try {
            const res = await fetch(`${API}/api/profil`, {
                method: "PUT",
                headers: authHeader(),
                body: JSON.stringify({ pseudo: editPseudo, pseudo_mc: editPseudoMc || null, email: editEmail }),
            });

            const data = await res.json();
            if (data.success) {
                if (!profil) return;

                //...profil récupère les propriétés de l'ancien objet profil
                setProfil({...profil, pseudo: editPseudo, pseudo_mc: editPseudoMc, email: editEmail});

                setAlerte({message: "Information modifiées !", type:"success"});
                setIsEditing(false);
            } else {
                setAlerte({message: data.message || "Erreur lors de la modification", type: "error"});
            }
        } catch {
            setAlerte({ message:"Impossible de joindre le serveur", type:"error"});
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
        <main className={styles.wrap}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button onClick={handleDashboard}>
                        Retour
                    </button>
                </div>
                <h1>Profil</h1>
            </header>
            <div className={styles.content}>
                {alerte && (
                    <div className={`${styles.alert} ${styles[alerte.type]}`}>
                        {alerte.message}
                    </div>
                )}

                {profil && (
                    isEditing ? (
                        <div>
                            <input
                                id="pseudo"
                                type="text"
                                value={editPseudo}
                                onChange={(e) => setEditPseudo(e.target.value)}
                            />
                            <input
                                id="pseudo_mc"
                                type="text"
                                value={editPseudoMc}
                                onChange={(e) => setEditPseudoMc(e.target.value)}
                            />
                            <input
                                id="email"
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                            />

                            <button onClick={() => setIsEditing(false)}>
                                Annuler
                            </button>

                            <button onClick={handleSave}>
                                Enregistrer
                            </button>
                        </div>
                    ) : (
                    <div className={styles.card}>
                        {profil.pseudo_mc == null ? (
                            <img 
                            src={`https://mc-heads.net/avatar/steve/32`}
                            alt="Avatar Par défaut"
                            />

                        ) : (
                            <img
                            src={`https://mc-heads.net/avatar/${profil.pseudo_mc}/32`}
                            alt="Avatar MC"
                            />
                        )}
                        <p>Pseudo: {profil.pseudo}</p>
                        <p>Pseudo Minecraft: {profil.pseudo_mc==null ? "Pseudo non Renseigné" : profil.pseudo_mc}</p>
                        <p>Email: {profil.email}</p>
                        <button onClick={handleEdit}>
                            Modifier
                        </button>
                    </div>
                    )
                )}
            </div>
        </main>
    )
}
