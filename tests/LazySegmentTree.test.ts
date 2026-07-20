import { describe, expect, it } from "vitest";
import { LazySegmentTree } from "../src/LazySegmentTree.ts";

function maxChmaxTree(size = 100) {
    return new LazySegmentTree(
        -Infinity,
        (a, b) => Math.max(a, b),
        (s, f) => Math.max(s, f),
        -Infinity,
        (newF, oldF) => Math.max(newF, oldF),
        size,
    );
}

describe("LazySegmentTree @example", () => {
    it("constructor (chmax)", () => {
        expect(() => maxChmaxTree()).not.toThrow();
    });

    it("constructor (range add + range min)", () => {
        expect(
            () =>
                new LazySegmentTree<number, number>(
                    Infinity,
                    (a, b) => Math.min(a, b),
                    (s, f) => s + f,
                    0,
                    (newF, oldF) => newF + oldF,
                    100,
                ),
        ).not.toThrow();
    });

    it("constructor (range add + range max)", () => {
        expect(
            () =>
                new LazySegmentTree<number, number>(
                    -Infinity,
                    (a, b) => Math.max(a, b),
                    (s, f) => s + f,
                    0,
                    (newF, oldF) => newF + oldF,
                    100,
                ),
        ).not.toThrow();
    });

    it("constructor (range update + range min)", () => {
        expect(
            () =>
                new LazySegmentTree<number, number | null>(
                    Infinity,
                    (a, b) => Math.min(a, b),
                    (s, f) => (f === null ? s : f),
                    null,
                    (newF, oldF) => (newF === null ? oldF : newF),
                    100,
                ),
        ).not.toThrow();
    });

    it("constructor (range update + range max)", () => {
        expect(
            () =>
                new LazySegmentTree<number, number | null>(
                    -Infinity,
                    (a, b) => Math.max(a, b),
                    (s, f) => (f === null ? s : f),
                    null,
                    (newF, oldF) => (newF === null ? oldF : newF),
                    100,
                ),
        ).not.toThrow();
    });

    it("constructor (range add + range sum)", () => {
        expect(
            () =>
                new LazySegmentTree<{ value: number; size: number }, number>(
                    { value: 0, size: 0 },
                    (a, b) => ({ value: a.value + b.value, size: a.size + b.size }),
                    (s, f) => ({ value: s.value + f * s.size, size: s.size }),
                    0,
                    (newF, oldF) => newF + oldF,
                    100,
                ),
        ).not.toThrow();
    });

    it("constructor (range update + range sum)", () => {
        expect(
            () =>
                new LazySegmentTree<{ value: number; size: number }, number | null>(
                    { value: 0, size: 0 },
                    (a, b) => ({ value: a.value + b.value, size: a.size + b.size }),
                    (s, f) => (f === null ? s : { value: f * s.size, size: s.size }),
                    null,
                    (newF, oldF) => (newF === null ? oldF : newF),
                    100,
                ),
        ).not.toThrow();
    });

    it("constructor (affine + range sum)", () => {
        expect(
            () =>
                new LazySegmentTree<{ value: number; size: number }, { a: number; b: number }>(
                    { value: 0, size: 0 },
                    (x, y) => ({ value: x.value + y.value, size: x.size + y.size }),
                    (s, f) => ({ value: f.a * s.value + f.b * s.size, size: s.size }),
                    { a: 1, b: 0 },
                    (newF, oldF) => ({ a: newF.a * oldF.a, b: newF.a * oldF.b + newF.b }),
                    100,
                ),
        ).not.toThrow();
    });

    it("apply", () => {
        const lazySegTree = maxChmaxTree();
        expect(() => lazySegTree.apply(10, 20, 15)).not.toThrow();
    });

    it("apply and query", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.apply(10, 20, 15);
        expect(lazySegTree.query(5, 15)).toBe(15);
        expect(lazySegTree.query(25, 30)).toBe(-Infinity);
    });

    it("maxRight", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.apply(10, 20, 15);
        lazySegTree.apply(15, 25, 30);
        expect(lazySegTree.maxRight(5, (x) => x < 20)).toBe(15);
    });

    it("minLeft", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.apply(10, 20, 15);
        lazySegTree.apply(15, 25, 30);
        expect(lazySegTree.minLeft(30, (x) => x < 20)).toBe(25);
    });

    it("queryAll", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.apply(10, 20, 15);
        lazySegTree.apply(15, 25, 30);
        expect(lazySegTree.queryAll()).toBe(30);
    });

    it("applyAt and get", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.applyAt(10, 15);
        expect(lazySegTree.get(10)).toBe(15);
    });

    it("apply then get", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.apply(10, 20, 15);
        expect(lazySegTree.get(12)).toBe(15);
        expect(lazySegTree.get(5)).toBe(-Infinity);
    });

    it("set overwrites after applyAt", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.applyAt(10, 15);
        lazySegTree.set(10, 20);
        expect(lazySegTree.get(10)).toBe(20);
    });

    it("size", () => {
        const lazySegTree = maxChmaxTree();
        expect(lazySegTree.size).toBe(100);
    });
});
