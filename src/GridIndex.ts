// ================================================================
// Types
// ================================================================

/** readonlyと数値リテラル限定を外す */
type GridIndexPosition<T extends readonly number[]> = {
    -readonly [K in keyof T]: number;
};
/** readonly外して0 or 1にする */
type GridIndexBases<T extends readonly number[]> = {
    -readonly [K in keyof T]: 0 | 1;
};

// ================================================================
// Exports
// ================================================================

/**
 * 主に多次元配列を扱うための、添字の平坦化・復元を行うためのユーティリティとなるクラスです。
 *
 * @since 2.2.0
 */
export class GridIndex<T extends readonly number[]> {
    /** 各次元の長さ (0-indexedなら[0, n)、1-indexedなら[1, n]) */
    #shape: Readonly<T>;
    /** 各次元のオリジン */
    #bases: Readonly<GridIndexBases<T>>;
    /** i番目の軸の座標を1増やしたとき、平坦化添字がいくつ増えるか (便宜上最後にsizeを追加で含む) */
    #strides: [...GridIndexPosition<T>, number];

    /**
     * 新しいGridIndexインスタンスを生成します。
     *
     * 時間計算量: O(d) (※dは次元数)
     *
     * @example 2次元, 1-indexedの場合
     * ```ts
     * const grid = new GridIndex([4, 2], [1, 1]);
     * ```
     *
     * @example 3次元, 0-indexedの場合
     * ```ts
     * const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
     * ```
     *
     * @param shape - 各次元の長さ(列数)を指定する配列。各要素は1以上の安全な整数で、総積も安全な整数
     * @param bases - 各次元の先頭が何かを指定する配列。shapeと同じ長さの配列で、各要素は0か1
     * @throws {RangeError} - 各次元の長さが安全な整数でないか、管理するマスの数が安全な整数の範囲に収まらない場合
     */
    constructor(shape: T, bases: GridIndexBases<T>) {
        // shapeとbasesはそのまま入れればOK
        this.#shape = [...shape];
        this.#bases = [...bases];
        // stridesは前から構築する (前にある方を小さい側にエンコードする方針)
        const strides: number[] = [1];
        for (let i = 0; i < shape.length; i++) {
            if (!Number.isSafeInteger(shape[i]) || shape[i] <= 0) {
                throw new RangeError(`shape[${i}] must be a positive safe integer.`);
            }
            strides.push(strides[strides.length - 1] * shape[i]);
        }
        if (!Number.isSafeInteger(strides[strides.length - 1])) {
            throw new RangeError("The number of cells in the grid is too large. It must be a safe integer.");
        }
        this.#strides = strides as [...GridIndexPosition<T>, number];
    }

    /** @private indexのi番目の次元の座標 */
    #coordinateOf(index: number, i: number): number {
        return Math.floor((index % this.#strides[i + 1]) / this.#strides[i]) + this.#bases[i];
    }

    /**
     * 各次元の座標から、平坦化後の添字を取得します。
     * 返される添字は、0以上shapeの総積未満の整数です。
     *
     * 時間計算量: O(d) (※dは次元数)
     *
     * @example
     * ```ts
     * const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
     * console.log(grid.indexOf(1, 2, 3)); // 321
     * ```
     *
     * @param coords - 各次元の座標。i番目(0-indexed)の引数はbases[i]以上shape[i]+bases[i]未満の整数 (そうでない場合の動作は未定義)
     * @returns - 1次元に平坦化された添字 (0以上shapeの総積未満の整数)
     */
    indexOf(...coords: GridIndexPosition<T>): number {
        let index = 0;
        for (let i = 0; i < this.#shape.length; i++) {
            index += (coords[i] - this.#bases[i]) * this.#strides[i];
        }
        return index;
    }

    /**
     * 平坦化された添字から、各次元の座標を取得します。
     *
     * 時間計算量: O(d) (※dは次元数)
     *
     * @example
     * ```ts
     * const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
     * console.log(grid.positionOf(321)); // [1, 2, 3]
     * ```
     *
     * @param index - 平坦化された添字 (0以上shapeの総積未満の整数を期待、そうでない場合の動作は未定義)
     * @returns - 各次元の座標
     */
    positionOf(index: number): GridIndexPosition<T> {
        const result: number[] = [];
        for (let i = 0; i < this.#shape.length; i++) {
            result[i] = this.#coordinateOf(index, i);
        }
        return result as GridIndexPosition<T>;
    }

    /**
     * 指定された座標が、このグリッドの範囲内にあるかどうかを判定します。
     *
     * 時間計算量: O(d) (※dは次元数)
     *
     * @example
     * ```ts
     * const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
     * console.log(grid.includes(0, 0, 0)); // true
     * console.log(grid.includes(5, 3, 6)); // true
     * console.log(grid.includes(9, 9, 9)); // true
     * console.log(grid.includes(9, 9, 10)); // false
     * ```
     *
     * @param coords - 各次元の座標。i番目(0-indexed)の引数はbases[i]以上shape[i]+bases[i]未満の整数 (そうでない場合の動作は未定義)
     * @returns - 指定された座標がグリッドの範囲内ならtrue、そうでなければfalse
     */
    includes(...coords: GridIndexPosition<T>): boolean {
        for (let i = 0; i < this.#shape.length; i++) {
            if (coords[i] < this.#bases[i] || this.#bases[i] + this.#shape[i] <= coords[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * インスタンス作成時に指定した各次元の長さを配列で返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
     * console.log(grid.shape); // [10, 10, 10]
     * ```
     */
    get shape(): Readonly<T> {
        return this.#shape;
    }

    /**
     * 指定された(平坦化後の)添字によって表されるマスに隣接する、グリッド内のマスの(平坦化後の)添字を列挙します。
     * 隣接の判定条件として、最大で何次元を動いてよいかを指定することができます。
     *
     * 時間計算量: O(c × Σ_{m=1..c} (2^m × dCm)) (※dは次元数、cはconnectivity)
     * とくに全方向を列挙する場合(c=d)はO(d × 3^d)。
     *
     * @example
     * ```ts
     * const grid = new GridIndex([3, 3], [0, 0]);
     * // 2次元グリッドで4近傍を得たい場合、connectivityには1を指定します
     * console.log(grid.getAdjacentCellIndexes(4, 1)); // [1, 3, 5, 7] (※順不同)
     * // 2次元グリッドで8近傍を得たい場合、connectivityには2を指定します
     * console.log(grid.getAdjacentCellIndexes(4, 2)); // [0, 1, 2, 3, 5, 6, 7, 8] (※順不同)
     * // グリッド外となるものは列挙の対象から外れます
     * console.log(grid.getAdjacentCellIndexes(0, 1)); // [1, 3] (※順不同)
     * console.log(grid.getAdjacentCellIndexes(5, 2)); // [1, 2, 4, 7, 8] (※順不同)
     * ```
     *
     * @param index - 基準とするマスの(平坦化後の)添字
     * @param connectivity - 最大で何次元動いてよいか。1以上このグリッドの次元数以下の整数。
     * @returns - indexに隣接するマスの添字の一覧。(順番はとくに保証なし)
     * @throws {RangeError} - connectivityが1以上このグリッドの次元数以下でないか、indexがこのグリッドの範囲外である場合
     */
    getAdjacentCellIndexes(index: number, connectivity: number): number[] {
        const D = this.#shape.length;
        // エラーハンドリングは先にやる
        if (!Number.isInteger(index) || index < 0 || this.size <= index) throw new RangeError("Out of grid");
        if (!Number.isInteger(connectivity) || connectivity < 1 || D < connectivity)
            throw new RangeError("Invalid connectivity");
        // 選ぶ本数mを先に決めて、D本からm本選ぶ方法をDFSで列挙してプラマイを試す
        const results: number[] = [];
        const positionOfIndex = this.positionOf(index);
        for (let m = 1; m <= connectivity; m++) {
            // D次元×2方向=2D個の選択肢から(同方向の選択が無いように)m個選ぶ必要があって、まあそれはDFSが妥当だと思う
            // 次元iの正方向をi、負方向を~iとして、番兵使いながら頑張るのが一番手っ取り早そう。帰りがけのpop処理はDを目印に
            const axis: number[] = [];
            const stack: number[] = [];
            for (let i = 0; i < D; i++) stack.push(D, ~i, D, i);
            while (stack.length > 0) {
                const current = stack.pop()!;
                if (current === D) {
                    axis.pop()!;
                    continue;
                }
                // 選択した軸リストaxisに入れる……のだが、それが境界外となる場合は中止する必要があるのでその判定を先にする
                const currentAxis = current < 0 ? ~current : current;
                const direction = current < 0 ? -1 : 1;
                const adjacentCoordinate = positionOfIndex[currentAxis] + direction;
                if (
                    adjacentCoordinate < this.#bases[currentAxis] ||
                    this.#bases[currentAxis] + this.#shape[currentAxis] <= adjacentCoordinate
                ) {
                    // グリッド外にはずれてしまう場合はaxisに入れるのを中止するし、番兵も消す必要がある
                    stack.pop();
                    continue;
                }
                // その軸・方向を選んでもグリッド外にならないことがわかったら軸リストに入れてOK
                axis.push(current);
                if (axis.length === m) {
                    // 一旦基準マスのindexで初期化して、指定された次元のstrides通りずらせばいい
                    let adjacentIndex = index;
                    for (const a of axis) {
                        if (a < 0) {
                            adjacentIndex -= this.#strides[~a];
                        } else {
                            adjacentIndex += this.#strides[a];
                        }
                    }
                    results.push(adjacentIndex);
                } else {
                    // これより後ろから選ばせる
                    for (let i = currentAxis + 1; i < D; i++) stack.push(D, ~i, D, i);
                }
            }
        }
        return results;
    }

    /**
     * このインスタンスが扱うグリッドが持つマスの数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
     * console.log(grid.size); // 1000
     * ```
     */
    get size(): number {
        return this.#strides[this.#strides.length - 1];
    }
}
