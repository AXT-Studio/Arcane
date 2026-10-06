import { describe, expect, it } from "vitest";
import { Convolution } from "../src/Convolution.ts";

/**
 * 小さい非負整数向けの素朴な畳み込み。
 * 係数と途中和が Number の安全整数に収まる範囲で、ランダムテストの期待値に使う。
 */
const convolution_naive = (a: number[], b: number[], mod: number): number[] => {
    const N = a.length;
    const M = b.length;
    if (N === 0 || M === 0) return [];
    const c = Array.from({ length: N + M - 1 }, () => 0);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < M; j++) {
            c[i + j] = (c[i + j] + a[i] * b[j]) % mod;
        }
    }
    return c;
};

describe("Convolution - JSDoc @example", () => {
    it("Convolution.calc()", () => {
        expect(Convolution.calc([2n, 1n], [3n, 4n, 5n], 998244353n)).toEqual([6n, 11n, 14n, 5n]);
    });
});

describe("Convolution - Edge Cases", () => {
    it("calc()は出力長が2^23を超えるときRangeError", () => {
        // 998244353 = 119 * 2^23 + 1。N + M - 1 > 2^23
        const a: bigint[] = [];
        a.length = 2 ** 23;
        expect(() => Convolution.calc(a, [0n, 0n], 998244353n)).toThrow(RangeError);
    });
    it("calc()は出力長が2^25を超えるときRangeError", () => {
        // 167772161 = 5 * 2^25 + 1。N + M - 1 > 2^25
        const a: bigint[] = [];
        a.length = 2 ** 25;
        expect(() => Convolution.calc(a, [0n, 0n], 167772161n)).toThrow(RangeError);
    });
    it("calc()は出力長が2^30を超えるときRangeError", () => {
        // 3221225473 = 3 * 2^30 + 1。N + M - 1 > 2^30
        const a: bigint[] = [];
        a.length = 2 ** 30;
        expect(() => Convolution.calc(a, [0n, 0n], 3221225473n)).toThrow(RangeError);
    });
    it("calc()はaが空のとき[]", () => {
        expect(Convolution.calc([], [1n, 2n], 998244353n)).toEqual([]);
    });
    it("calc()はbが空のとき[]", () => {
        expect(Convolution.calc([1n, 2n], [], 167772161n)).toEqual([]);
    });
    it("calc()はaとbが空のとき[]", () => {
        expect(Convolution.calc([], [], 3221225473n)).toEqual([]);
    });
    it("calc()は負の係数のとき非負の余り", () => {
        // c = [-12, 23, -5] (mod 998244353)
        expect(Convolution.calc([-3n, 5n], [4n, -1n], 998244353n)).toEqual([998244341n, 23n, 998244348n]);
    });
    it("calc()は法以上の係数のとき非負の余り", () => {
        expect(Convolution.calc([998244353n + 2n], [1n], 998244353n)).toEqual([2n]);
    });
});

describe("Convolution - Random Tests", () => {
    it("Convolution.calc()について、素朴な畳み込みと比較して一致確認", () => {
        const mods = [998244353n, 167772161n, 3221225473n] as const;
        const maxLen = 24;
        const maxVal = 100_000;
        for (let trial = 0; trial < 100; trial++) {
            const p = mods[Math.floor(Math.random() * mods.length)];
            const a = Array.from({ length: Math.floor(Math.random() * (maxLen + 1)) }, () =>
                Math.floor(Math.random() * maxVal),
            );
            const b = Array.from({ length: Math.floor(Math.random() * (maxLen + 1)) }, () =>
                Math.floor(Math.random() * maxVal),
            );
            const expected = convolution_naive(a, b, Number(p)).map(BigInt);
            const got = Convolution.calc(
                a.map((x) => BigInt(x)),
                b.map((x) => BigInt(x)),
                p,
            );
            expect(got, `trial ${trial}: a=${JSON.stringify(a)} b=${JSON.stringify(b)} mod=${p}`).toEqual(expected);
        }
    });
});

describe("Convolution - Scenario Tests", () => {
    it("出力長1000でも正常に計算できる", () => {
        const mods = [998244353n, 167772161n, 3221225473n] as const;
        const a = Array<bigint>(500).fill(1n);
        const b = Array<bigint>(501).fill(1n);
        // 全部1なので、自明に「1, 2, …, 499, 500, 500, 499, …, 2, 1」となるはず
        const expected = Array.from({ length: 1000 }, (_, i) => BigInt(Math.min(i + 1, 500, 1000 - i)));
        for (const p of mods) {
            expect(Convolution.calc(a, b, p)).toEqual(expected);
        }
    });
});
