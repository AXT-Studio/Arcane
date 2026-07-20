import { describe, expect, it } from "vitest";
import { LinearSieve } from "../src/LinearSieve.ts";

describe("LinearSieve の @example", () => {
    it("getAllMPF", () => {
        const mpf = LinearSieve.getAllMPF(10);
        expect(mpf).toEqual([NaN, NaN, 2, 3, 2, 5, 2, 7, 2, 3, 2]);
    });

    it("getAllPrimes", () => {
        const primes = LinearSieve.getAllPrimes(10);
        expect(primes).toEqual([2, 3, 5, 7]);
    });

    it("factorize", () => {
        expect(LinearSieve.factorize(12, LinearSieve.getAllMPF(12))).toEqual([2, 2, 3]);
        expect(LinearSieve.factorize(3, LinearSieve.getAllMPF(3))).toEqual([3]);
        expect(LinearSieve.factorize(1, LinearSieve.getAllMPF(1))).toEqual([]);
    });
});

describe("LinearSieve の境界・特例", () => {
    it("getAllPrimes / factorize は N < 2 のとき空配列", () => {
        expect(LinearSieve.getAllPrimes(1)).toEqual([]);
        expect(LinearSieve.getAllPrimes(0)).toEqual([]);
        expect(LinearSieve.factorize(0, LinearSieve.getAllMPF(0))).toEqual([]);
        expect(LinearSieve.factorize(1, LinearSieve.getAllMPF(1))).toEqual([]);
    });

    it("getAllMPF は素数で mpf[i] === i", () => {
        const mpf = LinearSieve.getAllMPF(10);
        const primes = [2, 3, 5, 7];
        const composites = [4, 6, 8, 9, 10];
        for (const p of primes) {
            expect(mpf[p]).toBe(p);
        }
        for (const c of composites) {
            expect(mpf[c]).not.toBe(c);
        }
    });
});
