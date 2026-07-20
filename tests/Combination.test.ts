import { describe, expect, it } from "vitest";
import { Combination } from "../src/Combination.ts";

describe("Combination の @example", () => {
    it("constructor", () => {
        expect(() => new Combination(83n, 10n)).not.toThrow();
    });

    it("get", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(10, 5)).toBe(3n); // 252 ≡ 3 (mod 83)
    });
});

describe("Combination の境界・特例", () => {
    it("get は n < k や負のとき 0n", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(3, 5)).toBe(0n);
        expect(combination.get(-1, 2)).toBe(0n);
        expect(combination.get(5, -1)).toBe(0n);
    });

    it("get(n, 0) と get(n, n) は 1n", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(0, 0)).toBe(1n);
        expect(combination.get(7, 0)).toBe(1n);
        expect(combination.get(7, 7)).toBe(1n);
    });
});
