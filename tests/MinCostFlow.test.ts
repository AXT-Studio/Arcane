import { describe, expect, it } from "vitest";
import { MinCostFlow } from "../src/MinCostFlow.ts";

/** @example の slope / flow で使うグラフを作る */
function exampleNetwork(): MinCostFlow {
    const minCostFlow = new MinCostFlow(4);
    const [S, A, B, T] = [0, 1, 2, 3];
    minCostFlow.addEdge(S, A, 2, 1);
    minCostFlow.addEdge(S, B, 1, 3);
    minCostFlow.addEdge(A, B, 1, 0);
    minCostFlow.addEdge(A, T, 1, 3);
    minCostFlow.addEdge(B, T, 1, 1);
    return minCostFlow;
}

describe("MinCostFlow の @example", () => {
    it("constructor", () => {
        expect(() => new MinCostFlow(4)).not.toThrow();
    });

    it("addEdge", () => {
        const minCostFlow = new MinCostFlow(4);
        const edgeId = minCostFlow.addEdge(0, 1, 3, 1);
        expect(edgeId).toBe(0);
    });

    it("getEdge", () => {
        const minCostFlow = new MinCostFlow(4);
        const edgeId = minCostFlow.addEdge(0, 1, 3, 2);
        minCostFlow.flow(0, 1);
        expect(minCostFlow.getEdge(edgeId)).toEqual({ from: 0, to: 1, cap: 3, cost: 2, flow: 3 });
    });

    it("getEdges", () => {
        const minCostFlow = new MinCostFlow(4);
        minCostFlow.addEdge(0, 1, 3, 2);
        minCostFlow.addEdge(1, 2, 2, 6);
        minCostFlow.flow(0, 2);
        expect(minCostFlow.getEdges()).toEqual([
            { from: 0, to: 1, cap: 3, cost: 2, flow: 2 },
            { from: 1, to: 2, cap: 2, cost: 6, flow: 2 },
        ]);
    });

    it("slope", () => {
        const [S, T] = [0, 3];
        const slopeResult = exampleNetwork().slope(S, T);
        expect(slopeResult.flow).toEqual([0, 1, 2]);
        expect(slopeResult.cost).toEqual([0, 2, 6]);
    });

    it("flow (流量を制限しない)", () => {
        const [S, T] = [0, 3];
        expect(exampleNetwork().flow(S, T)).toEqual({ flow: 2, cost: 6 });
    });

    it("flow (流量を制限する)", () => {
        const [S, T] = [0, 3];
        expect(exampleNetwork().flow(S, T, 1)).toEqual({ flow: 1, cost: 2 });
    });
});

describe("MinCostFlow の境界・特例", () => {
    it("非連結な s-t の流量は 0", () => {
        const minCostFlow = new MinCostFlow(3);
        minCostFlow.addEdge(0, 1, 5, 1);
        expect(minCostFlow.flow(0, 2)).toEqual({ flow: 0, cost: 0 });
    });

    it("容量 0 の辺だけでは流れない", () => {
        const minCostFlow = new MinCostFlow(2);
        const edgeId = minCostFlow.addEdge(0, 1, 0, 5);
        expect(minCostFlow.flow(0, 1)).toEqual({ flow: 0, cost: 0 });
        expect(minCostFlow.getEdge(edgeId)).toEqual({ from: 0, to: 1, cap: 0, cost: 5, flow: 0 });
    });

    it("s と t が同じ頂点のとき Error", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 1, 1);
        expect(() => minCostFlow.slope(0, 0)).toThrow(Error);
        expect(() => minCostFlow.flow(1, 1)).toThrow(Error);
    });

    it("並列辺ではコストの小さい辺から流す", () => {
        const minCostFlow = new MinCostFlow(2);
        const expensive = minCostFlow.addEdge(0, 1, 4, 10);
        const cheap = minCostFlow.addEdge(0, 1, 4, 1);
        expect(minCostFlow.flow(0, 1, 3)).toEqual({ flow: 3, cost: 3 });
        expect(minCostFlow.getEdge(cheap).flow).toBe(3);
        expect(minCostFlow.getEdge(expensive).flow).toBe(0);
    });

    it("slope は流量上限と最大流量の小さい方で止まる", () => {
        const capped = new MinCostFlow(2);
        capped.addEdge(0, 1, 5, 2);
        expect(capped.slope(0, 1, 3)).toEqual({ flow: [0, 3], cost: [0, 6] });

        const unsaturated = new MinCostFlow(2);
        unsaturated.addEdge(0, 1, 5, 2);
        expect(unsaturated.slope(0, 1, 10)).toEqual({ flow: [0, 5], cost: [0, 10] });
    });

    it("傾きが同じ区間は1本にまとめる", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 1, 5);
        minCostFlow.addEdge(0, 1, 1, 5);
        minCostFlow.addEdge(0, 1, 1, 5);
        expect(minCostFlow.slope(0, 1)).toEqual({ flow: [0, 3], cost: [0, 15] });
    });

    it("コスト 0 の区間では cost が横ばいになりうる", () => {
        const minCostFlow = new MinCostFlow(3);
        minCostFlow.addEdge(0, 1, 1, 0);
        minCostFlow.addEdge(1, 2, 1, 0);
        minCostFlow.addEdge(0, 2, 1, 4);
        expect(minCostFlow.slope(0, 2)).toEqual({ flow: [0, 1, 2], cost: [0, 0, 4] });
    });

    it("自己ループは s-t の流量に使われない", () => {
        const minCostFlow = new MinCostFlow(2);
        const loop = minCostFlow.addEdge(0, 0, 5, 1);
        const edge = minCostFlow.addEdge(0, 1, 2, 4);
        expect(minCostFlow.flow(0, 1)).toEqual({ flow: 2, cost: 8 });
        expect(minCostFlow.getEdge(loop)).toEqual({ from: 0, to: 0, cap: 5, cost: 1, flow: 0 });
        expect(minCostFlow.getEdge(edge)).toEqual({ from: 0, to: 1, cap: 2, cost: 4, flow: 2 });
    });

    it("逆辺を使って流れを組み替える", () => {
        const g = new MinCostFlow(4);
        g.addEdge(0, 1, 1, 1); // s→a
        const ab = g.addEdge(1, 2, 1, 1); // a→b
        g.addEdge(2, 3, 1, 1); // b→t
        g.addEdge(0, 2, 1, 3); // s→b
        g.addEdge(1, 3, 1, 3); // a→t

        expect(g.slope(0, 3)).toEqual({
            flow: [0, 1, 2],
            cost: [0, 3, 8],
        });
        expect(g.getEdge(ab).flow).toBe(0);
    });
});
