import { describe, expect, it } from "vitest";
import { Combination } from "../src/Combination.ts";

describe("Combination - JSDoc @example", () => {
    it("new Combination()", () => {
        expect(() => {
            const _combination = new Combination(83n, 10n);
        }).not.toThrow();
    });
    it("get()", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(10, 5)).toBe(3n); // 252 ≡ 3 (mod 83)
    });
});

describe("Combination - Edge Cases", () => {
    it("get()はn < kのとき0n", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(3, 5)).toBe(0n);
    });
    it("get()はnが負のとき0n", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(-1, 2)).toBe(0n);
    });
    it("get()はkが負のとき0n", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(5, -1)).toBe(0n);
    });
    it("get()はn = 0, k = 0のとき1n", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(0, 0)).toBe(1n);
    });
    it("get()はk = 0のとき1n", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(7, 0)).toBe(1n);
    });
    it("get()はn = kのとき1n", () => {
        const combination = new Combination(83n, 10n);
        expect(combination.get(7, 7)).toBe(1n);
    });
});

describe("Combination - Random Tests", () => {
    it("get()について、乗算による愚直なnCk mod pと比較して一致確認", () => {
        const p = 1009n;
        const max = 140;
        const combination = new Combination(p, BigInt(max));
        for (let n = 0; n <= max; n++) {
            for (let k = 0; k <= n; k++) {
                let value = 1n;
                for (let i = 0; i < k; i++) {
                    value = (value * BigInt(n - i)) / BigInt(i + 1);
                }
                expect(combination.get(n, k)).toBe(value % p);
            }
        }
    });
});
