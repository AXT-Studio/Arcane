// ================================================================
// Imports
// ================================================================

import { ModOps } from "./ModOps";

// ================================================================
// Types / Data
// ================================================================

type ConvolutionMod = 998244353n | 167772161n | 3221225473n;

/**
 * keyがNTT-Friendlyな素数、valueは「key = a * 2^b + 1」「法keyの原始根はg」を{a, b, g}で保持
 * @see https://www.mathenachia.blog/ntt-mod-list-01/
 */
const nttConfigs = new Map<ConvolutionMod, { a: bigint; b: bigint; g: bigint }>([
    [998244353n, { a: 119n, b: 23n, g: 3n }],
    [167772161n, { a: 5n, b: 25n, g: 3n }],
    [3221225473n, { a: 3n, b: 30n, g: 5n }],
]);

// ================================================================
// Exports
// ================================================================

/**
 * 畳み込みを計算するためのユーティリティクラスです。
 */
export class Convolution {
    /**
     * @private calcの内部で使うNTTパートの実装です
     *
     * @param c - c[i]は多項式Aのi次の係数。長さL (Lは2の冪で、cは空でない)
     * @param omega - 法pにおける原始L乗根 (0 <= omega < p, L=1の場合omega=1n)
     * @param p - 法p (奇素数)
     * @returns - result[i]はA(omega**i) mod p。長さL
     */
    static #ntt(c: readonly bigint[], omega: bigint, p: bigint): bigint[] {
        const L = c.length;
        // L === 1の場合、c[0]は定数項なのでそのまま返せばOK
        if (L === 1) return [((c[0] % p) + p) % p];
        // 偶奇で振り分け
        const evens: bigint[] = [];
        const odds: bigint[] = [];
        for (let i = 0; i < L; i += 2) {
            evens.push(c[i]);
            odds.push(c[i + 1]);
        }
        // A(x) = E(x^2) + x･O(x^2)に分割したあとのomegaは単にomega**2 mod p
        const child_omega = (omega * omega) % p;
        // 分割したものをそれぞれ再帰で求める
        const evenValues = Convolution.#ntt(evens, child_omega, p);
        const oddValues = Convolution.#ntt(odds, child_omega, p);
        // このあとのループでomegaの(非負整数)乗を順に使うので、それを保持する変数を用意しておく。初期値はomega**0 = 1
        let x = 1n;
        // 答えを埋める。このとき、前半と後半は先の議論により同時に埋めることができる
        const result = Array.from({ length: L }, () => 0n);
        for (let k = 0; k < L / 2; k++) {
            const e = evenValues[k];
            const xo = (x * oddValues[k]) % p;
            result[k] = (e + xo) % p;
            result[k + L / 2] = (e - xo + p) % p;
            x = (x * omega) % p;
        }
        return result;
    }

    /**
     * 長さNの数列a(a_0, a_1, ..., a_{N-1})と長さMの数列b(b_0, b_1, ..., b_{M-1})から、以下を満たす長さN+M-1の数列cの各要素の値を、指定された法のもとで求めます。
     * c_i = ∑[j = 0..i](a_j × b_{i-j})
     *
     * - a, bの少なくとも一方が空配列のときは、空配列を返します
     * - 法`p`に指定できる値は制限されています (NTT-Friendlyな素数である必要があるため)
     * - 指定した法`p`によって、N+M-1の上限が変わります
     *
     * 時間計算量: O(n log n + log p) (n=N+M)
     *
     * @remarks
     * 以下に、法`p`として指定可能な値と、それらの値におけるN+M-1の上限を列挙します
     * - `p = 998244353n` ... 制約: `2n ** 23n >= N + M - 1n` (998244353 = 119 * 2 ** 23 + 1)
     * - `p = 167772161n` ... 制約: `2n ** 25n >= N + M - 1n` (167772161 = 5 * 2 ** 25 + 1)
     * - `p = 3221225473n` ... 制約: `2n ** 30n >= N + M - 1n` (3221225473 = 3 * 2 ** 30 + 1)
     *
     * @example
     * ```ts
     * console.log(Convolution.calc([2n, 1n], [3n, 4n, 5n], 998244353n)); // => [6n, 11n, 14n, 5n] (※(x + 2)(5x^2 + 4x + 3) = (5x^3 + 14x^2 + 11x + 6))
     * ```
     *
     * @param a - 畳み込みを行う一方の数列
     * @param b - 畳み込みを行うもう一方の数列
     * @param p - 戻り値の法
     * @returns - result[i] = c_i = ∑[j = 0..i](a_j × b_{i-j}) mod p
     * @throws {RangeError} - 法`p`として指定した値の特徴に対して、aの長さ+bの長さ-1が大きすぎる場合
     */
    static calc(a: readonly bigint[], b: readonly bigint[], p: ConvolutionMod) {
        const modP = new ModOps(p);
        const N = a.length;
        const M = b.length;
        // AtCoder Libraryと挙動をある程度揃えるために、少なくとも一方が空配列なら空配列を返します
        if (N === 0 || M === 0) return [];
        // 出力長と、それ以上で最小の2の冪である数Lを求めます
        const resultLength = N + M - 1;
        const nttConfig = nttConfigs.get(p)!;
        if (BigInt(resultLength) > 2n ** nttConfig.b) {
            throw new RangeError("The output length exceeds the maximum transform length for this modulus.");
        }
        let L = 1;
        while (L < resultLength) {
            L *= 2;
        }
        // aとbそれぞれ、入力を非負の余りに揃えたうえで、Lに満たない部分は0埋めします
        const a_padded: bigint[] = [];
        const b_padded: bigint[] = [];
        for (let i = 0; i < L; i++) {
            a_padded[i] = i < a.length ? modP.normalize(a[i]) : 0n;
            b_padded[i] = i < b.length ? modP.normalize(b[i]) : 0n;
        }
        // aとbの順変換(NTT)の結果を得ます
        const omega = modP.pow(nttConfig.g, (p - 1n) / BigInt(L));
        const a_transformed = Convolution.#ntt(a_padded, omega, p);
        const b_transformed = Convolution.#ntt(b_padded, omega, p);
        const c_transformed: bigint[] = [];
        for (let i = 0; i < L; i++) {
            c_transformed[i] = modP.mul(a_transformed[i], b_transformed[i]);
        }
        // c_transformedを逆変換(根をomegaの乗法の逆元に入れ替えてNTT→Lで割る)を得て、先頭N+M-1項を返す
        const omega_inv = modP.inv(omega);
        const cL_inversed = Convolution.#ntt(c_transformed, omega_inv, p);
        const L_inv = modP.inv(BigInt(L));
        const result: bigint[] = [];
        for (let i = 0; i < N + M - 1; i++) {
            result[i] = modP.mul(cL_inversed[i], L_inv);
        }
        return result;
    }
}
