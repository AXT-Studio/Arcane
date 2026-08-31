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

    it("constructor は size が 1 のとき生成できる", () => {
        const tree = maxChmaxTree(1);
        expect(tree.size).toBe(1);
        expect(tree.queryAll()).toBe(-Infinity);
    });
});

describe("LazySegmentTree のエラー", () => {
    it("constructor は size が 1 未満・非整数・2^30 超のとき RangeError", () => {
        expect(() => maxChmaxTree(0)).toThrow(RangeError);
        expect(() => maxChmaxTree(-1)).toThrow(RangeError);
        expect(() => maxChmaxTree(1.5)).toThrow(RangeError);
        expect(() => maxChmaxTree(Number.NaN)).toThrow(RangeError);
        expect(() => maxChmaxTree(2 ** 30 + 1)).toThrow(RangeError);
    });

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

type AffineF = { b: bigint; c: bigint };
const AFFINE_MOD = 998244353n;

function rangeAffineTree(n: number, a: bigint[]) {
    return new LazySegmentTree<bigint, AffineF>(
        0n,
        (x, y) => (x + y) % AFFINE_MOD,
        (s, f, len) => (s * f.b + f.c * BigInt(len)) % AFFINE_MOD,
        { b: 1n, c: 0n },
        (newF, oldF) => ({ b: (oldF.b * newF.b) % AFFINE_MOD, c: (newF.b * oldF.c + newF.c) % AFFINE_MOD }),
        n,
        a,
    );
}

function solveRangeAffineRangeSum(
    N: number,
    a: bigint[],
    querys: ({ kind: 0; l: number; r: number; b: bigint; c: bigint } | { kind: 1; l: number; r: number })[],
): bigint[] {
    const lazySegTree = rangeAffineTree(N, a);
    const answers: bigint[] = [];
    for (const query of querys) {
        const { kind, l, r } = query;
        if (kind === 0) {
            const { b, c } = query;
            lazySegTree.apply(l, r, { b, c });
        } else {
            answers.push(lazySegTree.query(l, r));
        }
    }
    return answers;
}

describe("ACLPC_K - Range Affine Range Sum サンプル通過確認", () => {
    it("入出力例1", () => {
        const N = 5;
        const a = [1n, 2n, 3n, 4n, 5n];
        const querys = [
            { kind: 1 as const, l: 0, r: 5 },
            { kind: 0 as const, l: 2, r: 4, b: 100n, c: 101n },
            { kind: 1 as const, l: 0, r: 3 },
            { kind: 0 as const, l: 1, r: 3, b: 102n, c: 103n },
            { kind: 1 as const, l: 2, r: 5 },
            { kind: 0 as const, l: 2, r: 5, b: 104n, c: 105n },
            { kind: 1 as const, l: 0, r: 5 },
        ];
        const expected = [15n, 404n, 41511n, 4317767n];
        const actual = solveRangeAffineRangeSum(N, a, querys);
        expect(actual).toEqual(expected);
    });
});

describe("Range Affine Range Sum での残 API", () => {
    it("size と queryAll", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        expect(tree.size).toBe(5);
        expect(tree.queryAll()).toBe(15n);
    });

    it("区間作用後の get は遅延を下ろして葉の値を返す", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        tree.apply(2, 4, { b: 100n, c: 101n });
        expect(tree.get(0)).toBe(1n);
        expect(tree.get(2)).toBe(401n);
        expect(tree.get(3)).toBe(501n);
        expect(tree.get(4)).toBe(5n);
        expect(tree.query(0, 3)).toBe(404n);
    });

    it("applyAt は 1 点だけアフィン変換する", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        tree.applyAt(1, { b: 0n, c: 9n });
        expect(tree.get(1)).toBe(9n);
        expect(tree.query(0, 5)).toBe(22n);
    });

    it("set は遅延タグを潰して値を上書きする", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        tree.apply(0, 5, { b: 2n, c: 0n });
        tree.set(2, 100n);
        expect(tree.get(2)).toBe(100n);
        expect(tree.get(0)).toBe(2n);
        expect(tree.queryAll()).toBe(124n);
    });

    it("maxRight は区間和が閾値未満である最大の r を返す", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        expect(tree.maxRight(0, (s) => s < 6n)).toBe(2);
        expect(tree.maxRight(2, (s) => s < 7n)).toBe(3);
        expect(tree.maxRight(0, (s) => s < 16n)).toBe(5);
        expect(tree.maxRight(5, (s) => s < 1n)).toBe(5);
    });

    it("maxRight は未 push の遅延があっても正しい", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        tree.apply(0, 5, { b: 2n, c: 0n });
        expect(tree.maxRight(0, (s) => s < 7n)).toBe(2);
    });

    it("minLeft は区間和が閾値未満である最小の l を返す", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        expect(tree.minLeft(5, (s) => s < 10n)).toBe(3);
        expect(tree.minLeft(5, (s) => s < 16n)).toBe(0);
        expect(tree.minLeft(5, (s) => s < 1n)).toBe(5);
        expect(tree.minLeft(0, (s) => s < 1n)).toBe(0);
    });

    it("minLeft は未 push の遅延があっても正しい", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        tree.apply(0, 5, { b: 2n, c: 0n });
        expect(tree.minLeft(5, (s) => s < 11n)).toBe(4);
    });

    it("空区間の query は単位元、apply は何もしない", () => {
        const tree = rangeAffineTree(5, [1n, 2n, 3n, 4n, 5n]);
        expect(tree.query(2, 2)).toBe(0n);
        tree.apply(2, 2, { b: 100n, c: 101n });
        expect(tree.query(0, 5)).toBe(15n);
        expect(tree.get(2)).toBe(3n);
    });
});
