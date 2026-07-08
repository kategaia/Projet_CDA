/**
 * Convertit un nom Bukkit (SNAKE_CASE) en nom wiki Minecraft (Title_Case)
 * Exemple : PALE_OAK_LOG → Pale_Oak_Log
 */
function bukkitToWikiName(bukkit: string): string {
  return bukkit
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("_");
}

/**
 * Retourne l'URL de l'icône Minecraft selon le type et la cible.
 * - TUER    → épée en diamant
 * - TROUVER → carte
 * - SUCCES  → livre de connaissance
 * - OBTENIR / CRAFTER → icône de l'item automatiquement depuis le nom Bukkit
 */
// Exceptions : noms Bukkit → noms wiki différents
const exceptions: Record<string, string> = {
  "DRAGON_BREATH": "Dragon's_Breath",
  "REPEATER": "Redstone_Repeater",
  "COMPARATOR": "Redstone_Comparator",
};

export function getMinecraftIcon(cible: string, type: string): string {
  if (type === "TUER") return "https://minecraft.wiki/images/Invicon_Diamond_Sword.png";
  if (type === "TROUVER") return "https://minecraft.wiki/images/Invicon_Map.png";
  if (type === "SUCCES") return "https://minecraft.wiki/images/Invicon_Knowledge_Book.png";

  // Vérifie d'abord les exceptions
  const wikiName = exceptions[cible] ?? bukkitToWikiName(cible);
  return `https://minecraft.wiki/images/Invicon_${wikiName}.png`;
}