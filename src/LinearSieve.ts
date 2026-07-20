// ================================================================
// Exports
// ================================================================

/**
 * 線形篩アルゴリズムとそれに関連したメソッドを提供するユーティリティクラスです。
 *
 */
export class LinearSieve {
    /**
     * N以下のすべての整数について、その最小素因数を列挙します。
     * 戻り値の`0`番目・`1`番目の要素はNaNになります。
     *
     * 時間計算量: O(N)
     *
     * @example
     * ```ts
     * const mpf = LinearSieve.getAllMPF(10);
     * console.log(mpf); // [NaN, NaN, 2, 3, 2, 5, 2, 7, 2, 3, 2]
     * ```
     *
     * @param N - 最大値。
     * @returns 0からNまでを添字とする長さ`N + 1`の配列。各`i` (2 ≦ `i` ≦ `N`) について`mpf[i]`は`i`の最小素因数を表します。
     */
    static getAllMPF(N: number): number[] {
        /** 発見した素数のリスト */
        const primes: number[] = [];
        /** 最小素因数のリスト */
        const mpf: number[] = Array.from({ length: N + 1 }, () => NaN);
        for (let i = 2; i <= N; i++) {
            if (Number.isNaN(mpf[i])) {
                mpf[i] = i;
                primes.push(i);
            }
            for (const p of primes) {
                if (p > mpf[i] || p * i > N) break;
                mpf[p * i] = p;
            }
        }
        return mpf;
    }

    /**
     * N以下のすべての素数を列挙します。
     * `N < 2`の場合は空配列を返します。
     *
     * 時間計算量: O(N)
     *
     *
     * @example
     * ```ts
     * const primes = LinearSieve.getAllPrimes(10);
     * console.log(primes); // [2, 3, 5, 7]
     * ```
     *
     * @param N - 最大値。
     * @returns N以下のすべての素数を昇順で列挙した配列。
     */
    static getAllPrimes(N: number): number[] {
        if (N < 2) return [];
        const mpf = LinearSieve.getAllMPF(N);
        const primes: number[] = [];
        for (let i = 2; i <= N; i++) {
            if (mpf[i] === i) primes.push(i);
        }
        return primes;
    }

    /**
     * Nの素因数分解を行います。
     * `N < 2`の場合は空配列を返します。
     *
     * 時間計算量: O(log N)
     *
     * @example
     * ```ts
     * LinearSieve.factorize(12, LinearSieve.getAllMPF(12)); // [2, 2, 3]
     * LinearSieve.factorize(3, LinearSieve.getAllMPF(3)); // [3]
     * LinearSieve.factorize(1, LinearSieve.getAllMPF(1)); // []
     * ```
     *
     * @param N - 対象の整数。
     * @param MPF - N以下のすべての整数について、その最小素因数を列挙した配列。`MPF[i]`は`i`の最小素因数を表す。
     * @returns Nの素因数を昇順で列挙した配列。重複あり。
     */
    static factorize(N: number, MPF: number[]): number[] {
        if (N < 2) return [];
        let now = N;
        const factors: number[] = [];
        while (now > 1) {
            factors.push(MPF[now]);
            now /= MPF[now];
        }
        return factors;
    }
}
