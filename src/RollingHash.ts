const modPow = (a: number, n: number, m: number) => {
    let ans = 1;
    let b = a % m;
    let e = n;
    while (e > 0) {
        if (e % 2 === 1) ans = (ans * b) % m;
        b = (b * b) % m;
        e = Math.floor(e / 2);
    }
    return ans;
};

/**
 * 文字列のRolling Hashを計算する計算機を(インスタンスとして)提供するクラスです。
 * 文字列に対する直接のRolling Hashの計算の他、差分更新(左右の1文字追加・削除)の結果を計算することもできます。
 * 2整数の組(m, h)が必要で、(m, h)の選び方によってはハッシュの衝突耐性が大きく下がります。
 * また、多数の文字列を比較する場合は単独では衝突耐性が不十分であるため、そのような用途では異なる(m, h)の組を用意して2つ比較すべきです。
 */
export class RollingHash {
    /** 1文字あたりに乗算する値 */
    #m: number;
    /** mの逆元 */
    #m_inv: number;
    /** mod */
    #h: number;
    /** pow[i] = m^i mod h */
    #pow: number[] = [1];

    /**
     * Rolling Hashの計算を行うためのインスタンスを作成します。
     * `65535 < m < h <= 94906266`を満たす、整数`m`と素数`h`の組を指定する必要があります。
     * ただし、constructor内でそれらのチェックは行われず、条件を満たさない値を指定した場合エラーなくハッシュが意味を成さなくなる点に留意してください。
     * (`h`の上限が`94906266`なのは、実装が`(h - 1) ** 2 + (h - 1) <= Number.MAX_SAFE_INTEGER`を前提としているためです)
     * 指定しなかった場合、デフォルトでは`m = 1000003, h = 94906249`が使用されます。
     * 2系統目が必要で選定を行いたくない場合は`m = 999983, h = 94906247`を使用することをおすすめします。
     *
     * 時間計算量: 最悪 O(log h)
     *
     * @example
     * ```ts
     * const rh1 = new RollingHash();
     * const rh2 = new RollingHash(999983, 94906247);
     * console.log(rh1.hashOf("abcde")); // (0以上94906249未満の値がログ出力される)
     * console.log(rh2.hashOf("abcde")); // (0以上94906247未満の値がログ出力される)
     * ```
     *
     * @param m - 65536以上h未満の整数
     * @param h - m+1以上94906266以下の素数
     */
    constructor(m: number = 1000003, h: number = 94906249) {
        this.#m = m;
        this.#m_inv = modPow(m, h - 2, h);
        this.#h = h;
    }

    /** #m^n mod #h を返す（必要に応じてキャッシュを伸ばす） */
    #power(n: number): number {
        for (let i = this.#pow.length; i <= n; i++) {
            this.#pow[i] = (this.#pow[i - 1] * this.#m) % this.#h;
        }
        return this.#pow[n];
    }

    /**
     * 文字列のハッシュ値を計算します。
     * なお、空文字列のハッシュ値は(m, h)にかかわらず`0`です。
     *
     * 時間計算量: 最悪 O(|s|) (※|s|はsの長さ)
     *
     * @example
     * ```ts
     * const rh = new RollingHash();
     * console.log(rh.hashOf("abcde")); // (0以上94906249未満の値がログ出力される)
     * ```
     *
     * @param s - ハッシュ値を得たい文字列
     * @returns - ハッシュ値
     */
    hashOf(s: string): number {
        let ans = 0;
        for (let i = 0; i < s.length; i++) {
            ans = (ans * this.#m + s.charCodeAt(i)) % this.#h;
        }
        return ans;
    }

    /**
     * すでにハッシュ値がわかっている文字列の末尾に指定の1文字を連結した文字列のハッシュを計算します。
     *
     * 時間計算量: 最悪 O(1)
     *
     * @example
     * ```ts
     * const rh = new RollingHash();
     * const abc = rh.hashOf("abc");
     * const abcd = rh.pushToTail(abc, "d");
     * console.log(abcd === rh.hashOf("abcd")); // => true
     * ```
     *
     * @param hash - 足す前の文字列のハッシュ
     * @param char - 末尾に足す文字(先頭の文字以外は無視されます)
     * @returns ハッシュがhashである文字列の末尾にcharを連結した文字列のハッシュ
     */
    pushToTail(hash: number, char: string): number {
        return (hash * this.#m + char.charCodeAt(0)) % this.#h;
    }

    /**
     * すでにハッシュ値がわかっている文字列の先頭に指定の1文字を連結した文字列のハッシュを計算します。
     *
     * 時間計算量: 償却 O(1)、最悪 O(currentLength)
     *
     * @example
     * ```ts
     * const rh = new RollingHash();
     * const bcd = rh.hashOf("bcd");
     * const abcd = rh.pushToHead("a", bcd, 3);
     * console.log(abcd === rh.hashOf("abcd")); // => true
     * ```
     *
     * @param char - 先頭に足す文字(先頭の文字以外は無視されます)
     * @param hash - 足す前の文字列のハッシュ
     * @param currentLength - 足す前の文字列の長さ (サロゲートペアは2文字カウント。str.lengthを与えればよいです。)
     * @returns ハッシュがhashである文字列の先頭にcharを連結した文字列のハッシュ
     */
    pushToHead(char: string, hash: number, currentLength: number): number {
        return (hash + char.charCodeAt(0) * this.#power(currentLength)) % this.#h;
    }

    /**
     * すでにハッシュ値がわかっている文字列の末尾1文字を削除した文字列のハッシュを計算します。
     *
     * 時間計算量: 最悪 O(1)
     *
     * @example
     * ```ts
     * const rh = new RollingHash();
     * const abcd = rh.hashOf("abcd");
     * const abc = rh.popFromTail(abcd, "d");
     * console.log(abc === rh.hashOf("abc")); // => true
     * ```
     *
     * @param hash - 消す前の文字列のハッシュ
     * @param char - 消す末尾の文字(先頭の文字以外は無視されます)
     * @returns - ハッシュがhashである文字列の末尾がcharであるとして、それを削除した文字列のハッシュ
     */
    popFromTail(hash: number, char: string): number {
        const t = (((hash - char.charCodeAt(0)) % this.#h) + this.#h) % this.#h;
        return (t * this.#m_inv) % this.#h;
    }

    /**
     * すでにハッシュ値がわかっている文字列の先頭1文字を削除した文字列のハッシュを計算します。
     *
     * 時間計算量: 償却 O(1)、最悪 O(currentLength)
     *
     * @example
     * ```ts
     * const rh = new RollingHash();
     * const abcd = rh.hashOf("abcd");
     * const bcd = rh.popFromHead("a", abcd, 4);
     * console.log(bcd === rh.hashOf("bcd")); // => true
     * ```
     *
     * @param char - 消す先頭の文字(先頭の文字以外は無視されます)
     * @param hash - 消す前の文字列のハッシュ
     * @param currentLength - 消す前の文字列の長さ (サロゲートペアは2文字カウント。str.lengthを与えればよいです。)
     * @returns - ハッシュがhashである文字列の先頭がcharであるとして、それを削除した文字列のハッシュ
     */
    popFromHead(char: string, hash: number, currentLength: number): number {
        return (((hash - this.#power(currentLength - 1) * char.charCodeAt(0)) % this.#h) + this.#h) % this.#h;
    }

    /**
     * ハッシュがわかっている2つの文字列を連結した文字列のハッシュを計算します。
     *
     * 時間計算量: 償却 O(1)、最悪 O(lenB)
     *
     * @example
     * ```ts
     * const rh = new RollingHash();
     * const abc = rh.hashOf("abc");
     * const def = rh.hashOf("def");
     * const abcdef = rh.concat(abc, def, 3);
     * console.log(abcdef === rh.hashOf("abcdef")); // => true
     * ```
     *
     * @param hashA - 連結する2つの文字列のうち先頭側の方のハッシュ
     * @param hashB - 連結する2つの文字列のうち末尾側の方のハッシュ
     * @param lenB - 連結する2つの文字列のうち末尾側の方の文字数 (サロゲートペアは2文字カウント。str.lengthを与えればよいです。)
     * @returns - 2つの文字列を連結した文字列のハッシュ
     */
    concat(hashA: number, hashB: number, lenB: number): number {
        return (hashA * this.#power(lenB) + hashB) % this.#h;
    }
}
