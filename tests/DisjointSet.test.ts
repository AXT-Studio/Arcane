import { describe, expect, it } from "vitest";
import { DisjointSet } from "../src/DisjointSet.ts";

describe("DisjointSet の @example", () => {
    it("constructor と初期の componentCount", () => {
        const ds = new DisjointSet(5);
        expect(ds.componentCount).toBe(5);
    });

    it("find と union", () => {
        const ds = new DisjointSet(5);
        expect(ds.find(0)).toBe(0);
        expect(ds.find(1)).toBe(1);
        ds.union(0, 1);
        expect(ds.find(0) === ds.find(1)).toBe(true);
    });

    it("union が結合したかどうかを返す", () => {
        const ds = new DisjointSet(5);
        expect(ds.union(0, 1)).toBe(true);
        expect(ds.union(0, 1)).toBe(false);
    });

    it("connected", () => {
        const ds = new DisjointSet(5);
        expect(ds.connected(0, 1)).toBe(false);
        ds.union(0, 1);
        expect(ds.connected(0, 1)).toBe(true);
    });

    it("getGroupSize", () => {
        const ds = new DisjointSet(5);
        expect(ds.getGroupSize(0)).toBe(1);
        ds.union(0, 1);
        expect(ds.getGroupSize(0)).toBe(2);
    });

    it("union 後の componentCount", () => {
        const ds = new DisjointSet(5);
        expect(ds.componentCount).toBe(5);
        ds.union(0, 1);
        expect(ds.componentCount).toBe(4);
    });
});
