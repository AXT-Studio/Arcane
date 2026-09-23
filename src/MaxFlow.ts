// ================================================================
// Import
// ================================================================

import { Deque } from "./Deque";

// ================================================================
// Exports
// ================================================================

/**
 * Dinic's algorithm を用いて最大流問題を解くためのクラスです。
 */
export class MaxFlow {
    /** v_size := グラフの頂点数 */
    #v_size: number;
    /** dest[i][j] := 残余グラフにおいて、頂点`i`から出る`j`番目の辺がどの頂点に向かう辺か？ */
    #dest: number[][];
    /** revIndex[i][j] := 残余グラフにおいて、頂点`i`から出る`j`番目の辺の逆辺は、頂点`dest[i][j]`の何番目の辺か？ */
    #revIndex: number[][];
    /** remainCap[i][j] := 残余グラフにおいて、頂点`i`から出る`j`番目の辺の残余容量はいくつか？ */
    #remainCap: number[][];
    /** publicIndex_from[i] := addEdge()によって追加された`i`番目の辺は、どの頂点から出ている辺か？ */
    #publicIndex_from: number[];
    /** publicIndex_idx[i] := addEdge()によって追加された`i`番目の辺は、頂点`publicIndex_from[i]`から出る何番目の辺か？ */
    #publicIndex_idx: number[];

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
     */
    constructor(n: number) {
        this.#v_size = n;
        this.#dest = Array.from({ length: n }, () => []);
        this.#revIndex = Array.from({ length: n }, () => []);
        this.#remainCap = Array.from({ length: n }, () => []);
        this.#publicIndex_from = [];
        this.#publicIndex_idx = [];
    }

    /**
     * フローネットワークに、頂点`from`から頂点`to`への容量`cap`の辺を追加します。
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
     * @returns 何番目に追加された辺か (0-indexed, getEdgeやchangeEdgeの引数として使用される)
     */
    addEdge(from: number, to: number, cap: number): number {
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
        // 逆辺を記録に追加
        this.#dest[to][reverseEdge_idx] = from;
        this.#revIndex[to][reverseEdge_idx] = forwardEdge_idx;
        this.#remainCap[to][reverseEdge_idx] = 0;
        // 公開indexを返す
        return publicIndex;
    }

    /**
     * 現在のフローネットワーク(流れ)に対して、頂点`s`から頂点`t`への流量が最大になるようにフローを作ります。
     * (ただし、`max`を指定した場合は`s`→`t`の流量が`max`になった時点でフローの編集を終了します。)
     *
     * 時間計算量: O(V^2 * E) (Vは頂点数、Eは辺数)
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(4);
     * maxFlow.addEdge(0, 1, 2);
     * maxFlow.addEdge(0, 2, 1);
     * maxFlow.addEdge(1, 3, 1);
     * maxFlow.addEdge(2, 3, 1);
     * const flow = maxFlow.flow(0, 3);
     * console.log(flow); // => 2 (0->1->3で1、0->2->3で1の流量を流せるので、合計2)
     * ```
     *
     * @param s - 流量の始点
     * @param t - 流量の終点
     * @param max - 流量の上限 (デフォルトはInfinity)
     * @returns 点sから点tへ(追加で)流せた流量 (その流量を流すようなフローの詳細はflow()実行後にminCut()やgetEdge()などで取得可能)
     */
    flow(s: number, t: number, max: number = Infinity): number {
        /** 現在のs→tの流量 */
        let currentFlow_s_t = 0;
        levelLoop: while (true) {
            // BFSで残余容量が正の辺だけをたどり、各頂点のlevelを決定する
            const currentLevel = Array.from({ length: this.#v_size }, () => -1);
            currentLevel[s] = 0;
            const queue = new Deque<number>();
            queue.push(s);
            while (queue.size > 0) {
                const target = queue.shift()!;
                for (let j = 0; j < this.#dest[target].length; j++) {
                    const next = this.#dest[target][j];
                    if (this.#remainCap[target][j] > 0 && currentLevel[next] < 0) {
                        currentLevel[next] = currentLevel[target] + 1;
                        queue.push(next);
                    }
                }
            }
            // s→tに残余容量が正の辺だけで到達不可能な場合はtのlevelが-1になっていて、そのときはもう流せないのでbreak
            if (currentLevel[t] === -1) break;
            // levelが1ずつ増えるような、残余容量が正の辺のみで構成されるs→tのパス(増加道)を見つけてそこに流す
            /** currentEdgeIndex[i] := 今考えているパス(最後に考えたパス)において、頂点`i`の何番目の辺を通ることを考えているか？(先頭いくつの辺の探索を飛ばして良いか？) */
            const currentEdgeIndex = Array.from({ length: this.#v_size }, () => 0);
            searchLoop: while (true) {
                // もしもうmaxまで流しきってたらその時点でおわり！
                if (max <= currentFlow_s_t) break levelLoop;
                /** 今試しているパス (通る辺がどの頂点から出ているかだけ保存すれば、currentEdgeIndexを使って辺は復元できる) */
                const stack: number[] = [s];
                while (stack.length > 0) {
                    const targetFrom = stack.at(-1)!;
                    // 頂点tに到達していたら、今のstackが表すパスに流せるだけ流してDFSをやり直し
                    if (targetFrom === t) {
                        // 実際そのパスにどれだけ流せるかを求める
                        let neckFlow = Infinity;
                        stack.pop()!;
                        for (const edgeFrom of stack) {
                            neckFlow = Math.min(neckFlow, this.#remainCap[edgeFrom][currentEdgeIndex[edgeFrom]]);
                        }
                        neckFlow = Math.min(neckFlow, max - currentFlow_s_t);
                        // 残余グラフを更新
                        for (const edgeFrom of stack) {
                            const edgeIdx = currentEdgeIndex[edgeFrom];
                            this.#remainCap[edgeFrom][edgeIdx] -= neckFlow;
                            const revFrom = this.#dest[edgeFrom][edgeIdx];
                            this.#remainCap[revFrom][this.#revIndex[edgeFrom][edgeIdx]] += neckFlow;
                        }
                        currentFlow_s_t += neckFlow;
                        // リセット！
                        continue searchLoop;
                    }
                    // もしその頂点のすべての辺を見終わっていたらその頂点は見終わったことにして良くて、次は今のstackの末尾の頂点の次の辺を見る
                    if (currentEdgeIndex[targetFrom] >= this.#dest[targetFrom].length) {
                        if (stack.at(-1) === s) break searchLoop; // 頂点sを見終わった場合はDFSループ自体を抜ける
                        stack.pop();
                        currentEdgeIndex[stack.at(-1)!]++;
                        continue;
                    }
                    // 見る辺が条件(その辺の残余容量が生、次に見る頂点のlevelが+1になる)を満たさないなら、さっさと次の辺を見る
                    const edgeIdx = currentEdgeIndex[targetFrom];
                    if (
                        this.#remainCap[targetFrom][edgeIdx] === 0 ||
                        currentLevel[targetFrom] + 1 !== currentLevel[this.#dest[targetFrom][edgeIdx]]
                    ) {
                        currentEdgeIndex[targetFrom]++;
                        continue;
                    }
                    // 条件を満たす場合はスタックに積んで次に行ってみる
                    stack.push(this.#dest[targetFrom][edgeIdx]);
                    continue;
                }
            }
        }
        return currentFlow_s_t;
    }

    /**
     * 頂点`i`(0 <= i < n)について、頂点`i`が、最小カットの`s`側の頂点集合に所属するかを取得します。
     * すなわち、(残余グラフにおいて)頂点`s`から頂点`i`まで(残余容量が正の辺だけを通って)到達可能かを返す配列を返します。
     *
     * 時間計算量: O(V + E) (Vは頂点数、Eは辺数)
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
     * @returns 頂点`i`(0 <= i < n)について、頂点`i`が、最小カットの`s`側の頂点集合に所属するかを表す配列
     */
    minCut(s: number): boolean[] {
        const isReachable = Array.from({ length: this.#v_size }, () => false);
        const stack: number[] = [];
        stack.push(s);
        isReachable[s] = true;
        while (stack.length > 0) {
            const target = stack.pop()!;
            for (let j = 0; j < this.#dest[target].length; j++) {
                const next = this.#dest[target][j];
                if (this.#remainCap[target][j] > 0 && !isReachable[next]) {
                    isReachable[next] = true;
                    stack.push(next);
                }
            }
        }
        return isReachable;
    }

    /**
     * `i`番目に追加された辺の情報(辺が結ぶ頂点、辺の容量、現在の流量)を返します。
     * 戻り値は、`i`番目の辺が、頂点`from`から`to`を結ぶ容量`cap`の辺で、現在の流量が`flow`であることを表します。
     *
     * 時間計算量: O(1)
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
     * @returns - `i`番目に追加された辺の情報。`i`番目の辺が、頂点`from`から`to`を結ぶ容量`cap`の辺で、現在の流量が`flow`であることを表す。
     */
    getEdge(i: number): { from: number; to: number; cap: number; flow: number } {
        const from = this.#publicIndex_from[i];
        const idx = this.#publicIndex_idx[i];
        const to = this.#dest[from][idx];
        const revIdx = this.#revIndex[from][idx];
        const remainCap_forward = this.#remainCap[from][idx];
        const remainCap_reverse = this.#remainCap[to][revIdx];
        return {
            from,
            to,
            cap: remainCap_forward + remainCap_reverse,
            flow: remainCap_reverse,
        };
    }

    /**
     * すべての辺の情報(辺が結ぶ頂点、辺の容量、現在の流量)を、追加された順番で返します。
     * 戻り値の`i`番目の要素は、`i`番目に追加された辺が、頂点`from`から`to`を結ぶ容量`cap`の辺で、現在の流量が`flow`であることを表します。
     *
     * 時間計算量: O(E) (Eは辺の数)
     *
     * @example
     * ```ts
     * const maxFlow = new MaxFlow(3);
     * maxFlow.addEdge(0, 1, 3);
     * maxFlow.addEdge(1, 2, 2);
     * maxFlow.flow(0, 2);
     * console.log(maxFlow.getEdges()); // [{ from: 0, to: 1, cap: 3, flow: 2 }, { from: 1, to: 2, cap: 2, flow: 2 }]
     * ```
     *
     * @returns - 追加された辺の情報。戻り値の`i`番目の要素は、`i`番目に追加された辺が、頂点`from`から`to`を結ぶ容量`cap`の辺で、現在の流量が`flow`であることを表す。
     */
    getEdges(): { from: number; to: number; cap: number; flow: number }[] {
        const edges: { from: number; to: number; cap: number; flow: number }[] = [];
        for (let i = 0; i < this.#publicIndex_from.length; i++) {
            edges.push(this.getEdge(i));
        }
        return edges;
    }

    /**
     * `i`番目に追加した辺の容量を`cap`に、流量を`flow`に(強制的に)変更します。
     * なお、このメソッドは値の整合性を自動検証しません。通常は`0 <= flow <= cap`となるように値を指定してください。
     *
     * 時間計算量: O(1)
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
     * @param cap - 変更後の辺の容量
     * @param flow - 変更後の辺の流量
     */
    changeEdge(i: number, cap: number, flow: number): void {
        const from = this.#publicIndex_from[i];
        const idx = this.#publicIndex_idx[i];
        const to = this.#dest[from][idx];
        const revIdx = this.#revIndex[from][idx];
        const remainCap_forward = cap - flow;
        const remainCap_reverse = flow;
        this.#remainCap[from][idx] = remainCap_forward;
        this.#remainCap[to][revIdx] = remainCap_reverse;
    }
}
