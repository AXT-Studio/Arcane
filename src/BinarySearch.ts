// ================================================================
// Exports
// ================================================================

/**
 * 二分探索を行うためのメソッド群を提供するユーティリティクラスです。
 * - ソート済み配列の二分探索
 * なお、ソート用の比較関数として本ライブラリは`CompareFn`クラスを提供しています。必要に応じてそちらも利用してください。
 */
export class BinarySearch {
    /**
     * 配列`array`に`target`と等しい値が存在するかどうかを、二分探索を用いて判定します。
     *
     * 時間計算量: O(log N) (Nは配列の要素数)
     *
     * @example
     * ```ts
     * const arr = [1, 3, 5, 7, 9];
     * console.log(BinarySearch.binary_search(arr, 5, (a, b) => a - b)); // true
     * console.log(BinarySearch.binary_search(arr, 4, (a, b) => a - b)); // false
     * ```
     *
     * @param array - ソート済み配列
     * @param target - 探索対象の値
     * @param compareFn - 比較関数
     * @returns `target`と等しい値が存在すれば`true`、そうでなければ`false`
     */
    static binary_search<T>(array: readonly T[], target: T, compareFn: (a: T, b: T) => number): boolean {
        let low = 0;
        let high = array.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const cmp = compareFn(array[mid], target);
            if (cmp === 0) return true;
            if (cmp < 0) low = mid + 1;
            else high = mid - 1;
        }
        return false;
    }

    /**
     * 配列`array`の中で、`target`以上と判定される最初の要素のインデックスを返します。
     * `array`内に`target`以上の要素が存在しない場合は`array.length`を返します。
     *
     * 時間計算量: O(log N) (Nは配列の要素数)
     *
     * @example
     * ```ts
     * const arr = [1, 3, 5, 7, 9];
     * console.log(BinarySearch.lower_bound(arr, 4, (a, b) => a - b)); // 2
     * console.log(BinarySearch.lower_bound(arr, 10, (a, b) => a - b)); // 5
     * ```
     *
     * @param array - ソート済み配列
     * @param target - 探索対象の値
     * @param compareFn - 比較関数
     * @returns `target`以上と判定される最初の要素のインデックス または`array.length`
     */
    static lower_bound<T>(array: readonly T[], target: T, compareFn: (a: T, b: T) => number): number {
        let low = 0;
        let high = array.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const cmp = compareFn(array[mid], target);
            if (cmp < 0) low = mid + 1;
            else high = mid;
        }
        return low;
    }

    /**
     * 配列`array`の中で、`target`より大きいと判定される最初の要素のインデックスを返します。
     * `array`内に`target`より大きい要素が存在しない場合は`array.length`を返します。
     *
     * 時間計算量: O(log N) (Nは配列の要素数)
     *
     * @example
     * ```ts
     * const arr = [1, 3, 5, 7, 9];
     * console.log(BinarySearch.upper_bound(arr, 2, (a, b) => a - b)); // 1
     * console.log(BinarySearch.upper_bound(arr, 5, (a, b) => a - b)); // 3
     * console.log(BinarySearch.upper_bound(arr, 9, (a, b) => a - b)); // 5
     * ```
     *
     * @param array - ソート済み配列
     * @param target - 探索対象の値
     * @param compareFn - 比較関数
     * @returns `target`より大きいと判定される最初の要素のインデックス または`array.length`
     */
    static upper_bound<T>(array: readonly T[], target: T, compareFn: (a: T, b: T) => number): number {
        let low = 0;
        let high = array.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const cmp = compareFn(array[mid], target);
            if (cmp <= 0) low = mid + 1;
            else high = mid;
        }
        return low;
    }
}
