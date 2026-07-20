// ================================================================
// Exports
// ================================================================

/**
 * 数学的な関数のうち、JavaScript標準の`Math`にないものを提供するユーティリティクラスです。
 * - 最大公約数(gcd), 最小公倍数(lcm)
 * - 約数の列挙
 * - 整数平方根
 * - 冪乗の余剰計算
 * - ミラー・ラビン素数判定法
 */
export class ExtendedMath {
    /**
     * 2つの整数の最大公約数を求めます。
     * なお、gcd(0, 0) = 0、gcd(a, 0) = gcd(0, a) = |a| とします。
     *
     * 時間計算量: 最悪 O(log(min(|a|, |b|)))
     *
     * @example number型の場合
     * ```ts
     * ExtendedMath.gcd(48, 18) // => 6
     * ```
     *
     * @example bigint型の場合
     * ```ts
     * ExtendedMath.gcd(48n, 18n) // => 6n
     * ```
     *
     * @typeParam T - 引数と返り値の型。numberまたはbigint。
     * @param a - 1つ目の整数。
     * @param b - 2つ目の整数。
     * @returns aとbの最大公約数。引数と同じ型で返されます。
     */
    static gcd<T extends number | bigint>(a: T, b: T): T {
        while (b) {
            [a, b] = [b, (a % b) as T];
        }
        return a < 0 ? (-a as T) : a;
    }

    /**
     * 2つの整数の最小公倍数を求めます。
     * なお、lcm(0, 0) = 0、lcm(a, 0) = lcm(0, a) = 0 とします。
     *
     * 時間計算量: 最悪 O(log(min(|a|, |b|))) （gcdの計算に依存）
     *
     * @example number型の場合
     * ```ts
     * ExtendedMath.lcm(12, 18) // => 36
     * ```
     *
     * @example bigint型の場合
     * ```ts
     * ExtendedMath.lcm(12n, 18n) // => 36n
     * ```
     *
     * @typeParam T - 引数と返り値の型。numberまたはbigint。
     * @param a - 1つ目の整数。
     * @param b - 2つ目の整数。
     * @returns aとbの最小公倍数。引数と同じ型で返されます。
     */
    static lcm<T extends number | bigint>(a: T, b: T): T {
        if (a === 0 || b === 0 || a === 0n || b === 0n) {
            return (typeof a === "bigint" ? 0n : 0) as T;
        }
        return ((a * b) / ExtendedMath.gcd(a, b)) as T;
    }

    /**
     * 非負整数a, bについて、ax + by = g を満たす整数x, yを求めます。
     * なお、ここで g = gcd(a, b) とし、a = b = 0 のときは g = 0 とします。
     *
     * 時間計算量: O(log(min(a, b)))
     *
     * @example
     * ```ts
     * const [g, x, y] = ExtendedMath.extendedGCD(30n, 21n);
     * console.log(g); // => 3n
     * console.log(x); // => 1n
     * console.log(y); // => -1n
     * // 確認: 30*1 + 21*(-1) === 3
     * console.log(30n * x + 21n * y === g); // => true
     * ```
     *
     * @param a - 非負整数a
     * @param b - 非負整数b
     * @returns [g, x, y] - gはaとbの最大公約数、xとyはax + by = gを満たす整数
     */
    static extendedGCD(a: bigint, b: bigint): [bigint, bigint, bigint] {
        let r0 = a;
        let r1 = b;
        let x0 = 1n;
        let x1 = 0n;
        let y0 = 0n;
        let y1 = 1n;

        while (r1 !== 0n) {
            const q = r0 / r1;
            const temp = r1;
            r1 = r0 % r1;
            r0 = temp;

            const tempX = x0;
            x0 = x1;
            x1 = tempX - q * x1;

            const tempY = y0;
            y0 = y1;
            y1 = tempY - q * y1;
        }

        return [r0, x0, y0];
    }

    /**
     * 整数`n`の正の約数を列挙します。
     * ただし、`n === 1`なら`[1]`、`n < 1`なら`[]`を返します。
     *
     * 時間計算量: O(√n)
     *
     * @example
     * ```ts
     * ExtendedMath.getDivisors(28) // => [1, 2, 4, 7, 14, 28]
     * ExtendedMath.getDivisors(1) // => [1]
     * ExtendedMath.getDivisors(0) // => []
     * ExtendedMath.getDivisors(-5) // => []
     * ```
     *
     * @param n - 対象の整数
     * @returns 正の約数を昇順で列挙した配列
     */
    static getDivisors(n: number): number[] {
        if (n < 1) return [];
        if (n === 1) return [1];
        /** @type {number[]} */
        const smallDivisors: number[] = [];
        /** @type {number[]} */
        const largeDivisors: number[] = [];
        const limit = Math.sqrt(n);
        // 1から√nまでの整数で割り切れるかを調べ、割り切れたらiをsmallDivisors、n/iをlargeDivisorsに追加する
        for (let i = 1; i <= limit; i++) {
            if (n % i === 0) {
                smallDivisors.push(i);
                if (i !== n / i) {
                    largeDivisors.push(n / i);
                }
            }
        }
        // smallDivisorsにlargeDivisorsの逆順を追加して返す。
        largeDivisors.reverse();
        smallDivisors.push(...largeDivisors);
        return smallDivisors;
    }

    /**
     * 整数`n`の整数平方根を求めます。すなわち、`x ** 2 <= n < (x + 1) ** 2`を満たす唯一の整数`x`を返します。
     *
     * 時間計算量: nが2^104未満の場合はO(1)、それ以上の場合はO(M(log_2(n)))
     * ここで M(k) はkビット整数の乗算の時間計算量で、これは実行エンジンに依存します。一般に M(k) は O(k^(log_2(3))) もしくは O(k log k log log k) となります。
     *
     * @example
     * ```ts
     * ExtendedMath.isqrt(10n) // => 3n
     * ExtendedMath.isqrt(15n) // => 3n
     * ExtendedMath.isqrt(16n) // => 4n
     * ```
     *
     * @param n - 対象の整数 (n >= 0)
     * @returns nの整数平方根
     * @throws {RangeError} nが負の数の場合
     */
    static isqrt(n: bigint): bigint {
        // nが負の数の場合はエラー
        if (n < 0n) {
            throw new RangeError("n must be non-negative");
        }
        // f64 で扱える範囲ならば、Math.sqrt + 1段階の補正を利用する
        // n <= 2^104 では floor(sqrt) が高々 +1 しかずれないことが示されている
        if (n < 20282409603651670423947251286016n /* 2n ** 104n */) {
            let s = BigInt(Math.floor(Math.sqrt(Number(n))));
            if (s * s > n) s--;
            return s;
        }
        // 漸化式の初期値
        // 効率的なビット長の近似計算: 16進数文字列長 * 4
        const bitLength = BigInt(n.toString(16).length * 4);
        let x0 = 1n << ((bitLength + 1n) / 2n);
        let x1 = (x0 + n / x0) / 2n; // 漸化式で次のステップの値を計算

        // x1 が x0 より小さい間 = まだ収束していない間
        while (x1 < x0) {
            x0 = x1; // 値を更新
            x1 = (x0 + n / x0) / 2n; // 再度、次のステップの値を計算
        }

        // ループを抜けた時点の x0 が求める答え
        return x0;
    }

    /**
     * 整数`a`, 非負整数`n`, 正整数`m`について、`a`の`n`乗を`m`で割った余り(`(a ** n) % m`)を求めます。
     *
     * 時間計算量: O(log n)
     * (ただし、剰余、余剰演算の時間計算量はO(1)と仮定)
     *
     * @example
     * ```ts
     * BigIntMath.modPow(3n, 200n, 50n) // => 1n
     * ```
     *
     * @param a - 底 (整数)
     * @param n - 指数 (非負整数)
     * @param m - 法 (正整数)
     * @returns aのn乗をmで割った余り
     * @throws {RangeError} nが負の数である場合、またはmが正の整数でない場合
     */
    static modPow(a: bigint, n: bigint, m: bigint): bigint {
        // エラーハンドリング
        if (n < 0n) {
            throw new RangeError("exponent (n) must be non-negative integer");
        }
        if (m <= 0n) {
            throw new RangeError("modulus (m) must be a positive integer");
        }
        // m === 1のときは常に0を返す
        if (m === 1n) return 0n;
        // 繰り返し二乗法をやる
        let result = 1n;
        let base = ((a % m) + m) % m;
        let exponent = n;
        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = (((result * base) % m) + m) % m;
            }
            base = (((base * base) % m) + m) % m;
            exponent = exponent / 2n;
        }
        return ((result % m) + m) % m;
    }

    /**
     * `n`が素数であるかを、ミラー・ラビン素数判定法により判定します。
     *
     * > [!IMPORTANT]
     * > このメソッドは確率的アルゴリズムです。
     * > - `false`が返された場合`n`は確実に合成数です。
     * > - `true`が返された場合`n`は素数である可能性がありますが、確実ではありません。
     * >     - ただし、`n < 2^64`の範囲で、かつ`bases`を省略した場合において、`true`が返されたときは`n`は確実に素数です。
     *
     * 時間計算量: O(b * log(n) * M(log_2(n)))
     * ここで、bは`bases`の長さ、M(k)はkビット整数の乗算の時間計算量です。
     * bは`bases`を省略した場合固定で7で、この場合時間計算量はO(log(n) * M(log_2(n)))となります。
     * M(k)は実行エンジンに依存しますが、一般にO(k^(log_2(3)))もしくはO(k log k log log k)となります。
     *
     * @example basesを省略した場合（n < 2^64なら決定的）
     * ```ts
     * ExtendedMath.isProbablyPrime(17n) // => true
     * ExtendedMath.isProbablyPrime(18n) // => false
     * ```
     *
     * @example basesを指定した場合（n < 2^64であっても、basesに不適切な値を入れると誤判定する可能性がある）
     * ```ts
     * ExtendedMath.isProbablyPrime(17n, [2n]) // => true
     * ExtendedMath.isProbablyPrime(25326001n, [2n, 3n, 5n]) // => true (※25326001は、bases={2,3,5}に対して通過する最小の合成数(Strong pseudoprime)として知られています)
     * ```
     *
     * @param n - 判定する整数 (2以上)
     * @param [bases] - 判定に使用する基数の配列 (省略時は2^64未満で決定的になるよう選定)
     * @returns  - 素数でなければfalse、素数かもしれなければtrue (bases省略時、n<2^64なら決定的)
     */
    static isProbablyPrime(n: bigint, bases?: bigint[]): boolean {
        // エラーハンドリング
        if (n <= 1n) return false;
        if (n === 2n) return true;
        if (n % 2n === 0n) return false;
        // 基数のリストを先に作っておく
        const BASES = bases ?? [2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n];
        // n - 1 = 2^s * d の形に変形 (dが奇数になるまで2で割る)
        let d = n - 1n;
        let s = 0n;
        while ((d & 1n) === 0n) {
            d >>= 1n;
            s += 1n;
        }
        // 各基数についてテストを行う
        for (const a of BASES) {
            // 底が n と等しい場合は素数
            if (a === n) return true;
            // 底が n の倍数 (a % n === 0) の場合は skip（mod n が 0 になり x=0 となって誤判定するため）
            if (a % n === 0n) continue;
            // (効率化) n が底の倍数なら合成数 (例: n=9, a=3)
            if (n % a === 0n) return false;
            // x = a^d mod n
            let x = ExtendedMath.modPow(a, d, n);
            // x = 1 または x = n - 1 なら「素数っぽい」ので次の底へ
            if (x === 1n || x === n - 1n) continue;
            // xを2乗していき、n - 1 になるかチェック (s-1回繰り返す)
            let isProbablyPrime = false;
            for (let r = 1n; r < s; r++) {
                x = (x * x) % n;
                if (x === n - 1n) {
                    isProbablyPrime = true;
                    break;
                }
            }
            // n - 1 にならなかった場合は合成数
            if (!isProbablyPrime) {
                return false;
            }
        }
        // すべての基数で「素数っぽい」場合は素数かもしれない
        return true;
    }

    /**
     * 符号なし32bit整数`n`における立っているビットの数(popcount)を返します。
     * なお、nが整数でない場合、`0`未満の場合、`2**32`以上の場合の動作は未定義です。
     * (エラーを吐かず、多くの場合で誤った値を返します。この関数を使用する際は入力値が`0`以上`2**32`未満の整数であることを確認してください。)
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * ExtendedMath.popcount32(0b10101010) // => 4
     * ExtendedMath.popcount32(0b11111111) // => 8
     * ```
     *
     * @param n - 対象の整数 (`0`以上`2**32`未満)
     * @returns nにおける立っているビットの数
     */
    static popcount32(n: number): number {
        n = n - ((n >>> 1) & 0x55555555);
        n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
        return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
    }

    /**
     * 1つ以上のbigintを受け取り、そのうち最大のものを返します。
     *
     * 時間計算量: O(n) (nは引数の個数)
     *
     * @example
     * ```ts
     * ExtendedMath.max(1n, 2n, 3n) // => 3n
     * ```
     *
     * @param first - 1つ目のbigint
     * @param rest - 2つ目以降のbigint
     * @returns 最大のbigint
     */
    static maxBigint(first: bigint, ...rest: bigint[]): bigint {
        let max = first;
        for (const value of rest) {
            if (value > max) {
                max = value;
            }
        }
        return max;
    }

    /**
     * 1つ以上のbigintを受け取り、そのうち最小のものを返します。
     *
     * 時間計算量: O(n) (nは引数の個数)
     *
     * @example
     * ```ts
     * ExtendedMath.min(1n, 2n, 3n) // => 1n
     * ```
     * @param first - 1つ目のbigint
     * @param rest - 2つ目以降のbigint
     * @returns 最小のbigint
     */
    static minBigint(first: bigint, ...rest: bigint[]): bigint {
        let min = first;
        for (const value of rest) {
            if (value < min) {
                min = value;
            }
        }
        return min;
    }

    /**
     * bigintを受け取り、その絶対値を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * ExtendedMath.abs(1n) // => 1n
     * ExtendedMath.abs(-7n) // => 7n
     * ```
     * @param n - 対象のbigint
     * @returns nの絶対値
     */
    static absBigint(n: bigint): bigint {
        return n < 0n ? -n : n;
    }

    /**
     * bigintを受け取り、その符号を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * ExtendedMath.sign(1n) // => 1
     * ExtendedMath.sign(-7n) // => -1
     * ```
     * @param n - 対象のbigint
     * @returns nの符号
     */
    static signBigint(n: bigint): 0n | 1n | -1n {
        return n === 0n ? 0n : n < 0n ? -1n : 1n;
    }
}
