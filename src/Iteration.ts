// ================================================================
// Exports
// ================================================================

/**
 * 反復処理に関するメソッド群を提供するユーティリティクラスです。
 */
export class Iteration {
    /**
     * 呼び出されるたびに配列の(昇順で)次の順列を返すジェネレーター関数です。
     * この関数は、与えられた配列の要素を昇順に並べ替えた状態から開始し、次の順列を生成していきます。
     *
     * 時間計算量: 呼び出しごとに O(N) (Nは配列の要素数)、全列挙全体で O(N! * N)
     *
     * @example 順列を配列に展開する
     * ```ts
     * const arr = [1, 2, 3];
     * const permutations = Array.from(Iteration.next_permutation(arr, (a, b) => a - b));
     * console.log(permutations);
     * // [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
     * ```
     *
     * @example 順列を1つずつ処理する
     * ```ts
     * const arr = [1, 2, 3];
     * for (const perm of Iteration.next_permutation(arr, (a, b) => a - b)) {
     *     console.log(perm);
     * }
     * // [1, 2, 3]
     * // [1, 3, 2]
     * // [2, 1, 3]
     * // [2, 3, 1]
     * // [3, 1, 2]
     * // [3, 2, 1]
     * ```
     *
     * @param array - 順列を生成するための配列。要素はcompareFnで比較可能で、かつ現時点で昇順ソートされている必要があります。
     * @param compareFn - 要素の比較関数。Array.sortの引数と同じです。
     * @yields 配列の各要素を並び替えたもの。呼び出されるたびに辞書順で次の順列を返し、最後の順列を返したらreturn(ジェネレーター終了)します。
     */
    static *next_permutation<T>(array: T[], compareFn: (a: T, b: T) => number): Generator<T[], void, unknown> {
        // 入力配列のコピーを作成する。
        const a = [...array];
        while (true) {
            yield [...a]; // 現在の順列のコピーを返す（yield）。

            // 1. a[i] < a[i+1] を満たす最大のインデックス i を求める
            let i = a.length - 2;
            while (i >= 0 && compareFn(a[i], a[i + 1]) >= 0) {
                i--;
            }

            // そのようなインデックスが存在しない場合、現在の順列は最後の順列なので終了する。
            if (i < 0) {
                return;
            }

            // 2. a[i] < a[j] を満たす、i より大きい最大のインデックス j を求める
            let j = a.length - 1;
            while (compareFn(a[i], a[j]) >= 0) {
                j--;
            }

            // 3. a[i] と a[j] を交換する
            [a[i], a[j]] = [a[j], a[i]];

            // 4. a[i+1] から末尾までの部分列を反転する
            let l = i + 1;
            let r = a.length - 1;
            while (l < r) {
                [a[l], a[r]] = [a[r], a[l]];
                l++;
                r--;
            }
        }
    }

    /**
     * 呼び出されるたびに、各位置`i`について`0`以上`max[i]`未満の整数からなる組の次の要素を返すジェネレーター関数です。
     * bit全探索(`[2, 2, ..., 2]`)などに使うことができます。
     *
     * 時間計算量: max.lengthをNとして、呼び出しごとに O(N)、全列挙全体で O(N × Π(max[i]))
     *
     * @example bit全探索
     * ```ts
     * const products = Array.from(Iteration.next_product([2, 2]));
     * console.log(products);
     * // [[0, 0], [0, 1], [1, 0], [1, 1]]
     * ```
     *
     * @example 桁ごとに上限を変える場合
     * ```ts
     * const products = Array.from(Iteration.next_product([2, 3]));
     * console.log(products);
     * // [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]
     * ```
     *
     * @example 空配列の場合（空直積は元が1つなので [[]] を返す）
     * ```ts
     * const products = Array.from(Iteration.next_product([]));
     * console.log(products);
     * // [[]]
     * ```
     *
     * @param max - 各位置の上限を表す正の整数の配列。0以下を含む場合何も返さずreturnされます。
     * @yields 直積の各要素。末尾側から繰り上がる辞書順で返し、最後の組を返したらreturn(ジェネレーター終了)します。
     */
    static *next_product(max: number[]): Generator<number[], void, unknown> {
        if (max.some((n) => n <= 0)) return;
        const a = Array.from({ length: max.length }, () => 0);
        while (true) {
            yield [...a];
            for (let i = a.length - 1; i >= 0; i--) {
                a[i]++;
                if (i === 0) break;
                if (a[i] === max[i]) {
                    a[i] = 0;
                } else {
                    break;
                }
            }
            if (a[0] === max[0]) return;
        }
    }

    /**
     * 配列の隣り合う2要素のペアに対して処理を行います。
     * (配列の長さが2未満の場合は何もしません)
     *
     * 時間計算量: O(|array|) (|array|は配列長。実際はcallbackFnの計算量が掛かる)
     *
     * @example
     * ```ts
     * const arr = [1, 4, 10, 15];
     * Iteration.forEachPair(arr, (a, b, idx) => {
     *     console.log(`Pair #${idx}: ${Math.abs(a - b)}`);
     *     // Pair #0: 3
     *     // Pair #1: 6
     *     // Pair #2: 5
     * });
     * ```
     *
     * @param array - 対象とする配列
     * @param callbackFn - arrayの隣り合う各ペア(a, b)ごとに行いたい処理 (第3引数はaのidx)
     */
    static forEachPair<T>(array: ArrayLike<T>, callbackFn: (a: T, b: T, idx: number) => void): void {
        for (let i = 0; i < array.length - 1; i++) {
            callbackFn(array[i], array[i + 1], i);
        }

    /**
     * 数値配列の累積和を計算します。
     * - 関数を指定することで、和以外の累積を行うこともできます。
     * - 単位元を指定することで、戻り値の配列を半開区間[0, i)の累積にできます。
     *     - 指定がない場合は閉区間[0, i]とします。
     *
     * 時間計算量: 最悪O(|array|) (※|array|はarrayの長さ、実際はoperatorの計算量が掛かる)
     */
    static accumulate(array: ArrayLike<number>, op?: (a: number, b: number) => number, e?: number): number[];

    /**
     * 数値配列の累積和を計算します。
     * - 関数を指定することで、和以外の累積を行うこともできます。
     * - 単位元を指定することで、戻り値の配列を半開区間[0, i)の累積にできます。
     *     - 指定がない場合は閉区間[0, i]とします。
     *
     * 時間計算量: 最悪O(|array|) (※|array|はarrayの長さ、実際はoperatorの計算量が掛かる)
     */
    static accumulate(array: ArrayLike<bigint>, op?: (a: bigint, b: bigint) => bigint, e?: bigint): bigint[];
    /**
     * 数値配列の累積和を計算します。
     * - 関数を指定することで、和以外の累積を行うこともできます。
     * - 単位元を指定することで、戻り値の配列を半開区間[0, i)の累積にできます。
     *     - 指定がない場合は閉区間[0, i]とします。
     *
     * 時間計算量: 最悪O(|array|) (※|array|はarrayの長さ、実際はoperatorの計算量が掛かる)
     *
     * @example
     * ```ts
     * const nums = [2, 3, 5, 7];
     * console.log(Iteration.accumulate(nums)); // [2, 5, 10, 17]
     * console.log(Iteration.accumulate(nums, (a, b) => a * b)); // [2, 6, 30, 210]
     * console.log(Iteration.accumulate(nums, (a, b) => a + b, 0)); // [0, 2, 5, 10, 17]
     * const ints = [2n, 3n, 5n, 7n];
     * console.log(Iteration.accumulate(ints)); // [2n, 5n, 10n, 17n]
     * console.log(Iteration.accumulate(ints, (a, b) => a * b)); // [2n, 6n, 30n, 210n]
     * console.log(Iteration.accumulate(ints, (a, b) => a + b, 0n)); // [0n, 2n, 5n, 10n, 17n]
     * ```
     *
     * @param array 対象とする数値配列
     * @param operator 累積する演算 (指定がない場合加算)
     * @param e operatorの単位元 (returnValue[i]を半開区間[0, i)の累積とする場合に指定)
     * @returns 先頭からの累積結果の配列。eを指定した場合半開区間、指定がない場合閉区間
     */
    static accumulate<T extends number | bigint>(array: ArrayLike<T>, operator?: (a: T, b: T) => T, e?: T): T[] {
        const res: T[] = [];
        const op = (
            operator != null
                ? operator
                : typeof array[0] === "number"
                  ? (a: number, b: number) => a + b
                  : (a: bigint, b: bigint) => a + b
        ) as (a: T, b: T) => T;
        if (e == null && array.length === 0) {
            return [];
        }
        let acc = e ?? array[0];
        res.push(acc);
        for (let i = e == null ? 1 : 0; i < array.length; i++) {
            acc = op(acc, array[i]);
            res.push(acc);
        }
        return res;
    }
}
