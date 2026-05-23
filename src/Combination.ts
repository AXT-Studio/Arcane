// ================================================================
// Imports
// ================================================================

import { ModOps } from "./ModOps";

// ================================================================
// Exports
// ================================================================

/**
 * 組み合わせ(二項係数)を計算するためのクラスです。
 */
export class Combination {
    #modOps: ModOps;
    /** #fact[i] := i! mod p */
    #fact: bigint[];
    /** #ifact[i] := (i!)^(-1) mod p */
    #ifact: bigint[];

    /**
     * nCk mod p (ただし、1 <= k <= n <= max, n < p, pは素数)を計算するためのクラスを生成します。
     *
     * 時間計算量: O(max)
     *
     * @example
     * ```ts
     * const combination = new Combination(7n, 10n);
     * ```
     *
     * @param p - 法(素数)
     * @param max - n, kの最大値
     * @constructor
     */
    constructor(p: bigint, max: bigint) {
        this.#modOps = new ModOps(p);
        // 先にfact, ifactを計算しておく
        this.#fact = [1n];
        for (let i = 1; i <= max; i++) {
            this.#fact[i] = this.#modOps.mul(this.#fact[i - 1], BigInt(i));
        }
        // mod pにおける1〜maxの逆元
        const inv = [0n];
        for (let i = 1; i <= max; i++) {
            inv[i] = this.#modOps.inv(BigInt(i));
        }
        // invの累積積を取るとifactになる
        this.#ifact = [1n];
        for (let i = 1; i <= max; i++) {
            this.#ifact[i] = this.#modOps.mul(this.#ifact[i - 1], inv[i]);
        }
    }

    /**
     * nCk mod pを計算します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const combination = new Combination(7n, 10n);
     * console.log(combination.get(10, 5)); // => 0 (252 mod 7 = 0)
     * ```
     *
     * @param n - 整数
     * @param k - 整数
     * @returns nCk mod p
     */
    get(n: number, k: number): bigint {
        if (n < k) return 0n;
        if (n < 0 || k < 0) return 0n;
        return this.#modOps.mul(
            this.#modOps.mul(this.#fact[n], this.#ifact[k]),
            this.#ifact[n - k],
        );
    }
}
