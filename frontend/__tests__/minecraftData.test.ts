import { filterItems } from "../../frontend/lib/minecraftData";

describe("filterItems", () => {
    describe("Comportement général", () => {
        it("retourne un tableau vide si la query est trop courte", () => {
            expect(filterItems("D", "OBTENIR")).toHaveLength(0);
        });

        it("retourne un tableau vide si la query est vide", () => {
            expect(filterItems("", "OBTENIR")).toHaveLength(0);
        });

        it("retourne au maximum 8 suggestions", () => {
            const results = filterItems("OAK", "OBTENIR");
            expect(results.length).toBeLessThanOrEqual(8);
        });
    });

    describe("Type OBTENIR — items Bukkit", () => {
        it("trouve DIAMOND avec la query 'DIA'", () => {
            const results = filterItems("DIA", "OBTENIR");
            expect(results).toContain("DIAMOND");
        });

        it("trouve plusieurs items avec 'OAK'", () => {
            const results = filterItems("OAK", "OBTENIR");
            expect(results.length).toBeGreaterThan(1);
        });

        it("retourne des résultats en majuscules", () => {
            const results = filterItems("DIA", "OBTENIR");
            results.forEach(r => expect(r).toBe(r.toUpperCase()));
        });
    });

    describe("Type TUER — mobs Bukkit", () => {
        it("trouve ZOMBIE avec la query 'ZOM'", () => {
            const results = filterItems("ZOM", "TUER");
            expect(results).toContain("ZOMBIE");
        });

        it("trouve CREEPER avec la query 'CREEP'", () => {
            const results = filterItems("CREEP", "TUER");
            expect(results).toContain("CREEPER");
        });

        it("ne retourne pas d'items dans les résultats de TUER", () => {
            const results = filterItems("DIA", "TUER");
            expect(results).not.toContain("DIAMOND");
        });
    });

    describe("Type TROUVER — biomes et structures", () => {
        it("trouve JUNGLE avec la query 'JUNG'", () => {
            const results = filterItems("JUNG", "TROUVER");
            expect(results).toContain("JUNGLE");
        });

        it("trouve VILLAGE avec la query 'VILL'", () => {
            const results = filterItems("VILL", "TROUVER");
            expect(results).toContain("VILLAGE");
        });
    });

    describe("Type SUCCES — namespaced keys", () => {
        it("trouve des succès avec la query 'story'", () => {
            const results = filterItems("story", "SUCCES");
            expect(results.length).toBeGreaterThan(0);
        });

        it("ne retourne pas le préfixe minecraft:", () => {
            const results = filterItems("story", "SUCCES");
            results.forEach(r => expect(r).not.toContain("minecraft:"));
        });

        it("trouve dragon avec la query 'dragon'", () => {
            const results = filterItems("dragon", "SUCCES");
            expect(results.some(r => r.includes("dragon"))).toBe(true);
        });
    });
});