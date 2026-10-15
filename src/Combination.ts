// ================================================================
// Imports
// ================================================================

import { ModOps } from "./ModOps";

// ================================================================
// Exports
// ================================================================

/**
 * 組み合わせ(二項係数)を計算するためのクラスです。
 *
 * @since 1.0.0
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
     * const combination = new Combination(83n, 10n);
     * ```
     *
     * @param p - 法(素数)
     * @param max - n, kの最大値
     */
    constructor(p: bigint, max: bigint) {
        this.#modOps = new ModOps(p);
        const max_number = Number(max);
        // 先にfact, ifactを計算しておく
        this.#fact = [1n];
        for (let i = 1; i <= max_number; i++) {
            this.#fact[i] = this.#modOps.mul(this.#fact[i - 1], BigInt(i));
        }
        if (max_number <= 0) {
            this.#ifact = [1n];
            return;
        }
        // (max!)^(-1) を逆元計算1回で求め、ifact[i-1] = ifact[i] * i で降順に埋める
        // oxlint-disable-next-line unicorn/no-new-array
        this.#ifact = new Array<bigint>(max_number + 1);
        this.#ifact[max_number] = this.#modOps.inv(this.#fact[max_number]);
        for (let i = max_number; i >= 1; i--) this.#ifact[i - 1] = this.#modOps.mul(this.#ifact[i], BigInt(i));
    }

    /**
     * nCk mod pを計算します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const combination = new Combination(83n, 10n);
     * console.log(combination.get(10, 5)); // => 3n (252 ≡ 3 (mod 83))
     * ```
     *
     * @param n - 整数
     * @param k - 整数
     * @returns nCk mod p
     */
    get(n: number, k: number): bigint {
        if (n < k) return 0n;
        if (n < 0 || k < 0) return 0n;
        return this.#modOps.mul(this.#modOps.mul(this.#fact[n], this.#ifact[k]), this.#ifact[n - k]);
    }
}
