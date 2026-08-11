// ================================================================
// Common Types
// ================================================================

/**
 * 重み付きグラフにおける、隣接リストの各要素の型
 */
export type WeightedEdge<W> = { to: number; weight: W };

/**
 * 重みなしグラフのCompressed Sparse Row (CSR)表現を返すときの型
 */
export type CSRGraph = { head: Uint32Array; to: Uint32Array };

/**
 * 重み付きグラフのCompressed Sparse Row (CSR)表現を返すときの型
 */
export type WeightedCSRGraph<W> = { head: Uint32Array; to: Uint32Array; weight: W[] };

// ================================================================
// Composition Parts
// ================================================================

/**
 * 後述のグラフ系4クラスが内部で使用する、グラフの隣接リスト表現の薄いラッパーです。
 */
class AdjacencyCore<E> {
    /** 生データ */
    #raw: E[][];
    /** 頂点数 */
    #vertexCount: number;
    /** 辺の数(隣接リストに入れた要素の総数) */
    #arcCount: number;
    /** 隣接リストの要素から頂点の行き先(頂点番号)を取得する関数 */
    readonly #destOf: (item: E) => number;
    /** 隣接リストの要素の、頂点の行き先(頂点番号)を差し替える関数 (主にreverse用) */
    readonly #reverseItem: (from: number, item: E) => E;

    /**
     * 新しいAdjacencyCoreインスタンスを生成します。
     * 生成されるインスタンスは、はじめ「頂点に`0`から`vertexCount - 1`の番号がついた、`vertexCount`頂点0辺のグラフ」を表します。
     *
     * 時間計算量: O(V) (※Vは頂点数vertexCount)
     *
     * @throws vertexCountが1以上の整数でない場合、RangeErrorとなります。
     * @param vertexCount - グラフの頂点数。1以上の整数である必要があります。
     * @param destOf - 隣接リストの要素を引数に取り、頂点の行き先(頂点番号)を取得する関数です。
     * @param reverseItem - 隣接リストの要素の、頂点の行き先(頂点番号)だけを差し替えたものを返す関数です。
     */
    constructor(vertexCount: number, destOf: (item: E) => number, reverseItem: (from: number, item: E) => E) {
        if (vertexCount < 1 || !Number.isSafeInteger(vertexCount)) {
            throw new RangeError("The number of vertices must be an integer greater than or equal to 1.");
        }
        this.#raw = Array.from({ length: vertexCount }, () => []);
        this.#vertexCount = vertexCount;
        this.#destOf = destOf;
        this.#reverseItem = reverseItem;
        this.#arcCount = 0;
    }

    /**
     * 生の隣接リスト表現(2次元配列)から新しいAdjacencyCoreインスタンスを生成します。
     * 生成されるインスタンスの頂点数は、raw.lengthとなります。
     *
     * 時間計算量: O(V+E) (※Vは頂点数vertexCount)
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点についての情報。
     * @param destOf - 隣接リストの要素を引数に取り、頂点の行き先(頂点番号)を取得する関数です。
     * @param reverseItem - 隣接リストの要素の、頂点の行き先(頂点番号)だけを差し替えたものを返す関数です。
     */
    static fromRaw<E>(
        raw: E[][],
        destOf: (item: E) => number,
        reverseItem: (from: number, item: E) => E,
    ): AdjacencyCore<E> {
        const core = new AdjacencyCore(1, destOf, reverseItem); // <- 頂点数1はダミー
        core.#raw = raw; // <- ここでrawを差し替える
        core.#vertexCount = raw.length;
        let arcCount = 0;
        for (let u = 0; u < raw.length; u++) arcCount += raw[u].length;
        core.#arcCount = arcCount;
        return core;
    }

    /**
     * 頂点`u`から頂点`v`(片方向)に辺を追加します。
     * 必要に応じて、頂点の他に重みなどの追加情報を保持することができます。その場合、`E`を`number`以外にする必要があります。
     * 同じ頂点への辺の追加も許容されます。
     *
     * 時間計算量: O(1)
     *
     * @throws 頂点`u`が`vertexCount`以上(範囲外)である場合、TypeErrorが発生します。
     * @param u - 追加する辺の始点となる頂点の番号 (0 <= u < vertexCount)
     * @param v - 追加する辺の終点となる頂点に関する情報
     */
    addOneWay(u: number, v: E): void {
        this.#raw[u].push(v);
        this.#arcCount++;
    }

    /**
     * 頂点`v`に隣接する頂点の情報を返します。
     *
     * 時間計算量: O(1)
     *
     * @param v - 隣接頂点の情報を取得したい頂点の番号 (0 <= v < vertexCount)
     * @returns - 頂点`v`に隣接する頂点の情報 (隣接リストの要素の配列)
     */
    neighbors(v: number): readonly E[] {
        return this.#raw[v];
    }

    /**
     * 頂点`v`の出次数を返します。
     *
     * 時間計算量: O(1)
     *
     * @param v - 隣接頂点の情報を取得したい頂点の番号 (0 <= v < vertexCount)
     * @returns - 頂点`v`の出次数
     */
    outDegree(v: number): number {
        return this.#raw[v].length;
    }

    /**
     * 各頂点の入次数をカウントし、配列として返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @returns - 入次数を表す配列。配列のi番目は、頂点`i`の入次数を表す。
     */
    inDegrees(): number[] {
        // oxlint-disable-next-line unicorn/no-new-array
        const deg: number[] = new Array(this.#vertexCount).fill(0);
        for (let u = 0; u < this.#vertexCount; u++) {
            for (let i = 0; i < this.#raw[u].length; i++) {
                deg[this.#destOf(this.#raw[u][i])]++;
            }
        }
        return deg;
    }

    /**
     * 全頂点分の隣接リストを、一括でソートします。
     *
     * 時間計算量: O(∑deg log deg) (※degは(各頂点の)出次数で、オーダーは各頂点についてのO(deg log deg)の総和)
     *
     * @param compareFn - 隣接リストに保存されている情報の順番を決めるための比較関数
     */
    sortAll(compareFn: (a: E, b: E) => number): void {
        for (let u = 0; u < this.#vertexCount; u++) {
            this.#raw[u].sort(compareFn);
        }
    }

    /**
     * すべての辺の向きを反転したグラフの隣接表現を作成して返します。
     * 隣接リストの要素はシャローコピーされることに注意してください。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @returns - すべての辺を反転したグラフの隣接リスト表現
     */
    reversed(): AdjacencyCore<E> {
        const revGraph = new AdjacencyCore<E>(this.#vertexCount, this.#destOf, this.#reverseItem);
        for (let u = 0; u < this.#vertexCount; u++) {
            for (const neighbor of this.neighbors(u)) {
                const dest = this.#destOf(neighbor);
                const revItem = this.#reverseItem(u, neighbor);
                revGraph.addOneWay(dest, revItem);
            }
        }
        return revGraph;
    }

    /**
     * 同じグラフを複製したものを返します。
     * 隣接リストの要素はシャローコピーされるため、E型をオブジェクトにする場合の複製には注意してください。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @returns - 複製されたグラフの隣接リスト表現
     */
    clone(): AdjacencyCore<E> {
        const cloned = new AdjacencyCore<E>(this.#vertexCount, this.#destOf, this.#reverseItem);
        for (let u = 0; u < this.#vertexCount; u++) {
            for (const neighbor of this.neighbors(u)) {
                cloned.addOneWay(u, neighbor);
            }
        }
        return cloned;
    }

    /**
     * このグラフの頂点数を返します。
     *
     * 時間計算量: O(1)
     *
     * @returns - このグラフの頂点数
     */
    get vertexCount(): number {
        return this.#vertexCount;
    }

    /**
     * 現在このグラフが持っている(有向)辺の数を返します。
     * 無向グラフでは(自己ループを除き)重複カウントされることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @returns - 現在このグラフが持っている(有向)辺の数
     */
    get arcCount(): number {
        return this.#arcCount;
    }
}

// ================================================================
// Exports
// ================================================================

/**
 * (重みを持たない)有向グラフを表すクラスです。
 */
export class DirectedGraph {
    /** 内部で使用する隣接リスト表現 */
    #core: AdjacencyCore<number>;

    /**
     * 新しいDirectedGraphインスタンスを生成します。
     * 生成されるインスタンスは、はじめ「頂点に`0`から`vertexCount - 1`の番号がついた、`vertexCount`頂点0辺のグラフ」を表します。
     *
     * 時間計算量: O(V) (※Vは頂点の数)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * ```
     *
     * @throws vertexCountが1以上の整数でない場合、RangeErrorとなります。
     * @return vertexCount頂点の有向グラフを表す新しいインスタンス
     */
    constructor(vertexCount: number) {
        if (vertexCount < 1 || !Number.isSafeInteger(vertexCount)) {
            throw new RangeError("The number of vertices must be an integer greater than or equal to 1.");
        }
        this.#core = new AdjacencyCore<number>(
            vertexCount,
            (item) => item,
            (from) => from,
        );
    }

    /**
     * @private
     * AdjacencyCoreからDirectedGraphインスタンスを生成します。
     */
    static #fromCore(core: AdjacencyCore<number>): DirectedGraph {
        const g = new DirectedGraph(1); // <- 1頂点のグラフはダミーなので注意！
        g.#core = core; // <- ここでcoreを差し替えることでダミーを欲しいグラフにする
        return g;
    }

    /**
     * 頂点`from`から頂点`to`への有向辺を1本追加します。
     * 存在しない頂点を指定した場合のエラーチェックは行われません。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * ```
     *
     * @param from - 有向辺の始点とする頂点の番号 (0 <= from < vertexCount)
     * @param to - 有向辺の終点とする頂点の番号 (0 <= to < vertexCount)
     */
    addEdge(from: number, to: number): void {
        this.#core.addOneWay(from, to);
    }

    /**
     * 頂点`v`から出ている辺の行き先をリストで返します。
     * 処理高速化のため、内部配列の参照を返します。戻り値の配列を操作するとグラフの内部表現が破壊されることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(0, 2);
     * graph.addEdge(2, 0);
     * console.log(graph.outEdges(0)) // [1, 2]
     * ```
     *
     * @param v - 行き先(隣接頂点)のリストを取得したい頂点の番号
     * @returns - 頂点`v`から直接つながっている頂点のリスト
     */
    outEdges(v: number): readonly number[] {
        return this.#core.neighbors(v);
    }

    /**
     * 頂点`v`の出次数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(0, 2);
     * graph.addEdge(2, 0);
     * console.log(graph.outDegree(0)); // 2
     * console.log(graph.outDegree(1)); // 0
     * ```
     *
     * @param v - 出次数を取得したい頂点の番号 (0 <= v < vertexCount)
     * @returns - 頂点`v`の出次数
     */
    outDegree(v: number): number {
        return this.#core.outDegree(v);
    }

    /**
     * 各頂点の入次数をカウントし、配列として返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(0, 2);
     * graph.addEdge(2, 0);
     * console.log(graph.inDegrees()); // [1, 1, 1]
     * ```
     *
     * @returns - 入次数を表す配列。配列のi番目は、頂点`i`の入次数を表す。
     */
    inDegrees(): number[] {
        return this.#core.inDegrees();
    }

    /**
     * 内部表現の隣接リストを、一括でソートします。
     * 引数`compareFn`を指定しない場合、行き先の頂点番号の昇順でソートされます。
     *
     * 時間計算量: O(∑deg log deg) (※degは(各頂点の)出次数で、オーダーは各頂点についてのO(deg log deg)の総和)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 2);
     * graph.addEdge(0, 1);
     * graph.addEdge(2, 0);
     * console.log(graph.outEdges(0)); // [2, 1] (or [1, 2])
     * graph.sortNeighbors();
     * console.log(graph.outEdges(0)); // [1, 2]
     * ```
     *
     * @param compareFn - 隣接リストに保存されている情報の順番を決めるための比較関数
     */
    sortNeighbors(compareFn: (a: number, b: number) => number = (a, b) => a - b): void {
        this.#core.sortAll(compareFn);
    }

    /**
     * すべての辺の向きを反転したグラフの隣接表現を作成して返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(0, 2);
     * graph.addEdge(2, 0);
     * const reversed = graph.reversed();
     * console.log(reversed.outEdges(0)); // [2]
     * console.log(reversed.outEdges(1)); // [0]
     * console.log(reversed.outEdges(2)); // [0]
     * ```
     *
     * @returns - すべての辺を反転したグラフの隣接リスト表現
     */
    reversed(): DirectedGraph {
        const reversedCore = this.#core.reversed();
        return DirectedGraph.#fromCore(reversedCore);
    }

    /**
     * 同じグラフを複製したものを返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(0, 2);
     * graph.addEdge(2, 0);
     * console.log(graph.outEdges(0)); // [1, 2]
     * console.log(graph.outEdges(1)); // []
     * console.log(graph.outEdges(2)); // [0]
     * const cloned = graph.clone();
     * console.log(cloned.outEdges(0)); // [1, 2]
     * console.log(cloned.outEdges(1)); // []
     * console.log(cloned.outEdges(2)); // [0]
     * ```
     *
     * @returns - 複製された有向グラフ
     */
    clone(): DirectedGraph {
        const clonedCore = this.#core.clone();
        return DirectedGraph.#fromCore(clonedCore);
    }

    /**
     * 現在のグラフの状態をCompressed Sparse Row (CSR)表現で返します。
     * 例えば、「0→1, 0→2, 2→0」の3辺を持つ3頂点の有向グラフでは、戻り値は以下のようになります。
     * ```ts
     * {
     *     head: [0, 2, 2, 3],
     *     to: [1, 2, 0]
     * }
     * ```
     * つまり、以下のように探索を書く事ができます。
     * ```ts
     * for (let i = head[u]; i < head[u + 1]; i++) {
     *     const v = to[i];
     *     // ...
     * }
     * ```
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(0, 2);
     * graph.addEdge(2, 0);
     * const csr = graph.toCSR();
     * console.log(csr.head); // Uint32Array [0, 2, 2, 3]
     * console.log(csr.to); // Uint32Array [1, 2, 0]
     * ```
     *
     * @returns - CSR表現。長さV+1のheadと長さEのtoを持つオブジェクト。
     */
    toCSR(): CSRGraph {
        const head = new Uint32Array(this.vertexCount + 1);
        const to = new Uint32Array(this.edgeCount);
        let nextToIndex = 0;
        for (let u = 0; u < this.vertexCount; u++) {
            head[u] = nextToIndex;
            for (const v of this.outEdges(u)) {
                to[nextToIndex] = v;
                nextToIndex++;
            }
        }
        head[this.vertexCount] = nextToIndex; // <- this.edgeCountと同じになる
        return {
            head,
            to,
        };
    }

    /**
     * このグラフの隣接リスト表現を返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(0, 2);
     * graph.addEdge(2, 0);
     * const adj = graph.toAdjacencyList();
     * console.log(adj); // [[1, 2], [], [0]]
     * ```
     *
     * @return - このグラフの隣接表現リスト
     */
    toAdjacencyList(): number[][] {
        const list: number[][] = [];
        for (let u = 0; u < this.vertexCount; u++) {
            list[u] = [];
            for (const v of this.outEdges(u)) list[u].push(v);
        }
        return list;
    }

    /**
     * このグラフの頂点数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * console.log(graph.vertexCount); // 3
     * ```
     *
     * @returns - このグラフの頂点数
     */
    get vertexCount(): number {
        return this.#core.vertexCount;
    }

    /**
     * このグラフの辺の数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 2);
     * graph.addEdge(0, 1);
     * console.log(graph.edgeCount); // 2
     * graph.addEdge(2, 0);
     * console.log(graph.edgeCount); // 3
     * ```
     *
     * @returns - このグラフの辺の数
     */
    get edgeCount(): number {
        return this.#core.arcCount;
    }

    /**
     * 生の隣接リスト表現(2次元配列)の情報をもとに、有向グラフを作ります。
     * 配列はシャローコピーされます。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const raw = [[1, 2], [], [0]];
     * const graph = DirectedGraph.from(raw);
     * console.log(graph.outEdges(0)); // [1, 2]
     * console.log(graph.outEdges(1)); // []
     * console.log(graph.outEdges(2)); // [0]
     * ```
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点のリスト。
     * @returns - rawをもとにした有向グラフ
     */
    static from(raw: number[][]): DirectedGraph {
        const core = AdjacencyCore.fromRaw(
            raw.map((adj) => [...adj]),
            (i) => i,
            (f) => f,
        );
        return DirectedGraph.#fromCore(core);
    }

    /**
     * 生の隣接リスト表現(2次元配列)から、直接有向グラフを作ります。
     * 配列は内部でそのまま使用されます。配列を操作するとグラフ表現が破壊されるため注意してください。
     * (シャローコピーが発生しない分定数倍高速です。)
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const raw = [[1, 2], [], [0]];
     * const graph = DirectedGraph.wrap(raw);
     * console.log(graph.outEdges(0)); // [1, 2]
     * console.log(graph.outEdges(1)); // []
     * console.log(graph.outEdges(2)); // [0]
     * ```
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点のリスト。
     * @returns - rawを使用した有向グラフ
     */
    static wrap(raw: number[][]): DirectedGraph {
        const core = AdjacencyCore.fromRaw(
            raw,
            (i) => i,
            (f) => f,
        );
        return DirectedGraph.#fromCore(core);
    }

    /**
     * 強連結成分分解を行います。
     * すなわち、有向グラフの頂点を「お互いに行き来できる⇔同じグループ」を満たすようグループ分けする方法を与えます。
     * 戻り値は「"グループに所属する頂点の配列"の配列」です。
     * グループの列挙順は、グループを1つの頂点とみなしたDAGにおけるトポロジカル順であることが保証されます。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new DirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(1, 0);
     * graph.addEdge(0, 2);
     * const scc = DirectedGraph.getSCC(graph);
     * console.log(scc); // [[0, 1], [2]] (配列の要素の順序は不問)
     * ```
     *
     * @param g - 強連結成分分解を行う対象の有向グラフ
     * @return - 強連結成分分解の結果。"グループに所属する頂点の配列"の配列で、縮約DAGにおけるトポロジカル順を保証。
     */
    static getSCC(g: DirectedGraph): number[][] {
        // 適当な頂点から深さ優先探索して、帰りがけ順を記録
        // ランタイムの都合で再帰関数を回避したいので、~vを番兵とする
        // oxlint-disable-next-line unicorn/no-new-array
        const visited_1 = new Array<boolean>(g.vertexCount).fill(false);
        const postorder: number[] = [];
        for (let start = 0; start < g.vertexCount; start++) {
            if (visited_1[start]) continue;
            const stack = [start];
            while (stack.length > 0) {
                const v = stack.pop()!;
                if (v < 0) {
                    // vが負の場合は番兵なので、復元して帰りがけ順に記録する
                    postorder.push(~v);
                    continue;
                }
                if (visited_1[v]) continue;
                visited_1[v] = true;
                stack.push(~v); // 帰りがけ用の番兵を先に入れておく
                for (const next of g.outEdges(v)) {
                    if (!visited_1[next]) stack.push(next);
                }
            }
        }
        // 有向辺の向きをすべて逆にしたグラフを作る
        const reversed = g.reversed();
        // それに対して、帰りがけ順をpopする形で深さ優先探索
        // oxlint-disable-next-line unicorn/no-new-array
        const visited_2 = new Array<boolean>(g.vertexCount).fill(false);
        const SCCs: number[][] = [];
        for (let i = postorder.length - 1; i >= 0; i--) {
            const start = postorder[i];
            if (visited_2[start]) continue;
            const stack = [start];
            const group: number[] = [start];
            visited_2[start] = true;
            while (stack.length > 0) {
                const v = stack.pop()!;
                for (const next of reversed.outEdges(v)) {
                    if (!visited_2[next]) {
                        visited_2[next] = true;
                        stack.push(next);
                        group.push(next);
                    }
                }
            }
            SCCs.push(group);
        }
        return SCCs;
    }
}

/**
 * (重みを持たない)無向グラフを表すクラスです。
 */
export class UndirectedGraph {
    /** 内部で使用する隣接リスト表現 */
    #core: AdjacencyCore<number>;
    /** 辺の数 (coreのarcCountは自己ループの扱いでずれるため、こちら側で保持) */
    #logicalEdgeCount: number;

    /**
     * 新しいUndirectedGraphインスタンスを生成します。
     * 生成されるインスタンスは、はじめ「頂点に`0`から`vertexCount - 1`の番号がついた、`vertexCount`頂点0辺のグラフ」を表します。
     *
     * 時間計算量: O(V) (※Vは頂点の数)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * ```
     *
     * @throws vertexCountが1以上の整数でない場合、RangeErrorとなります。
     * @return vertexCount頂点の無向グラフを表す新しいインスタンス
     */
    constructor(vertexCount: number) {
        if (vertexCount < 1 || !Number.isSafeInteger(vertexCount)) {
            throw new RangeError("The number of vertices must be an integer greater than or equal to 1.");
        }
        this.#core = new AdjacencyCore<number>(
            vertexCount,
            (item) => item,
            (from) => from,
        );
        this.#logicalEdgeCount = 0;
    }

    /**
     * @private
     * AdjacencyCoreからUndirectedGraphインスタンスを生成します。
     */
    static #fromCore(core: AdjacencyCore<number>, logicalEdgeCount: number): UndirectedGraph {
        const g = new UndirectedGraph(1); // <- 1頂点のグラフはダミーなので注意！
        g.#core = core; // <- ここでcoreを差し替えることでダミーを欲しいグラフにする
        g.#logicalEdgeCount = logicalEdgeCount;
        return g;
    }

    /**
     * 頂点`u`から頂点`v`への無向辺を1本追加します。
     * 存在しない頂点を指定した場合のエラーチェックは行われません。
     * 自己ループ(u === v)も許可されます。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * graph.addEdge(0, 1);
     * ```
     *
     * @param u - 無向辺の一方の頂点の番号 (0 <= u < vertexCount)
     * @param v - 無向辺のもう一方の頂点の番号 (0 <= v < vertexCount)
     */
    addEdge(u: number, v: number): void {
        this.#core.addOneWay(u, v);
        if (u !== v) this.#core.addOneWay(v, u);
        this.#logicalEdgeCount++;
    }

    /**
     * 頂点`v`から出ている辺の行き先をリストで返します。
     * 処理高速化のため、内部配列の参照を返します。戻り値の配列を操作するとグラフの内部表現が破壊されることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(1, 2);
     * console.log(graph.neighbors(1)); // [0, 2]
     * ```
     *
     * @param v - 行き先(隣接頂点)のリストを取得したい頂点の番号
     * @returns - 頂点`v`から直接つながっている頂点のリスト
     */
    neighbors(v: number): readonly number[] {
        return this.#core.neighbors(v);
    }

    /**
     * 頂点`v`の次数を返します。
     * 自己ループは次数を1としてカウントします。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(1, 2);
     * console.log(graph.degree(0)); // 1
     * console.log(graph.degree(1)); // 2
     * ```
     *
     * @param v - 次数を取得したい頂点の番号 (0 <= v < vertexCount)
     * @returns - 頂点`v`の次数
     */
    degree(v: number): number {
        return this.neighbors(v).length;
    }

    /**
     * 内部表現の隣接リストを、一括でソートします。
     *
     * 時間計算量: O(∑deg log deg) (※degは(各頂点の)次数で、オーダーは各頂点についてのO(deg log deg)の総和)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * graph.addEdge(1, 2);
     * graph.addEdge(0, 1);
     * console.log(graph.neighbors(1)); // [2, 0] (or [0, 2])
     * graph.sortNeighbors();
     * console.log(graph.neighbors(1)); // [0, 2]
     * ```
     *
     * @param compareFn - 隣接リストに保存されている情報の順番を決めるための比較関数
     */
    sortNeighbors(compareFn: (a: number, b: number) => number = (a, b) => a - b): void {
        this.#core.sortAll(compareFn);
    }

    /**
     * 同じグラフを複製したものを返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(1, 2);
     * console.log(graph.neighbors(0)); // [1]
     * console.log(graph.neighbors(1)); // [0, 2]
     * console.log(graph.neighbors(2)); // [1]
     * const cloned = graph.clone();
     * console.log(cloned.neighbors(0)); // [1]
     * console.log(cloned.neighbors(1)); // [0, 2]
     * console.log(cloned.neighbors(2)); // [1]
     * ```
     *
     * @returns - 複製された無向グラフ
     */
    clone(): UndirectedGraph {
        const clonedCore = this.#core.clone();
        return UndirectedGraph.#fromCore(clonedCore, this.#logicalEdgeCount);
    }

    /**
     * 現在のグラフの状態をCompressed Sparse Row (CSR)表現で返します。
     * 例えば、「0↔1, 1↔2」の2辺を持つ3頂点の無向グラフでは、戻り値は以下のようになります。
     * ```ts
     * {
     *     head: [0, 1, 3, 4],
     *     to: [1, 0, 2, 1]
     * }
     * ```
     * つまり、以下のように探索を書く事ができます。
     * ```ts
     * for (let i = head[u]; i < head[u + 1]; i++) {
     *     const v = to[i];
     *     // ...
     * }
     * ```
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(1, 2);
     * const csr = graph.toCSR();
     * console.log(csr.head); // Uint32Array [0, 1, 3, 4]
     * console.log(csr.to); // Uint32Array [1, 0, 2, 1]
     * ```
     *
     * @returns - CSR表現。長さV+1のheadと長さ2E-自己ループ数のtoを持つオブジェクト。
     */
    toCSR(): CSRGraph {
        const head = new Uint32Array(this.vertexCount + 1);
        const to = new Uint32Array(this.#core.arcCount);
        let nextToIndex = 0;
        for (let u = 0; u < this.vertexCount; u++) {
            head[u] = nextToIndex;
            for (const v of this.neighbors(u)) {
                to[nextToIndex] = v;
                nextToIndex++;
            }
        }
        head[this.vertexCount] = nextToIndex;
        return {
            head,
            to,
        };
    }

    /**
     * このグラフの隣接リスト表現を返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * graph.addEdge(0, 1);
     * graph.addEdge(1, 2);
     * const adj = graph.toAdjacencyList();
     * console.log(adj); // [[1], [0, 2], [1]]
     * ```
     *
     * @return - このグラフの隣接表現リスト
     */
    toAdjacencyList(): number[][] {
        const list: number[][] = [];
        for (let u = 0; u < this.vertexCount; u++) {
            list[u] = [];
            for (const v of this.neighbors(u)) list[u].push(v);
        }
        return list;
    }

    /**
     * このグラフの頂点数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * console.log(graph.vertexCount); // 3
     * ```
     *
     * @returns - このグラフの頂点数
     */
    get vertexCount(): number {
        return this.#core.vertexCount;
    }

    /**
     * このグラフの辺の数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new UndirectedGraph(3);
     * graph.addEdge(0, 1);
     * console.log(graph.edgeCount); // 1
     * graph.addEdge(1, 2);
     * console.log(graph.edgeCount); // 2
     * ```
     *
     * @returns - このグラフの辺の数
     */
    get edgeCount(): number {
        return this.#logicalEdgeCount;
    }

    /**
     * 生の隣接リスト表現(2次元配列)の情報をもとに、無向グラフを作ります。
     * 配列はシャローコピーされます。
     * また、引数rawに無向グラフとして不適切な隣接リスト表現を渡した場合の動作は未定義です。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const raw = [[1], [0, 2], [1]];
     * const graph = UndirectedGraph.from(raw);
     * console.log(graph.neighbors(0)); // [1]
     * console.log(graph.neighbors(1)); // [0, 2]
     * console.log(graph.neighbors(2)); // [1]
     * ```
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点のリスト。
     * @returns - rawをもとにした無向グラフ
     */
    static from(raw: number[][]): UndirectedGraph {
        let selfLoopCount = 0;
        const copied: number[][] = [];
        for (let u = 0; u < raw.length; u++) {
            copied[u] = [];
            for (const v of raw[u]) {
                if (u === v) selfLoopCount++;
                copied[u].push(v);
            }
        }
        const core = AdjacencyCore.fromRaw(
            copied,
            (i) => i,
            (f) => f,
        );
        const graph = UndirectedGraph.#fromCore(core, (core.arcCount + selfLoopCount) / 2);
        return graph;
    }

    /**
     * 生の隣接リスト表現(2次元配列)から、直接無向グラフを作ります。
     * 配列は内部でそのまま使用されます。配列を操作するとグラフ表現が破壊されるため注意してください。
     * (シャローコピーが発生しない分定数倍高速です。)
     * また、引数rawに無向グラフとして不適切な隣接リスト表現を渡した場合の動作は未定義です。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const raw = [[1], [0, 2], [1]];
     * const graph = UndirectedGraph.wrap(raw);
     * console.log(graph.neighbors(0)); // [1]
     * console.log(graph.neighbors(1)); // [0, 2]
     * console.log(graph.neighbors(2)); // [1]
     * ```
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点のリスト。
     * @returns - rawを使用した無向グラフ
     */
    static wrap(raw: number[][]): UndirectedGraph {
        let selfLoopCount = 0;
        for (let u = 0; u < raw.length; u++) {
            for (const v of raw[u]) {
                if (u === v) selfLoopCount++;
            }
        }
        const core = AdjacencyCore.fromRaw(
            raw,
            (i) => i,
            (f) => f,
        );
        const graph = UndirectedGraph.#fromCore(core, (core.arcCount + selfLoopCount) / 2);
        return graph;
    }
}

/**
 * 重み付き有向グラフを表すクラスです。
 * 重みの型`W`はデフォルトではnumberです。number以外を指定することもできます。
 */
export class WeightedDirectedGraph<W = number> {
    /** 内部で使用する隣接リスト表現 */
    #core: AdjacencyCore<WeightedEdge<W>>;

    /**
     * 新しいWeightedDirectedGraphインスタンスを生成します。
     * 生成されるインスタンスは、はじめ「頂点に`0`から`vertexCount - 1`の番号がついた、`vertexCount`頂点0辺のグラフ」を表します。
     *
     * 時間計算量: O(V) (※Vは頂点の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * ```
     *
     * @throws vertexCountが1以上の整数でない場合、RangeErrorとなります。
     * @return vertexCount頂点の重み付き有向グラフを表す新しいインスタンス
     */
    constructor(vertexCount: number) {
        if (vertexCount < 1 || !Number.isSafeInteger(vertexCount)) {
            throw new RangeError("The number of vertices must be an integer greater than or equal to 1.");
        }
        this.#core = new AdjacencyCore(
            vertexCount,
            (item) => item.to,
            (from, { weight }) => ({ to: from, weight }),
        );
    }

    /**
     * @private
     * AdjacencyCoreからWeightedDirectedGraphインスタンスを生成します。
     */
    static #fromCore<W>(core: AdjacencyCore<WeightedEdge<W>>): WeightedDirectedGraph<W> {
        const g = new WeightedDirectedGraph<W>(1); // <- 1頂点のグラフはダミーなので注意！
        g.#core = core; // <- ここでcoreを差し替えることでダミーを欲しいグラフにする
        return g;
    }

    /**
     * 頂点`from`から頂点`to`への有向辺を1本追加します。
     * 存在しない頂点を指定した場合のエラーチェックは行われません。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * ```
     *
     * @param from - 有向辺の始点とする頂点の番号 (0 <= from < vertexCount)
     * @param to - 有向辺の終点とする頂点の番号 (0 <= to < vertexCount)
     * @param weight - 辺の重み
     */
    addEdge(from: number, to: number, weight: W): void {
        this.#core.addOneWay(from, { to, weight });
    }

    /**
     * 頂点`v`から出ている辺の行き先と、その辺の重みをリストで返します。
     * 処理高速化のため、内部配列の参照を返します。戻り値の配列を操作するとグラフの内部表現が破壊されることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(0, 2, 5);
     * graph.addEdge(2, 0, 6);
     * console.log(graph.outEdges(0)); // [{ to: 1, weight: 4 }, { to: 2, weight: 5 }]
     * ```
     *
     * @param v - 行き先(隣接頂点)のリストを取得したい頂点の番号
     * @returns - 頂点`v`から直接つながっている頂点とその頂点に向かう辺の重みのリスト
     */
    outEdges(v: number): readonly WeightedEdge<W>[] {
        return this.#core.neighbors(v);
    }

    /**
     * 頂点`v`の出次数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(0, 2, 5);
     * graph.addEdge(2, 0, 6);
     * console.log(graph.outDegree(0)); // 2
     * console.log(graph.outDegree(1)); // 0
     * ```
     *
     * @param v - 出次数を取得したい頂点の番号 (0 <= v < vertexCount)
     * @returns - 頂点`v`の出次数
     */
    outDegree(v: number): number {
        return this.#core.outDegree(v);
    }

    /**
     * 各頂点の入次数をカウントし、配列として返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(0, 2, 5);
     * graph.addEdge(2, 0, 6);
     * console.log(graph.inDegrees()); // [1, 1, 1]
     * ```
     *
     * @returns - 入次数を表す配列。配列のi番目は、頂点`i`の入次数を表す。
     */
    inDegrees(): number[] {
        return this.#core.inDegrees();
    }

    /**
     * 内部表現の隣接リストを、一括でソートします。
     * 引数`compareFn`を指定しない場合、行き先の頂点番号の昇順でソートされます。
     *
     * 時間計算量: O(∑deg log deg) (※degは(各頂点の)出次数で、オーダーは各頂点についてのO(deg log deg)の総和)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 2, 5);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(2, 0, 6);
     * console.log(graph.outEdges(0)); // [{ to: 2, weight: 5 }, { to: 1, weight: 4 }] (or [{ to: 1, weight: 4 }, { to: 2, weight: 5 }])
     * graph.sortNeighbors();
     * console.log(graph.outEdges(0)); // [{ to: 1, weight: 4 }, { to: 2, weight: 5 }]
     * ```
     *
     * @param compareFn - 隣接リストに保存されている情報の順番を決めるための比較関数
     */
    sortNeighbors(compareFn: (a: WeightedEdge<W>, b: WeightedEdge<W>) => number = (a, b) => a.to - b.to): void {
        this.#core.sortAll(compareFn);
    }

    /**
     * すべての辺の向きを反転したグラフの隣接表現を作成して返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(0, 2, 5);
     * graph.addEdge(2, 0, 6);
     * const reversed = graph.reversed();
     * console.log(reversed.outEdges(0)); // [{ to: 2, weight: 6 }]
     * console.log(reversed.outEdges(1)); // [{ to: 0, weight: 4 }]
     * console.log(reversed.outEdges(2)); // [{ to: 0, weight: 5 }]
     * ```
     *
     * @returns - すべての辺を反転した重み付き有向グラフの隣接リスト表現
     */
    reversed(): WeightedDirectedGraph<W> {
        const reversedCore = this.#core.reversed();
        return WeightedDirectedGraph.#fromCore(reversedCore);
    }

    /**
     * 同じグラフを複製したものを返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(0, 2, 5);
     * graph.addEdge(2, 0, 6);
     * console.log(graph.outEdges(0)); // [{ to: 1, weight: 4 }, { to: 2, weight: 5 }]
     * console.log(graph.outEdges(1)); // []
     * console.log(graph.outEdges(2)); // [{ to: 0, weight: 6 }]
     * const cloned = graph.clone();
     * console.log(cloned.outEdges(0)); // [{ to: 1, weight: 4 }, { to: 2, weight: 5 }]
     * console.log(cloned.outEdges(1)); // []
     * console.log(cloned.outEdges(2)); // [{ to: 0, weight: 6 }]
     * ```
     *
     * @returns - 複製された重み付き有向グラフ
     */
    clone(): WeightedDirectedGraph<W> {
        const clonedCore = this.#core.clone();
        return WeightedDirectedGraph.#fromCore(clonedCore);
    }

    /**
     * 現在のグラフの状態をCompressed Sparse Row (CSR)表現で返します。
     * 例えば、「0→1 (重み4), 0→2 (重み5), 2→0 (重み6)」の3辺を持つ3頂点の重み付き有向グラフでは、戻り値は以下のようになります。
     * ```ts
     * {
     *     head: [0, 2, 2, 3],
     *     to: [1, 2, 0],
     *     weight: [4, 5, 6]
     * }
     * ```
     * つまり、以下のように探索を書く事ができます。
     * ```ts
     * for (let i = head[u]; i < head[u + 1]; i++) {
     *     const v = to[i];
     *     const w = weight[i];
     *     // ...
     * }
     * ```
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(0, 2, 5);
     * graph.addEdge(2, 0, 6);
     * const csr = graph.toCSR();
     * console.log(csr.head); // Uint32Array [0, 2, 2, 3]
     * console.log(csr.to); // Uint32Array [1, 2, 0]
     * console.log(csr.weight); // [4, 5, 6]
     * ```
     *
     * @returns - CSR表現。長さV+1のhead・長さEのto・長さEのweightを持つオブジェクト。
     */
    toCSR(): WeightedCSRGraph<W> {
        const head = new Uint32Array(this.vertexCount + 1);
        const to = new Uint32Array(this.edgeCount);
        const weight: W[] = [];
        let nextToIndex = 0;
        for (let u = 0; u < this.vertexCount; u++) {
            head[u] = nextToIndex;
            for (const v of this.outEdges(u)) {
                to[nextToIndex] = v.to;
                weight[nextToIndex] = v.weight;
                nextToIndex++;
            }
        }
        head[this.vertexCount] = nextToIndex; // <- this.edgeCountと同じになる
        return {
            head,
            to,
            weight,
        };
    }

    /**
     * このグラフの隣接リスト表現を返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(0, 2, 5);
     * graph.addEdge(2, 0, 6);
     * const adj = graph.toAdjacencyList();
     * console.log(adj); // [[{ to: 1, weight: 4 }, { to: 2, weight: 5 }], [], [{ to: 0, weight: 6 }]]
     * ```
     *
     * @return - このグラフの隣接表現リスト
     */
    toAdjacencyList(): WeightedEdge<W>[][] {
        const list: WeightedEdge<W>[][] = [];
        for (let u = 0; u < this.vertexCount; u++) {
            list[u] = [];
            for (const v of this.outEdges(u)) list[u].push(v);
        }
        return list;
    }

    /**
     * このグラフの頂点数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * console.log(graph.vertexCount); // 3
     * ```
     *
     * @returns - このグラフの頂点数
     */
    get vertexCount(): number {
        return this.#core.vertexCount;
    }

    /**
     * このグラフの辺の数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedDirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(0, 2, 5);
     * console.log(graph.edgeCount); // 2
     * graph.addEdge(2, 0, 6);
     * console.log(graph.edgeCount); // 3
     * ```
     *
     * @returns - このグラフの辺の数
     */
    get edgeCount(): number {
        return this.#core.arcCount;
    }

    /**
     * 生の隣接リスト表現(2次元配列)の情報をもとに、重み付き有向グラフを作ります。
     * 配列はシャローコピーされます。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const raw = [[{ to: 1, weight: 4 }, { to: 2, weight: 5 }], [], [{ to: 0, weight: 6 }]];
     * const graph = WeightedDirectedGraph.from(raw);
     * console.log(graph.outEdges(0)); // [{ to: 1, weight: 4 }, { to: 2, weight: 5 }]
     * console.log(graph.outEdges(1)); // []
     * console.log(graph.outEdges(2)); // [{ to: 0, weight: 6 }]
     * ```
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点とその辺の重みのリスト。
     * @returns - rawをもとにした重み付き有向グラフ
     */
    static from<W>(raw: WeightedEdge<W>[][]): WeightedDirectedGraph<W> {
        const core = AdjacencyCore.fromRaw(
            raw.map((adj) => [...adj]),
            (item) => item.to,
            (from, { weight }) => ({ to: from, weight }),
        );
        return WeightedDirectedGraph.#fromCore(core);
    }

    /**
     * 生の隣接リスト表現(2次元配列)から、直接重み付き有向グラフを作ります。
     * 配列は内部でそのまま使用されます。配列を操作するとグラフ表現が破壊されるため注意してください。
     * (シャローコピーが発生しない分定数倍高速です。)
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const raw = [[{ to: 1, weight: 4 }, { to: 2, weight: 5 }], [], [{ to: 0, weight: 6 }]];
     * const graph = WeightedDirectedGraph.wrap(raw);
     * console.log(graph.outEdges(0)); // [{ to: 1, weight: 4 }, { to: 2, weight: 5 }]
     * console.log(graph.outEdges(1)); // []
     * console.log(graph.outEdges(2)); // [{ to: 0, weight: 6 }]
     * ```
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点のリスト。
     * @returns - rawを使用した重み付き有向グラフ
     */
    static wrap<W>(raw: WeightedEdge<W>[][]): WeightedDirectedGraph<W> {
        const core = AdjacencyCore.fromRaw(
            raw,
            (item) => item.to,
            (from, { weight }) => ({ to: from, weight }),
        );
        return WeightedDirectedGraph.#fromCore(core);
    }
}

/**
 * 重み付き無向グラフを表すクラスです。
 * 重みの型`W`はデフォルトではnumberです。number以外を指定することもできます。
 */
export class WeightedUndirectedGraph<W = number> {
    /** 内部で使用する隣接リスト表現 */
    #core: AdjacencyCore<WeightedEdge<W>>;
    /** 辺の数 (coreのarcCountは自己ループの扱いでずれるため、こちら側で保持) */
    #logicalEdgeCount: number;

    /**
     * 新しいWeightedUndirectedGraphインスタンスを生成します。
     * 生成されるインスタンスは、はじめ「頂点に`0`から`vertexCount - 1`の番号がついた、`vertexCount`頂点0辺のグラフ」を表します。
     *
     * 時間計算量: O(V) (※Vは頂点の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * ```
     *
     * @throws vertexCountが1以上の整数でない場合、RangeErrorとなります。
     * @return vertexCount頂点の重み付き無向グラフを表す新しいインスタンス
     */
    constructor(vertexCount: number) {
        if (vertexCount < 1 || !Number.isSafeInteger(vertexCount)) {
            throw new RangeError("The number of vertices must be an integer greater than or equal to 1.");
        }
        this.#core = new AdjacencyCore(
            vertexCount,
            (item) => item.to,
            (from, { weight }) => ({ to: from, weight }),
        );
        this.#logicalEdgeCount = 0;
    }

    /**
     * @private
     * AdjacencyCoreからWeightedUndirectedGraphインスタンスを生成します。
     */
    static #fromCore<W>(core: AdjacencyCore<WeightedEdge<W>>, logicalEdgeCount: number): WeightedUndirectedGraph<W> {
        const g = new WeightedUndirectedGraph<W>(1); // <- 1頂点のグラフはダミーなので注意！
        g.#core = core; // <- ここでcoreを差し替えることでダミーを欲しいグラフにする
        g.#logicalEdgeCount = logicalEdgeCount;
        return g;
    }

    /**
     * 頂点`u`から頂点`v`への無向辺を1本追加します。
     * 存在しない頂点を指定した場合のエラーチェックは行われません。
     * 自己ループ(u === v)も許可されます。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * ```
     *
     * @param u - 無向辺の一方の頂点の番号 (0 <= u < vertexCount)
     * @param v - 無向辺のもう一方の頂点の番号 (0 <= v < vertexCount)
     * @param weight - 辺の重み
     */
    addEdge(u: number, v: number, weight: W): void {
        this.#core.addOneWay(u, { to: v, weight });
        if (u !== v) this.#core.addOneWay(v, { to: u, weight });
        this.#logicalEdgeCount++;
    }

    /**
     * 頂点`v`から出ている辺の行き先と、その辺の重みをリストで返します。
     * 処理高速化のため、内部配列の参照を返します。戻り値の配列を操作するとグラフの内部表現が破壊されることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(1, 2, 5);
     * console.log(graph.neighbors(1)); // [{ to: 0, weight: 4 }, { to: 2, weight: 5 }]
     * ```
     *
     * @param v - 行き先(隣接頂点)のリストを取得したい頂点の番号
     * @returns - 頂点`v`から直接つながっている頂点とその頂点に向かう辺の重みのリスト
     */
    neighbors(v: number): readonly WeightedEdge<W>[] {
        return this.#core.neighbors(v);
    }

    /**
     * 頂点`v`の次数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(1, 2, 5);
     * console.log(graph.degree(0)); // 1
     * console.log(graph.degree(1)); // 2
     * ```
     *
     * @param v - 出次数を取得したい頂点の番号 (0 <= v < vertexCount)
     * @returns - 頂点`v`の次数
     */
    degree(v: number): number {
        return this.neighbors(v).length;
    }

    /**
     * 内部表現の隣接リストを、一括でソートします。
     *
     * 時間計算量: O(∑deg log deg) (※degは(各頂点の)次数で、オーダーは各頂点についてのO(deg log deg)の総和)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * graph.addEdge(1, 2, 5);
     * graph.addEdge(0, 1, 4);
     * console.log(graph.neighbors(1)); // [{ to: 2, weight: 5 }, { to: 0, weight: 4 }] (or [{ to: 0, weight: 4 }, { to: 2, weight: 5 }])
     * graph.sortNeighbors();
     * console.log(graph.neighbors(1)); // [{ to: 0, weight: 4 }, { to: 2, weight: 5 }]
     * ```
     *
     * @param compareFn - 隣接リストに保存されている情報の順番を決めるための比較関数
     */
    sortNeighbors(compareFn: (a: WeightedEdge<W>, b: WeightedEdge<W>) => number = (a, b) => a.to - b.to): void {
        this.#core.sortAll(compareFn);
    }

    /**
     * 同じグラフを複製したものを返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(1, 2, 5);
     * console.log(graph.neighbors(0)); // [{ to: 1, weight: 4 }]
     * console.log(graph.neighbors(1)); // [{ to: 0, weight: 4 }, { to: 2, weight: 5 }]
     * console.log(graph.neighbors(2)); // [{ to: 1, weight: 5 }]
     * const cloned = graph.clone();
     * console.log(cloned.neighbors(0)); // [{ to: 1, weight: 4 }]
     * console.log(cloned.neighbors(1)); // [{ to: 0, weight: 4 }, { to: 2, weight: 5 }]
     * console.log(cloned.neighbors(2)); // [{ to: 1, weight: 5 }]
     * ```
     *
     * @returns - 複製された重み付き無向グラフ
     */
    clone(): WeightedUndirectedGraph<W> {
        const clonedCore = this.#core.clone();
        return WeightedUndirectedGraph.#fromCore(clonedCore, this.#logicalEdgeCount);
    }

    /**
     * 現在のグラフの状態をCompressed Sparse Row (CSR)表現で返します。
     * 例えば、「0↔1 (重み4), 1↔2 (重み5)」の2辺を持つ3頂点の無向グラフでは、戻り値は以下のようになります。
     * ```ts
     * {
     *     head: [0, 1, 3, 4],
     *     to: [1, 0, 2, 1],
     *     weight: [4, 4, 5, 5]
     * }
     * ```
     * つまり、以下のように探索を書く事ができます。
     * ```ts
     * for (let i = head[u]; i < head[u + 1]; i++) {
     *     const v = to[i];
     *     const w = weight[i];
     *     // ...
     * }
     * ```
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(1, 2, 5);
     * const csr = graph.toCSR();
     * console.log(csr.head); // Uint32Array [0, 1, 3, 4]
     * console.log(csr.to); // Uint32Array [1, 0, 2, 1]
     * console.log(csr.weight); // [4, 4, 5, 5]
     * ```
     *
     * @returns - CSR表現。長さV+1のhead・長さ2E-自己ループ数のto・toと同数のweightを持つオブジェクト。
     */
    toCSR(): WeightedCSRGraph<W> {
        const head = new Uint32Array(this.vertexCount + 1);
        const to = new Uint32Array(this.#core.arcCount);
        const weight: W[] = [];
        let nextToIndex = 0;
        for (let u = 0; u < this.vertexCount; u++) {
            head[u] = nextToIndex;
            for (const v of this.neighbors(u)) {
                to[nextToIndex] = v.to;
                weight[nextToIndex] = v.weight;
                nextToIndex++;
            }
        }
        head[this.vertexCount] = nextToIndex;
        return {
            head,
            to,
            weight,
        };
    }

    /**
     * このグラフの隣接リスト表現を返します。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * graph.addEdge(1, 2, 5);
     * const adj = graph.toAdjacencyList();
     * console.log(adj); // [[{ to: 1, weight: 4 }], [{ to: 0, weight: 4 }, { to: 2, weight: 5 }], [{ to: 1, weight: 5 }]]
     * ```
     *
     * @return - このグラフの隣接表現リスト
     */
    toAdjacencyList(): WeightedEdge<W>[][] {
        const list: WeightedEdge<W>[][] = [];
        for (let u = 0; u < this.vertexCount; u++) {
            list[u] = [];
            for (const v of this.neighbors(u)) list[u].push(v);
        }
        return list;
    }

    /**
     * このグラフの頂点数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * console.log(graph.vertexCount); // 3
     * ```
     *
     * @returns - このグラフの頂点数
     */
    get vertexCount(): number {
        return this.#core.vertexCount;
    }

    /**
     * このグラフの辺の数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const graph = new WeightedUndirectedGraph(3);
     * graph.addEdge(0, 1, 4);
     * console.log(graph.edgeCount); // 1
     * graph.addEdge(1, 2, 5);
     * console.log(graph.edgeCount); // 2
     * ```
     *
     * @returns - このグラフの辺の数
     */
    get edgeCount(): number {
        return this.#logicalEdgeCount;
    }
    /**
     * 生の隣接リスト表現(2次元配列)の情報をもとに、重み付き無向グラフを作ります。
     * 配列はシャローコピーされます。
     * また、引数rawに無向グラフとして不適切な隣接リスト表現を渡した場合の動作は未定義です。
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const raw = [[{ to: 1, weight: 4 }], [{ to: 0, weight: 4 }, { to: 2, weight: 5 }], [{ to: 1, weight: 5 }]];
     * const graph = WeightedUndirectedGraph.from(raw);
     * console.log(graph.neighbors(0)); // [{ to: 1, weight: 4 }]
     * console.log(graph.neighbors(1)); // [{ to: 0, weight: 4 }, { to: 2, weight: 5 }]
     * console.log(graph.neighbors(2)); // [{ to: 1, weight: 5 }]
     * ```
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点とその辺の重みのリスト。
     * @returns - rawをもとにした重み付き無向グラフ
     */
    static from<W>(raw: WeightedEdge<W>[][]): WeightedUndirectedGraph<W> {
        let selfLoopCount = 0;
        const copied: WeightedEdge<W>[][] = [];
        for (let u = 0; u < raw.length; u++) {
            copied[u] = [];
            for (const v of raw[u]) {
                if (u === v.to) selfLoopCount++;
                copied[u].push(v);
            }
        }
        const core = AdjacencyCore.fromRaw(
            copied,
            (item) => item.to,
            (from, { weight }) => ({ to: from, weight }),
        );
        const graph = WeightedUndirectedGraph.#fromCore(core, (core.arcCount + selfLoopCount) / 2);
        return graph;
    }

    /**
     * 生の隣接リスト表現(2次元配列)から、直接重み付き無向グラフを作ります。
     * 配列は内部でそのまま使用されます。配列を操作するとグラフ表現が破壊されるため注意してください。
     * (シャローコピーが発生しない分定数倍高速です。)
     *
     * 時間計算量: O(V + E) (※Vは頂点の数、Eは辺の数)
     *
     * @example
     * ```ts
     * const raw = [[{ to: 1, weight: 4 }], [{ to: 0, weight: 4 }, { to: 2, weight: 5 }], [{ to: 1, weight: 5 }]];
     * const graph = WeightedUndirectedGraph.wrap(raw);
     * console.log(graph.neighbors(0)); // [{ to: 1, weight: 4 }]
     * console.log(graph.neighbors(1)); // [{ to: 0, weight: 4 }, { to: 2, weight: 5 }]
     * console.log(graph.neighbors(2)); // [{ to: 1, weight: 5 }]
     * ```
     *
     * @param raw - 生の隣接リスト表現。raw[u]は頂点uに隣接する頂点のリスト。
     * @returns - rawを使用した重み付き無向グラフ
     */
    static wrap<W>(raw: WeightedEdge<W>[][]): WeightedUndirectedGraph<W> {
        let selfLoopCount = 0;
        for (let u = 0; u < raw.length; u++) {
            for (const v of raw[u]) {
                if (u === v.to) selfLoopCount++;
            }
        }
        const core = AdjacencyCore.fromRaw(
            raw,
            (item) => item.to,
            (from, { weight }) => ({ to: from, weight }),
        );
        const graph = WeightedUndirectedGraph.#fromCore(core, (core.arcCount + selfLoopCount) / 2);
        return graph;
    }
}
