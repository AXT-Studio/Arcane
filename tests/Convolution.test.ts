import { describe, expect, it } from "vitest";
import { Convolution } from "../src/Convolution.ts";
import { mulberry32 } from "./utils.ts";

const MODS = [998244353n, 167772161n, 3221225473n] as const;

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

/** 要素は読まず、長さだけを持たせる。上限チェックは長さだけを見る */
function arrayOfLength(length: number): bigint[] {
    const a: bigint[] = [];
    a.length = length;
    return a;
}

describe("Convolution の @example", () => {
    it("calc", () => {
        // (x + 2)(5x^2 + 4x + 3) = 5x^3 + 14x^2 + 11x + 6
        expect(Convolution.calc([2n, 1n], [3n, 4n, 5n], 998244353n)).toEqual([6n, 11n, 14n, 5n]);
    });
});

describe("Convolution のランダムテスト", () => {
    it("小さい非負入力 100 件が naive と一致する", () => {
        const rand = mulberry32(20261004);
        const maxLen = 24;
        const maxVal = 100_000;
        for (let trial = 0; trial < 100; trial++) {
            const p = MODS[Math.floor(rand() * MODS.length)];
            const a = Array.from({ length: Math.floor(rand() * (maxLen + 1)) }, () => Math.floor(rand() * maxVal));
            const b = Array.from({ length: Math.floor(rand() * (maxLen + 1)) }, () => Math.floor(rand() * maxVal));
            const expected = convolution_naive(a, b, Number(p)).map(BigInt);
            const got = Convolution.calc(a.map(BigInt), b.map(BigInt), p);
            expect(got, `trial ${trial}: a=${JSON.stringify(a)} b=${JSON.stringify(b)} mod=${p}`).toEqual(expected);
        }
    });
});

describe("Convolution のエラー", () => {
    it("出力長が法の上限を超えるとき RangeError", () => {
        // 998244353 = 119 * 2^23 + 1。N + M - 1 > 2^23
        expect(() => Convolution.calc(arrayOfLength(2 ** 23), [0n, 0n], 998244353n)).toThrow(RangeError);
        // 167772161 = 5 * 2^25 + 1。N + M - 1 > 2^25
        expect(() => Convolution.calc(arrayOfLength(2 ** 25), [0n, 0n], 167772161n)).toThrow(RangeError);
        // 3221225473 = 3 * 2^30 + 1。N + M - 1 > 2^30
        expect(() => Convolution.calc(arrayOfLength(2 ** 30), [0n, 0n], 3221225473n)).toThrow(RangeError);
    });
});

describe("Convolution の境界・特例", () => {
    it("少なくとも一方が空配列のとき空配列", () => {
        expect(Convolution.calc([], [1n, 2n], 998244353n)).toEqual([]);
        expect(Convolution.calc([1n, 2n], [], 167772161n)).toEqual([]);
        expect(Convolution.calc([], [], 3221225473n)).toEqual([]);
    });

    it("負の係数と法以上の係数は非負の余りに正規化される", () => {
        // c = [-12, 23, -5] (mod 998244353)
        expect(Convolution.calc([-3n, 5n], [4n, -1n], 998244353n)).toEqual([998244341n, 23n, 998244348n]);
        expect(Convolution.calc([998244353n + 2n], [1n], 998244353n)).toEqual([2n]);
    });

    it("出力長1000でも正常に計算できる", () => {
        const a = Array<bigint>(500).fill(1n);
        const b = Array<bigint>(501).fill(1n);

        // 全部1なので、自明に「1, 2, …, 499, 500, 500, 499, …, 2, 1」となるはず
        const expected = Array.from({ length: 1000 }, (_, i) => BigInt(Math.min(i + 1, 500, 1000 - i)));

        for (const p of MODS) {
            expect(Convolution.calc(a, b, p)).toEqual(expected);
        }
    });
});
