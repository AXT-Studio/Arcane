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
}
