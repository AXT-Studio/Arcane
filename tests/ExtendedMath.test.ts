import { describe, expect, it } from "vitest";
import { ExtendedMath } from "../src/ExtendedMath.ts";

describe("ExtendedMath - JSDoc @example", () => {
    it("ExtendedMath.gcd() [number型の場合]", () => {
        expect(ExtendedMath.gcd(48, 18)).toBe(6);
    });
    it("ExtendedMath.gcd() [bigint型の場合]", () => {
        expect(ExtendedMath.gcd(48n, 18n)).toBe(6n);
    });
    it("ExtendedMath.lcm() [number型の場合]", () => {
        expect(ExtendedMath.lcm(12, 18)).toBe(36);
    });
    it("ExtendedMath.lcm() [bigint型の場合]", () => {
        expect(ExtendedMath.lcm(12n, 18n)).toBe(36n);
    });
    it("ExtendedMath.extendedGCD()", () => {
        const [g, x, y] = ExtendedMath.extendedGCD(30n, 21n);
        expect(g).toBe(3n);
        expect(x).toBe(-2n);
        expect(y).toBe(3n);
        expect(30n * x + 21n * y === g).toBe(true);
    });
    it("ExtendedMath.getDivisors()", () => {
        expect(ExtendedMath.getDivisors(28)).toEqual([1, 2, 4, 7, 14, 28]);
        expect(ExtendedMath.getDivisors(1)).toEqual([1]);
        expect(ExtendedMath.getDivisors(0)).toEqual([]);
        expect(ExtendedMath.getDivisors(-5)).toEqual([]);
    });
    it("ExtendedMath.isqrt()", () => {
        expect(ExtendedMath.isqrt(10n)).toBe(3n);
        expect(ExtendedMath.isqrt(15n)).toBe(3n);
        expect(ExtendedMath.isqrt(16n)).toBe(4n);
    });
    it("ExtendedMath.icbrt()", () => {
        expect(ExtendedMath.icbrt(8n)).toBe(2n);
        expect(ExtendedMath.icbrt(26n)).toBe(2n);
        expect(ExtendedMath.icbrt(27n)).toBe(3n);
    });
    it("ExtendedMath.modPow()", () => {
        expect(ExtendedMath.modPow(3n, 200n, 50n)).toBe(1n);
    });
    it("ExtendedMath.modInv()", () => {
        expect(ExtendedMath.modInv(3n, 7n)).toBe(5n);
        expect(ExtendedMath.modInv(0n, 1n)).toBe(0n);
        expect(ExtendedMath.modInv(-2n, 7n)).toBe(3n);
        expect(() => ExtendedMath.modInv(2n, 4n)).toThrow(Error);
    });
    it("ExtendedMath.isProbablyPrime() [basesを省略した場合]", () => {
        expect(ExtendedMath.isProbablyPrime(17n)).toBe(true);
        expect(ExtendedMath.isProbablyPrime(18n)).toBe(false);
    });
    it("ExtendedMath.isProbablyPrime() [basesを指定した場合]", () => {
        expect(ExtendedMath.isProbablyPrime(17n, [2n])).toBe(true);
        expect(ExtendedMath.isProbablyPrime(25326001n, [2n, 3n, 5n])).toBe(true);
    });
    it("ExtendedMath.popcount32()", () => {
        expect(ExtendedMath.popcount32(0b10101010)).toBe(4);
        expect(ExtendedMath.popcount32(0b11111111)).toBe(8);
    });
    it("ExtendedMath.maxBigint()", () => {
        expect(ExtendedMath.maxBigint(1n, 2n, 3n)).toBe(3n);
    });
    it("ExtendedMath.minBigint()", () => {
        expect(ExtendedMath.minBigint(1n, 2n, 3n)).toBe(1n);
    });
    it("ExtendedMath.absBigint()", () => {
        expect(ExtendedMath.absBigint(1n)).toBe(1n);
        expect(ExtendedMath.absBigint(-7n)).toBe(7n);
    });
    it("ExtendedMath.signBigint()", () => {
        expect(ExtendedMath.signBigint(1n)).toBe(1n);
        expect(ExtendedMath.signBigint(-7n)).toBe(-1n);
    });
    it("ExtendedMath.divBigint()", () => {
        expect(ExtendedMath.divBigint(1n, 2n)).toBe(0n);
        expect(ExtendedMath.divBigint(5n, 3n)).toBe(1n);
        expect(ExtendedMath.divBigint(-1n, 3n)).toBe(-1n);
        expect(() => ExtendedMath.divBigint(1n, -3n)).toThrow(RangeError);
        expect(() => ExtendedMath.divBigint(2n, 0n)).toThrow(RangeError);
    });
    it("ExtendedMath.medianOfSorted()", () => {
        expect(ExtendedMath.medianOfSorted([1, 2, 3])).toBe(2);
        expect(ExtendedMath.medianOfSorted([1, 2, 3, 4])).toBe(2.5);
        expect(ExtendedMath.medianOfSorted([1, 3, 3, 6])).toBe(3);
        expect(ExtendedMath.medianOfSorted([])).toBeNaN();
    });
    it("ExtendedMath.floorSum()", () => {
        expect(ExtendedMath.floorSum(4n, 10n, 6n, 3n)).toBe(3n);
    });
    it("ExtendedMath.crt()", () => {
        expect(ExtendedMath.crt([10n], [7n])).toEqual([3n, 7n]);
        expect(ExtendedMath.crt([-1n, 3n], [4n, 6n])).toEqual([3n, 12n]);
        expect(ExtendedMath.crt([1n, 3n], [4n, 6n])).toEqual([9n, 12n]);
        expect(ExtendedMath.crt([0n, 1n], [2n, 2n])).toEqual([0n, 0n]);
        expect(ExtendedMath.crt([0n], [1n])).toEqual([0n, 1n]);
    });
});

describe("ExtendedMath - Edge Cases", () => {
    it("gcd()は両方が0のとき0", () => {
        expect(ExtendedMath.gcd(0, 0)).toBe(0);
        expect(ExtendedMath.gcd(0n, 0n)).toBe(0n);
    });
    it("gcd()は片方が0のときもう一方の絶対値", () => {
        expect(ExtendedMath.gcd(12, 0)).toBe(12);
        expect(ExtendedMath.gcd(0, 12)).toBe(12);
        expect(ExtendedMath.gcd(-12n, 0n)).toBe(12n);
    });
    it("gcd()は負数を含むとき絶対値の最大公約数", () => {
        expect(ExtendedMath.gcd(-12, 18)).toBe(6);
    });
    it("lcm()は0を含むとき0", () => {
        expect(ExtendedMath.lcm(0, 0)).toBe(0);
        expect(ExtendedMath.lcm(12, 0)).toBe(0);
        expect(ExtendedMath.lcm(0, 12)).toBe(0);
        expect(ExtendedMath.lcm(0n, 0n)).toBe(0n);
        expect(ExtendedMath.lcm(12n, 0n)).toBe(0n);
    });
    it("isqrt()はnが負のときRangeError", () => {
        expect(() => ExtendedMath.isqrt(-1n)).toThrow(RangeError);
    });
    it("icbrt()はnが負のときRangeError", () => {
        expect(() => ExtendedMath.icbrt(-1n)).toThrow(RangeError);
    });
    it("icbrt()は0nのとき0n", () => {
        expect(ExtendedMath.icbrt(0n)).toBe(0n);
    });
    it("icbrt()は1以上2^10以下でfloor(cbrt)と一致", () => {
        const ref = (n: bigint) => BigInt(Math.floor(Math.cbrt(Number(n))));
        for (let n = 1n; n <= 1n << 10n; n++) {
            expect(ExtendedMath.icbrt(n)).toBe(ref(n));
        }
    });
    it("modPow()は指数が負のときRangeError", () => {
        expect(() => ExtendedMath.modPow(3n, -1n, 50n)).toThrow(RangeError);
    });
    it("modPow()は法が0のときRangeError", () => {
        expect(() => ExtendedMath.modPow(3n, 2n, 0n)).toThrow(RangeError);
    });
    it("modPow()は法が負のときRangeError", () => {
        expect(() => ExtendedMath.modPow(3n, 2n, -5n)).toThrow(RangeError);
    });
    it("modPow()は法が1のとき0n", () => {
        expect(ExtendedMath.modPow(3n, 200n, 1n)).toBe(0n);
        expect(ExtendedMath.modPow(0n, 0n, 1n)).toBe(0n);
    });
    it("modInv()は法が0のときError", () => {
        expect(() => ExtendedMath.modInv(3n, 0n)).toThrow(Error);
    });
    it("modInv()は法が負のときError", () => {
        expect(() => ExtendedMath.modInv(3n, -1n)).toThrow(Error);
    });
    it("signBigint()は0nのとき0n", () => {
        expect(ExtendedMath.signBigint(0n)).toBe(0n);
    });
    it("divBigint()はmが負のときRangeError", () => {
        expect(() => ExtendedMath.divBigint(1n, -3n)).toThrow(RangeError);
    });
    it("divBigint()はmが0のときRangeError", () => {
        expect(() => ExtendedMath.divBigint(2n, 0n)).toThrow(RangeError);
    });
    it("medianOfSorted()は長さ1のときその要素", () => {
        expect(ExtendedMath.medianOfSorted([42])).toBe(42);
    });
    it("medianOfSorted()は長さ2のとき平均", () => {
        expect(ExtendedMath.medianOfSorted([1, 2])).toBe(1.5);
    });
    it("medianOfSorted()は負数・小数でも中央値", () => {
        expect(ExtendedMath.medianOfSorted([-5, -1, 0, 2, 10])).toBe(0);
        expect(ExtendedMath.medianOfSorted([-4, -2, 0, 2])).toBe(-1);
        expect(ExtendedMath.medianOfSorted([0.5, 1.5, 2.5])).toBe(1.5);
        expect(ExtendedMath.medianOfSorted([0.5, 1.5, 2.5, 3.5])).toBe(2);
    });
    it("medianOfSorted()はArrayLikeを受け付ける", () => {
        expect(ExtendedMath.medianOfSorted(new Float64Array([1, 2, 3, 4]))).toBe(2.5);
        expect(ExtendedMath.medianOfSorted({ length: 3, 0: 10, 1: 20, 2: 30 })).toBe(20);
    });
    it("medianOfSorted()はlengthが不正なときNaN", () => {
        expect(ExtendedMath.medianOfSorted({ length: -1 })).toBeNaN();
        expect(ExtendedMath.medianOfSorted({ length: 1.5, 0: 1, 1: 2 })).toBeNaN();
        expect(ExtendedMath.medianOfSorted({ length: Number.POSITIVE_INFINITY, 0: 1 })).toBeNaN();
        expect(ExtendedMath.medianOfSorted({ length: Number.NaN })).toBeNaN();
    });
    it("crt()はaとnの長さが一致しないときError", () => {
        expect(() => ExtendedMath.crt([1n], [2n, 3n])).toThrow(Error);
        expect(() => ExtendedMath.crt([1n, 2n], [3n])).toThrow(Error);
    });
    it("crt()はnに0が含まれるときError", () => {
        expect(() => ExtendedMath.crt([1n], [0n])).toThrow(Error);
    });
    it("crt()はnに負の値が含まれるときError", () => {
        expect(() => ExtendedMath.crt([1n, 2n], [3n, -1n])).toThrow(Error);
    });
});

describe("ExtendedMath - Random Tests", () => {
    it("signBigint()について、Math.sign()と比較して一致確認", () => {
        for (let t = 0; t < 100; t++) {
            const n = Math.floor(Math.random() * 2001) - 1000;
            expect(ExtendedMath.signBigint(BigInt(n))).toBe(BigInt(Math.sign(n)));
        }
    });
    it("absBigint()について、Math.abs()と比較して一致確認", () => {
        for (let t = 0; t < 100; t++) {
            const n = Math.floor(Math.random() * 2001) - 1000;
            expect(ExtendedMath.absBigint(BigInt(n))).toBe(BigInt(Math.abs(n)));
        }
    });
    it("minBigint()について、Math.min()と比較して一致確認", () => {
        for (let t = 0; t < 100; t++) {
            const values = Array.from({ length: 1 + Math.floor(Math.random() * 5) }, () => {
                return Math.floor(Math.random() * 2001) - 1000;
            });
            const bigints = values.map((value) => BigInt(value)) as [bigint, ...bigint[]];
            expect(ExtendedMath.minBigint(...bigints)).toBe(BigInt(Math.min(...values)));
        }
    });
    it("maxBigint()について、Math.max()と比較して一致確認", () => {
        for (let t = 0; t < 100; t++) {
            const values = Array.from({ length: 1 + Math.floor(Math.random() * 5) }, () => {
                return Math.floor(Math.random() * 2001) - 1000;
            });
            const bigints = values.map((value) => BigInt(value)) as [bigint, ...bigint[]];
            expect(ExtendedMath.maxBigint(...bigints)).toBe(BigInt(Math.max(...values)));
        }
    });
    it("isqrt()について、Math.floor(Math.sqrt())と比較して一致確認", () => {
        const limit = 1n << 52n;
        for (let t = 0; t < 100; t++) {
            const n = BigInt(Math.floor(Math.random() * Number(limit))) + 1n;
            expect(ExtendedMath.isqrt(n)).toBe(BigInt(Math.floor(Math.sqrt(Number(n)))));
        }
    });
    it("icbrt()について、Math.floor(Math.cbrt())と比較して一致確認", () => {
        const limit = 1n << 52n;
        for (let t = 0; t < 100; t++) {
            const n = BigInt(Math.floor(Math.random() * Number(limit))) + 1n;
            expect(ExtendedMath.icbrt(n)).toBe(BigInt(Math.floor(Math.cbrt(Number(n)))));
        }
    });
    it("divBigint()について、Math.floor()による除算と比較して一致確認", () => {
        for (let t = 0; t < 100; t++) {
            const a = BigInt(Math.floor(Math.random() * 20_001) - 10_000);
            const m = BigInt(Math.floor(Math.random() * 10_000) + 1);
            expect(ExtendedMath.divBigint(a, m)).toBe(BigInt(Math.floor(Number(a) / Number(m))));
        }
    });
    it("floorSum()について、各項のfloorを足す愚直実装と比較して一致確認", () => {
        for (let t = 0; t < 100; t++) {
            const n = BigInt(Math.floor(Math.random() * 101));
            const m = BigInt(Math.floor(Math.random() * 100) + 1);
            const a = BigInt(Math.floor(Math.random() * 201) - 100);
            const b = BigInt(Math.floor(Math.random() * 201) - 100);
            let sum = 0n;
            for (let i = 0n; i < n; i++) {
                sum += BigInt(Math.floor(Number(a * i + b) / Number(m)));
            }
            expect(ExtendedMath.floorSum(n, m, a, b)).toBe(sum);
        }
    });
});
