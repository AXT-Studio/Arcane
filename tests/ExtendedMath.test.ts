import { describe, expect, it } from "vitest";
import { ExtendedMath } from "../src/ExtendedMath.ts";

describe("ExtendedMath の @example", () => {
    it("gcd（number）", () => {
        expect(ExtendedMath.gcd(48, 18)).toBe(6);
    });

    it("gcd（bigint）", () => {
        expect(ExtendedMath.gcd(48n, 18n)).toBe(6n);
    });

    it("lcm（number）", () => {
        expect(ExtendedMath.lcm(12, 18)).toBe(36);
    });

    it("lcm（bigint）", () => {
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

    it("bases 指定の isProbablyPrime", () => {
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

describe("ExtendedMath のエラー", () => {
    it("isqrt は n が負のとき RangeError", () => {
        expect(() => ExtendedMath.isqrt(-1n)).toThrow(RangeError);
    });

    it("modPow は指数が負のとき RangeError", () => {
        expect(() => ExtendedMath.modPow(3n, -1n, 50n)).toThrow(RangeError);
    });

    it("modPow は法が正でないとき RangeError", () => {
        expect(() => ExtendedMath.modPow(3n, 2n, 0n)).toThrow(RangeError);
        expect(() => ExtendedMath.modPow(3n, 2n, -5n)).toThrow(RangeError);
    });
});

describe("ExtendedMath の境界・特例", () => {
    it("gcd の 0 と負数", () => {
        expect(ExtendedMath.gcd(0, 0)).toBe(0);
        expect(ExtendedMath.gcd(12, 0)).toBe(12);
        expect(ExtendedMath.gcd(0, 12)).toBe(12);
        expect(ExtendedMath.gcd(-12, 18)).toBe(6);
        expect(ExtendedMath.gcd(0n, 0n)).toBe(0n);
        expect(ExtendedMath.gcd(-12n, 0n)).toBe(12n);
    });

    it("lcm の 0", () => {
        expect(ExtendedMath.lcm(0, 0)).toBe(0);
        expect(ExtendedMath.lcm(12, 0)).toBe(0);
        expect(ExtendedMath.lcm(0, 12)).toBe(0);
        expect(ExtendedMath.lcm(0n, 0n)).toBe(0n);
        expect(ExtendedMath.lcm(12n, 0n)).toBe(0n);
    });

    it("signBigint(0n)", () => {
        expect(ExtendedMath.signBigint(0n)).toBe(0n);
    });

    it("modPow は法が 1 のとき常に 0n", () => {
        expect(ExtendedMath.modPow(3n, 200n, 1n)).toBe(0n);
        expect(ExtendedMath.modPow(0n, 0n, 1n)).toBe(0n);
    });
});
