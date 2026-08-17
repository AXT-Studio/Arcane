// ================================================================
// Exports
// ================================================================

/**
 * 3次ベジェ曲線によるイージングに関する計算を行うためのユーティリティクラスです。
 * - 曲線は4つの実数の組(c1x, c1y, c2x, c2y)によって表されます。
 *     - 「(0, 0), (c1x, c1y), (c2x, c2y), (1, 1)の4点を制御点とする3次ベジェ曲線」を表します。
 * - c1x, c1y, c2x, c2yは、0以上1以下である必要があります。
 *     - CSS cubic-bezier()では制御点のy座標に制限はありませんが、このクラスではy座標にも制限が存在することに注意してください。
 *     - この制限により、このクラスでは「跳ね返り効果をもつイージング」を扱うことができません。
 * - 計算結果について、その許容誤差の目安を指定することができます。
 *     - デフォルトでは10^(-6) (1e-6)となっています。
 *     - 最大でepsの1.5倍程度の誤差が出ます。
 *     - あまりepsを小さくしすぎると無限ループするため注意してください。
 */
export class CubicBezierEasing {
    /**
     * 使用頻度の高いイージングについて、その制御点座標をまとめたオブジェクトです。
     * イージングの名称は概ねpostcss-easingsと同じものがついています。
     *
     * @example
     * ```ts
     * CubicBezierEasing.apply(0.5, CubicBezierEasing.ctrlPts.easeInLinear); // => 0.5
     * ```
     */
    static ctrlPts: Record<
        `ease${"In" | "Out" | "InOut" | "OutIn"}${"Linear" | "Sine" | "Cubic" | "Quad" | "Quart" | "Quint" | "Expo" | "Circ"}`,
        [c1x: number, c1y: number, c2x: number, c2y: number]
    > = {
        // In系
        easeInLinear: [0.0, 0.0, 1.0, 1.0],
        easeInSine: [0.12, 0.0, 0.39, 0.0],
        easeInQuad: [0.11, 0.0, 0.5, 0.0],
        easeInCubic: [0.32, 0.0, 0.67, 0.0],
        easeInQuart: [0.5, 0.0, 0.75, 0.0],
        easeInQuint: [0.64, 0.0, 0.78, 0.0],
        easeInExpo: [0.7, 0.0, 0.84, 0.0],
        easeInCirc: [0.55, 0.0, 1.0, 0.45],
        // Out系
        easeOutLinear: [0.0, 0.0, 1.0, 1.0],
        easeOutSine: [0.61, 1.0, 0.88, 1.0],
        easeOutQuad: [0.5, 1.0, 0.89, 1.0],
        easeOutCubic: [0.33, 1.0, 0.68, 1.0],
        easeOutQuart: [0.25, 1.0, 0.5, 1.0],
        easeOutQuint: [0.22, 1.0, 0.36, 1.0],
        easeOutExpo: [0.16, 1.0, 0.3, 1.0],
        easeOutCirc: [0.0, 0.55, 0.45, 1.0],
        // InOut系
        easeInOutLinear: [0.0, 0.0, 1.0, 1.0],
        easeInOutSine: [0.37, 0.0, 0.63, 1.0],
        easeInOutQuad: [0.45, 0.0, 0.55, 1.0],
        easeInOutCubic: [0.65, 0.0, 0.35, 1.0],
        easeInOutQuart: [0.76, 0.0, 0.24, 1.0],
        easeInOutQuint: [0.83, 0.0, 0.17, 1.0],
        easeInOutExpo: [0.87, 0.0, 0.13, 1.0],
        easeInOutCirc: [0.85, 0.0, 0.15, 1.0],
        // OutIn系
        easeOutInLinear: [0.0, 0.0, 1.0, 1.0],
        easeOutInSine: [0.0, 0.37, 1.0, 0.63],
        easeOutInQuad: [0.0, 0.45, 1.0, 0.55],
        easeOutInCubic: [0.0, 0.65, 1.0, 0.35],
        easeOutInQuart: [0.0, 0.76, 1.0, 0.24],
        easeOutInQuint: [0.0, 0.83, 1.0, 0.17],
        easeOutInExpo: [0.0, 0.87, 1.0, 0.13],
        easeOutInCirc: [0.0, 0.85, 1.0, 0.15],
    };

    /**
     * @private
     * 媒介変数表示t → 座標p
     */
    static #t2p(t: number, c1: number, c2: number): number {
        return 3 * (1 - t) ** 2 * t * c1 + 3 * (1 - t) * t ** 2 * c2 + t ** 3;
    }

    /**
     * @private
     * 座標p → 媒介変数表示t
     */
    static #p2t(p: number, c1: number, c2: number, eps: number): number {
        let low = 0;
        let high = 1;
        while (high - low > eps) {
            const mid = (low + high) / 2;
            if (this.#t2p(mid, c1, c2) < p) low = mid;
            else high = mid;
        }
        return (low + high) / 2;
    }

    /**
     * イージングが適用されていない値 x に指定されたイージングを適用した値 y を求めます。
     * xが0以下である場合は0を、1以上である場合は1を返します。
     *
     * 時間計算量: O(log(1/eps))
     *
     * @example
     * ```ts
     * CubicBezierEasing.apply(0.5, [1 / 3, 0, 2 / 3, 0]); // => 0.125
     * CubicBezierEasing.apply(-1, CubicBezierEasing.ctrlPts.easeInSine); // => 0
     * CubicBezierEasing.apply(2, CubicBezierEasing.ctrlPts.easeInSine); // => 1
     * ```
     *
     * @param x - イージングを適用する前の値
     * @param easing - イージング関数 (制御点の座標で指定)
     * @param eps - 許容誤差の目安 (デフォルト1e-6、小さくしすぎると無限ループするため注意)
     * @returns イージングを適用したあとの値
     */
    static apply(x: number, easing: [c1x: number, c1y: number, c2x: number, c2y: number], eps: number = 1e-6): number {
        const [c1x, c1y, c2x, c2y] = easing;
        const t = this.#p2t(x, c1x, c2x, eps);
        return this.#t2p(t, c1y, c2y);
    }

    /**
     * イージングが適用されている値 y から指定されたイージングの適用を外した値 x を求めます。
     * yが0以下である場合は0を、1以上である場合は1を返します。
     *
     * 時間計算量: O(log(1/eps))
     *
     * @example
     * ```ts
     * CubicBezierEasing.invert(0.125, [1 / 3, 0, 2 / 3, 0]); // => 0.5
     * ```
     *
     * @param y - イージングを適用したあとの値
     * @param easing - イージング関数 (制御点の座標で指定)
     * @param eps - 許容誤差の目安 (デフォルト1e-6、小さくしすぎると無限ループするため注意)
     * @returns イージングを適用する前の値
     */
    static invert(y: number, easing: [c1x: number, c1y: number, c2x: number, c2y: number], eps: number = 1e-6): number {
        const [c1x, c1y, c2x, c2y] = easing;
        const t = this.#p2t(y, c1y, c2y, eps);
        return this.#t2p(t, c1x, c2x);
    }
}
