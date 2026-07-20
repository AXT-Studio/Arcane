import { describe, expect, it } from "vitest";
import { ExtendedMath } from "../src/ExtendedMath.ts";

describe("ExtendedMath @example", () => {
    it("gcd number", () => {
        expect(ExtendedMath.gcd(48, 18)).toBe(6);
    });

    it("gcd bigint", () => {
        expect(ExtendedMath.gcd(48n, 18n)).toBe(6n);
    });

    it("lcm number", () => {
        expect(ExtendedMath.lcm(12, 18)).toBe(36);
    });

    it("lcm bigint", () => {
        expect(ExtendedMath.lcm(12n, 18n)).toBe(36n);
    });

    it("extendedGCD", () => {
        const [g, x, y] = ExtendedMath.extendedGCD(30n, 21n);
        expect(g).toBe(3n);
        expect(x).toBe(-2n);
        expect(y).toBe(3n);
        expect(30n * x + 21n * y === g).toBe(true);
    });

    it("getDivisors", () => {
        expect(ExtendedMath.getDivisors(28)).toEqual([1, 2, 4, 7, 14, 28]);
        expect(ExtendedMath.getDivisors(1)).toEqual([1]);
        expect(ExtendedMath.getDivisors(0)).toEqual([]);
        expect(ExtendedMath.getDivisors(-5)).toEqual([]);
    });

    it("isqrt", () => {
        expect(ExtendedMath.isqrt(10n)).toBe(3n);
        expect(ExtendedMath.isqrt(15n)).toBe(3n);
        expect(ExtendedMath.isqrt(16n)).toBe(4n);
    });

    it("modPow", () => {
        expect(ExtendedMath.modPow(3n, 200n, 50n)).toBe(1n);
    });

    it("isProbablyPrime", () => {
        expect(ExtendedMath.isProbablyPrime(17n)).toBe(true);
        expect(ExtendedMath.isProbablyPrime(18n)).toBe(false);
    });

    it("isProbablyPrime with bases", () => {
        expect(ExtendedMath.isProbablyPrime(17n, [2n])).toBe(true);
        expect(ExtendedMath.isProbablyPrime(25326001n, [2n, 3n, 5n])).toBe(true);
    });

    it("popcount32", () => {
        expect(ExtendedMath.popcount32(0b10101010)).toBe(4);
        expect(ExtendedMath.popcount32(0b11111111)).toBe(8);
    });

    it("maxBigint", () => {
        expect(ExtendedMath.maxBigint(1n, 2n, 3n)).toBe(3n);
    });

    it("minBigint", () => {
        expect(ExtendedMath.minBigint(1n, 2n, 3n)).toBe(1n);
    });

    it("absBigint", () => {
        expect(ExtendedMath.absBigint(1n)).toBe(1n);
        expect(ExtendedMath.absBigint(-7n)).toBe(7n);
    });

    it("signBigint", () => {
        expect(ExtendedMath.signBigint(1n)).toBe(1n);
        expect(ExtendedMath.signBigint(-7n)).toBe(-1n);
    });
});
