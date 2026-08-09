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

describe("LazySegmentTree の @example", () => {
    it("constructor（chmax）", () => {
        expect(() => maxChmaxTree()).not.toThrow();
    });

    it("constructor（区間加算 + 区間最小）", () => {
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

    it("constructor（区間加算 + 区間最大）", () => {
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

    it("constructor（区間更新 + 区間最小）", () => {
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

    it("constructor（区間更新 + 区間最大）", () => {
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

    it("constructor（区間加算 + 区間和）", () => {
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

    it("constructor（区間更新 + 区間和）", () => {
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

    it("constructor（アフィン変換 + 区間和）", () => {
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

    it("apply と query", () => {
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

    it("applyAt と get", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.applyAt(10, 15);
        expect(lazySegTree.get(10)).toBe(15);
    });

    it("apply 後の get", () => {
        const lazySegTree = maxChmaxTree();
        lazySegTree.apply(10, 20, 15);
        expect(lazySegTree.get(12)).toBe(15);
        expect(lazySegTree.get(5)).toBe(-Infinity);
    });

    it("applyAt 後の set による上書き", () => {
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

describe("LazySegmentTree のエラー", () => {
    it("maxRight は l が範囲外のとき Error", () => {
        const lazySegTree = maxChmaxTree();
        expect(() => lazySegTree.maxRight(-1, () => true)).toThrow(Error);
        expect(() => lazySegTree.maxRight(101, () => true)).toThrow(Error);
    });

    it("maxRight は fn(e) が false のとき Error", () => {
        const lazySegTree = maxChmaxTree();
        expect(() => lazySegTree.maxRight(0, () => false)).toThrow(Error);
    });

    it("minLeft は r が範囲外のとき Error", () => {
        const lazySegTree = maxChmaxTree();
        expect(() => lazySegTree.minLeft(-1, () => true)).toThrow(Error);
        expect(() => lazySegTree.minLeft(101, () => true)).toThrow(Error);
    });

    it("minLeft は fn(e) が false のとき Error", () => {
        const lazySegTree = maxChmaxTree();
        expect(() => lazySegTree.minLeft(30, () => false)).toThrow(Error);
    });
});

function solveLongBricks(W: number, N: number, L: number[], R: number[]): number[] {
    const lazysegtree = new LazySegmentTree<number, number>(
        -Infinity,
        (a, b) => Math.max(a, b),
        (s, f) => Math.max(s, f),
        -Infinity,
        (newF, oldF) => Math.max(newF, oldF),
        W + 1,
        Array.from({ length: W + 1 }, () => 0),
    );
    const answers: number[] = [];
    for (let i = 0; i < N; i++) {
        const Li = L[i];
        const Ri = R[i];
        const rangeMax = lazysegtree.query(Li, Ri + 1);
        lazysegtree.apply(Li, Ri + 1, rangeMax + 1);
        answers.push(rangeMax + 1);
    }
    return answers;
}

describe("競プロ典型90問 029 - Long Bricks サンプル通過確認", () => {
    it("入出力例1", () => {
        const [W, N] = [100, 4];
        const L = [27, 8, 83, 24];
        const R = [100, 39, 97, 75];
        const expected = [1, 2, 2, 3];
        const actual = solveLongBricks(W, N, L, R);
        expect(actual).toEqual(expected);
    });
    it("入出力例2", () => {
        const [W, N] = [3, 5];
        const L = [1, 2, 2, 3, 1];
        const R = [2, 2, 3, 3, 2];
        const expected = [1, 2, 3, 4, 4];
        const actual = solveLongBricks(W, N, L, R);
        expect(actual).toEqual(expected);
    });
    it("入出力例3", () => {
        const [W, N] = [10, 10];
        const L = [1, 3, 5, 7, 2, 4, 6, 3, 5, 4];
        const R = [3, 5, 7, 9, 4, 6, 8, 5, 7, 6];
        const expected = [1, 2, 3, 4, 3, 4, 5, 5, 6, 7];
        const actual = solveLongBricks(W, N, L, R);
        expect(actual).toEqual(expected);
    });
    it("入出力例4", () => {
        const [W, N] = [500000, 7];
        const L = [1, 500000, 1, 1, 1, 500000, 1];
        const R = [500000, 500000, 500000, 1, 500000, 500000, 500000];
        const expected = [1, 2, 3, 4, 5, 6, 7];
        const actual = solveLongBricks(W, N, L, R);
        expect(actual).toEqual(expected);
    });
});
