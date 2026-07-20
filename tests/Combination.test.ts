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
