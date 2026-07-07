const iconMap: Record<string, string> = {
  "diamant": "Invicon_Diamond",
  "poulet": "Invicon_Raw_Chicken",
  "village": "Invicon_Oak_Door",
  "vache": "Invicon_Raw_Beef",
  "cochon": "Invicon_Raw_Porkchop",
  "bâton": "Invicon_Stick",
  "enclume": "Invicon_Anvil",
  "jungle": "Invicon_Jungle_Sapling",
  "dragon egg": "Invicon_Dragon_Egg",
  "escalier en pierre": "Invicon_Stone_Stairs",
  "emeraude": "Invicon_Emerald",
  "lingot de fer": "Invicon_Iron_Ingot",
  "repeteur": "Invicon_Redstone_Repeater",
  "bois de chêne pale": "Invicon_Pale_Oak_Wood",
  "escalier en bouleau": "Invicon_Birch_Stairs",
  "comparateur": "Invicon_Redstone_Comparator",
  "ancre de réapparition": "Invicon_Respawn_Anchor",
  "minerai de charbon des abimes": "Invicon_Deepslate_Coal_Ore",
};

const DEFAULT_ICON = "https://minecraft.wiki/images/Invicon_Barrier.png";

export function getMinecraftIcon(cible: string, type: string): string {
  if (type === "TUER") {
    return "https://minecraft.wiki/images/Invicon_Diamond_Sword.png";
  }
  if (type === "TROUVER") {
    return "https://minecraft.wiki/images/Invicon_Map.png";
  }
  if (type === "SUCCES") {
    return "https://minecraft.wiki/images/Invicon_Knowledge_Book.png";
  }

  const lower = cible.toLowerCase();
  for (const [mot, item] of Object.entries(iconMap)) {
    if (lower.includes(mot)) {
      return `https://minecraft.wiki/images/${item}.png`;
    }
  }

  return DEFAULT_ICON;
}