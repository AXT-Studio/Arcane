// ================================================================
// Exports
// ================================================================

/**
 * 2次元ベクトルを表すクラスです。平面上の点の座標や方向を表現するのに使用できます。
 * - ベクトル同士の加算、ベクトル同士の減算、ベクトルの内積、2次元ベクトルの"外積"を計算できます。
 * - 3点の位置関係や線分の交差判定を行うためのStatic Methodも提供します。
 */
export class Vector2D {
    /**
     * ベクトルのx座標
     */
    x: number;
    /**
     * ベクトルのy座標
     */
    y: number;

    /**
     * 新しいVector2Dインスタンスを生成します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2D(1, 2);
     * const v2 = new Vector2D(3, 4);
     * const sum = v1.add(v2); // Vector2D { x: 4, y: 6 }
     * ```
     *
     * @param x - x座標
     * @param y - y座標
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * 自身と`other`のベクトル同士の加算を行い、新しいVector2Dインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2D(1, 2);
     * const v2 = new Vector2D(3, 4);
     * const sum = v1.add(v2); // Vector2D { x: 4, y: 6 }
     * ```
     *
     * @param other - 加算するもう一方のベクトル
     * @returns 加算結果の新しいVector2Dインスタンス
     */
    add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    /**
     * 自身から`other`を減算したベクトルを計算し、新しいVector2Dインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2D(3, 4);
     * const v2 = new Vector2D(1, 2);
     * const diff = v1.sub(v2); // Vector2D { x: 2, y: 2 }
     * ```
     *
     * @param other - 減算するもう一方のベクトル
     * @returns 減算結果の新しいVector2Dインスタンス
     */
    sub(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    /**
     * 自身のベクトルの大きさの2乗を計算して返します。
     * 純粋なベクトルの大きさが欲しい場合は、戻り値の平方根を取る必要があります。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v = new Vector2D(3, 4);
     * console.log(v.squaredMagnitude()); // 25
     * ```
     *
     * @returns ベクトルの大きさの2乗
     */
    squaredMagnitude(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * 自身のベクトルをスカラー値`scalar`倍したベクトルを計算し、新しいVector2Dインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v = new Vector2D(1, 2);
     * const scaled = v.mul(3); // Vector2D { x: 3, y: 6 }
     * ```
     *
     * @param scalar - ベクトルを乗算するスカラー値
     * @returns スカラー倍された新しいVector2Dインスタンス
     */
    mul(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    /**
     * 自身と`other`のベクトル同士の内積を計算し、スカラー値を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2D(1, 1);
     * const v2 = new Vector2D(2, 3);
     * const dotProduct = v1.dot(v2); // 5
     * ```
     *
     * @param other - 内積を計算するもう一方のベクトル
     * @returns 内積のスカラー値
     */
    dot(other: Vector2D): number {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * 自身と`other`について、2次元ベクトルの「外積」に相当するスカラー値を計算して返します。
     * この値は、ベクトルが張る平行四辺形の符号付き面積に相当します。
     * また、ベクトルの回転方向や位置関係を判断するのに使用されます。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2D(1, 1);
     * const v2 = new Vector2D(2, 3);
     * const crossProduct = v1.cross(v2); // 1
     * ```
     *
     * @param other - 「外積」を計算するもう一方のベクトル
     * @returns 「外積」のスカラー値
     */
    cross(other: Vector2D): number {
        return this.x * other.y - this.y * other.x;
    }

    /**
     * 2次元空間における3点`p0`, `p1`, `p2`の位置関係を判定します。
     * 3点が反時計回りに配置されている場合は`1`、時計回りに配置されている場合は`-1`、一直線上にある場合は`0`を返します。
     *
     * なお、数値誤差を考慮して、クロス積の値が十分小さい場合は一直線上とみなします。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const p0 = new Vector2D(0, 0);
     * const p1 = new Vector2D(1, 1);
     * const p2 = new Vector2D(2, 0);
     * console.log(Vector2D.CCW(p0, p1, p2)); // -1 (時計回り)
     * ```
     *
     * @param p0 - 判定する3点のうちの1点目
     * @param p1 - 判定する3点のうちの2点目
     * @param p2 - 判定する3点のうちの3点目
     * @returns 位置関係を表す整数値 (反時計回り: 1, 時計回り: -1, 一直線上: 0)
     */
    static CCW(p0: Vector2D, p1: Vector2D, p2: Vector2D): 0 | 1 | -1 {
        const a = p1.sub(p0);
        const b = p2.sub(p0);
        const crossProduct = a.cross(b);

        const eps = 1e-8;
        if (crossProduct > eps) return 1;
        if (crossProduct < -eps) return -1;
        return 0;
    }

    /**
     * 2次元空間における線分の交差判定を行います。
     * 4点`a1`, `a2`, `b1`, `b2`が与えられたとき、`a1`と`a2`を結ぶ線分と、`b1`と`b2`を結ぶ線分が交差、または接しているかを判定します。
     * 交差している場合(接している場合も含む)は`true`、そうでない場合は`false`を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const a1 = new Vector2D(0, 0);
     * const a2 = new Vector2D(2, 2);
     * const b1 = new Vector2D(0, 2);
     * const b2 = new Vector2D(2, 0);
     * console.log(Vector2D.areSegmentsIntersecting(a1, a2, b1, b2)); // true
     * ```
     *
     * @param a1 - 線分Aの一方の端点
     * @param a2 - 線分Aのもう一方の端点
     * @param b1 - 線分Bの一方の端点
     * @param b2 - 線分Bのもう一方の端点
     * @returns 線分が交差または接している場合は`true`、そうでない場合は`false`
     */
    static areSegmentsIntersecting(
        a1: Vector2D,
        a2: Vector2D,
        b1: Vector2D,
        b2: Vector2D,
    ): boolean {
        const t1 = Vector2D.CCW(a1, a2, b1);
        const t2 = Vector2D.CCW(a1, a2, b2);
        const t3 = Vector2D.CCW(b1, b2, a1);
        const t4 = Vector2D.CCW(b1, b2, a2);

        // 一般的なケース：互いの線分をまたいでいる
        if (t1 * t2 < 0 && t3 * t4 < 0) {
            return true;
        }

        // 特殊なケース：3点または4点が一直線上に並ぶ場合の処理
        // a1-a2-b1 が一直線上で、b1が線分a1-a2上にある
        if (t1 === 0 && a1.sub(b1).dot(a2.sub(b1)) <= 0) return true;
        // a1-a2-b2 が一直線上で、b2が線分a1-a2上にある
        if (t2 === 0 && a1.sub(b2).dot(a2.sub(b2)) <= 0) return true;
        // b1-b2-a1 が一直線上で、a1が線分b1-b2上にある
        if (t3 === 0 && b1.sub(a1).dot(b2.sub(a1)) <= 0) return true;
        // b1-b2-a2 が一直線上で、a2が線分b1-b2上にある
        if (t4 === 0 && b1.sub(a2).dot(b2.sub(a2)) <= 0) return true;

        return false;
    }
}
