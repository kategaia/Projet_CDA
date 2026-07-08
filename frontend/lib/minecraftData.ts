import items from "./bukkitItems.json";
import mobs from "./bukkitMobs.json";
import biomes from "./minecraftBiomes.json";
import advancements from "./minecraftAdvancements.json";

// Retourne la bonne liste selon le type sélectionné
function getListForType(type: string): string[] {
  switch (type) {
    case "TUER":    return mobs as string[];
    case "TROUVER": return biomes as string[];
    case "SUCCES":  return advancements as string[];
    default:        return items as string[]; // OBTENIR, CRAFTER
  }
}

/**
 * Filtre les suggestions selon le type et la saisie.
 * Retourne les 8 premiers résultats.
 */
export function filterItems(query: string, type: string = ""): string[] {
  if (!query || query.length < 2) return [];
  
  const list = getListForType(type);
  
  // Pour les succès, recherche en minuscules sans forcer les majuscules
  if (type === "SUCCES") {
    const q = query.toLowerCase();
    return list
      .filter((item) => item.includes(q))
      // Retire le préfixe "minecraft:" pour le plugin
      .map((item) => item.replace("minecraft:", ""))
      .slice(0, 8);
  }

  // Pour les autres types, recherche en majuscules
  const q = query.toUpperCase();
  return list.filter((item) => item.includes(q)).slice(0, 8);
}