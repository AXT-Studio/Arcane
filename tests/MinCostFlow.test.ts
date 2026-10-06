import { describe, expect, it } from "vitest";
import { MinCostFlow } from "../src/MinCostFlow.ts";

describe("MinCostFlow - JSDoc @example", () => {
    it("new MinCostFlow()", () => {
        expect(() => {
            const _minCostFlow = new MinCostFlow(4);
        }).not.toThrow();
    });
    it("addEdge()", () => {
        const minCostFlow = new MinCostFlow(4);
        const edgeId = minCostFlow.addEdge(0, 1, 3, 1);
        expect(edgeId).toBe(0);
    });
    it("getEdge()", () => {
        const minCostFlow = new MinCostFlow(4);
        const edgeId = minCostFlow.addEdge(0, 1, 3, 2);
        minCostFlow.flow(0, 1);
        expect(minCostFlow.getEdge(edgeId)).toEqual({ from: 0, to: 1, cap: 3, cost: 2, flow: 3 });
    });
    it("getEdges()", () => {
        const minCostFlow = new MinCostFlow(4);
        minCostFlow.addEdge(0, 1, 3, 2);
        minCostFlow.addEdge(1, 2, 2, 6);
        minCostFlow.flow(0, 2);
        expect(minCostFlow.getEdges()).toEqual([
            { from: 0, to: 1, cap: 3, cost: 2, flow: 2 },
            { from: 1, to: 2, cap: 2, cost: 6, flow: 2 },
        ]);
    });
    it("slope()", () => {
        const minCostFlow = new MinCostFlow(4);
        const [S, A, B, T] = [0, 1, 2, 3];
        minCostFlow.addEdge(S, A, 2, 1);
        minCostFlow.addEdge(S, B, 1, 3);
        minCostFlow.addEdge(A, B, 1, 0);
        minCostFlow.addEdge(A, T, 1, 3);
        minCostFlow.addEdge(B, T, 1, 1);
        const slopeResult = minCostFlow.slope(S, T);
        expect(slopeResult.flow).toEqual([0, 1, 2]);
        expect(slopeResult.cost).toEqual([0, 2, 6]);
    });
    it("flow() [流量を制限しない場合]", () => {
        const minCostFlow = new MinCostFlow(4);
        const [S, A, B, T] = [0, 1, 2, 3];
        minCostFlow.addEdge(S, A, 2, 1);
        minCostFlow.addEdge(S, B, 1, 3);
        minCostFlow.addEdge(A, B, 1, 0);
        minCostFlow.addEdge(A, T, 1, 3);
        minCostFlow.addEdge(B, T, 1, 1);
        const flowResult = minCostFlow.flow(S, T);
        expect(flowResult).toEqual({ flow: 2, cost: 6 });
    });
    it("flow() [流量を制限する場合]", () => {
        const minCostFlow = new MinCostFlow(4);
        const [S, A, B, T] = [0, 1, 2, 3];
        minCostFlow.addEdge(S, A, 2, 1);
        minCostFlow.addEdge(S, B, 1, 3);
        minCostFlow.addEdge(A, B, 1, 0);
        minCostFlow.addEdge(A, T, 1, 3);
        minCostFlow.addEdge(B, T, 1, 1);
        const flowResult = minCostFlow.flow(S, T, 1);
        expect(flowResult).toEqual({ flow: 1, cost: 2 });
    });
});

describe("MinCostFlow - Edge Cases", () => {
    it("flow()はsとtが非連結のとき{flow: 0, cost: 0}", () => {
        const minCostFlow = new MinCostFlow(3);
        minCostFlow.addEdge(0, 1, 5, 1);
        expect(minCostFlow.flow(0, 2)).toEqual({ flow: 0, cost: 0 });
    });
    it("flow()は容量0の辺だけのとき{flow: 0, cost: 0}", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 0, 5);
        expect(minCostFlow.flow(0, 1)).toEqual({ flow: 0, cost: 0 });
    });
    it("getEdge()は容量0の辺だけのとき流量0", () => {
        const minCostFlow = new MinCostFlow(2);
        const edgeId = minCostFlow.addEdge(0, 1, 0, 5);
        minCostFlow.flow(0, 1);
        expect(minCostFlow.getEdge(edgeId)).toEqual({ from: 0, to: 1, cap: 0, cost: 5, flow: 0 });
    });
    it("slope()はsとtが同じ頂点のときError", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 1, 1);
        expect(() => minCostFlow.slope(0, 0)).toThrow(Error);
    });
    it("flow()はsとtが同じ頂点のときError", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 1, 1);
        expect(() => minCostFlow.flow(1, 1)).toThrow(Error);
    });
    it("flow()は並列辺のときコストの小さい辺から流して{flow: 3, cost: 3}", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 4, 10);
        minCostFlow.addEdge(0, 1, 4, 1);
        expect(minCostFlow.flow(0, 1, 3)).toEqual({ flow: 3, cost: 3 });
    });
    it("getEdge()は並列辺でコストの小さい辺のとき流量3", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 4, 10);
        const cheap = minCostFlow.addEdge(0, 1, 4, 1);
        minCostFlow.flow(0, 1, 3);
        expect(minCostFlow.getEdge(cheap).flow).toBe(3);
    });
    it("getEdge()は並列辺でコストの大きい辺のとき流量0", () => {
        const minCostFlow = new MinCostFlow(2);
        const expensive = minCostFlow.addEdge(0, 1, 4, 10);
        minCostFlow.addEdge(0, 1, 4, 1);
        minCostFlow.flow(0, 1, 3);
        expect(minCostFlow.getEdge(expensive).flow).toBe(0);
    });
    it("slope()は流量上限が辺容量より小さいとき{flow: [0, 3], cost: [0, 6]}", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 5, 2);
        expect(minCostFlow.slope(0, 1, 3)).toEqual({ flow: [0, 3], cost: [0, 6] });
    });
    it("slope()は流量上限が最大流量より大きいとき{flow: [0, 5], cost: [0, 10]}", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 5, 2);
        expect(minCostFlow.slope(0, 1, 10)).toEqual({ flow: [0, 5], cost: [0, 10] });
    });
    it("slope()は傾きが同じ区間のとき{flow: [0, 3], cost: [0, 15]}", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 1, 1, 5);
        minCostFlow.addEdge(0, 1, 1, 5);
        minCostFlow.addEdge(0, 1, 1, 5);
        expect(minCostFlow.slope(0, 1)).toEqual({ flow: [0, 3], cost: [0, 15] });
    });
    it("slope()はコスト0の区間のとき{flow: [0, 1, 2], cost: [0, 0, 4]}", () => {
        const minCostFlow = new MinCostFlow(3);
        minCostFlow.addEdge(0, 1, 1, 0);
        minCostFlow.addEdge(1, 2, 1, 0);
        minCostFlow.addEdge(0, 2, 1, 4);
        expect(minCostFlow.slope(0, 2)).toEqual({ flow: [0, 1, 2], cost: [0, 0, 4] });
    });
    it("flow()は自己ループがあるとき{flow: 2, cost: 8}", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 0, 5, 1);
        minCostFlow.addEdge(0, 1, 2, 4);
        expect(minCostFlow.flow(0, 1)).toEqual({ flow: 2, cost: 8 });
    });
    it("getEdge()は自己ループのとき流量0", () => {
        const minCostFlow = new MinCostFlow(2);
        const loop = minCostFlow.addEdge(0, 0, 5, 1);
        minCostFlow.addEdge(0, 1, 2, 4);
        minCostFlow.flow(0, 1);
        expect(minCostFlow.getEdge(loop)).toEqual({ from: 0, to: 0, cap: 5, cost: 1, flow: 0 });
    });
    it("getEdge()は自己ループ以外のs-t辺のとき流量2", () => {
        const minCostFlow = new MinCostFlow(2);
        minCostFlow.addEdge(0, 0, 5, 1);
        const edge = minCostFlow.addEdge(0, 1, 2, 4);
        minCostFlow.flow(0, 1);
        expect(minCostFlow.getEdge(edge)).toEqual({ from: 0, to: 1, cap: 2, cost: 4, flow: 2 });
    });
    it("slope()は逆辺で流れを組み替えるとき{flow: [0, 1, 2], cost: [0, 3, 8]}", () => {
        const minCostFlow = new MinCostFlow(4);
        minCostFlow.addEdge(0, 1, 1, 1); // s→a
        minCostFlow.addEdge(1, 2, 1, 1); // a→b
        minCostFlow.addEdge(2, 3, 1, 1); // b→t
        minCostFlow.addEdge(0, 2, 1, 3); // s→b
        minCostFlow.addEdge(1, 3, 1, 3); // a→t
        expect(minCostFlow.slope(0, 3)).toEqual({
            flow: [0, 1, 2],
            cost: [0, 3, 8],
        });
    });
    it("getEdge()は逆辺で流れを組み替えたとき途中辺の流量0", () => {
        const minCostFlow = new MinCostFlow(4);
        minCostFlow.addEdge(0, 1, 1, 1); // s→a
        const ab = minCostFlow.addEdge(1, 2, 1, 1); // a→b
        minCostFlow.addEdge(2, 3, 1, 1); // b→t
        minCostFlow.addEdge(0, 2, 1, 3); // s→b
        minCostFlow.addEdge(1, 3, 1, 3); // a→t
        minCostFlow.slope(0, 3);
        expect(minCostFlow.getEdge(ab).flow).toBe(0);
    });
});
