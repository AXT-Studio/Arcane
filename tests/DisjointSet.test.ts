import { describe, expect, it } from "vitest";
import { DisjointSet } from "../src/DisjointSet.ts";

describe("DisjointSet - JSDoc @example", () => {
    it("new DisjointSet()", () => {
        const ds = new DisjointSet(5);
        expect(ds.componentCount).toBe(5);
    });
    it("find()", () => {
        const ds = new DisjointSet(5);
        expect(ds.find(0)).toBe(0);
        expect(ds.find(1)).toBe(1);
        ds.union(0, 1);
        expect(ds.find(0) === ds.find(1)).toBe(true);
    });
    it("union()", () => {
        const ds = new DisjointSet(5);
        expect(ds.union(0, 1)).toBe(true);
        expect(ds.union(0, 1)).toBe(false);
    });
    it("connected()", () => {
        const ds = new DisjointSet(5);
        expect(ds.connected(0, 1)).toBe(false);
        ds.union(0, 1);
        expect(ds.connected(0, 1)).toBe(true);
    });
    it("getGroupSize()", () => {
        const ds = new DisjointSet(5);
        expect(ds.getGroupSize(0)).toBe(1);
        ds.union(0, 1);
        expect(ds.getGroupSize(0)).toBe(2);
    });
    it("get componentCount", () => {
        const ds = new DisjointSet(5);
        expect(ds.componentCount).toBe(5);
        ds.union(0, 1);
        expect(ds.componentCount).toBe(4);
    });
});

describe("DisjointSet - Edge Cases", () => {
    it("new DisjointSet()はsizeが0のときError", () => {
        expect(() => new DisjointSet(0)).toThrow(Error);
    });
    it("new DisjointSet()はsizeが負のときError", () => {
        expect(() => new DisjointSet(-1)).toThrow(Error);
    });
    it("new DisjointSet()はsizeが非整数のときError", () => {
        expect(() => new DisjointSet(1.5)).toThrow(Error);
    });
});

describe("DisjointSet - Random Tests", () => {
    it("find(), connected(), getGroupSize(), componentCountについて、親配列の愚直な素集合と比較して一致確認", () => {
        const n = 50;
        const ds = new DisjointSet(n);
        const parent = Array.from({ length: n }, (_, i) => i);
        const size = Array<number>(n).fill(1);
        let components = n;
        const rootOf = (x: number): number => {
            while (parent[x] !== x) x = parent[x];
            return x;
        };
        for (let q = 0; q < 200; q++) {
            const x = Math.floor(Math.random() * n);
            const y = Math.floor(Math.random() * n);
            const rootX = rootOf(x);
            const rootY = rootOf(y);
            expect(ds.union(x, y)).toBe(rootX !== rootY);
            if (rootX !== rootY) {
                if (size[rootX] < size[rootY]) {
                    parent[rootX] = rootY;
                    size[rootY] += size[rootX];
                } else {
                    parent[rootY] = rootX;
                    size[rootX] += size[rootY];
                }
                components--;
            }
            const a = Math.floor(Math.random() * n);
            const b = Math.floor(Math.random() * n);
            const op = Math.floor(Math.random() * 4);
            if (op === 0) {
                expect(ds.find(a)).toBe(rootOf(a));
            } else if (op === 1) {
                expect(ds.connected(a, b)).toBe(rootOf(a) === rootOf(b));
            } else if (op === 2) {
                expect(ds.getGroupSize(a)).toBe(size[rootOf(a)]);
            } else {
                expect(ds.componentCount).toBe(components);
            }
        }
    });
});
