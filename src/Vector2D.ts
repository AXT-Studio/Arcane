// ================================================================
// Exports
// ================================================================

/**
 * 2次元ベクトルを表すクラスです。平面上の点の座標や方向などを表現するのに使用できます。
 * ベクトル同士の加減算やスカラー倍、内積、外積などを計算することができます。
 * また、3点の位置関係や線分の交差判定を行うためのStatic Methodも提供します。
 *
 * なお、このクラスでは座標を`number`で表現します。
 * 実数座標を扱う場合はこのクラスを使用すべきですが、浮動小数点数の計算誤差や巨大な数における精度の問題が発生することに注意してください。
 * もし整数座標のみを扱う(もしくは適切なスケーリングにより整数座標での計算を可能にできる)場合は、Vector2DIntを使用してください。
 */
export class Vector2DFloat {
    /** ベクトルのx座標 */
    x: number;
    /** ベクトルのy座標 */
    y: number;

    /**
     * 新しいVector2DFloatインスタンスを生成します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v = new Vector2DFloat(1, 2);
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
     * 自身と`other`のベクトル同士の加算を行い、新しいVector2DFloatインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2DFloat(1, 2);
     * const v2 = new Vector2DFloat(3, 4);
     * const sum = v1.add(v2); // Vector2DFloat { x: 4, y: 6 }
     * ```
     *
     * @param other - 加算するもう一方のベクトル
     * @returns 加算結果の新しいVector2DFloatインスタンス
     */
    add(other: Vector2DFloat): Vector2DFloat {
        return new Vector2DFloat(this.x + other.x, this.y + other.y);
    }

    /**
     * 自身から`other`を減算したベクトルを計算し、新しいVector2DFloatインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2DFloat(3, 4);
     * const v2 = new Vector2DFloat(1, 2);
     * const diff = v1.sub(v2); // Vector2DFloat { x: 2, y: 2 }
     * ```
     *
     * @param other - 減算するもう一方のベクトル
     * @returns 減算結果の新しいVector2DFloatインスタンス
     */
    sub(other: Vector2DFloat): Vector2DFloat {
        return new Vector2DFloat(this.x - other.x, this.y - other.y);
    }

    /**
     * 自身のベクトルの大きさの2乗を計算して返します。
     * 純粋なベクトルの大きさが欲しい場合は、戻り値の平方根を取る必要があります。
     *
     * なお、このメソッドは内部で座標の2乗を計算しています。
     * このため、座標の絶対値が大きい(目安は10^8程度)場合、戻り値が`number`で正確に表せる整数の範囲を超える可能性があることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v = new Vector2DFloat(3, 4);
     * console.log(v.squaredMagnitude()); // 25
     * ```
     *
     * @returns ベクトルの大きさの2乗
     */
    squaredMagnitude(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * 自身のベクトルをスカラー値`scalar`倍したベクトルを計算し、新しいVector2DFloatインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v = new Vector2DFloat(1, 2);
     * const scaled = v.mul(3); // Vector2DFloat { x: 3, y: 6 }
     * ```
     *
     * @param scalar - ベクトルを乗算するスカラー値
     * @returns スカラー倍された新しいVector2DFloatインスタンス
     */
    mul(scalar: number): Vector2DFloat {
        return new Vector2DFloat(this.x * scalar, this.y * scalar);
    }

    /**
     * 自身と`other`のベクトル同士の内積を計算し、スカラー値を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2DFloat(1, 1);
     * const v2 = new Vector2DFloat(2, 3);
     * const dotProduct = v1.dot(v2); // 5
     * ```
     *
     * @param other - 内積を計算するもう一方のベクトル
     * @returns 内積のスカラー値
     */
    dot(other: Vector2DFloat): number {
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
     * const v1 = new Vector2DFloat(1, 1);
     * const v2 = new Vector2DFloat(2, 3);
     * const crossProduct = v1.cross(v2); // 1
     * ```
     *
     * @param other - 「外積」を計算するもう一方のベクトル
     * @returns 「外積」のスカラー値
     */
    cross(other: Vector2DFloat): number {
        return this.x * other.y - this.y * other.x;
    }

    /**
     * 2次元空間における3点`p0`, `p1`, `p2`の位置関係を判定します。
     * 3点が反時計回りに配置されている場合は`1`、時計回りに配置されている場合は`-1`、一直線上にある場合は`0`を返します。
     *
     * なお、数値誤差を考慮して、クロス積の絶対値が`eps`以下の場合は一直線上とみなします。
     * デフォルトでは`eps = 1e-10`を使用しますが、これはオプション引数で変更可能です。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const p0 = new Vector2DFloat(0, 0);
     * const p1 = new Vector2DFloat(1, 1);
     * const p2 = new Vector2DFloat(2, 0);
     * console.log(Vector2DFloat.CCW(p0, p1, p2)); // -1 (時計回り)
     * ```
     *
     * @param p0 - 判定する3点のうちの1点目
     * @param p1 - 判定する3点のうちの2点目
     * @param p2 - 判定する3点のうちの3点目
     * @param eps - 数値誤差の閾値
     * @returns 位置関係を表す整数値 (反時計回り: 1, 時計回り: -1, 一直線上: 0)
     */
    static CCW(p0: Vector2DFloat, p1: Vector2DFloat, p2: Vector2DFloat, eps: number = 1e-10): 0 | 1 | -1 {
        const a = p1.sub(p0);
        const b = p2.sub(p0);
        const crossProduct = a.cross(b);

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
     * const a1 = new Vector2DFloat(0, 0);
     * const a2 = new Vector2DFloat(2, 2);
     * const b1 = new Vector2DFloat(0, 2);
     * const b2 = new Vector2DFloat(2, 0);
     * console.log(Vector2DFloat.areSegmentsIntersecting(a1, a2, b1, b2)); // true
     * ```
     *
     * @param a1 - 線分Aの一方の端点
     * @param a2 - 線分Aのもう一方の端点
     * @param b1 - 線分Bの一方の端点
     * @param b2 - 線分Bのもう一方の端点
     * @param eps - 数値誤差の閾値 (デフォルトは`1e-10`, 内部でCCWを使用しているため)
     * @returns 線分が交差または接している場合は`true`、そうでない場合は`false`
     */
    static areSegmentsIntersecting(
        a1: Vector2DFloat,
        a2: Vector2DFloat,
        b1: Vector2DFloat,
        b2: Vector2DFloat,
        eps: number = 1e-10,
    ): boolean {
        const t1 = Vector2DFloat.CCW(a1, a2, b1, eps);
        const t2 = Vector2DFloat.CCW(a1, a2, b2, eps);
        const t3 = Vector2DFloat.CCW(b1, b2, a1, eps);
        const t4 = Vector2DFloat.CCW(b1, b2, a2, eps);

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

/**
 * 2次元ベクトルを表すクラスです。平面上の点の座標や方向などを表現するのに使用できます。
 * ベクトル同士の加減算やスカラー倍、内積、外積などを計算することができます。
 * また、3点の位置関係や線分の交差判定を行うためのStatic Methodも提供します。
 *
 * なお、このクラスでは座標を`bigint`で表現します。
 * 整数座標のみを扱う(もしくは適切なスケーリングにより整数座標での計算を可能にできる)場合はこのクラスを使用すべきです。
 * 実数座標を扱う必要がある場合はVector2DFloatを使用してください。
 */
export class Vector2DInt {
    /** ベクトルのx座標 */
    x: bigint;
    /** ベクトルのy座標 */
    y: bigint;

    /**
     * 新しいVector2DIntインスタンスを生成します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v = new Vector2DInt(1n, 2n);
     * ```
     *
     * @param x - x座標
     * @param y - y座標
     */
    constructor(x: bigint, y: bigint) {
        this.x = x;
        this.y = y;
    }

    /**
     * 自身と`other`のベクトル同士の加算を行い、新しいVector2DIntインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2DInt(1n, 2n);
     * const v2 = new Vector2DInt(3n, 4n);
     * const sum = v1.add(v2); // Vector2DInt { x: 4n, y: 6n }
     * ```
     *
     * @param other - 加算するもう一方のベクトル
     * @returns 加算結果の新しいVector2DIntインスタンス
     */
    add(other: Vector2DInt): Vector2DInt {
        return new Vector2DInt(this.x + other.x, this.y + other.y);
    }

    /**
     * 自身から`other`を減算したベクトルを計算し、新しいVector2DIntインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2DInt(3n, 4n);
     * const v2 = new Vector2DInt(1n, 2n);
     * const diff = v1.sub(v2); // Vector2DInt { x: 2n, y: 2n }
     * ```
     *
     * @param other - 減算するもう一方のベクトル
     * @returns 減算結果の新しいVector2DIntインスタンス
     */
    sub(other: Vector2DInt): Vector2DInt {
        return new Vector2DInt(this.x - other.x, this.y - other.y);
    }

    /**
     * 自身のベクトルの大きさの2乗を計算して返します。
     * 純粋なベクトルの大きさが欲しい場合は、戻り値の平方根を取る必要があります。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v = new Vector2DInt(3n, 4n);
     * console.log(v.squaredMagnitude()); // 25n
     * ```
     *
     * @returns ベクトルの大きさの2乗
     */
    squaredMagnitude(): bigint {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * 自身のベクトルをスカラー値`scalar`倍したベクトルを計算し、新しいVector2DIntインスタンスを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v = new Vector2DInt(1n, 2n);
     * const scaled = v.mul(3n); // Vector2DInt { x: 3n, y: 6n }
     * ```
     *
     * @param scalar - ベクトルを乗算するスカラー値
     * @returns スカラー倍された新しいVector2DIntインスタンス
     */
    mul(scalar: bigint): Vector2DInt {
        return new Vector2DInt(this.x * scalar, this.y * scalar);
    }

    /**
     * 自身と`other`のベクトル同士の内積を計算し、スカラー値を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const v1 = new Vector2DInt(1n, 1n);
     * const v2 = new Vector2DInt(2n, 3n);
     * const dotProduct = v1.dot(v2); // 5n
     * ```
     *
     * @param other - 内積を計算するもう一方のベクトル
     * @returns 内積のスカラー値
     */
    dot(other: Vector2DInt): bigint {
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
     * const v1 = new Vector2DInt(1n, 1n);
     * const v2 = new Vector2DInt(2n, 3n);
     * const crossProduct = v1.cross(v2); // 1n
     * ```
     *
     * @param other - 「外積」を計算するもう一方のベクトル
     * @returns 「外積」のスカラー値
     */
    cross(other: Vector2DInt): bigint {
        return this.x * other.y - this.y * other.x;
    }

    /**
     * 2次元空間における3点`p0`, `p1`, `p2`の位置関係を判定します。
     * 3点が反時計回りに配置されている場合は`1`、時計回りに配置されている場合は`-1`、一直線上にある場合は`0`を返します。
     * 戻り値がbigint型`0`, `1`, `-1`ではなくnumber型`0`, `1`, `-1`であることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const p0 = new Vector2DInt(0n, 0n);
     * const p1 = new Vector2DInt(1n, 1n);
     * const p2 = new Vector2DInt(2n, 0n);
     * console.log(Vector2DInt.CCW(p0, p1, p2)); // -1 (時計回り)
     * ```
     *
     * @param p0 - 判定する3点のうちの1点目
     * @param p1 - 判定する3点のうちの2点目
     * @param p2 - 判定する3点のうちの3点目
     * @returns 位置関係を表す整数値 (反時計回り: 1, 時計回り: -1, 一直線上: 0)
     */
    static CCW(p0: Vector2DInt, p1: Vector2DInt, p2: Vector2DInt): 0 | 1 | -1 {
        const a = p1.sub(p0);
        const b = p2.sub(p0);
        const crossProduct = a.cross(b);

        if (crossProduct > 0n) return 1;
        if (crossProduct < 0n) return -1;
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
     * const a1 = new Vector2DInt(0n, 0n);
     * const a2 = new Vector2DInt(2n, 2n);
     * const b1 = new Vector2DInt(0n, 2n);
     * const b2 = new Vector2DInt(2n, 0n);
     * console.log(Vector2DInt.areSegmentsIntersecting(a1, a2, b1, b2)); // true
     * ```
     *
     * @param a1 - 線分Aの一方の端点
     * @param a2 - 線分Aのもう一方の端点
     * @param b1 - 線分Bの一方の端点
     * @param b2 - 線分Bのもう一方の端点
     * @returns 線分が交差または接している場合は`true`、そうでない場合は`false`
     */
    static areSegmentsIntersecting(a1: Vector2DInt, a2: Vector2DInt, b1: Vector2DInt, b2: Vector2DInt): boolean {
        const t1 = Vector2DInt.CCW(a1, a2, b1);
        const t2 = Vector2DInt.CCW(a1, a2, b2);
        const t3 = Vector2DInt.CCW(b1, b2, a1);
        const t4 = Vector2DInt.CCW(b1, b2, a2);

        // 一般的なケース：互いの線分をまたいでいる
        if (t1 * t2 < 0 && t3 * t4 < 0) {
            return true;
        }

        // 特殊なケース：3点または4点が一直線上に並ぶ場合の処理
        // a1-a2-b1 が一直線上で、b1が線分a1-a2上にある
        if (t1 === 0 && a1.sub(b1).dot(a2.sub(b1)) <= 0n) return true;
        // a1-a2-b2 が一直線上で、b2が線分a1-a2上にある
        if (t2 === 0 && a1.sub(b2).dot(a2.sub(b2)) <= 0n) return true;
        // b1-b2-a1 が一直線上で、a1が線分b1-b2上にある
        if (t3 === 0 && b1.sub(a1).dot(b2.sub(a1)) <= 0n) return true;
        // b1-b2-a2 が一直線上で、a2が線分b1-b2上にある
        if (t4 === 0 && b1.sub(a2).dot(b2.sub(a2)) <= 0n) return true;

        return false;
    }
}
