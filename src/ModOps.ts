// ================================================================
// Imports
// ================================================================

import { ExtendedMath } from "./ExtendedMath";

// ================================================================
// Exports
// ================================================================

/**
 * 指定された法の中で整数の演算を行うための演算器クラスです。
 * - 加算、減算、乗算、累乗、逆元、除算などの演算を提供します。
 * - 内部でbigintを使用しているため、大きな整数の演算も正確に行うことができます。
 */
export class ModOps {
    /** 演算の法 */
    #mod: bigint;

    /**
     * 新しいModOpsインスタンス(演算器)を生成します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod7 = new ModOps(7n);
     * ```
     *
     * @throws {Error} - `mod`が正の整数でない(0以下の)場合
     *
     * @param mod - 演算の法 (1以上の整数)
     */
    constructor(mod: bigint) {
        if (mod <= 0n) {
            throw new Error("mod must be a positive integer");
        }
        this.#mod = mod;
    }
    /**
     * 引数`value`を、このModOpsの法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod5 = new ModOps(5n);
     * console.log(mod5.normalize(12n)); // => 2n
     * console.log(mod5.normalize(-3n)); // => 2n
     * ```
     *
     * @param value - 余りを計算するためのbigint
     * @returns valueをこのModOpsの法で割った余り
     */
    normalize(value: bigint): bigint {
        const r = value % this.#mod;
        return r < 0n ? r + this.#mod : r;
    }

    /**
     * a + bを、このModOpsの法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod10 = new ModOps(10n);
     * console.log(mod10.add(7n, 8n)); // => 5n
     * console.log(mod10.add(-3n, 4n)); // => 1n
     * ```
     *
     * @param a - 加算されるbigint
     * @param b - 加算されるbigint
     * @returns a + bをこのModOpsの法で割った余り
     */
    add(a: bigint, b: bigint): bigint {
        return this.normalize(a + b);
    }

    /**
     * 引数として与えられたbigintの総和を、このModOpsの法で割った余りを返します。
     *
     * 時間計算量: O(n) (nは引数の数)
     *
     * @example
     * ```ts
     * const mod100 = new ModOps(100n);
     * console.log(mod100.sum(10n, 20n, 30n)); // => 60n
     * console.log(mod100.sum(-50n, 25n, 75n)); // => 50n
     * ```
     *
     * @param values - 足し合わせるbigint (可変長引数)
     * @returns valuesの総和をこのModOpsの法で割った余り
     */
    sum(...values: bigint[]): bigint {
        let total = 0n;
        for (const value of values) {
            total = this.add(total, value);
        }
        return total;
    }

    /**
     * a - bを、このModOpsの法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod10 = new ModOps(10n);
     * console.log(mod10.sub(7n, 8n)); // => 9n
     * console.log(mod10.sub(-3n, 4n)); // => 3n
     * ```
     *
     * @param a - 減算するbigint
     * @param b - 減算されるbigint
     * @returns a - bをこのModOpsの法で割った余り
     */
    sub(a: bigint, b: bigint): bigint {
        return this.normalize(a - b);
    }

    /**
     * a * bを、このModOpsの法で割った余りを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const mod10 = new ModOps(10n);
     * console.log(mod10.mul(7n, 8n)); // => 6n
     * console.log(mod10.mul(-3n, 4n)); // => 8n
     * ```
     *
     * @param a - 乗算されるbigint
     * @param b - 乗算されるbigint
     * @returns a * bをこのModOpsの法で割った余り
     */
    mul(a: bigint, b: bigint): bigint {
        return this.normalize(a * b);
    }

    /**
     * 引数として与えられたbigintの総積を、このModOpsの法で割った余りを返します。
     *
     * 時間計算量: O(n) (nは引数の数)
     *
     * @example
     * ```ts
     * const mod12 = new ModOps(12n);
     * console.log(mod12.prod(2n, 3n, 4n)); // => 0n
     * console.log(mod12.prod(-1n, 5n)); // => 7n
     * ```
     *
     * @param values - 掛け合わせるbigint (可変長引数)
     * @returns valuesの総積をこのModOpsの法で割った余り
     */
    prod(...values: bigint[]): bigint {
        let total = this.normalize(1n);
        for (const value of values) {
            total = this.mul(total, value);
        }
        return this.normalize(total);
    }

    /**
     * aのb乗を、このModOpsの法で割った余りを返します。
     *
     * 時間計算量: O(log b) (bは指数)
     *
     * @example
     * ```ts
     * const mod7 = new ModOps(7n);
     * console.log(mod7.pow(3n, 4n)); // => 4n (3^4 mod 7 = 81 mod 7 = 4)
     * ```
     *
     * @throws {RangeError} - `b`が負の整数である場合
     *
     * @param a - 累乗されるbigint
     * @param b - 累乗するbigint (非負整数でなければならない)
     * @returns aのb乗をこのModOpsの法で割った余り
     */
    pow(a: bigint, b: bigint): bigint {
        if (b < 0n) {
            throw new RangeError("Exponent b must be a non-negative integer");
        }
        // m === 1 -> 常に0を返す
        if (this.#mod === 1n) return 0n;
        // 繰り返し二乗法
        let result = 1n;
        let base = this.normalize(a);
        let exponent = b;
        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = this.mul(result, base);
            }
            base = this.mul(base, base);
            exponent = exponent / 2n;
        }
        return result;
    }

    /**
     * このModOpsの法におけるaの逆元を返します。
     * なお、法pにおけるaの逆元とは、 av≡1 (mod p) を満たす0以上p未満の唯一の整数vのことです。
     * 1÷a≡v(mod p)と考えることもできます。
     *
     * 時間計算量: O(log m) (mはこのModOpsの法)
     *
     * @example
     * ```ts
     * const mod7 = new ModOps(7n);
     * console.log(mod7.inv(3n)); // => 5n (3 * 5 mod 7 = 15 mod 7 = 1)
     * ```
     *
     * @param a - 逆元を求めるbigint
     * @returns aのこのModOpsの法における逆元
     * @throws Error - aとこのModOpsの法が互いに素でない場合 (つまり、逆元が存在しない場合)
     */
    inv(a: bigint): bigint {
        const value = this.normalize(a);
        const [g, x] = ExtendedMath.extendedGCD(value, this.#mod);
        if (g !== 1n) {
            throw new Error(
                `Inverse does not exist for ${a} modulo ${this.#mod} because gcd(${a}, ${this.#mod}) = ${g} is not 1.`,
            );
        }
        return this.normalize(x);
    }

    /**
     * a / bを、このModOpsの法で割った余りを返します。
     * すなわち、aにbの逆元を掛けた値をこのModOpsの法で割った余りを返します。
     *
     * 時間計算量: O(log m) (mはこのModOpsの法)
     *
     * @example
     * ```ts
     * const mod7 = new ModOps(7n);
     * console.log(mod7.div(3n, 2n)); // => 5n (mod7における2の逆元は4nなので、3 * 4 mod 7 = 12 mod 7 = 5)
     * ```
     *
     * @param a - 除算されるbigint
     * @param b - 除算するbigint (逆元が存在することが前提)
     * @returns a / bをこのModOpsの法で割った余り
     * @throws Error - bの逆元が存在しない場合 (つまり、bとこのModOpsの法が互いに素でない場合)
     */
    div(a: bigint, b: bigint): bigint {
        return this.mul(a, this.inv(b));
    }
}
