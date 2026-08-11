import { describe, expect, it } from "vitest";
import { DirectedGraph, UndirectedGraph, WeightedDirectedGraph, WeightedUndirectedGraph } from "../src/Graphs.ts";

/** seed 固定の疑似乱数生成器 (mulberry32) */
function mulberry32(seed: number): () => number {
    let t = seed >>> 0;
    return () => {
        t = (t + 0x6d2b79f5) >>> 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

/** SCC の成分内・成分間の順序を正規化して比較用にする */
function normalizeSCCs(sccs: number[][]): number[][] {
    return sccs.map((comp) => [...comp].sort((a, b) => a - b)).sort((a, b) => a[0] - b[0]);
}

describe("DirectedGraph の @example", () => {
    it("constructor", () => {
        const graph = new DirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
        expect(graph.edgeCount).toBe(0);
    });

    it("addEdge", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        expect(graph.edgeCount).toBe(1);
        expect(graph.outEdges(0)).toEqual([1]);
    });

    it("outEdges", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        expect(graph.outEdges(0)).toEqual([1, 2]);
    });

    it("outDegree", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        expect(graph.outDegree(0)).toBe(2);
        expect(graph.outDegree(1)).toBe(0);
    });

    it("inDegrees", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        expect(graph.inDegrees()).toEqual([1, 1, 1]);
    });

    it("sortNeighbors", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 2);
        graph.addEdge(0, 1);
        graph.addEdge(2, 0);
        graph.sortNeighbors();
        expect(graph.outEdges(0)).toEqual([1, 2]);
    });

    it("reversed", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        const reversed = graph.reversed();
        expect(reversed.outEdges(0)).toEqual([2]);
        expect(reversed.outEdges(1)).toEqual([0]);
        expect(reversed.outEdges(2)).toEqual([0]);
    });

    it("clone", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        expect(graph.outEdges(0)).toEqual([1, 2]);
        expect(graph.outEdges(1)).toEqual([]);
        expect(graph.outEdges(2)).toEqual([0]);
        const cloned = graph.clone();
        expect(cloned.outEdges(0)).toEqual([1, 2]);
        expect(cloned.outEdges(1)).toEqual([]);
        expect(cloned.outEdges(2)).toEqual([0]);
    });

    it("toCSR", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        const csr = graph.toCSR();
        expect(Array.from(csr.head)).toEqual([0, 2, 2, 3]);
        expect(Array.from(csr.to)).toEqual([1, 2, 0]);
    });

    it("toAdjacencyList", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        const adj = graph.toAdjacencyList();
        expect(adj).toEqual([[1, 2], [], [0]]);
    });

    it("vertexCount", () => {
        const graph = new DirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
    });

    it("edgeCount", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 2);
        graph.addEdge(0, 1);
        expect(graph.edgeCount).toBe(2);
        graph.addEdge(2, 0);
        expect(graph.edgeCount).toBe(3);
    });

    it("static from", () => {
        const raw = [[1, 2], [], [0]];
        const graph = DirectedGraph.from(raw);
        expect(graph.outEdges(0)).toEqual([1, 2]);
        expect(graph.outEdges(1)).toEqual([]);
        expect(graph.outEdges(2)).toEqual([0]);
    });

    it("static wrap", () => {
        const raw = [[1, 2], [], [0]];
        const graph = DirectedGraph.wrap(raw);
        expect(graph.outEdges(0)).toEqual([1, 2]);
        expect(graph.outEdges(1)).toEqual([]);
        expect(graph.outEdges(2)).toEqual([0]);
    });

    it("static getSCC", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 0);
        graph.addEdge(0, 2);
        const scc = DirectedGraph.getSCC(graph);
        expect(normalizeSCCs(scc)).toEqual([[0, 1], [2]]);
    });
});

describe("UndirectedGraph の @example", () => {
    it("constructor", () => {
        const graph = new UndirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
        expect(graph.edgeCount).toBe(0);
    });

    it("addEdge", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        expect(graph.edgeCount).toBe(1);
        expect(graph.neighbors(0)).toEqual([1]);
        expect(graph.neighbors(1)).toEqual([0]);
    });

    it("neighbors", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        expect(graph.neighbors(1)).toEqual([0, 2]);
    });

    it("degree", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        expect(graph.degree(0)).toBe(1);
        expect(graph.degree(1)).toBe(2);
    });

    it("sortNeighbors", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(1, 2);
        graph.addEdge(0, 1);
        graph.sortNeighbors();
        expect(graph.neighbors(1)).toEqual([0, 2]);
    });

    it("clone", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        expect(graph.neighbors(0)).toEqual([1]);
        expect(graph.neighbors(1)).toEqual([0, 2]);
        expect(graph.neighbors(2)).toEqual([1]);
        const cloned = graph.clone();
        expect(cloned.neighbors(0)).toEqual([1]);
        expect(cloned.neighbors(1)).toEqual([0, 2]);
        expect(cloned.neighbors(2)).toEqual([1]);
    });

    it("toCSR", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        const csr = graph.toCSR();
        expect(Array.from(csr.head)).toEqual([0, 1, 3, 4]);
        expect(Array.from(csr.to)).toEqual([1, 0, 2, 1]);
    });

    it("toAdjacencyList", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        const adj = graph.toAdjacencyList();
        expect(adj).toEqual([[1], [0, 2], [1]]);
    });

    it("vertexCount", () => {
        const graph = new UndirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
    });

    it("edgeCount", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        expect(graph.edgeCount).toBe(1);
        graph.addEdge(1, 2);
        expect(graph.edgeCount).toBe(2);
    });

    it("static from", () => {
        const raw = [[1], [0, 2], [1]];
        const graph = UndirectedGraph.from(raw);
        expect(graph.neighbors(0)).toEqual([1]);
        expect(graph.neighbors(1)).toEqual([0, 2]);
        expect(graph.neighbors(2)).toEqual([1]);
    });

    it("static wrap", () => {
        const raw = [[1], [0, 2], [1]];
        const graph = UndirectedGraph.wrap(raw);
        expect(graph.neighbors(0)).toEqual([1]);
        expect(graph.neighbors(1)).toEqual([0, 2]);
        expect(graph.neighbors(2)).toEqual([1]);
    });
});

describe("WeightedDirectedGraph の @example", () => {
    it("constructor", () => {
        const graph = new WeightedDirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
        expect(graph.edgeCount).toBe(0);
    });

    it("addEdge", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        expect(graph.edgeCount).toBe(1);
        expect(graph.outEdges(0)).toEqual([{ to: 1, weight: 4 }]);
    });

    it("outEdges", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        expect(graph.outEdges(0)).toEqual([
            { to: 1, weight: 4 },
            { to: 2, weight: 5 },
        ]);
    });

    it("outDegree", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        expect(graph.outDegree(0)).toBe(2);
        expect(graph.outDegree(1)).toBe(0);
    });

    it("inDegrees", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        expect(graph.inDegrees()).toEqual([1, 1, 1]);
    });

    it("sortNeighbors", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 2, 5);
        graph.addEdge(0, 1, 4);
        graph.addEdge(2, 0, 6);
        graph.sortNeighbors();
        expect(graph.outEdges(0)).toEqual([
            { to: 1, weight: 4 },
            { to: 2, weight: 5 },
        ]);
    });

    it("reversed", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        const reversed = graph.reversed();
        expect(reversed.outEdges(0)).toEqual([{ to: 2, weight: 6 }]);
        expect(reversed.outEdges(1)).toEqual([{ to: 0, weight: 4 }]);
        expect(reversed.outEdges(2)).toEqual([{ to: 0, weight: 5 }]);
    });

    it("clone", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        expect(graph.outEdges(0)).toEqual([
            { to: 1, weight: 4 },
            { to: 2, weight: 5 },
        ]);
        expect(graph.outEdges(1)).toEqual([]);
        expect(graph.outEdges(2)).toEqual([{ to: 0, weight: 6 }]);
        const cloned = graph.clone();
        expect(cloned.outEdges(0)).toEqual([
            { to: 1, weight: 4 },
            { to: 2, weight: 5 },
        ]);
        expect(cloned.outEdges(1)).toEqual([]);
        expect(cloned.outEdges(2)).toEqual([{ to: 0, weight: 6 }]);
    });

    it("toCSR", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        const csr = graph.toCSR();
        expect(Array.from(csr.head)).toEqual([0, 2, 2, 3]);
        expect(Array.from(csr.to)).toEqual([1, 2, 0]);
        expect(csr.weight).toEqual([4, 5, 6]);
    });

    it("toAdjacencyList", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        const adj = graph.toAdjacencyList();
        expect(adj).toEqual([
            [
                { to: 1, weight: 4 },
                { to: 2, weight: 5 },
            ],
            [],
            [{ to: 0, weight: 6 }],
        ]);
    });

    it("vertexCount", () => {
        const graph = new WeightedDirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
    });

    it("edgeCount", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        expect(graph.edgeCount).toBe(2);
        graph.addEdge(2, 0, 6);
        expect(graph.edgeCount).toBe(3);
    });

    it("static from", () => {
        const raw = [
            [
                { to: 1, weight: 4 },
                { to: 2, weight: 5 },
            ],
            [],
            [{ to: 0, weight: 6 }],
        ];
        const graph = WeightedDirectedGraph.from(raw);
        expect(graph.outEdges(0)).toEqual([
            { to: 1, weight: 4 },
            { to: 2, weight: 5 },
        ]);
        expect(graph.outEdges(1)).toEqual([]);
        expect(graph.outEdges(2)).toEqual([{ to: 0, weight: 6 }]);
    });

    it("static wrap", () => {
        const raw = [
            [
                { to: 1, weight: 4 },
                { to: 2, weight: 5 },
            ],
            [],
            [{ to: 0, weight: 6 }],
        ];
        const graph = WeightedDirectedGraph.wrap(raw);
        expect(graph.outEdges(0)).toEqual([
            { to: 1, weight: 4 },
            { to: 2, weight: 5 },
        ]);
        expect(graph.outEdges(1)).toEqual([]);
        expect(graph.outEdges(2)).toEqual([{ to: 0, weight: 6 }]);
    });
});

describe("WeightedUndirectedGraph の @example", () => {
    it("constructor", () => {
        const graph = new WeightedUndirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
        expect(graph.edgeCount).toBe(0);
    });

    it("addEdge", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        expect(graph.edgeCount).toBe(1);
        expect(graph.neighbors(0)).toEqual([{ to: 1, weight: 4 }]);
        expect(graph.neighbors(1)).toEqual([{ to: 0, weight: 4 }]);
    });

    it("neighbors", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        expect(graph.neighbors(1)).toEqual([
            { to: 0, weight: 4 },
            { to: 2, weight: 5 },
        ]);
    });

    it("degree", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        expect(graph.degree(0)).toBe(1);
        expect(graph.degree(1)).toBe(2);
    });

    it("sortNeighbors", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(1, 2, 5);
        graph.addEdge(0, 1, 4);
        graph.sortNeighbors();
        expect(graph.neighbors(1)).toEqual([
            { to: 0, weight: 4 },
            { to: 2, weight: 5 },
        ]);
    });

    it("clone", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        expect(graph.neighbors(0)).toEqual([{ to: 1, weight: 4 }]);
        expect(graph.neighbors(1)).toEqual([
            { to: 0, weight: 4 },
            { to: 2, weight: 5 },
        ]);
        expect(graph.neighbors(2)).toEqual([{ to: 1, weight: 5 }]);
        const cloned = graph.clone();
        expect(cloned.neighbors(0)).toEqual([{ to: 1, weight: 4 }]);
        expect(cloned.neighbors(1)).toEqual([
            { to: 0, weight: 4 },
            { to: 2, weight: 5 },
        ]);
        expect(cloned.neighbors(2)).toEqual([{ to: 1, weight: 5 }]);
    });

    it("toCSR", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        const csr = graph.toCSR();
        expect(Array.from(csr.head)).toEqual([0, 1, 3, 4]);
        expect(Array.from(csr.to)).toEqual([1, 0, 2, 1]);
        expect(csr.weight).toEqual([4, 4, 5, 5]);
    });

    it("toAdjacencyList", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        const adj = graph.toAdjacencyList();
        expect(adj).toEqual([
            [{ to: 1, weight: 4 }],
            [
                { to: 0, weight: 4 },
                { to: 2, weight: 5 },
            ],
            [{ to: 1, weight: 5 }],
        ]);
    });

    it("vertexCount", () => {
        const graph = new WeightedUndirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
    });

    it("edgeCount", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        expect(graph.edgeCount).toBe(1);
        graph.addEdge(1, 2, 5);
        expect(graph.edgeCount).toBe(2);
    });

    it("static from", () => {
        const raw = [
            [{ to: 1, weight: 4 }],
            [
                { to: 0, weight: 4 },
                { to: 2, weight: 5 },
            ],
            [{ to: 1, weight: 5 }],
        ];
        const graph = WeightedUndirectedGraph.from(raw);
        expect(graph.neighbors(0)).toEqual([{ to: 1, weight: 4 }]);
        expect(graph.neighbors(1)).toEqual([
            { to: 0, weight: 4 },
            { to: 2, weight: 5 },
        ]);
        expect(graph.neighbors(2)).toEqual([{ to: 1, weight: 5 }]);
    });

    it("static wrap", () => {
        const raw = [
            [{ to: 1, weight: 4 }],
            [
                { to: 0, weight: 4 },
                { to: 2, weight: 5 },
            ],
            [{ to: 1, weight: 5 }],
        ];
        const graph = WeightedUndirectedGraph.wrap(raw);
        expect(graph.neighbors(0)).toEqual([{ to: 1, weight: 4 }]);
        expect(graph.neighbors(1)).toEqual([
            { to: 0, weight: 4 },
            { to: 2, weight: 5 },
        ]);
        expect(graph.neighbors(2)).toEqual([{ to: 1, weight: 5 }]);
    });
});

describe("自己ループを含む無向グラフ", () => {
    it("UndirectedGraph: edgeCount / degree / toCSR.to.length", () => {
        const g = new UndirectedGraph(2);
        g.addEdge(0, 1);
        g.addEdge(1, 1);
        expect(g.edgeCount).toBe(2);
        expect(g.degree(1)).toBe(2); // 0 への辺 + 自己ループ
        const selfLoopCount = 1;
        const csr = g.toCSR();
        expect(csr.to.length).toBe(2 * g.edgeCount - selfLoopCount);
    });

    it("WeightedUndirectedGraph: edgeCount / degree / toCSR.to.length", () => {
        const g = new WeightedUndirectedGraph(2);
        g.addEdge(0, 1, 4);
        g.addEdge(1, 1, 10);
        expect(g.edgeCount).toBe(2);
        expect(g.degree(1)).toBe(2); // 0 への辺 + 自己ループ
        const selfLoopCount = 1;
        const csr = g.toCSR();
        expect(csr.to.length).toBe(2 * g.edgeCount - selfLoopCount);
    });
});

describe("clone() の辺数引き継ぎ", () => {
    it("UndirectedGraph", () => {
        const g = new UndirectedGraph(4);
        g.addEdge(0, 1);
        g.addEdge(1, 2);
        g.addEdge(2, 3);
        g.addEdge(1, 1);
        const cloned = g.clone();
        expect(cloned.edgeCount).toBe(g.edgeCount);
    });

    it("WeightedUndirectedGraph", () => {
        const g = new WeightedUndirectedGraph(4);
        g.addEdge(0, 1, 1);
        g.addEdge(1, 2, 2);
        g.addEdge(2, 3, 3);
        g.addEdge(1, 1, 9);
        const cloned = g.clone();
        expect(cloned.edgeCount).toBe(g.edgeCount);
    });
});

describe("DirectedGraph.getSCC の追加ケース", () => {
    it("基本ケース: {0,1,2} と {3}", () => {
        const g = new DirectedGraph(4);
        g.addEdge(0, 1);
        g.addEdge(1, 2);
        g.addEdge(2, 0);
        g.addEdge(2, 3);
        const sccs = DirectedGraph.getSCC(g);
        expect(normalizeSCCs(sccs)).toEqual([[0, 1, 2], [3]]);
    });

    it("トポロジカル順保証 (ランダム有向グラフ)", () => {
        const n = 100;
        const m = 300;
        const rand = mulberry32(20260812);
        const g = new DirectedGraph(n);
        const edges: [number, number][] = [];
        for (let i = 0; i < m; i++) {
            const u = Math.floor(rand() * n);
            const v = Math.floor(rand() * n);
            g.addEdge(u, v);
            edges.push([u, v]);
        }
        const sccs = DirectedGraph.getSCC(g);
        // oxlint-disable-next-line unicorn/no-new-array
        const groupIndex = new Array<number>(n);
        sccs.forEach((comp, idx) => {
            for (const v of comp) groupIndex[v] = idx;
        });
        for (const [u, v] of edges) {
            expect(groupIndex[u]).toBeLessThanOrEqual(groupIndex[v]);
        }
    });

    it("大規模パスグラフでもスタックオーバーフローせず完了する", () => {
        const n = 100_000;
        const g = new DirectedGraph(n);
        for (let i = 0; i < n - 1; i++) g.addEdge(i, i + 1);
        const sccs = DirectedGraph.getSCC(g);
        expect(sccs.length).toBe(n);
    });
});

describe("CSR と隣接リストの一致", () => {
    it("DirectedGraph", () => {
        const g = new DirectedGraph(3);
        g.addEdge(0, 1);
        g.addEdge(0, 2);
        g.addEdge(2, 0);
        const { head, to } = g.toCSR();
        const collected: number[][] = [];
        for (let u = 0; u < g.vertexCount; u++) {
            collected[u] = [];
            for (let i = head[u]; i < head[u + 1]; i++) {
                collected[u].push(to[i]);
            }
        }
        expect(collected).toEqual(g.toAdjacencyList());
    });

    it("UndirectedGraph", () => {
        const g = new UndirectedGraph(3);
        g.addEdge(0, 1);
        g.addEdge(1, 2);
        const { head, to } = g.toCSR();
        const collected: number[][] = [];
        for (let u = 0; u < g.vertexCount; u++) {
            collected[u] = [];
            for (let i = head[u]; i < head[u + 1]; i++) {
                collected[u].push(to[i]);
            }
        }
        expect(collected).toEqual(g.toAdjacencyList());
    });

    it("WeightedDirectedGraph", () => {
        const g = new WeightedDirectedGraph(3);
        g.addEdge(0, 1, 4);
        g.addEdge(0, 2, 5);
        g.addEdge(2, 0, 6);
        const { head, to, weight } = g.toCSR();
        const collected: { to: number; weight: number }[][] = [];
        for (let u = 0; u < g.vertexCount; u++) {
            collected[u] = [];
            for (let i = head[u]; i < head[u + 1]; i++) {
                collected[u].push({ to: to[i], weight: weight[i] });
            }
        }
        expect(collected).toEqual(g.toAdjacencyList());
    });

    it("WeightedUndirectedGraph", () => {
        const g = new WeightedUndirectedGraph(3);
        g.addEdge(0, 1, 4);
        g.addEdge(1, 2, 5);
        const { head, to, weight } = g.toCSR();
        const collected: { to: number; weight: number }[][] = [];
        for (let u = 0; u < g.vertexCount; u++) {
            collected[u] = [];
            for (let i = head[u]; i < head[u + 1]; i++) {
                collected[u].push({ to: to[i], weight: weight[i] });
            }
        }
        expect(collected).toEqual(g.toAdjacencyList());
    });

    it("UndirectedGraph (自己ループあり)", () => {
        const g = new UndirectedGraph(2);
        g.addEdge(0, 1);
        g.addEdge(1, 1);
        const { head, to } = g.toCSR();
        const collected: number[][] = [];
        for (let u = 0; u < g.vertexCount; u++) {
            collected[u] = [];
            for (let i = head[u]; i < head[u + 1]; i++) {
                collected[u].push(to[i]);
            }
        }
        expect(collected).toEqual(g.toAdjacencyList());
    });

    it("WeightedUndirectedGraph (自己ループあり)", () => {
        const g = new WeightedUndirectedGraph(2);
        g.addEdge(0, 1, 4);
        g.addEdge(1, 1, 10);
        const { head, to, weight } = g.toCSR();
        const collected: { to: number; weight: number }[][] = [];
        for (let u = 0; u < g.vertexCount; u++) {
            collected[u] = [];
            for (let i = head[u]; i < head[u + 1]; i++) {
                collected[u].push({ to: to[i], weight: weight[i] });
            }
        }
        expect(collected).toEqual(g.toAdjacencyList());
    });
});

describe("from / wrap の自己ループカウント", () => {
    it("UndirectedGraph.from", () => {
        const raw = [[1], [0, 1]];
        const graph = UndirectedGraph.from(raw);
        expect(graph.edgeCount).toBe(2);
    });

    it("UndirectedGraph.wrap", () => {
        const raw = [[1], [0, 1]];
        const graph = UndirectedGraph.wrap(raw);
        expect(graph.edgeCount).toBe(2);
    });

    it("WeightedUndirectedGraph.from", () => {
        const raw = [
            [{ to: 1, weight: 4 }],
            [
                { to: 0, weight: 4 },
                { to: 1, weight: 5 },
            ],
        ];
        const graph = WeightedUndirectedGraph.from(raw);
        expect(graph.edgeCount).toBe(2);
    });

    it("WeightedUndirectedGraph.wrap", () => {
        const raw = [
            [{ to: 1, weight: 4 }],
            [
                { to: 0, weight: 4 },
                { to: 1, weight: 5 },
            ],
        ];
        const graph = WeightedUndirectedGraph.wrap(raw);
        expect(graph.edgeCount).toBe(2);
    });
});

describe("コンストラクタの引数検証", () => {
    it("DirectedGraph: 0 / 非整数は RangeError", () => {
        expect(() => new DirectedGraph(0)).toThrow(RangeError);
        expect(() => new DirectedGraph(2.5)).toThrow(RangeError);
    });

    it("UndirectedGraph: 0 / 非整数は RangeError", () => {
        expect(() => new UndirectedGraph(0)).toThrow(RangeError);
        expect(() => new UndirectedGraph(2.5)).toThrow(RangeError);
    });

    it("WeightedDirectedGraph: 0 / 非整数は RangeError", () => {
        expect(() => new WeightedDirectedGraph(0)).toThrow(RangeError);
        expect(() => new WeightedDirectedGraph(2.5)).toThrow(RangeError);
    });

    it("WeightedUndirectedGraph: 0 / 非整数は RangeError", () => {
        expect(() => new WeightedUndirectedGraph(0)).toThrow(RangeError);
        expect(() => new WeightedUndirectedGraph(2.5)).toThrow(RangeError);
    });
});
