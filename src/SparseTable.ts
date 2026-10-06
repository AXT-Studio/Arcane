// ================================================================
// Exports
// ================================================================

/**
 * Sparse Tableです。長さNの静的な配列に対して、O(N log N)の前計算を行うことで、一定条件を満たす区間クエリをO(1)で解答できます。
 *
 * ただし、以下のとおり「冪等な半群」が定義できる必要があります。
 * - `S`: 配列上の要素の型(集合)
 * - `op`: 集合`S`上の二項演算(op: S ･ S → S)
 *     - 任意の`x ∈ S`に対して、`x ･ x = x`を満たす (冪等性)
 *     - 任意の`{a, b, c} ⊂ S`に対して、`(a ･ b) ･ c = a ･ (b ･ c)`を満たす(結合律)
 *
 * @since 1.9.0
 */
export class SparseTable<S> {
    /** Sparse Table本体。#table[k][i] := arrayの[i, i + 2**k)の区間総積 */
    #table: S[][];
    /** floorLog2[i] := i以下で最大の2の冪 (ただしfloorLog2[0]はNaN) */
    #floorLog2: number[];
    /** 二項演算 */
    #op: (a: S, b: S) => S;

    /**
     * 新しいSparseTableインスタンスを作成します。
     * Sparse Tableは現時点の`array`の状態に対して生成されます。そのため、`array`を変更した場合は新しくSparse Tableを作り直す必要があります。
     * (配列自体の編集も処理したい場合は、LazySegmentTreeなどを検討してください。)
     *
     * 時間計算量: 最悪O(N log N) (`op`がO(1)である場合)
     *
     * @param array - 対象となる配列 (`[...array]`によってコピーされます)
     * @param op - `array`の要素に対する二項演算。冪等性(`op(x, x) = x`)と結合律(`op(op(a, b), c) = op(a, op(b, c))`を満たす必要がある)
     */
    constructor(array: readonly S[], op: (a: S, b: S) => S) {
        const n = array.length;
        this.#table = [[...array]];
        // 2倍しながら回すほうが都度2の冪計算するより楽だろ
        for (let width = 2; width <= n; width *= 2) {
            const half = width / 2;
            const prev = this.#table[this.#table.length - 1];
            const row: S[] = [];
            for (let i = 0; i < n - width + 1; i++) {
                // 実は一個前の計算2つを組み合わせればそれだけで済む
                row[i] = op(prev[i], prev[i + half]);
            }
            this.#table.push(row);
        }
        // 追加で払う計算量が時間空間ともにO(N)でペイする価値があるので、i以下で最大の2の冪を1からnまで前計算しておく
        this.#floorLog2 = [NaN, 0];
        for (let i = 2; i <= n; i++) {
            this.#floorLog2[i] = this.#floorLog2[Math.floor(i / 2)] + 1;
        }
        // op保存しておかないといけないよ〜
        this.#op = op;
    }

    /**
     * 配列の区間[l, r)に対して事前に与えた演算`op`を左から順に適用した最終的な値を返します。
     * 空区間・不正な区間・範囲外を含む区間を指定した場合、RangeErrorを返します。
     *
     * 時間計算量: 最悪O(1) (`op`がO(1)である場合)
     *
     * @param l - 区間の左端(l自身を含む)
     * @param r - 区間の右端(r自身を含まない)
     * @returns - `op(op(op(array[l], array[l + 1]), ...), array[r - 1])`
     * @throws {RangeError} 空区間・不正な区間・範囲外を含む区間を指定した場合
     */
    query(l: number, r: number): S {
        if (!Number.isInteger(l) || !Number.isInteger(r) || l < 0 || l >= r || r > this.#table[0].length)
            throw new RangeError("l and r must be integers satisfying 0 <= l < r <= length.");
        const k = this.#floorLog2[r - l];
        const width = 2 ** k;
        return this.#op(this.#table[k][l], this.#table[k][r - width]);
    }
}
