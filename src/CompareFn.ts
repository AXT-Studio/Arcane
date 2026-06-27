// ================================================================
// Exports
// ================================================================

/**
 * ECMAScriptのArray#sort()や本ライブラリのBinarySearchで要求される比較関数をまとめたユーティリティクラスです。
 */
export class CompareFn {
    /**
     * 「数値の昇順」で比較するための比較関数です。
     *
     * @example Array#sort()の比較関数として使用する例
     * ```ts
     * const arr = [5, 2, 9, 1, 5];
     * arr.sort(CompareFn.number_asc);
     * console.log(arr); // [1, 2, 5, 5, 9]
     * ```
     *
     * @param a - 比較対象の値1
     * @param b - 比較対象の値2
     * @return `a`が`b`より小さい場合は負の数、等しい場合は0、大きい場合は正の数
     */
    static number_asc(a: number, b: number): number {
        return a - b;
    }

    /**
     * 「数値の降順」で比較するための比較関数です。
     *
     * @example Array#sort()の比較関数として使用する例
     * ```ts
     * const arr = [5, 2, 9, 1, 5];
     * arr.sort(CompareFn.number_desc);
     * console.log(arr); // [9, 5, 5, 2, 1]
     * ```
     *
     * @param a - 比較対象の値1
     * @param b - 比較対象の値2
     * @return `a`が`b`より大きい場合は負の数、等しい場合は0、小さい場合は正の数
     */
    static number_desc(a: number, b: number): number {
        return b - a;
    }

    /**
     * JavaScriptの`Array#sort()`のデフォルトの挙動と同様に2要素を比較するための比較関数です。
     * 「文字列の辞書順」(Unicode Code Unit 昇順) で比較します。
     *
     * @example Array#sort()の比較関数として使用する例
     * ```ts
     * const arr = ["banana", "apple", "cherry"];
     * arr.sort(CompareFn.unicode_forward);
     * console.log(arr); // ["apple", "banana", "cherry"]
     * ```
     *
     * @param a - 比較対象の値1
     * @param b - 比較対象の値2
     * @return `a`が`b`より"小さい"場合は負の数、等しい場合は0、"大きい"場合は正の数
     */
    static unicode_forward(a: unknown, b: unknown): number {
        const [A, B] = [String(a), String(b)];
        return A < B ? -1 : A > B ? 1 : 0;
    }

    /**
     * JavaScriptの`Array#sort()`のデフォルトの挙動と逆順になるように2要素を比較するための比較関数です。
     * 「文字列の辞書順の逆順」(Unicode Code Unit 降順) で比較します。
     *
     * @example Array#sort()の比較関数として使用する例
     * ```ts
     * const arr = ["banana", "apple", "cherry"];
     * arr.sort(CompareFn.unicode_reverse);
     * console.log(arr); // ["cherry", "banana", "apple"]
     * ```
     *
     * @param a - 比較対象の値1
     * @param b - 比較対象の値2
     * @return `a`が`b`より"大きい"場合は負の数、等しい場合は0、"小さい"場合は正の数
     */
    static unicode_reverse(a: unknown, b: unknown): number {
        const [A, B] = [String(a), String(b)];
        return A > B ? -1 : A < B ? 1 : 0;
    }
}
