import { describe, expect, it } from "vitest";
import { LinearSieve } from "../src/LinearSieve.ts";

describe("LinearSieve @example", () => {
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
