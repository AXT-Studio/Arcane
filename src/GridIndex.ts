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
 * @since 2.3.0
 */
export class GridIndex<T extends readonly number[]> {
    /** 各次元の長さ (0-indexedなら[0, n)、1-indexedなら[1, n]) */
    #shape: Readonly<T>;
    /** 各次元のオリジン */
    #bases: Readonly<GridIndexBases<T>>;
    /** i番目の軸の座標を1増やしたとき、平坦化添字がいくつ増えるか (便宜上最後にsizeを追加で含む) */
    #strides: [...GridIndexPosition<T>, number];
    /** 次元数 */
    #dimension: number;

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
        this.#dimension = shape.length;
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
        for (let i = 0; i < this.#dimension; i++) {
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
        let rest = index;
        // 余りを取ったものを保存して、整除して……を先頭から繰り返せばいい
        for (let i = 0; i < this.#dimension - 1; i++) {
            const length = this.#shape[i];
            result.push((rest % length) + this.#bases[i]);
            rest = Math.floor(rest / length);
        }
        // 最後だけそのままrest+baseをpushできる
        if (this.#dimension > 0) result.push(rest + this.#bases[this.#dimension - 1]);
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
        for (let i = 0; i < this.#dimension; i++) {
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
        // エラーハンドリングは先にやる
        if (!Number.isInteger(index) || index < 0 || this.size <= index) {
            throw new RangeError("Out of grid");
        }
        if (!Number.isInteger(connectivity) || connectivity < 1 || this.#dimension < connectivity) {
            throw new RangeError("Invalid connectivity");
        }
        // 2次元グリッドの4近傍(1)・8近傍(2)は需要が高いので特別処理を入れておく
        if (this.#dimension === 2) {
            const results: number[] = [];
            // baseに関係なく平坦化添字だけで境界判定しちゃってよくて、そうする
            const width = this.#shape[0];
            const x = index % width;
            const left = x > 0;
            const right = x < width - 1;
            const up = index >= width;
            const down = index < this.size - width;
            // 4近傍は1でも2でも入るので、境界判定だけ見て入れる
            if (left) results.push(index - 1);
            if (right) results.push(index + 1);
            if (up) results.push(index - width);
            if (down) results.push(index + width);
            // connectivityが2のときは8近傍として斜め4方向を加える必要がある
            if (connectivity === 2) {
                if (up) {
                    if (left) results.push(index - width - 1);
                    if (right) results.push(index - width + 1);
                }
                if (down) {
                    if (left) results.push(index + width - 1);
                    if (right) results.push(index + width + 1);
                }
            }
            return results;
        }
        // D次元×2方向=2D個の選択肢から(同方向の選択が無いように)m個選ぶ必要があって、まあそれはDFSが妥当だと思う
        // 次元iの正方向を2i, 負方向を2i+1として、~xを帰りがけの番兵に使うと、添字を差分更新できそう
        const results: number[] = [];
        let currentIndex = index;
        let currentCount = 0;
        const stack: number[] = [];
        // 端にいてその方向への移動を除外する必要があるかを確認しておいて、ついでに1方向目のstack挿入もしちゃう
        const positionOfIndex = this.positionOf(index);
        const isAbleToMove: boolean[] = [];
        for (let i = 0; i < this.#dimension; i++) {
            // 正方向
            if ((isAbleToMove[2 * i] = positionOfIndex[i] < this.#bases[i] + this.#shape[i] - 1)) {
                stack.push(~(2 * i), 2 * i);
            }
            // 負方向
            if ((isAbleToMove[2 * i + 1] = this.#bases[i] < positionOfIndex[i])) {
                stack.push(~(2 * i + 1), 2 * i + 1);
            }
        }
        // DFSぶんまわしタイム
        while (stack.length > 0) {
            const command = stack.pop()!;
            if (command < 0) {
                // (A) 負の値(帰りがけ番兵)の場合、今の添字をresultsに足したあとに添字変数の差分更新を戻す
                // 添字自体は今のcurrentIndexをそのまま入れればOK
                results.push(currentIndex);
                // 何番目の軸か？と方向はcommandから計算できて、それを打ち消すように差分更新する (打ち消す方向を計算)
                const axis = Math.floor(~command / 2);
                const negateDirection = ~command % 2 === 0 ? -1 : 1;
                currentIndex += negateDirection * this.#strides[axis];
                // 足している軸の数も減らす
                currentCount--;
            } else {
                // (B) 非負の値の場合、自身を軸リストに入れて、まだ軸を足せるなら1個足す操作をスタックに予約する
                // 一旦commandを軸と方向に分ける
                const axis = Math.floor(command / 2);
                const direction = command % 2 === 0 ? 1 : -1;
                // 境界判定は先に済ませているので軸追加の差分更新をしていい
                currentIndex += direction * this.#strides[axis];
                currentCount++;
                // 軸を追加した結果まだ軸を足せるなら……
                if (currentCount < connectivity) {
                    // 次の軸を足すために、自身より後ろの軸のうち境界で除外されないものをスタックに予約する
                    for (let next = (axis + 1) * 2; next < 2 * this.#dimension; next++) {
                        if (isAbleToMove[next]) stack.push(~next, next);
                    }
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
