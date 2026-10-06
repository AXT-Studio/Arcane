import { describe, expect, it } from "vitest";
import { SparseTable } from "../src/SparseTable.ts";

describe("SparseTable - JSDoc @example", () => {
    it("new SparseTable()", () => {
        expect(() => {
            const arr = [1, 5, 3, 8, 2, 7, 4, 6];
            const _sparseTable = new SparseTable<number>(arr, (a, b) => Math.max(a, b));
        }).not.toThrow();
    });
    it("query()", () => {
        const arr = [1, 5, 3, 8, 2, 7, 4, 6];
        const sparseTable = new SparseTable<number>(arr, (a, b) => Math.max(a, b));
        expect(sparseTable.query(0, 2)).toBe(5);
        expect(sparseTable.query(4, 8)).toBe(7);
        expect(sparseTable.query(7, 8)).toBe(6);
        expect(() => sparseTable.query(5, 5)).toThrow(RangeError);
        expect(() => sparseTable.query(6, 2)).toThrow(RangeError);
        expect(() => sparseTable.query(0, 9)).toThrow(RangeError);
    });
});

describe("SparseTable - Random Tests", () => {
    it("query()について、array.reduceと比較して一致確認", () => {
        const op = (a: number, b: number) => Math.max(a, b);
        for (let trial = 0; trial < 10; trial++) {
            const n = 1 + Math.floor(Math.random() * 100);
            const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 1001));
            const sparseTable = new SparseTable(arr, op);
            for (let q = 0; q < 1000; q++) {
                const l = Math.floor(Math.random() * n);
                const r = l + 1 + Math.floor(Math.random() * (n - l));
                expect(sparseTable.query(l, r)).toBe(arr.slice(l, r).reduce(op));
            }
        }
    });
});
