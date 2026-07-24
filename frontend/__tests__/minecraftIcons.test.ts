import { getMinecraftIcon } from "../../frontend/lib/minecraftIcons";

describe("getMinecraftIcon", () => {
    describe("Types avec icônes fixes", () => {
        it("retourne l'épée en diamant pour le type TUER", () => {
            const url = getMinecraftIcon("ZOMBIE", "TUER");
            expect(url).toContain("Invicon_Diamond_Sword");
        });

        it("retourne la carte pour le type TROUVER", () => {
            const url = getMinecraftIcon("JUNGLE", "TROUVER");
            expect(url).toContain("Invicon_Map");
        });

        it("retourne le livre de connaissance pour le type SUCCES", () => {
            const url = getMinecraftIcon("story/mine_diamond", "SUCCES");
            expect(url).toContain("Invicon_Knowledge_Book");
        });
    });

    describe("Conversion automatique Bukkit → Wiki", () => {
        it("convertit DIAMOND en Invicon_Diamond", () => {
            const url = getMinecraftIcon("DIAMOND", "OBTENIR");
            expect(url).toContain("Invicon_Diamond.png");
        });

        it("convertit RAW_CHICKEN en Invicon_Raw_Chicken", () => {
            const url = getMinecraftIcon("RAW_CHICKEN", "OBTENIR");
            expect(url).toContain("Invicon_Raw_Chicken.png");
        });

        it("convertit PALE_OAK_LOG en Invicon_Pale_Oak_Log", () => {
            const url = getMinecraftIcon("PALE_OAK_LOG", "CRAFTER");
            expect(url).toContain("Invicon_Pale_Oak_Log.png");
        });

        it("retourne une URL du minecraft wiki", () => {
            const url = getMinecraftIcon("DIAMOND", "OBTENIR");
            expect(url).toContain("minecraft.wiki/images");
        });
    });

    describe("Exceptions Bukkit → Wiki", () => {
        it("gère l'exception DRAGON_BREATH", () => {
            const url = getMinecraftIcon("DRAGON_BREATH", "OBTENIR");
            expect(url).toContain("Dragon");
        });

        it("gère l'exception REPEATER", () => {
            const url = getMinecraftIcon("REPEATER", "CRAFTER");
            expect(url).toContain("Repeater");
        });

        it("gère l'exception COMPARATOR", () => {
            const url = getMinecraftIcon("COMPARATOR", "CRAFTER");
            expect(url).toContain("Comparator");
        });
    });
});