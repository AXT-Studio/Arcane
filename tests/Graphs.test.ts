import { describe, expect, it } from "vitest";
import { DirectedGraph, UndirectedGraph, WeightedDirectedGraph, WeightedUndirectedGraph } from "../src/Graphs.ts";

describe("DirectedGraph - JSDoc @example", () => {
    it("new DirectedGraph()", () => {
        expect(() => {
            const _graph = new DirectedGraph(3);
        }).not.toThrow();
    });
    it("addEdge()", () => {
        expect(() => {
            const graph = new DirectedGraph(3);
            graph.addEdge(0, 1);
        }).not.toThrow();
    });
    it("outEdges()", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        expect(graph.outEdges(0)).toEqual([1, 2]);
    });
    it("outDegree()", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        expect(graph.outDegree(0)).toBe(2);
        expect(graph.outDegree(1)).toBe(0);
    });
    it("inDegrees()", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        expect(graph.inDegrees()).toEqual([1, 1, 1]);
    });
    it("sortNeighbors()", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 2);
        graph.addEdge(0, 1);
        graph.addEdge(2, 0);
        expect([
            [2, 1],
            [1, 2],
        ]).toContainEqual([...graph.outEdges(0)]);
        graph.sortNeighbors();
        expect(graph.outEdges(0)).toEqual([1, 2]);
    });
    it("reversed()", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        const reversed = graph.reversed();
        expect(reversed.outEdges(0)).toEqual([2]);
        expect(reversed.outEdges(1)).toEqual([0]);
        expect(reversed.outEdges(2)).toEqual([0]);
    });
    it("clone()", () => {
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
    it("toCSR()", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        const csr = graph.toCSR();
        expect(Array.from(csr.head)).toEqual([0, 2, 2, 3]);
        expect(Array.from(csr.to)).toEqual([1, 2, 0]);
    });
    it("toAdjacencyList()", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(0, 2);
        graph.addEdge(2, 0);
        expect(graph.toAdjacencyList()).toEqual([[1, 2], [], [0]]);
    });
    it("get vertexCount", () => {
        const graph = new DirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
    });
    it("get edgeCount", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 2);
        graph.addEdge(0, 1);
        expect(graph.edgeCount).toBe(2);
        graph.addEdge(2, 0);
        expect(graph.edgeCount).toBe(3);
    });
    it("DirectedGraph.from()", () => {
        const raw = [[1, 2], [], [0]];
        const graph = DirectedGraph.from(raw);
        expect(graph.outEdges(0)).toEqual([1, 2]);
        expect(graph.outEdges(1)).toEqual([]);
        expect(graph.outEdges(2)).toEqual([0]);
    });
    it("DirectedGraph.wrap()", () => {
        const raw = [[1, 2], [], [0]];
        const graph = DirectedGraph.wrap(raw);
        expect(graph.outEdges(0)).toEqual([1, 2]);
        expect(graph.outEdges(1)).toEqual([]);
        expect(graph.outEdges(2)).toEqual([0]);
    });
    it("DirectedGraph.getSCC()", () => {
        const graph = new DirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 0);
        graph.addEdge(0, 2);
        const scc = DirectedGraph.getSCC(graph);
        expect(scc.map((comp) => [...comp].sort((a, b) => a - b))).toEqual([[0, 1], [2]]);
    });
});

describe("UndirectedGraph - JSDoc @example", () => {
    it("new UndirectedGraph()", () => {
        expect(() => {
            const _graph = new UndirectedGraph(3);
        }).not.toThrow();
    });
    it("addEdge()", () => {
        expect(() => {
            const graph = new UndirectedGraph(3);
            graph.addEdge(0, 1);
        }).not.toThrow();
    });
    it("neighbors()", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        expect(graph.neighbors(1)).toEqual([0, 2]);
    });
    it("degree()", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        expect(graph.degree(0)).toBe(1);
        expect(graph.degree(1)).toBe(2);
    });
    it("sortNeighbors()", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(1, 2);
        graph.addEdge(0, 1);
        expect([
            [2, 0],
            [0, 2],
        ]).toContainEqual([...graph.neighbors(1)]);
        graph.sortNeighbors();
        expect(graph.neighbors(1)).toEqual([0, 2]);
    });
    it("clone()", () => {
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
    it("toCSR()", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        const csr = graph.toCSR();
        expect(Array.from(csr.head)).toEqual([0, 1, 3, 4]);
        expect(Array.from(csr.to)).toEqual([1, 0, 2, 1]);
    });
    it("toAdjacencyList()", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        graph.addEdge(1, 2);
        expect(graph.toAdjacencyList()).toEqual([[1], [0, 2], [1]]);
    });
    it("get vertexCount", () => {
        const graph = new UndirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
    });
    it("get edgeCount", () => {
        const graph = new UndirectedGraph(3);
        graph.addEdge(0, 1);
        expect(graph.edgeCount).toBe(1);
        graph.addEdge(1, 2);
        expect(graph.edgeCount).toBe(2);
    });
    it("UndirectedGraph.from()", () => {
        const raw = [[1], [0, 2], [1]];
        const graph = UndirectedGraph.from(raw);
        expect(graph.neighbors(0)).toEqual([1]);
        expect(graph.neighbors(1)).toEqual([0, 2]);
        expect(graph.neighbors(2)).toEqual([1]);
    });
    it("UndirectedGraph.wrap()", () => {
        const raw = [[1], [0, 2], [1]];
        const graph = UndirectedGraph.wrap(raw);
        expect(graph.neighbors(0)).toEqual([1]);
        expect(graph.neighbors(1)).toEqual([0, 2]);
        expect(graph.neighbors(2)).toEqual([1]);
    });
});

describe("WeightedDirectedGraph - JSDoc @example", () => {
    it("new WeightedDirectedGraph()", () => {
        expect(() => {
            const _graph = new WeightedDirectedGraph(3);
        }).not.toThrow();
    });
    it("addEdge()", () => {
        expect(() => {
            const graph = new WeightedDirectedGraph(3);
            graph.addEdge(0, 1, 4);
        }).not.toThrow();
    });
    it("outEdges()", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        expect(graph.outEdges(0)).toEqual([
            { to: 1, weight: 4 },
            { to: 2, weight: 5 },
        ]);
    });
    it("outDegree()", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        expect(graph.outDegree(0)).toBe(2);
        expect(graph.outDegree(1)).toBe(0);
    });
    it("inDegrees()", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        expect(graph.inDegrees()).toEqual([1, 1, 1]);
    });
    it("sortNeighbors()", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 2, 5);
        graph.addEdge(0, 1, 4);
        graph.addEdge(2, 0, 6);
        expect([
            [
                { to: 2, weight: 5 },
                { to: 1, weight: 4 },
            ],
            [
                { to: 1, weight: 4 },
                { to: 2, weight: 5 },
            ],
        ]).toContainEqual([...graph.outEdges(0)]);
        graph.sortNeighbors();
        expect(graph.outEdges(0)).toEqual([
            { to: 1, weight: 4 },
            { to: 2, weight: 5 },
        ]);
    });
    it("reversed()", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        const reversed = graph.reversed();
        expect(reversed.outEdges(0)).toEqual([{ to: 2, weight: 6 }]);
        expect(reversed.outEdges(1)).toEqual([{ to: 0, weight: 4 }]);
        expect(reversed.outEdges(2)).toEqual([{ to: 0, weight: 5 }]);
    });
    it("clone()", () => {
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
    it("toCSR()", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        const csr = graph.toCSR();
        expect(Array.from(csr.head)).toEqual([0, 2, 2, 3]);
        expect(Array.from(csr.to)).toEqual([1, 2, 0]);
        expect(csr.weight).toEqual([4, 5, 6]);
    });
    it("toAdjacencyList()", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        graph.addEdge(2, 0, 6);
        expect(graph.toAdjacencyList()).toEqual([
            [
                { to: 1, weight: 4 },
                { to: 2, weight: 5 },
            ],
            [],
            [{ to: 0, weight: 6 }],
        ]);
    });
    it("get vertexCount", () => {
        const graph = new WeightedDirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
    });
    it("get edgeCount", () => {
        const graph = new WeightedDirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(0, 2, 5);
        expect(graph.edgeCount).toBe(2);
        graph.addEdge(2, 0, 6);
        expect(graph.edgeCount).toBe(3);
    });
    it("WeightedDirectedGraph.from()", () => {
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
    it("WeightedDirectedGraph.wrap()", () => {
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

describe("WeightedUndirectedGraph - JSDoc @example", () => {
    it("new WeightedUndirectedGraph()", () => {
        expect(() => {
            const _graph = new WeightedUndirectedGraph(3);
        }).not.toThrow();
    });
    it("addEdge()", () => {
        expect(() => {
            const graph = new WeightedUndirectedGraph(3);
            graph.addEdge(0, 1, 4);
        }).not.toThrow();
    });
    it("neighbors()", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        expect(graph.neighbors(1)).toEqual([
            { to: 0, weight: 4 },
            { to: 2, weight: 5 },
        ]);
    });
    it("degree()", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        expect(graph.degree(0)).toBe(1);
        expect(graph.degree(1)).toBe(2);
    });
    it("sortNeighbors()", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(1, 2, 5);
        graph.addEdge(0, 1, 4);
        expect([
            [
                { to: 2, weight: 5 },
                { to: 0, weight: 4 },
            ],
            [
                { to: 0, weight: 4 },
                { to: 2, weight: 5 },
            ],
        ]).toContainEqual([...graph.neighbors(1)]);
        graph.sortNeighbors();
        expect(graph.neighbors(1)).toEqual([
            { to: 0, weight: 4 },
            { to: 2, weight: 5 },
        ]);
    });
    it("clone()", () => {
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
    it("toCSR()", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        const csr = graph.toCSR();
        expect(Array.from(csr.head)).toEqual([0, 1, 3, 4]);
        expect(Array.from(csr.to)).toEqual([1, 0, 2, 1]);
        expect(csr.weight).toEqual([4, 4, 5, 5]);
    });
    it("toAdjacencyList()", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        graph.addEdge(1, 2, 5);
        expect(graph.toAdjacencyList()).toEqual([
            [{ to: 1, weight: 4 }],
            [
                { to: 0, weight: 4 },
                { to: 2, weight: 5 },
            ],
            [{ to: 1, weight: 5 }],
        ]);
    });
    it("get vertexCount", () => {
        const graph = new WeightedUndirectedGraph(3);
        expect(graph.vertexCount).toBe(3);
    });
    it("get edgeCount", () => {
        const graph = new WeightedUndirectedGraph(3);
        graph.addEdge(0, 1, 4);
        expect(graph.edgeCount).toBe(1);
        graph.addEdge(1, 2, 5);
        expect(graph.edgeCount).toBe(2);
    });
    it("WeightedUndirectedGraph.from()", () => {
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
    it("WeightedUndirectedGraph.wrap()", () => {
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

describe("DirectedGraph - Edge Cases", () => {
    it("new DirectedGraph()はvertexCountが0のときRangeError", () => {
        expect(() => new DirectedGraph(0)).toThrow(RangeError);
    });
    it("new DirectedGraph()はvertexCountが非整数のときRangeError", () => {
        expect(() => new DirectedGraph(2.5)).toThrow(RangeError);
    });
    it("getSCC()は長さ10万のパスでも完了し、成分数は頂点数", () => {
        const n = 100_000;
        const g = new DirectedGraph(n);
        for (let i = 0; i < n - 1; i++) g.addEdge(i, i + 1);
        const sccs = DirectedGraph.getSCC(g);
        expect(sccs.length).toBe(n);
    });
});

describe("UndirectedGraph - Edge Cases", () => {
    it("new UndirectedGraph()はvertexCountが0のときRangeError", () => {
        expect(() => new UndirectedGraph(0)).toThrow(RangeError);
    });
    it("new UndirectedGraph()はvertexCountが非整数のときRangeError", () => {
        expect(() => new UndirectedGraph(2.5)).toThrow(RangeError);
    });
    it("edgeCount, degree(), toCSR()は自己ループを1本として数える", () => {
        const g = new UndirectedGraph(2);
        g.addEdge(0, 1);
        g.addEdge(1, 1);
        expect(g.edgeCount).toBe(2);
        expect(g.degree(1)).toBe(2); // 0 への辺 + 自己ループ
        const selfLoopCount = 1;
        const csr = g.toCSR();
        expect(csr.to.length).toBe(2 * g.edgeCount - selfLoopCount);
    });
    it("clone()は自己ループを含むedgeCountを引き継ぐ", () => {
        const g = new UndirectedGraph(4);
        g.addEdge(0, 1);
        g.addEdge(1, 2);
        g.addEdge(2, 3);
        g.addEdge(1, 1);
        const cloned = g.clone();
        expect(cloned.edgeCount).toBe(g.edgeCount);
    });
    it("from()は自己ループを1本としてedgeCountに数える", () => {
        const raw = [[1], [0, 1]];
        const graph = UndirectedGraph.from(raw);
        expect(graph.edgeCount).toBe(2);
    });
    it("wrap()は自己ループを1本としてedgeCountに数える", () => {
        const raw = [[1], [0, 1]];
        const graph = UndirectedGraph.wrap(raw);
        expect(graph.edgeCount).toBe(2);
    });
});

describe("WeightedDirectedGraph - Edge Cases", () => {
    it("new WeightedDirectedGraph()はvertexCountが0のときRangeError", () => {
        expect(() => new WeightedDirectedGraph(0)).toThrow(RangeError);
    });
    it("new WeightedDirectedGraph()はvertexCountが非整数のときRangeError", () => {
        expect(() => new WeightedDirectedGraph(2.5)).toThrow(RangeError);
    });
});

describe("WeightedUndirectedGraph - Edge Cases", () => {
    it("new WeightedUndirectedGraph()はvertexCountが0のときRangeError", () => {
        expect(() => new WeightedUndirectedGraph(0)).toThrow(RangeError);
    });
    it("new WeightedUndirectedGraph()はvertexCountが非整数のときRangeError", () => {
        expect(() => new WeightedUndirectedGraph(2.5)).toThrow(RangeError);
    });
    it("edgeCount, degree(), toCSR()は自己ループを1本として数える", () => {
        const g = new WeightedUndirectedGraph(2);
        g.addEdge(0, 1, 4);
        g.addEdge(1, 1, 10);
        expect(g.edgeCount).toBe(2);
        expect(g.degree(1)).toBe(2); // 0 への辺 + 自己ループ
        const selfLoopCount = 1;
        const csr = g.toCSR();
        expect(csr.to.length).toBe(2 * g.edgeCount - selfLoopCount);
    });
    it("clone()は自己ループを含むedgeCountを引き継ぐ", () => {
        const g = new WeightedUndirectedGraph(4);
        g.addEdge(0, 1, 1);
        g.addEdge(1, 2, 2);
        g.addEdge(2, 3, 3);
        g.addEdge(1, 1, 9);
        const cloned = g.clone();
        expect(cloned.edgeCount).toBe(g.edgeCount);
    });
    it("from()は自己ループを1本としてedgeCountに数える", () => {
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
    it("wrap()は自己ループを1本としてedgeCountに数える", () => {
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

describe("DirectedGraph - Random Tests", () => {
    it("getSCC()について、ランダムな有向グラフで縮約DAGがトポロジカル順であることを確認", () => {
        const n = 100;
        const m = 300;
        const g = new DirectedGraph(n);
        const edges: [number, number][] = [];
        for (let i = 0; i < m; i++) {
            const u = Math.floor(Math.random() * n);
            const v = Math.floor(Math.random() * n);
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
});

describe("DirectedGraph - Scenario Tests", () => {
    it("getSCC()は{0,1,2}と{3}に分ける", () => {
        const g = new DirectedGraph(4);
        g.addEdge(0, 1);
        g.addEdge(1, 2);
        g.addEdge(2, 0);
        g.addEdge(2, 3);
        const sccs = DirectedGraph.getSCC(g);
        expect(sccs.map((comp) => [...comp].sort((a, b) => a - b)).sort((a, b) => a[0] - b[0])).toEqual([
            [0, 1, 2],
            [3],
        ]);
    });
    it("toCSR()を隣接リストに戻すとtoAdjacencyList()と一致する", () => {
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
});

describe("UndirectedGraph - Scenario Tests", () => {
    it("toCSR()を隣接リストに戻すとtoAdjacencyList()と一致する", () => {
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
    it("toCSR()を隣接リストに戻すとtoAdjacencyList()と一致する [自己ループあり]", () => {
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
});

describe("WeightedDirectedGraph - Scenario Tests", () => {
    it("toCSR()を隣接リストに戻すとtoAdjacencyList()と一致する", () => {
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
});

describe("WeightedUndirectedGraph - Scenario Tests", () => {
    it("toCSR()を隣接リストに戻すとtoAdjacencyList()と一致する", () => {
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
    it("toCSR()を隣接リストに戻すとtoAdjacencyList()と一致する [自己ループあり]", () => {
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
