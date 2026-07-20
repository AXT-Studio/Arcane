// ================================================================
// Exports
// ================================================================

/**
 * 素集合データ構造 (Disjoint Set Union: DSU) です。
 * 要素0から要素N-1までのN個の要素を管理し、2要素が所属する素集合の結合や同一判定などを高速に行うことができます。
 * 要素にデータを持たせたい場合は、このクラスの外部で`Map<number, T>`などを用いて管理することができます。
 */
export class DisjointSet {
    /** #parents[i]は要素iの親のインデックス */
    #parents: number[];
    /** #size[i]は要素iの属する木のサイズ (※根の要素でのみ有効) */
    #size: number[];
    /** 現在の連結成分の数 */
    #components: number;

    /**
     * 要素`0`から要素`size - 1`までの`size`個の要素を持つ素集合データ構造を作成・初期化します。
     *
     * 時間計算量: 要素数`size`に対してO(size)
     *
     * @example
     * ```ts
     * const ds = new DisjointSet(5); // 0, 1, 2, 3, 4の5要素を持つ素集合データ構造を作成
     * console.log(ds.componentCount); // 5 (初期状態では全ての要素が別々の集合に属しているため、連結成分の数は5)
     * ```
     *
     * @throws {Error} - `size`が正の整数でない(0以下、もしくは非整数の)場合
     *
     * @param size - 要素の数
     */
    constructor(size: number) {
        if (!Number.isInteger(size) || size <= 0) {
            throw new Error("DisjointSet: size must be a positive integer.");
        }
        this.#parents = [...Array(size).keys()];
        this.#size = Array(size).fill(1);
        this.#components = size;
    }

    /**
     * 要素`x`が属する集合の代表元(根)である要素のインデックスを返します。
     *
     * 時間計算量: 要素数をNとして、償却O(α(N))
     * ここで、α(N)はアッカーマン関数の逆関数で、N <= 10^80に対してα(N) <= 4であることが知られています。
     *
     * @example
     * ```ts
     * const ds = new DisjointSet(5);
     * console.log(ds.find(0)); // 0 (初期状態では全ての要素が別々の集合に属しているため、要素0の代表元は0)
     * console.log(ds.find(1)); // 1 (初期状態では全ての要素が別々の集合に属しているため、要素1の代表元は1)
     * ds.union(0, 1);
     * console.log(ds.find(0) === ds.find(1)); // true (要素0と要素1を結合したため、要素0と要素1は代表元が同じになる)
     * ```
     *
     * 要素`x`の属する木の根を返す
     * @param x - 要素 (0以上size-1以下の整数)
     * @returns - 代表元(根)である要素 (0以上size-1以下の整数)
     */
    find(x: number): number {
        if (this.#parents[x] === x) {
            return x;
        }
        // 親を再帰的に探索し、その過程で親を根に直接つなぎ変える（経路圧縮）
        const root = this.find(this.#parents[x]);
        this.#parents[x] = root;
        return root;
    }

    /**
     * 要素`x`が属する集合と要素`y`が属する集合を結合します。
     * すでに同じ集合に属している場合は何もせず、`false`を返します。
     * 異なる集合に属している場合は結合を行い、`true`を返します。
     *
     * 時間計算量: 要素数をNとして、償却O(α(N))
     * ここで、α(N)はアッカーマン関数の逆関数で、N <= 10^80に対してα(N) <= 4であることが知られています。
     *
     * @example
     * ```ts
     * const ds = new DisjointSet(5);
     * console.log(ds.union(0, 1)); // true (要素0と要素1は異なる集合に属しているため、結合が行われる)
     * console.log(ds.union(0, 1)); // false (要素0と要素1はすでに同じ集合に属しているため、結合は行われない)
     * ```
     *
     * @param x - 要素 (0以上size-1以下の整数)
     * @param y - 要素 (0以上size-1以下の整数)
     * @returns - 結合が行われた場合はtrue、すでに同じ集合に属していた場合はfalse
     */
    union(x: number, y: number): boolean {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX === rootY) {
            return false;
        } else {
            // サイズが小さい木を大きい木にくっつける
            if (this.#size[rootX] < this.#size[rootY]) {
                this.#parents[rootX] = rootY;
                this.#size[rootY] += this.#size[rootX];
            } else {
                this.#parents[rootY] = rootX;
                this.#size[rootX] += this.#size[rootY];
            }
            // 連結成分の数を1減らす
            this.#components--;
            return true;
        }
    }

    /**
     * 要素`x`と要素`y`が同じ集合に属しているかを判定します。
     *
     * 時間計算量: 要素数をNとして、償却O(α(N))
     * ここで、α(N)はアッカーマン関数の逆関数で、N <= 10^80に対してα(N) <= 4であることが知られています。
     *
     * @example
     * ```ts
     * const ds = new DisjointSet(5);
     * console.log(ds.connected(0, 1)); // false (初期状態では全ての要素が別々の集合に属しているため、要素0と要素1は同じ集合に属していない)
     * ds.union(0, 1);
     * console.log(ds.connected(0, 1)); // true (要素0と要素1を結合したため、要素0と要素1は同じ集合に属している)
     * ```
     *
     * @param x - 要素 (0以上size-1以下の整数)
     * @param y - 要素 (0以上size-1以下の整数)
     * @returns - 同じ集合に属している場合はtrue、そうでない場合はfalse
     */
    connected(x: number, y: number): boolean {
        return this.find(x) === this.find(y);
    }

    /**
     * 要素`x`が属する集合のサイズを返します。
     *
     * 時間計算量: 要素数をNとして、償却O(α(N))
     * ここで、α(N)はアッカーマン関数の逆関数で、N <= 10^80に対してα(N) <= 4であることが知られています。
     *
     * @example
     * ```ts
     * const ds = new DisjointSet(5);
     * console.log(ds.getGroupSize(0)); // 1 (初期状態では全ての要素が別々の集合に属しているため、要素0の集合のサイズは1)
     * ds.union(0, 1);
     * console.log(ds.getGroupSize(0)); // 2 (要素0と要素1を結合したため、要素0の集合のサイズは2)
     * ```
     *
     * @param x - 要素 (0以上size-1以下の整数)
     * @returns - 要素xが属する集合のサイズ
     */
    getGroupSize(x: number): number {
        const root = this.find(x);
        return this.#size[root];
    }

    /**
     * 現在の連結成分の数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const ds = new DisjointSet(5);
     * console.log(ds.componentCount); // 5
     * ds.union(0, 1);
     * console.log(ds.componentCount); // 4 (0と1が同じ集合になったため、連結成分の数が1減る)
     * ```
     *
     * @returns - 現在の連結成分の数
     */
    get componentCount(): number {
        return this.#components;
    }
}
