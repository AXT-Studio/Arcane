// ================================================================
// Exports
// ================================================================

/**
 * 2次元グリッド上の座標と1次元のインデックスを相互変換するためのクラスです。
 * 0-indexedと1-indexedの両方に対応するため、コンストラクタ引数`i`でどちらの形式を使用するかを指定します。
 */
export class GridIndex2D {
    /** グリッドの高さ */
    readonly H: number;
    /** グリッドの幅 */
    readonly W: number;
    /** 座標の開始値。(0-indexedか1-indexedかを指定する。) */
    readonly base: 0 | 1;

    /**
     * 新しいGridIndex2Dインスタンスを生成します。
     *
     * 時間計算量: O(1)
     *
     * @example 1-indexedの場合
     * ```ts
     * const gridIndex = new GridIndex2D(5, 3, 1);
     * ```
     * 左上が`(1, 1)`、右下が(5, 3)であるような、5行3列のグリッドについて考えることを宣言します。
     *
     * @param H - グリッドの高さ
     * @param W - グリッドの幅
     * @param I - 端の座標が何であるかを指定する。AtCoderでは専ら左上が`1`なものが多い。
     */
    constructor(H: number, W: number, I: 0 | 1) {
        if (H <= 0 || W <= 0 || !Number.isSafeInteger(H) || !Number.isSafeInteger(W) || !Number.isSafeInteger(H * W)) {
            throw new Error("GridIndex2D: Invalid arguments. H, W, H*W must be a positive safe integer.");
        }
        this.H = H;
        this.W = W;
        this.base = I;
    }

    /**
     * 2次元座標から1次元のインデックスを取得します。
     * 返されるインデックスは0以上HW未満の整数です。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const gridIndex = new GridIndex2D(5, 3, 1);
     * // ここで、各マスの変換後のインデックスは以下のとおりです。
     * //  0  1  2
     * //  3  4  5
     * //  6  7  8
     * //  9 10 11
     * // 12 13 14
     * console.log(gridIndex.indexOf(1, 1)); // 0
     * console.log(gridIndex.indexOf(2, 2)); // 4
     * console.log(gridIndex.indexOf(5, 3)); // 14
     * ```
     *
     * @param r - 行 (上から何行目か)
     * @param c - 列 (左から何列目か)
     * @returns 1次元のインデックス(0以上HW未満の整数)
     */
    indexOf(r: number, c: number): number {
        return (r - this.base) * this.W + (c - this.base);
    }

    /**
     * 1次元のインデックスから2次元座標を取得します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const gridIndex = new GridIndex2D(5, 3, 1);
     * // ここで、各マスの変換後のインデックスは以下のとおりです。
     * //  0  1  2
     * //  3  4  5
     * //  6  7  8
     * //  9 10 11
     * // 12 13 14
     * console.log(gridIndex.positionOf(0)); // [1, 1]
     * console.log(gridIndex.positionOf(4)); // [2, 2]
     * console.log(gridIndex.positionOf(14)); // [5, 3]
     * ```
     */
    positionOf(index: number): [r: number, c: number] {
        return [Math.floor(index / this.W) + this.base, (index % this.W) + this.base];
    }

    /**
     * 指定されたインデックスによって表されるセルに隣接する、グリッド内のセルのインデックスを列挙します。
     * 隣接の条件に、4近傍(上下左右)と8近傍(斜めも含む)のどちらかを指定することができます。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const gridIndex = new GridIndex2D(3, 3, 1);
     * // ここで、各マスの変換後のインデックスは以下のとおりです。
     * // 0 1 2
     * // 3 4 5
     * // 6 7 8
     * console.log(gridIndex.getAdjacentCellIndexes(4, 4)); // [1, 3, 5, 7]
     * console.log(gridIndex.getAdjacentCellIndexes(4, 8)); // [0, 1, 2, 3, 5, 6, 7, 8]
     * console.log(gridIndex.getAdjacentCellIndexes(0, 4)); // [1, 3]
     * console.log(gridIndex.getAdjacentCellIndexes(5, 8)); // [1, 2, 4, 7, 8]
     * ```
     *
     * @param index - 1次元のインデックス
     * @param mode - 方向を指定 (4近傍 or 斜めを含む8近傍)
     */
    getAdjacentCellIndexes(index: number, mode: 4 | 8): number[] {
        const [r, c] = this.positionOf(index);
        const adjacentCells: number[] = [];
        if (mode === 4) {
            const D = [0, 1, 0, -1, 0];
            for (let i = 0; i < 4; i++) {
                const dr = D[i];
                const dc = D[i + 1];
                const nr = r + dr;
                const nc = c + dc;
                if (this.isInGrid(nr, nc)) {
                    adjacentCells.push(this.indexOf(nr, nc));
                }
            }
        } else {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (this.isInGrid(nr, nc)) {
                        adjacentCells.push(this.indexOf(nr, nc));
                    }
                }
            }
        }
        adjacentCells.sort((a, b) => a - b);
        return adjacentCells;
    }

    /**
     * (r, c)がこのグリッド内にあるかどうかを判定します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const gridIndex = new GridIndex2D(5, 3, 1);
     * console.log(gridIndex.isInGrid(1, 1)); // true
     * console.log(gridIndex.isInGrid(5, 3)); // true
     * console.log(gridIndex.isInGrid(0, 0)); // false
     * console.log(gridIndex.isInGrid(6, 4)); // false
     * ```
     *
     * @param r - 行 (上から何行目か)
     * @param c - 列 (左から何列目か)
     * @returns グリッド内にあるかどうか
     */
    isInGrid(r: number, c: number): boolean {
        return this.base <= r && r < this.H + this.base && this.base <= c && c < this.W + this.base;
    }
}
