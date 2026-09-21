// ================================================================
// Imports
// ================================================================

import { DirectedGraph } from "./Graphs";

// ================================================================
// Exports
// ================================================================

/**
 * 2-SATを解くためのクラスです。
 * - 長さ`n`の`x: boolean[]`について考えます
 * - 「`x[a] === f`と`x[b] === g`の少なくとも一方は真(両方真でも良い)」という条件をM個与えます
 *     - つまり、各条件は`[a: number, f: boolean, b: number, g: boolean]`で表されます
 * - このとき、M個の条件すべてを満たすような`x`が作れるかを判定し、また可能な場合はそのような`x`を一つ与えます
 */
export class TwoSAT {
    /** 変数の数 (xの長さ, x[0]〜x[n-1]のn変数について考えることとする) */
    #n: number;
    /** 各変数の状態を頂点、条件を辺とする有向グラフ。"x[i]が偽"を頂点2i、"x[i]が真"を頂点2i+1で表す */
    #graph: DirectedGraph;
    /** 強連結成分分解したあとの各頂点が所属する強連結成分idxのキャッシュ。条件足したときに消すこと！ */
    #scc_idx_cache: number[] | null;

    /**
     * `n`変数の2-SATを解くためのインスタンスを作成します。
     *
     * 時間計算量: O(n)
     *
     * @example
     * ```ts
     * const twoSat = new TwoSAT(2);
     * ```
     *
     * @param n - 割り当て対象となる変数の数
     * @throws {RangeError} - nが正の整数でない場合
     */
    constructor(n: number) {
        if (!Number.isSafeInteger(n) || n < 1) {
            throw new RangeError("`n` must be a positive integer.");
        }
        this.#n = n;
        // 2n頂点の有向グラフを作る
        this.#graph = new DirectedGraph(2 * n);
        this.#scc_idx_cache = null;
    }

    /**
     * 「`x[a] === f`と`x[b] === g`の少なくとも一方は真(両方真でも良い)」という条件を追加します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const twoSat = new TwoSAT(2);
     * twoSat.addClause(0, true, 1, true);
     * twoSat.addClause(0, false, 1, true);
     * ```
     *
     * @param a 「`x[a] === f`と`x[b] === g`の少なくとも一方は真(両方真でも良い)」の「a」。0以上n未満の整数
     * @param f 「`x[a] === f`と`x[b] === g`の少なくとも一方は真(両方真でも良い)」の「f」。trueかfalse
     * @param b 「`x[a] === f`と`x[b] === g`の少なくとも一方は真(両方真でも良い)」の「b」。0以上n未満の整数
     * @param g 「`x[a] === f`と`x[b] === g`の少なくとも一方は真(両方真でも良い)」の「g」。trueかfalse
     * @throws {RangeError} - a, bのいずれかが0未満・n以上・非整数であるとき
     */
    addClause(a: number, f: boolean, b: number, g: boolean): void {
        if (a < 0 || this.#n <= a || !Number.isInteger(a)) {
            throw new RangeError("`a` must be a integer satisfying 0 ≤ a < n.");
        }
        if (b < 0 || this.#n <= b || !Number.isInteger(b)) {
            throw new RangeError("`b` must be a integer satisfying 0 ≤ b < n.");
        }
        // x[a] === !f なら x[b] === g
        this.#graph.addEdge(2 * a + (!f ? 1 : 0), 2 * b + (g ? 1 : 0));
        // x[b] === !g なら x[a] === f
        this.#graph.addEdge(2 * b + (!g ? 1 : 0), 2 * a + (f ? 1 : 0));
        // 強連結成分分解のキャッシュを消す
        this.#scc_idx_cache = null;
    }

    /** @private 強連結成分分解のキャッシュがなければ作る */
    #scc(): void {
        if (this.#scc_idx_cache != null) return;
        // 強連結成分分解をする
        const scc = DirectedGraph.getSCC(this.#graph);
        // 各頂点が所属する強連結成分のidxを抜き出す
        // oxlint-disable-next-line unicorn/no-new-array
        const idx = new Array(2 * this.#n).fill(0);
        scc.forEach((v, i) => {
            for (const u of v) idx[u] = i;
        });
        this.#scc_idx_cache = idx;
    }

    /**
     * これまでに追加された条件をすべて満たすような`x`の割り当て方が存在するかどうかを返します。
     *
     * 時間計算量: O(n + m) (※nは割り当て対象の変数の数、mはこれまでに加えた条件の数)
     *
     * @example 割り当てが存在する例
     * ```ts
     * const twoSat = new TwoSAT(2);
     * twoSat.addClause(0, true, 1, true);
     * twoSat.addClause(0, false, 1, true);
     * twoSat.isSatisfiable(); // => true
     * ```
     *
     * @example 割り当てが存在しない例
     * ```ts
     * const twoSat = new TwoSAT(1);
     * twoSat.addClause(0, true, 0, true);
     * twoSat.addClause(0, false, 0, false);
     * twoSat.isSatisfiable(); // => false
     * ```
     */
    isSatisfiable(): boolean {
        // 強連結成分分解をして各頂点の強連結成分idxを用意する
        this.#scc();
        const idx = this.#scc_idx_cache!;
        // 0<=i<nについて、頂点2iと頂点2i+1が同じ強連結成分にいるならその瞬間にNG
        for (let i = 0; i < this.#n; i++) {
            if (idx[2 * i] === idx[2 * i + 1]) return false;
        }
        return true;
    }

    /**
     * これまでに追加された条件をすべて満たすような`x`の割り当てが存在すればそれを1つ構築します。
     * 先に`isSatisfiable()`で割り当てが存在することを必ず確認する必要があります。それを行わなかった場合、Errorをthrowします。
     * 直前の`isSatisfiable()`の戻り値が`false`であった場合、Errorにはならないものの、このメソッドは無意味な配列を返します。
     *
     * 時間計算量: O(n)
     *
     * @example
     * ```ts
     * const twoSat = new TwoSAT(2);
     * twoSat.addClause(0, true, 1, true);
     * twoSat.addClause(0, false, 1, true);
     * twoSat.isSatisfiable(); // => true
     * console.log(twoSat.getAnswer()); // (長さ2のboolean[]で、先に追加した2条件をともに満たすもの)
     * ```
     *
     * @throws {Error} - 先に現在の条件で割り当てが存在するかを(isSatisfiable()を用いて)確認しなかった場合
     */
    getAnswer(): boolean[] {
        if (this.#scc_idx_cache == null) {
            throw new Error(
                "You need to execute `isSatisfiable()` first to verify that an assignment satisfying the conditions exists.",
            );
        }
        const idx = this.#scc_idx_cache!;
        const ans: boolean[] = [];
        for (let i = 0; i < this.#n; i++) {
            ans[i] = idx[2 * i + 1] > idx[2 * i];
        }
        return ans;
    }
}
