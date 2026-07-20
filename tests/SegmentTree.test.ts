import { describe, expect, it } from "vitest";
import { SegmentTree } from "../src/SegmentTree.ts";

describe("SegmentTree の @example", () => {
    it("constructor", () => {
        expect(() => new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100)).not.toThrow();
    });

    it("set と query", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        expect(segTree.query(0, 2)).toBe(20);
    });

    it("get", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        expect(segTree.get(0)).toBe(10);
        expect(segTree.get(1)).toBe(20);
        expect(segTree.get(2)).toBe(-Infinity);
    });

    it("query による区間取得", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        segTree.set(2, 15);
        expect(segTree.query(0, 3)).toBe(20);
        expect(segTree.query(0, 2)).toBe(20);
    });

    it("queryAll", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        segTree.set(2, 15);
        expect(segTree.queryAll()).toBe(20);
    });

    it("size", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        expect(segTree.size).toBe(100);
    });

    it("maxRight", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        expect(segTree.maxRight(0, (x) => x < 15)).toBe(1);
    });

    it("minLeft", () => {
        const segTree = new SegmentTree(Infinity, (a, b) => Math.min(a, b), 100);
        segTree.set(0, 10);
        segTree.set(1, 20);
        expect(segTree.minLeft(2, (x) => x > 15)).toBe(1);
    });
});

describe("SegmentTree のエラー", () => {
    it("maxRight は l が範囲外のとき RangeError", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        expect(() => segTree.maxRight(-1, () => true)).toThrow(RangeError);
        expect(() => segTree.maxRight(101, () => true)).toThrow(RangeError);
    });

    it("maxRight は fn(e) が false のとき Error", () => {
        const segTree = new SegmentTree(-Infinity, (a, b) => Math.max(a, b), 100);
        expect(() => segTree.maxRight(0, () => false)).toThrow(Error);
    });

    it("minLeft は r が範囲外のとき RangeError", () => {
        const segTree = new SegmentTree(Infinity, (a, b) => Math.min(a, b), 100);
        expect(() => segTree.minLeft(-1, () => true)).toThrow(RangeError);
        expect(() => segTree.minLeft(101, () => true)).toThrow(RangeError);
    });

    it("minLeft は fn(e) が false のとき Error", () => {
        const segTree = new SegmentTree(Infinity, (a, b) => Math.min(a, b), 100);
        expect(() => segTree.minLeft(2, () => false)).toThrow(Error);
    });
});
