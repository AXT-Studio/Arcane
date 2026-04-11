// ================================================================
// Import
// ================================================================

import { Deque } from "./Deque";

// ================================================================
// Types
// ================================================================

interface InternalEdge {
    to: number;
    rev: number;
    cap: number;
}

interface PublicEdge {
    from: number;
    to: number;
    cap: number;
    flow: number;
}

// ================================================================
// Exports
// ================================================================

/**
 * Dinic's algorithm を用いて最大流問題を解くためのクラスです。
 *
 */
export class MaxFlow {
    /** 探索用: グラフの隣接リスト表現 */
    #graph: InternalEdge[][];
    /** 公開用: [i番目に追加された辺のfrom, graph[from]内のindex] */
    #pos: [number, number][];

    /**
     * 新しいMaxFlowインスタンスを生成します。
     * 頂点`0`〜`n-1`からなる、頂点数`n`のフローネットワークを初期化します。
     *
     * 時間計算量: O(V) (Vは頂点数`n`)
     *
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(4);
     * ```
     *
     * @param n - グラフの頂点数
     * @constructor
     */
    constructor(n: number) {
        this.#graph = Array.from({ length: n }, () => []);
        this.#pos = [];
    }

    /**
     * フローネットワークに、点fromから点toへの容量capの辺を追加します。
     * また、この辺が何番目に追加された辺かを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(4);
     * const edgeId = maxFlow.addEdge(0, 1, 5);
     * console.log(edgeId); // 0
     * ```
     *
     * @param from - 辺の始点番号 (0 <= from < n)
     * @param to - 辺の終点番号 (0 <= to < n, from == toも可)
     * @param cap - 辺の容量 (0 <= cap)
     * @return 何番目に追加された辺か (0-indexed, getEdgeやchangeEdgeの引数として使用される)
     */
    addEdge(from: number, to: number, cap: number): number {
        const m = this.#pos.length;
        const fromId = this.#graph[from].length;
        const toId = this.#graph[to].length;
        this.#pos.push([from, fromId]);
        this.#graph[from].push({
            to,
            rev: toId + (from === to ? 1 : 0), // 自己ループのときは逆辺も同じ場所に追加されるので、revはtoId+1になる
            cap,
        });
        this.#graph[to].push({
            to: from,
            rev: fromId,
            cap: 0,
        });
        return m;
    }

    /**
     * 点`s`から点`t`への最大流量を求めます。
     * `max`を指定すると、流量の上限を`max`に制限します。
     *
     * 時間計算量: O(V^2 * E) (Vは頂点数、Eは辺数)
     *
     * 以下の点に注意してください。
     * - このメソッドは、内部で関数再帰による深さ優先探索(DFS)を使用しています。
     *     - 大規模なグラフを扱う場合、JavaScriptエンジンの再帰呼び出しの上限に達する可能性があります。
     *     - 必要に応じて、コールスタックのサイズを引き上げるオプションを使用するようにしてください。
     * - `max`を指定した場合、点`s`から点`t`への最大流量が`max`を超えることはありません。
     * - このメソッドは残余グラフを更新するため、同じインスタンスに対して複数回呼び出すと状態を引き継いで追加で流量を流すことになります。
     *
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(4);
     * maxFlow.addEdge(0, 1, 2);
     * maxFlow.addEdge(0, 2, 1);
     * maxFlow.addEdge(1, 3, 1);
     * maxFlow.addEdge(2, 3, 1);
     * const flow = maxFlow.flow(0, 3);
     * console.log(flow); // => 2 (0->1->3で1、0->2->3で1の流量を流せるので、合計2)
     *
     * @param s - 流量の始点
     * @param t - 流量の終点
     * @param max - 流量の上限 (デフォルトはInfinity)
     * @return 点sから点tへの最大流量
     */
    flow(s: number, t: number, max: number = Infinity): number {
        let flow = 0;
        while (true) {
            // BFSでレベルグラフ(点sからの距離)を構築する
            const level = Array(this.#graph.length).fill(-1);
            level[s] = 0;
            const queue = new Deque<number>();
            queue.push(s);
            while (queue.size > 0) {
                const v = queue.shift() as number;
                for (const e of this.#graph[v]) {
                    if (e.cap > 0 && level[e.to] < 0) {
                        level[e.to] = level[v] + 1;
                        queue.push(e.to);
                    }
                }
            }
            // もうsからtに到達できない場合は、これ以上流せないので終了
            if (level[t] < 0) {
                break;
            }
            // DFSで増加パスを探して流す
            const iter = Array(this.#graph.length).fill(0);
            /** 現在地v、ボトルネックの容量f(、目的地t)でDFS */
            const dfs = (v: number, f: number): number => {
                if (v === t) {
                    return f;
                }
                for (; iter[v] < this.#graph[v].length; iter[v]++) {
                    const e = this.#graph[v][iter[v]];
                    if (e.cap > 0 && level[v] < level[e.to]) {
                        const d = dfs(e.to, Math.min(f, e.cap));
                        if (d > 0) {
                            e.cap -= d;
                            this.#graph[e.to][e.rev].cap += d;
                            return d;
                        }
                    }
                }
                return 0;
            };
            let f: number;
            // biome-ignore lint/suspicious/noAssignInExpressions: こう書くほうがきれいじゃん
            while ((f = dfs(s, max - flow)) > 0) {
                flow += f;
            }
            // flowがmaxに達したら、これ以上流せないので終了
            if (flow >= max) {
                break;
            }
        }
        return flow;
    }
    /**
     * 点sから点i(0 <= i < n)について、(残余グラフにおいて)点sから点iに(残余容量0の(もう流せない)辺を通らずに)到達可能かどうかを返す配列を返します。
     *
     * 時間計算量: O(V + E) (Vは頂点数、Eは辺数)
     *
     * 以下の点に注意してください。
     * - 通常は`flow`実行後に`minCut`を呼び出して、最小カットの`s`側頂点集合を取得します。
     * - 戻り値の`i`番目の要素が`true`のとき、頂点`i`は頂点`s`から残余容量が正の(まだ流せる)辺だけを通って到達可能です。
     *
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(4);
     * maxFlow.addEdge(0, 1, 2);
     * maxFlow.addEdge(0, 2, 1);
     * maxFlow.addEdge(1, 3, 1);
     * maxFlow.addEdge(2, 3, 1);
     *
     * maxFlow.flow(0, 3);
     * const reachable = maxFlow.minCut(0);
     * console.log(reachable); // 例: [true, true, false, false]
     * ```
     *
     * @param s - 始点
     * @return 点sから点i(0 <= i < n)について、(残余グラフにおいて)点sから点iに(残余容量0の(もう流せない)辺を通らずに)到達可能かどうかを返す配列
     */
    minCut(s: number): boolean[] {
        const visited = Array(this.#graph.length).fill(false);
        const queue = new Deque<number>();
        queue.push(s);
        visited[s] = true;
        while (queue.size > 0) {
            const v = queue.shift() as number;
            for (const e of this.#graph[v]) {
                if (e.cap > 0 && !visited[e.to]) {
                    visited[e.to] = true;
                    queue.push(e.to);
                }
            }
        }
        return visited;
    }
    /**
     * i番目に追加された辺の情報(辺の容量と現在の流量)を返します。
     *
     * 時間計算量: O(1)
     *
     * 以下の点に注意してください。
     * - `cap`は辺の容量、`flow`は現在流れている流量を表します。
     *     - 残余容量は`cap - flow`で計算できます。
     *
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(2);
     * const edgeId = maxFlow.addEdge(0, 1, 7);
     * maxFlow.flow(0, 1, 4);
     * console.log(maxFlow.getEdge(edgeId)); // { from: 0, to: 1, cap: 7, flow: 4 }
     * ```
     *
     * @param i - 辺の番号 (0-indexed, `addEdge`の戻り値として得られる値)
     * @return i番目に追加された辺の情報。`{from, to, cap, flow}`で、capは辺の容量、flowは現在流れている流量。
     */
    getEdge(i: number): PublicEdge {
        const [from, index] = this.#pos[i];
        const e = this.#graph[from][index];
        const rev = this.#graph[e.to][e.rev];
        return { from, to: e.to, cap: e.cap + rev.cap, flow: rev.cap };
    }
    /**
     * すべての辺の情報(辺の容量と現在の流量)を、追加された順番で返します。
     * 戻り値の`i`番目の要素は、`getEdge(i)`と同じ形式のオブジェクトで、i番目に追加された辺の情報を表します。
     *
     * 時間計算量: O(E) (Eは辺の数)
     *
     * 以下の点に注意してください。
     * - `cap`は辺の容量、`flow`は現在流れている流量を表します。
     *    - 残余容量は`cap - flow`で計算できます。
     *
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(3);
     * maxFlow.addEdge(0, 1, 3);
     * maxFlow.addEdge(1, 2, 2);
     * maxFlow.flow(0, 2);
     * console.log(maxFlow.getEdges()); // [{ from: 0, to: 1, cap: 3, flow: 2 }, { from: 1, to: 2, cap: 2, flow: 2 }]
     * ```
     */
    getEdges(): PublicEdge[] {
        const edges: PublicEdge[] = [];
        for (let i = 0; i < this.#pos.length; i++) {
            edges.push(this.getEdge(i));
        }
        return edges;
    }
    /**
     * i番目に追加した辺の容量を`cap`に、流量を`flow`に(強制的に)変更します。
     * ただし、`flow`は`cap`を超える値を指定することはできません。
     *
     * 時間計算量: O(1)
     *
     * 以下の点に注意してください。
     * - このメソッドは、特定の辺の容量や流量を直接変更したい場合に使用します。
     * - `cap`は辺の容量、`flow`は現在流れている流量を表します。
     * - このメソッドは値の整合性を自動検証しません。通常は`0 <= flow <= cap`を満たす値を指定してください。
     *
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(2);
     * const edgeId = maxFlow.addEdge(0, 1, 10);
     * maxFlow.changeEdge(edgeId, 10, 3);
     * console.log(maxFlow.getEdge(edgeId)); // { from: 0, to: 1, cap: 10, flow: 3 }
     * ```
     *
     * @param i - 辺の番号 (0-indexed)
     * @param cap - 辺の容量
     * @param flow - 流量 (capを超えてはならない)
     */
    changeEdge(i: number, cap: number, flow: number): void {
        const [from, index] = this.#pos[i];
        const e = this.#graph[from][index];
        const rev = this.#graph[e.to][e.rev];
        e.cap = cap - flow;
        rev.cap = flow;
    }
}
