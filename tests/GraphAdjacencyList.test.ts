import { describe, expect, it } from "vitest";
import { GraphAdjacencyList } from "../src/GraphAdjacencyList.ts";

describe("GraphAdjacencyList の @example", () => {
    it("constructor", () => {
        const graph = new GraphAdjacencyList(3);
        expect(graph.raw).toEqual([[], [], []]);
    });

    it("addUndirectedEdge", () => {
        const graph = new GraphAdjacencyList(3);
        graph.addUndirectedEdge(0, 1);
        expect(graph.raw).toEqual([[1], [0], []]);
    });

    it("addDirectedEdge", () => {
        const graph = new GraphAdjacencyList(3);
        graph.addDirectedEdge(0, 1);
        expect(graph.raw).toEqual([[1], [], []]);
    });

    it("sortNeighbors", () => {
        const graph = new GraphAdjacencyList(3);
        graph.addDirectedEdge(0, 2);
        graph.addDirectedEdge(0, 1);
        expect(graph.raw).toEqual([[2, 1], [], []]);
        graph.sortNeighbors(0);
        expect(graph.raw).toEqual([[1, 2], [], []]);
    });

    it("getNeighbors", () => {
        const graph = new GraphAdjacencyList(3);
        graph.addDirectedEdge(0, 2);
        graph.addDirectedEdge(0, 1);
        expect(graph.getNeighbors(0)).toEqual([2, 1]);
        graph.sortNeighbors(0);
        expect(graph.getNeighbors(0)).toEqual([1, 2]);
    });

    it("getEdgeCount", () => {
        const graph = new GraphAdjacencyList(3);
        graph.addUndirectedEdge(0, 1);
        expect(graph.getEdgeCount()).toBe(2);
    });

    it("getInDegrees", () => {
        const graph = new GraphAdjacencyList(3);
        graph.addDirectedEdge(0, 1);
        expect(graph.getInDegrees()).toEqual([0, 1, 0]);
    });

    it("getReversed", () => {
        const graph = new GraphAdjacencyList(3);
        graph.addDirectedEdge(0, 1);
        expect(graph.raw).toEqual([[1], [], []]);
        const reversed = graph.getReversed();
        expect(reversed.raw).toEqual([[], [0], []]);
    });

    it("clone", () => {
        const graph = new GraphAdjacencyList(3);
        graph.addDirectedEdge(0, 1);
        expect(graph.raw).toEqual([[1], [], []]);
        const clone = graph.clone();
        expect(clone.raw).toEqual([[1], [], []]);
    });

    it("fromRaw", () => {
        const graph = GraphAdjacencyList.fromRaw([[1], [], []]);
        expect(graph.vertexCount).toBe(3);
    });

    it("vertexCount", () => {
        const graph = new GraphAdjacencyList(3);
        expect(graph.vertexCount).toBe(3);
    });
});
