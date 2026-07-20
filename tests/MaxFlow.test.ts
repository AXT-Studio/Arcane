import { describe, expect, it } from "vitest";
import { MaxFlow } from "../src/MaxFlow.ts";

describe("MaxFlow @example", () => {
    it("constructor", () => {
        expect(() => new MaxFlow(4)).not.toThrow();
    });

    it("addEdge", () => {
        const maxFlow = new MaxFlow(4);
        const edgeId = maxFlow.addEdge(0, 1, 5);
        expect(edgeId).toBe(0);
    });

    it("flow", () => {
        const maxFlow = new MaxFlow(4);
        maxFlow.addEdge(0, 1, 2);
        maxFlow.addEdge(0, 2, 1);
        maxFlow.addEdge(1, 3, 1);
        maxFlow.addEdge(2, 3, 1);
        expect(maxFlow.flow(0, 3)).toBe(2);
    });

    it("minCut", () => {
        const maxFlow = new MaxFlow(4);
        maxFlow.addEdge(0, 1, 2);
        maxFlow.addEdge(0, 2, 1);
        maxFlow.addEdge(1, 3, 1);
        maxFlow.addEdge(2, 3, 1);
        maxFlow.flow(0, 3);
        expect(maxFlow.minCut(0)).toEqual([true, true, false, false]);
    });

    it("getEdge", () => {
        const maxFlow = new MaxFlow(2);
        const edgeId = maxFlow.addEdge(0, 1, 7);
        maxFlow.flow(0, 1, 4);
        expect(maxFlow.getEdge(edgeId)).toEqual({ from: 0, to: 1, cap: 7, flow: 4 });
    });

    it("getEdges", () => {
        const maxFlow = new MaxFlow(3);
        maxFlow.addEdge(0, 1, 3);
        maxFlow.addEdge(1, 2, 2);
        maxFlow.flow(0, 2);
        expect(maxFlow.getEdges()).toEqual([
            { from: 0, to: 1, cap: 3, flow: 2 },
            { from: 1, to: 2, cap: 2, flow: 2 },
        ]);
    });

    it("changeEdge", () => {
        const maxFlow = new MaxFlow(2);
        const edgeId = maxFlow.addEdge(0, 1, 10);
        maxFlow.changeEdge(edgeId, 10, 3);
        expect(maxFlow.getEdge(edgeId)).toEqual({ from: 0, to: 1, cap: 10, flow: 3 });
    });
});
