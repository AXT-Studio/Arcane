import { describe, expect, it } from "vitest";
import { SegmentTree } from "../src/SegmentTree.ts";

describe("SegmentTree - JSDoc @example", () => {
    it("new SegmentTree()", () => {
        expect(() => {
            const _segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        }).not.toThrow();
    });
    it("set()", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        expect(segTree.query(0, 2)).toBe(20);
    });
    it("get()", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        expect(segTree.get(0)).toBe(10);
        expect(segTree.get(1)).toBe(20);
        expect(segTree.get(2)).toBe(-Infinity);
    });
    it("query()", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        segTree.set(2, 15);
        expect(segTree.query(0, 3)).toBe(20);
        expect(segTree.query(0, 2)).toBe(20);
    });
    it("queryAll()", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        segTree.set(2, 15);
        expect(segTree.queryAll()).toBe(20);
    });
    it("get size", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        expect(segTree.size).toBe(100);
    });
    it("maxRight()", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        const maxRight = segTree.maxRight(0, (x) => x < 15);
        expect(maxRight).toBe(1);
    });
    it("minLeft()", () => {
        const segTree = new SegmentTree(Infinity, (a, b) => Math.min(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        const minLeft = segTree.minLeft(2, (x) => x > 15);
        expect(minLeft).toBe(1);
    });
});

describe("SegmentTree - Edge Cases", () => {
    it("maxRight()はlが負のときRangeError", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        expect(() => segTree.maxRight(-1, () => true)).toThrow(RangeError);
    });
    it("maxRight()はlがsizeより大きいときRangeError", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        expect(() => segTree.maxRight(101, () => true)).toThrow(RangeError);
    });
    it("maxRight()はfn(e)がfalseのときError", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        expect(() => segTree.maxRight(0, () => false)).toThrow(Error);
    });
    it("minLeft()はrが負のときRangeError", () => {
        const segTree = new SegmentTree(Infinity, (a, b) => Math.min(a, b), 100);
        expect(() => segTree.minLeft(-1, () => true)).toThrow(RangeError);
    });
    it("minLeft()はrがsizeより大きいときRangeError", () => {
        const segTree = new SegmentTree(Infinity, (a, b) => Math.min(a, b), 100);
        expect(() => segTree.minLeft(101, () => true)).toThrow(RangeError);
    });
    it("minLeft()はfn(e)がfalseのときError", () => {
        const segTree = new SegmentTree(Infinity, (a, b) => Math.min(a, b), 100);
        expect(() => segTree.minLeft(2, () => false)).toThrow(Error);
    });
});
