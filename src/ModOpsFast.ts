// ================================================================
// WASM
// ================================================================

// ================================================================
// Exports
// ================================================================

/**
 * 指定された法の中で整数の演算を行うための演算器クラスです。
 * - 加算、減算、乗算、累乗、逆元、除算などの演算を提供します。
 * - 一部の演算をwasmに委任し、高速に動作します。その代わり、扱える値に制約があります。
 *
 * @since 2.1.0
 */
export class ModOpsFast {
    /** 法 */
    #mod: number;

    /**
     * 新しいModOpsFastインスタンス(演算器)を生成します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod7 = new ModOpsFast(7);
     * ```
     *
     * @param mod - 演算の法 (1以上2^31未満の整数)
     * @throws {Error} - `mod`が1以上2^31未満の整数でない場合
     */
    constructor(mod: number) {
        if (mod <= 0 || 2 ** 31 <= mod || !Number.isInteger(mod)) {
            throw new Error("mod must be 1 <= mod < 2^31");
        }
        this.#mod = mod;
    }

    /**
     * 引数`value`を、この演算器の法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod5 = new ModOpsFast(5);
     * console.log(mod5.normalize(12)); // => 2
     * console.log(mod5.normalize(-3)); // => 2
     * ```
     *
     * @param value - 余りを計算するためのnumber
     * @returns valueをこの演算器の法で割った余り
     */
    normalize(value: number): number {
        if (0 <= value && value < this.#mod) return value;
        const r = value % this.#mod;
        return r < 0 ? r + this.#mod : r;
    }

    /**
     * a + bを、この演算器の法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod10 = new ModOpsFast(10);
     * console.log(mod10.add(7, 8)); // => 5
     * console.log(mod10.add(-3, 4)); // => 1
     * ```
     *
     * @param a - 加算されるnumber
     * @param b - 加算されるnumber
     * @returns a + bをこの演算器の法で割った余り
     */
    add(a: number, b: number): number {
        const x = this.normalize(a);
        const y = this.normalize(b);
        const sum = x + y;
        return sum >= this.#mod ? sum - this.#mod : sum;
    }

    /**
     * 引数として与えられたnumberの総和を、この演算器の法で割った余りを返します。
     *
     * 時間計算量: O(n) (nは引数の数)
     *
     * @example
     * ```ts
     * const mod100 = new ModOpsFast(100);
     * console.log(mod100.sum(10, 20, 30)); // => 60
     * console.log(mod100.sum(-50, 25, 75)); // => 50
     * ```
     *
     * @param values - 足し合わせるnumber (可変長引数)
     * @returns valuesの総和をこの演算器の法で割った余り
     */
    sum(...values: number[]): number {
        let total = 0;
        for (const value of values) {
            total = this.add(total, value);
        }
        return total;
    }

    /**
     * a - bを、この演算器の法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod10 = new ModOpsFast(10);
     * console.log(mod10.sub(7, 8)); // => 9
     * console.log(mod10.sub(-3, 4)); // => 3
     * ```
     *
     * @param a - 減算するnumber
     * @param b - 減算されるnumber
     * @returns a - bをこの演算器の法で割った余り
     */
    sub(a: number, b: number): number {
        const x = this.normalize(a);
        const y = this.normalize(b);
        const diff = x - y;
        return diff < 0 ? diff + this.#mod : diff;
    }

    /**
     * a * bを、この演算器の法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod10 = new ModOpsFast(10);
     * console.log(mod10.mul(7, 8)); // => 6
     * console.log(mod10.mul(-3, 4)); // => 8
     * ```
     *
     * @param a - 乗算されるnumber
     * @param b - 乗算されるnumber
     * @returns a * bをこの演算器の法で割った余り
     */
    mul(a: number, b: number): number {
        return ModOpsFast.#wasm.mul(this.normalize(a), this.normalize(b), this.#mod);
    }

    /**
     * a * b + c * dを、この演算器の法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod10 = new ModOpsFast(10);
     *  console.log(mod10.mulAdd(1, 2, 3, 4)); // => 4
     *  console.log(mod10.mulAdd(2, 3, 1, 4)); // => 0
     *  console.log(mod10.mulAdd(-1, 1, 2, -3)); // => 3
     * ```
     *
     * @param a - 演算`a * b + c * d`のうち、`a`をnumberで
     * @param b - 演算`a * b + c * d`のうち、`b`をnumberで
     * @param c - 演算`a * b + c * d`のうち、`c`をnumberで
     * @param d - 演算`a * b + c * d`のうち、`d`をnumberで
     * @returns a * b + c * dをこの演算器の法で割った余り
     */
    mulAdd(a: number, b: number, c: number, d: number): number {
        return ModOpsFast.#wasm.mulAdd(
            this.normalize(a),
            this.normalize(b),
            this.normalize(c),
            this.normalize(d),
            this.#mod,
        );
    }

    /**
     * 引数として与えられたnumberの総積を、この演算器の法で割った余りを返します。
     *
     * 時間計算量: O(n) (nは引数の数)
     *
     * @example
     * ```ts
     * const mod12 = new ModOpsFast(12);
     * console.log(mod12.prod(2, 3, 4)); // => 0
     * console.log(mod12.prod(-1, 5)); // => 7
     * ```
     *
     * @param values - 掛け合わせるnumber (可変長引数)
     * @returns valuesの総積をこの演算器の法で割った余り
     */
    prod(...values: number[]): number {
        let total = this.normalize(1);
        for (const value of values) {
            total = this.mul(total, value);
        }
        return total;
    }

    /**
     * aのb乗を、この演算器の法で割った余りを返します。
     *
     * 時間計算量: O(log b) (bは指数)
     *
     * @example
     * ```ts
     * const mod7 = new ModOpsFast(7);
     * console.log(mod7.pow(3, 4)); // => 4 (3^4 mod 7 = 81 mod 7 = 4)
     * ```
     *
     * @param a - 累乗されるnumber
     * @param b - 累乗するnumber (0以上2^32未満の整数)
     * @returns aのb乗をこの演算器の法で割った余り
     * @throws {RangeError} - `b`が0以上2^32未満の整数でない場合
     */
    pow(a: number, b: number): number {
        if (b < 0 || 2 ** 32 <= b || !Number.isSafeInteger(b)) {
            throw new RangeError("The exponent `b` must be an integer between 0 and 2^32-1");
        }
        return ModOpsFast.#wasm.pow(this.normalize(a), b, this.#mod);
    }

    /**
     * この演算器の法におけるaの逆元を返します。
     * なお、法pにおけるaの逆元とは、 av≡1 (mod p) を満たす0以上p未満の唯一の整数vのことです。
     * 1÷a≡v(mod p)と考えることもできます。
     *
     * 時間計算量: O(log m) (mはこの演算器の法)
     *
     * @example
     * ```ts
     * const mod7 = new ModOpsFast(7);
     * console.log(mod7.inv(3)); // => 5 (3 * 5 mod 7 = 15 mod 7 = 1)
     * ```
     *
     * @param a - 逆元を求めるnumber
     * @returns aのこの演算器の法における逆元
     * @throws Error - aとこの演算器の法が互いに素でない場合 (つまり、逆元が存在しない場合)
     */
    inv(a: number): number {
        const result = ModOpsFast.#wasm.inv(this.normalize(a), this.#mod);
        if (result === -1) {
            throw new Error(`Inverse does not exist for ${a} (mod ${this.#mod}) because gcd is not 1.`);
        }
        return result;
    }

    /**
     * a / bを、この演算器の法で割った余りを返します。
     * すなわち、aにbの逆元を掛けた値をこの演算器の法で割った余りを返します。
     * なお、この演算器の法においてbの逆元が存在する(、すなわち、演算器の法とbは互いに素である)ことを前提とします。
     *
     * 時間計算量: O(log m) (mはこの演算器の法)
     *
     * @example
     * ```ts
     * const mod7 = new ModOpsFast(7);
     * console.log(mod7.div(3, 2)); // => 5 (mod7における2の逆元は4なので、3 * 4 mod 7 = 12 mod 7 = 5)
     * ```
     *
     * @param a - 除算されるnumber
     * @param b - 除算するnumber
     * @returns a / bをこの演算器の法で割った余り
     * @throws {Error} - 逆元が存在しない場合 (演算器の法とbが互いに素でない場合)
     */
    div(a: number, b: number): number {
        const result = ModOpsFast.#wasm.div(this.normalize(a), this.normalize(b), this.#mod);
        if (result === -1) {
            throw new Error("Modular inverse does not exist");
        }
        return result;
    }

    /**
     * ModOpsFastが内部で使用するwasmモジュールをBase64エンコードしたものです。
     * もととなった.watファイルはAXT Arcane(`https://github.com/AXT-Studio/Arcane`)のリポジトリ等から確認してください。
     */
    static #base64 =
        "AGFzbQEAAAABFwNgA39/fwF/YAV/f39/fwF/YAJ/fwF/AwYFAAEAAgAHIgUDbXVsAAAGbXVsQWRkAAEDcG93AAIDaW52AAMDZGl2AAQK8wEFDgAgAK0gAa1+IAKtgqcLFgAgAK0gAa1+IAKtIAOtfnwgBK2CpwtFAQN/IAAhAyABIQRBASACcCEFAkADQCAERQ0BIARBAXEEQCAFIAMgAhAAIQULIAMgAyACEAAhAyAEQQF2IQQMAAsLIAULZQEGfiAArSECIAGtIQNCASEEAkADQCADUA0BIAIgA38hBiADIAIgA4EhAyECIAUgBCAGIAV+fSEFIQQMAAsLIAJCAVIEQEF/DwsgBCABrYEhByAHQgBTBEAgByABrXwhBwsgB6cLHwEBfyABIAIQAyEDIANBf0YEQEF/DwsgACADIAIQAAsAkAEEbmFtZQEdBQADbXVsAQZtdWxBZGQCA3BvdwMDaW52BANkaXYCagUAAwABYQEBYgIBcAEFAAFhAQFiAgFjAwFkBAFwAgYAAWEBAWICAXADBGJhc2UEA2V4cAUDcmVzAwgAAWEBAXACAnIwAwJyMQQCeDAFAngxBgFxBwR0ZW1wBAQAAWEBAWICAXADBHRlbXA=";
    static #ui = Uint8Array.from(atob(this.#base64), (c) => c.charCodeAt(0));
    static #instance = new WebAssembly.Instance(new WebAssembly.Module(this.#ui));
    static #wasm = this.#instance.exports as {
        mul: (a: number, b: number, p: number) => number;
        mulAdd: (a: number, b: number, c: number, d: number, p: number) => number;
        pow: (a: number, e: number, p: number) => number;
        inv: (a: number, p: number) => number;
        div: (a: number, b: number, p: number) => number;
    };
}
