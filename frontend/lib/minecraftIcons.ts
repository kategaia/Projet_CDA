// Dictionnaire mots-clés → nom d'item sur minecraft.wiki
const iconMap: Record<string, string> = {
  "diamant": "Diamond",
  "poulet": "Chicken",
  "village": "Village",
  "vache" : "Cow",
  "cochon" : "Porck",
  "bâton" : "Stick",
  "enclume" : "Anvil",
  "jungle" : "Jungle",
};

// Fonction qui analyse le texte et retourne l'URL de l'icône
export function getMinecraftIcon(texte: string): string | null {
  const lower = texte.toLowerCase();
  for (const [mot, item] of Object.entries(iconMap)) {
    if (lower.includes(mot)) {
      return `https://minecraft.wiki/images/${item}.png`;
    }
  }
  return null; // pas d'icône trouvée
}