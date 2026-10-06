import { describe, expect, it } from "vitest";
import { LinearSieve } from "../src/LinearSieve.ts";

describe("LinearSieve - JSDoc @example", () => {
    it("LinearSieve.getAllMPF()", () => {
        const mpf = LinearSieve.getAllMPF(10);
        expect(mpf[0]).toBeNaN();
        expect(mpf[1]).toBeNaN();
        expect(mpf.slice(2)).toEqual([2, 3, 2, 5, 2, 7, 2, 3, 2]);
    });
    it("LinearSieve.getAllPrimes()", () => {
        const primes = LinearSieve.getAllPrimes(10);
        expect(primes).toEqual([2, 3, 5, 7]);
    });
    it("LinearSieve.factorize()", () => {
        expect(LinearSieve.factorize(12, LinearSieve.getAllMPF(12))).toEqual([2, 2, 3]);
        expect(LinearSieve.factorize(3, LinearSieve.getAllMPF(3))).toEqual([3]);
        expect(LinearSieve.factorize(1, LinearSieve.getAllMPF(1))).toEqual([]);
    });
});

describe("LinearSieve - Edge Cases", () => {
    it("getAllMPF()は素数のときmpf[i]===i", () => {
        const mpf = LinearSieve.getAllMPF(10);
        expect(mpf[2]).toBe(2);
        expect(mpf[3]).toBe(3);
        expect(mpf[5]).toBe(5);
        expect(mpf[7]).toBe(7);
    });
    it("getAllMPF()は合成数のときmpf[i]!==i", () => {
        const mpf = LinearSieve.getAllMPF(10);
        expect(mpf[4]).not.toBe(4);
        expect(mpf[6]).not.toBe(6);
        expect(mpf[8]).not.toBe(8);
        expect(mpf[9]).not.toBe(9);
        expect(mpf[10]).not.toBe(10);
    });
    it("getAllPrimes()はNが1のとき空配列", () => {
        expect(LinearSieve.getAllPrimes(1)).toEqual([]);
    });
    it("getAllPrimes()はNが0のとき空配列", () => {
        expect(LinearSieve.getAllPrimes(0)).toEqual([]);
    });
    it("factorize()はNが0のとき空配列", () => {
        expect(LinearSieve.factorize(0, LinearSieve.getAllMPF(0))).toEqual([]);
    });
    it("factorize()はNが1のとき空配列", () => {
        expect(LinearSieve.factorize(1, LinearSieve.getAllMPF(1))).toEqual([]);
    });
});
