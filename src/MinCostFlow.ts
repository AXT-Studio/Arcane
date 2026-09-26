// ================================================================
// Import
// ================================================================

import { BinaryHeapLite } from "./BinaryHeap";

// ================================================================
// Exports
// ================================================================

/**
 * 最小費用流問題(Minimun-Cost Flow Problem)を解くためのクラスです。
 * (ポテンシャル付きDijkstra法による)逐次最短路法を用います。
 */
export class MinCostFlow {
    /** v_size := グラフの頂点数 */
    #v_size: number;
    /** dest[i][j] := 残余グラフにおいて、頂点`i`から出る`j`番目の辺がどの頂点に向かう辺か？ */
    #dest: number[][];
    /** revIndex[i][j] := 残余グラフにおいて、頂点`i`から出る`j`番目の辺の逆辺は、頂点`dest[i][j]`の何番目の辺か？ */
    #revIndex: number[][];
    /** remainCap[i][j] := 残余グラフにおいて、頂点`i`から出る`j`番目の辺の残余容量はいくつか？ */
    #remainCap: number[][];
    /** cost[i][j] := 残余グラフにおいて、頂点`i`から出る`j`番目の辺の流量1単位あたりのコストはいくつか？ */
    #cost: number[][];
    /** publicIndex_from[i] := addEdge()によって追加された`i`番目の辺は、どの頂点から出ている辺か？ */
    #publicIndex_from: number[];
    /** publicIndex_idx[i] := addEdge()によって追加された`i`番目の辺は、頂点`publicIndex_from[i]`から出る何番目の辺か？ */
    #publicIndex_idx: number[];

    /**
     * 新しいMinCostFlowインスタンスを生成します。
     * 頂点`0`〜`n-1`からなる、頂点数`n`のフローネットワークを初期化します。
     *
     * 時間計算量: O(V) (Vは頂点数`n`)
     *
     * @example
     * ```ts
     * const minCostFlow = new MinCostFlow(4);
     * ```
     *
     * @param n - フローネットワークの頂点数
     */
    constructor(n: number) {
        this.#v_size = n;
        this.#dest = Array.from({ length: n }, () => []);
        this.#revIndex = Array.from({ length: n }, () => []);
        this.#remainCap = Array.from({ length: n }, () => []);
        this.#cost = Array.from({ length: n }, () => []);
        this.#publicIndex_from = [];
        this.#publicIndex_idx = [];
    }

    /**
     * フローネットワークに、頂点`from`から頂点`to`への容量`cap`・コスト`cost`(/流量1単位)の辺を追加します。
     * また、この辺が何番目に追加された辺かを返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const minCostFlow = new MinCostFlow(4);
     * const edgeId = minCostFlow.addEdge(0, 1, 3, 1);
     * console.log(edgeId); // 0
     * ```
     *
     * @param from - 辺の始点番号 (0 <= from < n)
     * @param to - 辺の終点番号 (0 <= to < n, from == toも可)
     * @param cap - 辺の容量 (0 <= cap, cap ∈ ℤ)
     * @param cost - 辺の流量1単位あたりのコスト (0 <= cost, cost ∈ ℤ)
     * @returns 何番目に追加された辺か (0-indexed, getEdgeの引数として使用される)
     */
    addEdge(from: number, to: number, cap: number, cost: number): number {
        // 辺の公開index・順辺のdest[from]内のindex・逆辺のdest[to]内のindexを先に確定させておく
        const publicIndex = this.#publicIndex_from.length;
        const forwardEdge_idx = this.#dest[from].length;
        const reverseEdge_idx = this.#dest[to].length + (from === to ? 1 : 0); // from === toのときだけindexずれるので注意
        // 辺の公開index → 順辺の索引情報を記録
        this.#publicIndex_from[publicIndex] = from;
        this.#publicIndex_idx[publicIndex] = forwardEdge_idx;
        // 順方向の辺を記録に追加
        this.#dest[from][forwardEdge_idx] = to;
        this.#revIndex[from][forwardEdge_idx] = reverseEdge_idx;
        this.#remainCap[from][forwardEdge_idx] = cap;
        this.#cost[from][forwardEdge_idx] = cost;
        // 逆辺を記録に追加
        this.#dest[to][reverseEdge_idx] = from;
        this.#revIndex[to][reverseEdge_idx] = forwardEdge_idx;
        this.#remainCap[to][reverseEdge_idx] = 0;
        this.#cost[to][reverseEdge_idx] = -cost;
        // 公開indexを返す
        return publicIndex;
    }

    /**
     * `i`番目に追加された辺の情報(辺が結ぶ頂点、辺の容量、辺のコスト、現在の流量)を返します。
     * 戻り値は、`i`番目の辺が、頂点`from`から`to`を結ぶ容量`cap`・流量1単位あたりコスト`cost`の辺で、現在の流量が`flow`であることを表します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const minCostFlow = new MinCostFlow(4);
     * const edgeId = minCostFlow.addEdge(0, 1, 3, 2);
     * minCostFlow.flow(0, 1);
     * console.log(minCostFlow.getEdge(edgeId)); // { from: 0, to: 1, cap: 3, cost: 2, flow: 3 }
     * ```
     *
     * @param i - 辺の番号 (0-indexed, `addEdge`の戻り値として得られる値)
     * @returns - `i`番目に追加された辺の情報。`i`番目の辺が、頂点`from`から`to`を結ぶ容量`cap`・流量1単位あたりコスト`cost`の辺で、現在の流量が`flow`であることを表す。
     */
    getEdge(i: number): { from: number; to: number; cap: number; cost: number; flow: number } {
        const from = this.#publicIndex_from[i];
        const idx = this.#publicIndex_idx[i];
        const to = this.#dest[from][idx];
        const revIdx = this.#revIndex[from][idx];
        const cost = this.#cost[from][idx];
        const remainCap_forward = this.#remainCap[from][idx];
        const remainCap_reverse = this.#remainCap[to][revIdx];
        return {
            from,
            to,
            cap: remainCap_forward + remainCap_reverse,
            cost,
            flow: remainCap_reverse,
        };
    }

    /**
     * すべての辺の情報(辺が結ぶ頂点、辺の容量、辺のコスト、現在の流量)を、追加された順番で返します。
     * 戻り値の`i`番目の要素は、`i`番目に追加された辺が、頂点`from`から`to`を結ぶ容量`cap`・流量1単位あたりコスト`cost`の辺で、現在の流量が`flow`であることを表します。
     *
     * 時間計算量: O(E) (Eは辺の数)
     *
     * @example
     * ```ts
     * const minCostFlow = new MinCostFlow(4);
     * minCostFlow.addEdge(0, 1, 3, 2);
     * minCostFlow.addEdge(1, 2, 2, 6);
     * minCostFlow.flow(0, 2);
     * console.log(minCostFlow.getEdges()); // [{ from: 0, to: 1, cap: 3, cost: 2, flow: 2 }, { from: 1, to: 2, cap: 2, cost: 6, flow: 2 }]
     *
     * @returns -追加された辺の情報。戻り値の`i`番目の要素は、`i`番目に追加された辺が、頂点`from`から`to`を結ぶ容量`cap`・流量1単位あたりコスト`cost`の辺で、現在の流量が`flow`であることを表す。
     * ```
     */
    getEdges(): { from: number; to: number; cap: number; cost: number; flow: number }[] {
        const edges: { from: number; to: number; cap: number; cost: number; flow: number }[] = [];
        for (let i = 0; i < this.#publicIndex_from.length; i++) {
            edges.push(this.getEdge(i));
        }
        return edges;
    }

    /**
     * 現在のフローネットワークに対する、流量と最小コストの関係を示す「折れ線」を求めます。
     * より具体的には、以下を行います。
     * - 流量`max`を目標として、頂点`s`から頂点`t`まで、その流量における最小コストを維持しながら流量を増加させます
     * - その結果わかった「流量と最小コストの関係」を、折れ線グラフが通る点のリストの形で返します
     *
     * 時間計算量: O(F(V+E) × log(V+E)) (Vは頂点の数、Eは辺の数、Fは実際に流した流量)
     *
     * @example
     * ```ts
     * const minCostFlow = new MinCostFlow(4);
     * const [S, A, B, T] = [0, 1, 2, 3];
     * minCostFlow.addEdge(S, A, 2, 1);
     * minCostFlow.addEdge(S, B, 1, 3);
     * minCostFlow.addEdge(A, B, 1, 0);
     * minCostFlow.addEdge(A, T, 1, 3);
     * minCostFlow.addEdge(B, T, 1, 1);
     * const slopeResult = minCostFlow.slope(S, T);
     * console.log(slopeResult.flow); // => [0, 1, 2]
     * console.log(slopeResult.cost); // => [0, 2, 8]
     * ```
     *
     * @remarks
     * - 戻り値は`{flow: number[], cost: number[]}`です
     *     - `flow[0]`・`cost[0]`はともに`0`です
     *     - `flow`・`cost`はいずれも単調非減少であることが保証されます
     *     - (`flow`, `cost`)の組を2次元平面にプロットしたとき、同一直線上に3点が存在することはないことが保証されます
     *     - `flow`と`cost`の長さは同じです
     *     - `flow.at(-1)`は実際に流せた最大流量で、`max`より小さくなる可能性があります
     * - `slope()`や`flow()`をあわせて複数回呼んだときの挙動は未定義です
     *
     * @param s - フローの始点
     * @param t - フローの終点
     * @param max - 流量の上限 (デフォルトはInfinity)
     * @returns s→tの流量と最小コストの関係(折れ線グラフで表され、その点を`{flow: number[], cost: number[]}`で返す)
     * @throws {Error} - 頂点`s`と頂点`t`に同一頂点を指定した場合
     */
    slope(s: number, t: number, max: number = Infinity): { flow: number[]; cost: number[] } {
        if (s === t) {
            throw Error("source(`s`) and sink(`t`) must be distinct vertices.");
        }
        const resultFlow: number[] = [0];
        const resultCost: number[] = [0];
        /** 現在のs→tの流量 */
        let currentFlow_s_t = 0;
        /** 現在のs→tのコスト */
        let currentCost_s_t = 0;
        /** Dijkstraを使えるようにするために頂点につけるポテンシャル */
        const potential = Array.from({ length: this.#v_size }, () => 0);
        levelLoop: while (true) {
            if (max <= currentFlow_s_t) break levelLoop;
            // Dijkstraでsourceから各頂点までの最小(換算)コスト + 経路を求める
            const distance = Array.from({ length: this.#v_size }, () => Infinity);
            const pathFrom = Array.from({ length: this.#v_size }, () => -1);
            const pathFrom_index = Array.from({ length: this.#v_size }, () => -1);
            // BinaryHeapLiteは優先度が高いほうが負
            const pq = new BinaryHeapLite<{ target: number; dist: number; from: number; idx: number }>(
                (a, b) => a.dist - b.dist,
            );
            pq.push({ target: s, dist: 0, from: s, idx: -1 });
            while (pq.size > 0) {
                const current = pq.pop()!;
                if (pathFrom[current.target] !== -1) continue;
                pathFrom[current.target] = current.from;
                pathFrom_index[current.target] = current.idx;
                distance[current.target] = current.dist;
                // current.targetから出ている辺を予約
                for (let i = 0; i < this.#dest[current.target].length; i++) {
                    if (pathFrom[this.#dest[current.target][i]] !== -1) continue;
                    if (this.#remainCap[current.target][i] === 0) continue;
                    const nextDist =
                        current.dist +
                        this.#cost[current.target][i] +
                        potential[current.target] -
                        potential[this.#dest[current.target][i]];
                    pq.push({
                        target: this.#dest[current.target][i],
                        dist: nextDist,
                        from: current.target,
                        idx: i,
                    });
                }
            }
            if (pathFrom[t] === -1) break;
            // s→tの最小実コストは「source→sinkの最小換算コスト-sourceポテ+sinkポテ」なので、それを求める
            const currentMinCost = distance[t] - potential[s] + potential[t];
            // 最小(換算)コストとなるパスに流せるだけ流して良いので、流す量を決める
            let neckFlow = max - currentFlow_s_t;
            {
                let prev = pathFrom[t];
                let curr = t;
                while (curr !== s) {
                    neckFlow = Math.min(neckFlow, this.#remainCap[prev][pathFrom_index[curr]]);
                    curr = prev;
                    prev = pathFrom[prev];
                }
            }
            // 流す
            {
                let prev = pathFrom[t];
                let curr = t;
                while (curr !== s) {
                    const forwardEdge_idx = pathFrom_index[curr];
                    const reverseEdge_idx = this.#revIndex[prev][forwardEdge_idx];
                    this.#remainCap[prev][forwardEdge_idx] -= neckFlow;
                    this.#remainCap[curr][reverseEdge_idx] += neckFlow;
                    curr = prev;
                    prev = pathFrom[prev];
                }
            }
            currentFlow_s_t += neckFlow;
            currentCost_s_t += neckFlow * currentMinCost;
            // resultへの追加時、追加前のラスト2つと傾きが同じ場合はラストを取ってから入れる必要がある
            if (resultCost.length >= 2) {
                const flow_last1 = resultFlow.at(-1)!;
                const cost_last1 = resultCost.at(-1)!;
                const flow_last2 = resultFlow.at(-2)!;
                const cost_last2 = resultCost.at(-2)!;
                const deltaFlow_prev = flow_last1 - flow_last2;
                const deltaCost_prev = cost_last1 - cost_last2;
                const deltaFlow_curr = currentFlow_s_t - flow_last1;
                const deltaCost_curr = currentCost_s_t - cost_last1;
                if (deltaCost_prev * deltaFlow_curr === deltaFlow_prev * deltaCost_curr) {
                    resultCost.pop();
                    resultFlow.pop();
                }
            }
            resultCost.push(currentCost_s_t);
            resultFlow.push(currentFlow_s_t);
            // ポテンシャル更新 (source→各頂点の最小換算コストを足す)
            for (let i = 0; i < this.#v_size; i++) {
                if (distance[i] === Infinity) continue;
                potential[i] += distance[i];
            }
        }
        return { flow: resultFlow, cost: resultCost };
    }

    /**
     * 現在のネットワークに、流量`max`を上限として頂点`s`から頂点`t`まで(最小コストを維持しながら)流せるだけ流します。
     * 戻り値は、実際に流せた流量と、その流量を達成する最小コストです。
     *
     * 時間計算量: O(F(V+E) × log(V+E)) (Vは頂点の数、Eは辺の数、Fは実際に流した流量)
     *
     * @example 流量を制限しない場合
     * ```ts
     * const minCostFlow = new MinCostFlow(4);
     * const [S, A, B, T] = [0, 1, 2, 3];
     * minCostFlow.addEdge(S, A, 2, 1);
     * minCostFlow.addEdge(S, B, 1, 3);
     * minCostFlow.addEdge(A, B, 1, 0);
     * minCostFlow.addEdge(A, T, 1, 3);
     * minCostFlow.addEdge(B, T, 1, 1);
     * const flowResult = minCostFlow.flow(S, T);
     * console.log(flowResult); // {flow: 2, cost: 8};
     * ```
     *
     * @example 流量を制限する場合
     * ```ts
     * const minCostFlow = new MinCostFlow(4);
     * const [S, A, B, T] = [0, 1, 2, 3];
     * minCostFlow.addEdge(S, A, 2, 1);
     * minCostFlow.addEdge(S, B, 1, 3);
     * minCostFlow.addEdge(A, B, 1, 0);
     * minCostFlow.addEdge(A, T, 1, 3);
     * minCostFlow.addEdge(B, T, 1, 1);
     * const flowResult = minCostFlow.flow(S, T, 1);
     * console.log(flowResult); // {flow: 1, cost: 2};
     * ```
     *
     * @remarks
     * - `slope()`や`flow()`をあわせて複数回呼んだときの挙動は未定義です
     *
     * @param s - フローの始点
     * @param t - フローの終点
     * @param max - 流量の上限 (デフォルトはInfinity)
     * @returns - `{flow: number, cost: number}`。達成できた最大流量が`flow`で、それを達成する最小コストが`cost`であることを示す
     * @throws {Error} - 頂点`s`と頂点`t`に同一頂点を指定した場合
     */
    flow(s: number, t: number, max: number = Infinity): { flow: number; cost: number } {
        const slopeResult = this.slope(s, t, max);
        return {
            flow: slopeResult.flow.at(-1)!,
            cost: slopeResult.cost.at(-1)!,
        };
    }
}
