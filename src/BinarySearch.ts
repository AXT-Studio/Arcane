// ================================================================
// Exports
// ================================================================

/**
 * 二分探索を行うためのメソッド群を提供するユーティリティクラスです。
 * - 比較関数
 * - ソート済み配列の二分探索
 */
export class BinarySearch {
    /**
     * 「数値の昇順」で比較するための比較関数です。
     *
     * @param a - 比較対象の値1
     * @param b - 比較対象の値2
     * @return `a`が`b`より小さい場合は負の数、等しい場合は0、大きい場合は正の数
     */
    static COMPARE_NUMBER_ASCENDING(a: number, b: number): number {
        return a - b;
    }

    /**
     * 「数値の降順」で比較するための比較関数です。
     *
     * @param a - 比較対象の値1
     * @param b - 比較対象の値2
     * @return `a`が`b`より大きい場合は負の数、等しい場合は0、小さい場合は正の数
     */
    static COMPARE_NUMBER_DESCENDING(a: number, b: number): number {
        return b - a;
    }

    /**
     * JavaScriptの`Array#sort()`のデフォルトの挙動と同様に2要素を比較するための比較関数です。
     * 「文字列の辞書順」(Unicode Code Unit 昇順) で比較します。
     */
    static COMPARE_SORT_DEFAULT(a: unknown, b: unknown): number {
        const [A, B] = [String(a), String(b)];
        return A < B ? -1 : A > B ? 1 : 0;
    }

    /**
     * JavaScriptの`Array#sort()`のデフォルトの挙動と逆順になるように2要素を比較するための比較関数です。
     * 「文字列の辞書順の逆順」(Unicode Code Unit 降順) で比較します。
     */
    static COMPARE_SORT_REVERSE(a: unknown, b: unknown): number {
        const [A, B] = [String(a), String(b)];
        return A > B ? -1 : A < B ? 1 : 0;
    }

    /**
     * 配列`array`に`target`と等しい値が存在するかどうかを、二分探索を用いて判定します。
     *
     * 時間計算量: O(log N) (Nは配列の要素数)
     *
     * @example
     * ```ts
     * const arr = [1, 3, 5, 7, 9];
     * console.log(BinarySearch.binary_search(arr, 5, BinarySearch.COMPARE_NUMBER_ASCENDING)); // true
     * console.log(BinarySearch.binary_search(arr, 4, BinarySearch.COMPARE_NUMBER_ASCENDING)); // false
     * ```
     *
     * @param array - ソート済み配列
     * @param target - 探索対象の値
     * @param compareFn - 比較関数
     * @return `target`と等しい値が存在すれば`true`、そうでなければ`false`
     */
    static binary_search<T>(
        array: readonly T[],
        target: T,
        compareFn: (a: T, b: T) => number,
    ): boolean {
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
     * console.log(BinarySearch.lower_bound(arr, 4, BinarySearch.COMPARE_NUMBER_ASCENDING)); // 2
     * console.log(BinarySearch.lower_bound(arr, 10, BinarySearch.COMPARE_NUMBER_ASCENDING)); // 5
     * ```
     *
     * @param array - ソート済み配列
     * @param target - 探索対象の値
     * @param compareFn - 比較関数
     * @return `target`以上と判定される最初の要素のインデックス または`array.length`
     */
    static lower_bound<T>(
        array: readonly T[],
        target: T,
        compareFn: (a: T, b: T) => number,
    ): number {
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
     * console.log(BinarySearch.upper_bound(arr, 2, BinarySearch.COMPARE_NUMBER_ASCENDING)); // 1
     * console.log(BinarySearch.upper_bound(arr, 5, BinarySearch.COMPARE_NUMBER_ASCENDING)); // 3
     * console.log(BinarySearch.upper_bound(arr, 9, BinarySearch.COMPARE_NUMBER_ASCENDING)); // 5
     * ```
     *
     * @param array - ソート済み配列
     * @param target - 探索対象の値
     * @param compareFn - 比較関数
     * @return `target`より大きいと判定される最初の要素のインデックス または`array.length`
     */
    static upper_bound<T>(
        array: readonly T[],
        target: T,
        compareFn: (a: T, b: T) => number,
    ): number {
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
