// ================================================================
// Exports
// ================================================================

/**
 * グラフの隣接リスト表現の薄いラッパークラスです。
 * - `raw`プロパティから生データにアクセスし、編集することができます。
 * - グラフの隣接リスト表現に関するいくつかの操作を楽に行うことができます。
 */
export class GraphAdjacencyList {
    /** 生データ (グラフの隣接リスト表現) */
    raw: number[][];

    /**
     * 新しいGraphAdjacencyListインスタンスを生成します。
     * 生成されるインスタンスは、「頂点に`0`から`v_size -1`の番号がついた、`v_size`頂点`0`辺のグラフ」になります。
     *
     * 時間計算量: O(v_size)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * console.log(graph.raw); // [[], [], []]
     * ```
     *
     * @throws v_size(頂点数)が1以上でない場合、RangeErrorをスローします。
     *
     * @param v_size - 頂点数。1以上の整数である必要があります。
     */
    constructor(v_size: number) {
        if (v_size <= 0) {
            throw new RangeError("The number of vertices must be 1 or greater.");
        }
        this.raw = Array.from({ length: v_size }, () => []);
    }

    /**
     * 頂点`u`と頂点`v`を結ぶ無向辺を追加します。
     * なお、自己辺(u == v)を追加した場合、this.raw[u]にはuが2つ追加されることに注意してください。
     *
     * 有向辺を追加する場合は、`addDirectedEdge()`を使用してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * graph.addUndirectedEdge(0, 1);
     * console.log(graph.raw); // [[1], [0], []]
     * ```
     *
     * @param u - 辺の始点番号 (0 <= u < v_size)
     * @param v - 辺の終点番号 (0 <= v < v_size, u == vも可)
     */
    addUndirectedEdge(u: number, v: number): void {
        this.raw[u].push(v);
        this.raw[v].push(u);
    }

    /**
     * 頂点`u`から頂点`v`への有向辺を追加します。
     *
     * 無向辺を追加する場合は、`addUndirectedEdge()`を使用してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * graph.addDirectedEdge(0, 1);
     * console.log(graph.raw); // [[1], [], []]
     * ```
     *
     * @param u - 辺の始点番号 (0 <= u < v_size)
     * @param v - 辺の終点番号 (0 <= v < v_size, u == vも可)
     */
    addDirectedEdge(u: number, v: number): void {
        this.raw[u].push(v);
    }

    /**
     * 頂点`u`の隣接リストを、`compareFn`を使ってソートします。
     *
     * 時間計算量: O(n log n) (nは隣接リストの長さ)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * graph.addDirectedEdge(0, 2);
     * graph.addDirectedEdge(0, 1);
     * console.log(graph.raw); // [[2, 1], [], []]
     * graph.sortNeighbors(0);
     * console.log(graph.raw); // [[1, 2], [], []]
     * ```
     *
     * @param u - 隣接リストのソートを行う頂点の番号
     * @param compareFn - ソート関数。array.sort()のcompareFnと同じ形式で、省略時は数値の昇順。
     */
    sortNeighbors(u: number, compareFn: (a: number, b: number) => number = (a, b) => a - b): void {
        this.raw[u].sort(compareFn);
    }

    /**
     * 頂点`u`に隣接する頂点(頂点`u`から辺で直接つながっている頂点)のリストへの参照を返します。
     * 返り値は配列への参照です。取得後にグラフを変更した場合に値が変わりうることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * graph.addDirectedEdge(0, 2);
     * graph.addDirectedEdge(0, 1);
     * console.log(graph.getNeighbors(0)); // [2, 1]
     * graph.sortNeighbors(0);
     * console.log(graph.getNeighbors(0)); // [1, 2]
     * ```
     *
     * @param u - 隣接頂点のリストを取得する頂点の番号
     * @returns - 頂点`u`に隣接する頂点(頂点`u`から辺で直接つながっている頂点)のリスト
     */
    getNeighbors(u: number): number[] {
        return this.raw[u];
    }

    /**
     * このグラフに含まれる有向辺の数を返します。
     * インスタンスを無向グラフとして扱う場合、辺の数はこのメソッドの返り値の半分であることに注意してください。
     *
     * 時間計算量: O(|V| + |E|) (|V|は頂点の数、|E|は辺の数)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * graph.addUndirectedEdge(0, 1);
     * console.log(graph.getEdgeCount()); // 2
     * ```
     *
     * @returns - このグラフに含まれる有向辺の数
     */
    getEdgeCount(): number {
        let count = 0;
        for (let i = 0; i < this.raw.length; i++) {
            count += this.raw[i].length;
        }
        return count;
    }

    /**
     * 各頂点の入次数をカウントし、リストで返します。
     * 出次数および無向グラフの次数については、`this.raw[i].length`を確認してください。
     *
     * 時間計算量: O(|V| + |E|) (|V|は頂点の数、|E|は辺の数)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * graph.addDirectedEdge(0, 1);
     * console.log(graph.getInDegrees()); // [0, 1, 0]
     * ```
     *
     * @returns - 各頂点の入次数のリスト、戻り値のi番目(0-indexed)の値が頂点iの入次数を表す。
     */
    getInDegrees(): number[] {
        const result = new Array<number>(this.raw.length).fill(0);
        for (let u = 0; u < this.raw.length; u++) {
            this.raw[u].forEach((v) => {
                result[v]++;
            });
        }
        return result;
    }

    /**
     * 現在のグラフのすべての辺を反転したグラフを作成して返します。
     * このメソッドは有向グラフ向けの機能です。無向グラフに対してこのメソッドを使用すると辺が増殖することに注意してください。
     *
     * 時間計算量: O(|V| + |E|) (|V|は頂点の数、|E|は辺の数)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * graph.addDirectedEdge(0, 1);
     * console.log(graph.raw); // [[1], [], []]
     * const reversed = graph.getReversed();
     * console.log(reversed.raw); // [[], [0], []]
     * ```
     *
     * @returns - 現在のグラフのすべての辺を反転したグラフ
     */
    getReversed(): GraphAdjacencyList {
        const reversed = new GraphAdjacencyList(this.vertexCount);
        for (let u = 0; u < this.raw.length; u++) {
            this.raw[u].forEach((v) => {
                reversed.addDirectedEdge(v, u);
            });
        }
        return reversed;
    }

    /**
     * このグラフをコピーして返します。
     *
     * 時間計算量: O(|V| + |E|) (|V|は頂点の数、|E|は辺の数)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * graph.addDirectedEdge(0, 1);
     * console.log(graph.raw); // [[1], [], []]
     * const clone = graph.clone();
     * console.log(clone.raw); // [[1], [], []]
     * ```
     *
     * @returns - 現在のグラフの複製
     */
    clone(): GraphAdjacencyList {
        return GraphAdjacencyList.fromRaw(this.raw.map((adj) => [...adj]));
    }

    /**
     * 隣接リスト自体からこのクラスのインスタンスを作ります。
     * 与えられたrawをそのままthis.rawとして使用するため、元の配列を触るとグラフも変更されることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = GraphAdjacencyList.fromRaw([[1], [], []]);
     * console.log(graph.vertexCount); // 3
     * ```
     *
     * @param raw - グラフの隣接リスト表現。raw[i]は頂点iに隣接する頂点(頂点`i`から辺で直接つながっている頂点)のリスト。0頂点はNG。
     * @throws 頂点数が1以上でない場合、RangeErrorをスローします。
     * @returns rawから作られたGraphAdjacencyListのインスタンス
     */
    static fromRaw(raw: number[][]): GraphAdjacencyList {
        if (raw.length < 1) throw new RangeError("The number of vertices must be 1 or greater.");
        const result = new GraphAdjacencyList(raw.length);
        result.raw = raw;
        return result;
    }

    /**
     * このグラフの頂点数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new GraphAdjacencyList(3);
     * console.log(graph.vertexCount); // 3
     * ```
     *
     * @returns - このグラフの頂点数
     */
    get vertexCount(): number {
        return this.raw.length;
    }
}
