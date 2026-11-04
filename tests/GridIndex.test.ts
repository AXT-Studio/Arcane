import { describe, expect, it } from "vitest";
import { GridIndex } from "../src/GridIndex.ts";

describe("GridIndex - JSDoc @example", () => {
    it("new GridIndex() [2次元, 1-indexedの場合]", () => {
        expect(() => {
            const _grid = new GridIndex([4, 2], [1, 1]);
        }).not.toThrow();
    });
    it("new GridIndex() [3次元, 0-indexedの場合]", () => {
        expect(() => {
            const _grid = new GridIndex([10, 10, 10], [0, 0, 0]);
        }).not.toThrow();
    });
    it("indexOf()", () => {
        const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
        expect(grid.indexOf(1, 2, 3)).toBe(321);
    });
    it("positionOf()", () => {
        const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
        expect(grid.positionOf(321)).toEqual([1, 2, 3]);
    });
    it("includes()", () => {
        const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
        expect(grid.includes(0, 0, 0)).toBe(true);
        expect(grid.includes(5, 3, 6)).toBe(true);
        expect(grid.includes(9, 9, 9)).toBe(true);
        expect(grid.includes(9, 9, 10)).toBe(false);
    });
    it("getAdjacentCellIndexes()", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        // 順番は保証されない
        expect(grid.getAdjacentCellIndexes(4, 1).sort((a, b) => a - b)).toEqual([1, 3, 5, 7]);
        expect(grid.getAdjacentCellIndexes(4, 2).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
        expect(grid.getAdjacentCellIndexes(0, 1).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(grid.getAdjacentCellIndexes(5, 2).sort((a, b) => a - b)).toEqual([1, 2, 4, 7, 8]);
    });
    it("get shape", () => {
        const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
        expect(grid.shape).toEqual([10, 10, 10]);
    });
    it("get bases", () => {
        const grid = new GridIndex([10, 10, 10], [0, 1, 0]);
        expect(grid.bases).toEqual([0, 1, 0]);
    });
    it("get size", () => {
        const grid = new GridIndex([10, 10, 10], [0, 0, 0]);
        expect(grid.size).toBe(1000);
    });
});

describe("GridIndex - Edge Cases", () => {
    // 先頭次元のストライドが1。GridIndex2D(H, W, base) と同じ添字にするときは shape [W, H]、座標 (c, r)。
    it("shapeはコンストラクタ引数を保持し、positionOf(0)はbasesになる", () => {
        const grid = new GridIndex([3, 5], [1, 1]);
        expect(grid.shape).toEqual([3, 5]);
        expect(grid.positionOf(0)).toEqual([1, 1]);
    });
    it("new GridIndex()はshape[0]が0のときRangeError", () => {
        expect(() => new GridIndex([0, 3], [1, 1])).toThrow(RangeError);
    });
    it("new GridIndex()はshape[0]が負のときRangeError", () => {
        expect(() => new GridIndex([-1, 3], [1, 1])).toThrow(RangeError);
    });
    it("new GridIndex()はshape[0]が非整数のときRangeError", () => {
        expect(() => new GridIndex([1.5, 3], [1, 1])).toThrow(RangeError);
        expect(() => new GridIndex([NaN, 3], [1, 1])).toThrow(RangeError);
        expect(() => new GridIndex([Infinity, 3], [1, 1])).toThrow(RangeError);
    });
    it("new GridIndex()はshapeの総積が安全整数でないときRangeError", () => {
        expect(() => new GridIndex([2 ** 27, 2 ** 27], [0, 0])).toThrow(RangeError);
    });
    it("new GridIndex()はshape[0]が安全整数でないときRangeError", () => {
        expect(() => new GridIndex([2 ** 53, 1], [0, 0])).toThrow(RangeError);
    });
    it("引数の配列を変更しても内部状態は変わらない", () => {
        const shape = [3, 4];
        const bases: (0 | 1)[] = [0, 1];
        const grid = new GridIndex(shape, bases);
        shape[0] = 100;
        bases[1] = 0;
        expect(grid.shape).toEqual([3, 4]);
        expect(grid.size).toBe(12);
        expect(grid.positionOf(0)).toEqual([0, 1]);
        expect(grid.indexOf(2, 4)).toBe(11);
    });
    it("indexOf()は0-indexedのとき先頭次元が連続するインデックス", () => {
        const grid = new GridIndex([3, 5], [0, 0]);
        expect(grid.indexOf(0, 0)).toBe(0);
        expect(grid.indexOf(1, 1)).toBe(4);
        expect(grid.indexOf(2, 4)).toBe(14);
    });
    it("positionOf()は0-indexedのとき座標を返す", () => {
        const grid = new GridIndex([3, 5], [0, 0]);
        expect(grid.positionOf(0)).toEqual([0, 0]);
        expect(grid.positionOf(4)).toEqual([1, 1]);
        expect(grid.positionOf(14)).toEqual([2, 4]);
    });
    it("indexOf()とpositionOf()は0-indexedで往復する", () => {
        const grid = new GridIndex([5, 4], [0, 0]);
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 4; y++) {
                expect(grid.positionOf(grid.indexOf(x, y))).toEqual([x, y]);
            }
        }
        for (let index = 0; index < 20; index++) {
            const [x, y] = grid.positionOf(index);
            expect(grid.indexOf(x, y)).toBe(index);
        }
    });
    it("indexOf()とpositionOf()は1-indexedで往復する", () => {
        const grid = new GridIndex([5, 4], [1, 1]);
        for (let x = 1; x <= 5; x++) {
            for (let y = 1; y <= 4; y++) {
                expect(grid.positionOf(grid.indexOf(x, y))).toEqual([x, y]);
            }
        }
        for (let index = 0; index < 20; index++) {
            const [x, y] = grid.positionOf(index);
            expect(grid.indexOf(x, y)).toBe(index);
        }
    });
    it("indexOf()とpositionOf()は0-indexed/1-indexed混合で往復する", () => {
        const grid = new GridIndex([5, 4], [0, 1]);
        for (let x = 0; x < 5; x++) {
            for (let y = 1; y <= 4; y++) {
                expect(grid.positionOf(grid.indexOf(x, y))).toEqual([x, y]);
            }
        }
        for (let index = 0; index < 20; index++) {
            const [x, y] = grid.positionOf(index);
            expect(grid.indexOf(x, y)).toBe(index);
        }
    });
    it("indexOf(), positionOf(), getAdjacentCellIndexes()は1x1の0-indexedで端の値", () => {
        const grid = new GridIndex([1, 1], [0, 0]);
        expect(grid.indexOf(0, 0)).toBe(0);
        expect(grid.positionOf(0)).toEqual([0, 0]);
        expect(grid.getAdjacentCellIndexes(0, 1)).toEqual([]);
        expect(grid.getAdjacentCellIndexes(0, 2)).toEqual([]);
    });
    it("indexOf(), positionOf(), getAdjacentCellIndexes()は1x1の1-indexedで端の値", () => {
        const grid = new GridIndex([1, 1], [1, 1]);
        expect(grid.indexOf(1, 1)).toBe(0);
        expect(grid.positionOf(0)).toEqual([1, 1]);
        expect(grid.getAdjacentCellIndexes(0, 1)).toEqual([]);
        expect(grid.getAdjacentCellIndexes(0, 2)).toEqual([]);
    });
    it("indexOf()とpositionOf()は第2次元の長さが1のとき第1次元の座標がインデックス", () => {
        const grid = new GridIndex([5, 1], [0, 0]);
        expect(grid.indexOf(0, 0)).toBe(0);
        expect(grid.indexOf(4, 0)).toBe(4);
        expect(grid.positionOf(2)).toEqual([2, 0]);
    });
    it("indexOf()とpositionOf()は第1次元の長さが1のとき第2次元の座標がインデックス", () => {
        const grid = new GridIndex([1, 5], [0, 0]);
        expect(grid.indexOf(0, 0)).toBe(0);
        expect(grid.indexOf(0, 4)).toBe(4);
        expect(grid.positionOf(2)).toEqual([0, 2]);
    });
    it("getAdjacentCellIndexes()は第2次元の長さが1のとき第1次元の隣だけ", () => {
        const grid = new GridIndex([5, 1], [0, 0]);
        expect(grid.getAdjacentCellIndexes(0, 1).sort((a, b) => a - b)).toEqual([1]);
        expect(grid.getAdjacentCellIndexes(2, 1).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(grid.getAdjacentCellIndexes(4, 1).sort((a, b) => a - b)).toEqual([3]);
        expect(grid.getAdjacentCellIndexes(0, 2).sort((a, b) => a - b)).toEqual([1]);
        expect(grid.getAdjacentCellIndexes(2, 2).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(grid.getAdjacentCellIndexes(4, 2).sort((a, b) => a - b)).toEqual([3]);
    });
    it("getAdjacentCellIndexes()は第1次元の長さが1のとき第2次元の隣だけ", () => {
        const grid = new GridIndex([1, 5], [0, 0]);
        expect(grid.getAdjacentCellIndexes(0, 1).sort((a, b) => a - b)).toEqual([1]);
        expect(grid.getAdjacentCellIndexes(2, 1).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(grid.getAdjacentCellIndexes(4, 1).sort((a, b) => a - b)).toEqual([3]);
        expect(grid.getAdjacentCellIndexes(0, 2).sort((a, b) => a - b)).toEqual([1]);
        expect(grid.getAdjacentCellIndexes(2, 2).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(grid.getAdjacentCellIndexes(4, 2).sort((a, b) => a - b)).toEqual([3]);
    });
    it("includes()は0-indexedでグリッド内ならtrue、外ならfalse", () => {
        const grid = new GridIndex([3, 5], [0, 0]);
        expect(grid.includes(0, 0)).toBe(true);
        expect(grid.includes(2, 4)).toBe(true);
        expect(grid.includes(-1, 0)).toBe(false);
        expect(grid.includes(3, 0)).toBe(false);
        expect(grid.includes(0, -1)).toBe(false);
        expect(grid.includes(0, 5)).toBe(false);
    });
    it("getAdjacentCellIndexes()は四隅のconnectivity 1で辺で接する2マス", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(grid.getAdjacentCellIndexes(0, 1).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(grid.getAdjacentCellIndexes(2, 1).sort((a, b) => a - b)).toEqual([1, 5]);
        expect(grid.getAdjacentCellIndexes(6, 1).sort((a, b) => a - b)).toEqual([3, 7]);
        expect(grid.getAdjacentCellIndexes(8, 1).sort((a, b) => a - b)).toEqual([5, 7]);
    });
    it("getAdjacentCellIndexes()は四隅のconnectivity 2で接する3マス", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(grid.getAdjacentCellIndexes(0, 2).sort((a, b) => a - b)).toEqual([1, 3, 4]);
        expect(grid.getAdjacentCellIndexes(2, 2).sort((a, b) => a - b)).toEqual([1, 4, 5]);
        expect(grid.getAdjacentCellIndexes(6, 2).sort((a, b) => a - b)).toEqual([3, 4, 7]);
        expect(grid.getAdjacentCellIndexes(8, 2).sort((a, b) => a - b)).toEqual([4, 5, 7]);
    });
    it("getAdjacentCellIndexes()は第2次元の端の中央のとき、connectivityが1なら3マス、2なら5マス", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(grid.getAdjacentCellIndexes(1, 1).sort((a, b) => a - b)).toEqual([0, 2, 4]);
        expect(grid.getAdjacentCellIndexes(1, 2).sort((a, b) => a - b)).toEqual([0, 2, 3, 4, 5]);
    });
    it("getAdjacentCellIndexes()は3x3の全マスで、順不同の隣接集合が一致する", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        const expectedByConnectivity = [
            [
                [1, 3],
                [0, 2, 4],
                [1, 5],
                [0, 4, 6],
                [1, 3, 5, 7],
                [2, 4, 8],
                [3, 7],
                [4, 6, 8],
                [5, 7],
            ],
            [
                [1, 3, 4],
                [0, 2, 3, 4, 5],
                [1, 4, 5],
                [0, 1, 4, 6, 7],
                [0, 1, 2, 3, 5, 6, 7, 8],
                [1, 2, 4, 7, 8],
                [3, 4, 7],
                [3, 4, 5, 6, 8],
                [4, 5, 7],
            ],
        ];
        for (const connectivity of [1, 2] as const) {
            for (let index = 0; index < 9; index++) {
                expect(grid.getAdjacentCellIndexes(index, connectivity).sort((a, b) => a - b)).toEqual(
                    expectedByConnectivity[connectivity - 1][index],
                );
            }
        }
    });
    it("indexOf()とpositionOf()は各次元の長さが10^6のとき端点を変換できる", () => {
        const n = 10 ** 6;
        const grid = new GridIndex([n, n], [0, 0]);
        expect(grid.indexOf(0, 0)).toBe(0);
        expect(grid.indexOf(n - 1, n - 1)).toBe(n * n - 1);
        expect(grid.positionOf(0)).toEqual([0, 0]);
        expect(grid.positionOf(n * n - 1)).toEqual([n - 1, n - 1]);
    });
    it("indexOf()とpositionOf()は次元ごとに異なるbasesで往復する", () => {
        const grid = new GridIndex([3, 4], [0, 1]);
        for (let x = 0; x < 3; x++) {
            for (let y = 1; y <= 4; y++) {
                expect(grid.positionOf(grid.indexOf(x, y))).toEqual([x, y]);
            }
        }
        for (let index = 0; index < 12; index++) {
            const [x, y] = grid.positionOf(index);
            expect(grid.indexOf(x, y)).toBe(index);
        }
    });
    it("includes()は次元ごとに異なるbasesで範囲内ならtrue、外ならfalse", () => {
        const grid = new GridIndex([3, 4], [0, 1]);
        expect(grid.includes(0, 1)).toBe(true);
        expect(grid.includes(2, 4)).toBe(true);
        expect(grid.includes(-1, 1)).toBe(false);
        expect(grid.includes(3, 1)).toBe(false);
        expect(grid.includes(0, 0)).toBe(false);
        expect(grid.includes(0, 5)).toBe(false);
    });
    it("getAdjacentCellIndexes()は次元ごとに異なるbasesでグリッド外を除く", () => {
        const grid = new GridIndex([3, 4], [0, 1]);
        expect(grid.getAdjacentCellIndexes(0, 1).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(grid.getAdjacentCellIndexes(0, 2).sort((a, b) => a - b)).toEqual([1, 3, 4]);
    });
    it("indexOf()とpositionOf()は3次元で次元ごとに異なるbasesのとき往復する", () => {
        const grid = new GridIndex([2, 3, 4], [1, 0, 1]);
        for (let x = 1; x <= 2; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 1; z <= 4; z++) {
                    expect(grid.positionOf(grid.indexOf(x, y, z))).toEqual([x, y, z]);
                }
            }
        }
        for (let index = 0; index < 24; index++) {
            const [x, y, z] = grid.positionOf(index);
            expect(grid.indexOf(x, y, z)).toBe(index);
        }
    });
    it("indexOf()とpositionOf()は1次元の0-indexedで往復する", () => {
        const grid = new GridIndex([5], [0]);
        for (let x = 0; x < 5; x++) {
            expect(grid.positionOf(grid.indexOf(x))).toEqual([x]);
        }
        for (let index = 0; index < 5; index++) {
            const [x] = grid.positionOf(index);
            expect(grid.indexOf(x)).toBe(index);
        }
    });
    it("indexOf()とpositionOf()は1次元の1-indexedで往復する", () => {
        const grid = new GridIndex([5], [1]);
        for (let x = 1; x <= 5; x++) {
            expect(grid.positionOf(grid.indexOf(x))).toEqual([x]);
        }
        for (let index = 0; index < 5; index++) {
            const [x] = grid.positionOf(index);
            expect(grid.indexOf(x)).toBe(index);
        }
    });
    it("indexOf(), positionOf(), getAdjacentCellIndexes()は1次元の長さ1の0-indexedで端の値", () => {
        const grid = new GridIndex([1], [0]);
        expect(grid.indexOf(0)).toBe(0);
        expect(grid.positionOf(0)).toEqual([0]);
        expect(grid.getAdjacentCellIndexes(0, 1)).toEqual([]);
    });
    it("indexOf(), positionOf(), getAdjacentCellIndexes()は1次元の長さ1の1-indexedで端の値", () => {
        const grid = new GridIndex([1], [1]);
        expect(grid.indexOf(1)).toBe(0);
        expect(grid.positionOf(0)).toEqual([1]);
        expect(grid.getAdjacentCellIndexes(0, 1)).toEqual([]);
    });
    it("getAdjacentCellIndexes()は1次元の端と中央で隣のマスだけ", () => {
        const grid = new GridIndex([5], [0]);
        expect(grid.getAdjacentCellIndexes(0, 1).sort((a, b) => a - b)).toEqual([1]);
        expect(grid.getAdjacentCellIndexes(2, 1).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(grid.getAdjacentCellIndexes(4, 1).sort((a, b) => a - b)).toEqual([3]);
    });
    it("includes()は1次元の0-indexedで範囲内ならtrue、外ならfalse", () => {
        const grid = new GridIndex([5], [0]);
        expect(grid.includes(0)).toBe(true);
        expect(grid.includes(4)).toBe(true);
        expect(grid.includes(-1)).toBe(false);
        expect(grid.includes(5)).toBe(false);
    });
    it("indexOf()とpositionOf()は1次元の長さが最大の安全整数のとき端点を変換できる", () => {
        const n = Number.MAX_SAFE_INTEGER;
        const grid = new GridIndex([n], [0]);
        expect(grid.size).toBe(n);
        expect(grid.indexOf(0)).toBe(0);
        expect(grid.indexOf(n - 1)).toBe(n - 1);
        expect(grid.positionOf(0)).toEqual([0]);
        expect(grid.positionOf(n - 1)).toEqual([n - 1]);
        expect(grid.getAdjacentCellIndexes(0, 1)).toEqual([1]);
        expect(grid.getAdjacentCellIndexes(n - 1, 1)).toEqual([n - 2]);
    });
    it("indexOf()とpositionOf()は3次元の0-indexedで端点を変換できる", () => {
        const grid = new GridIndex([2, 3, 4], [0, 0, 0]);
        expect(grid.size).toBe(24);
        expect(grid.indexOf(0, 0, 0)).toBe(0);
        expect(grid.indexOf(1, 2, 3)).toBe(23);
        expect(grid.positionOf(0)).toEqual([0, 0, 0]);
        expect(grid.positionOf(23)).toEqual([1, 2, 3]);
    });
    it("indexOf()とpositionOf()は3次元の0-indexedで往復する", () => {
        const grid = new GridIndex([2, 3, 4], [0, 0, 0]);
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 4; z++) {
                    expect(grid.positionOf(grid.indexOf(x, y, z))).toEqual([x, y, z]);
                }
            }
        }
        for (let index = 0; index < 24; index++) {
            const [x, y, z] = grid.positionOf(index);
            expect(grid.indexOf(x, y, z)).toBe(index);
        }
    });
    it("indexOf()とpositionOf()は3次元の1-indexedで往復する", () => {
        const grid = new GridIndex([2, 3, 4], [1, 1, 1]);
        for (let x = 1; x <= 2; x++) {
            for (let y = 1; y <= 3; y++) {
                for (let z = 1; z <= 4; z++) {
                    expect(grid.positionOf(grid.indexOf(x, y, z))).toEqual([x, y, z]);
                }
            }
        }
        for (let index = 0; index < 24; index++) {
            const [x, y, z] = grid.positionOf(index);
            expect(grid.indexOf(x, y, z)).toBe(index);
        }
    });
    it("includes()は3次元の0-indexedで範囲内ならtrue、外ならfalse", () => {
        const grid = new GridIndex([2, 3, 4], [0, 0, 0]);
        expect(grid.includes(0, 0, 0)).toBe(true);
        expect(grid.includes(1, 2, 3)).toBe(true);
        expect(grid.includes(-1, 0, 0)).toBe(false);
        expect(grid.includes(2, 0, 0)).toBe(false);
        expect(grid.includes(0, -1, 0)).toBe(false);
        expect(grid.includes(0, 3, 0)).toBe(false);
        expect(grid.includes(0, 0, -1)).toBe(false);
        expect(grid.includes(0, 0, 4)).toBe(false);
    });
    it("indexOf(), positionOf(), getAdjacentCellIndexes()は1x1x1の0-indexedで端の値", () => {
        const grid = new GridIndex([1, 1, 1], [0, 0, 0]);
        expect(grid.indexOf(0, 0, 0)).toBe(0);
        expect(grid.positionOf(0)).toEqual([0, 0, 0]);
        expect(grid.getAdjacentCellIndexes(0, 1)).toEqual([]);
        expect(grid.getAdjacentCellIndexes(0, 2)).toEqual([]);
        expect(grid.getAdjacentCellIndexes(0, 3)).toEqual([]);
    });
    it("indexOf(), positionOf(), getAdjacentCellIndexes()は1x1x1の1-indexedで端の値", () => {
        const grid = new GridIndex([1, 1, 1], [1, 1, 1]);
        expect(grid.indexOf(1, 1, 1)).toBe(0);
        expect(grid.positionOf(0)).toEqual([1, 1, 1]);
        expect(grid.getAdjacentCellIndexes(0, 1)).toEqual([]);
        expect(grid.getAdjacentCellIndexes(0, 2)).toEqual([]);
        expect(grid.getAdjacentCellIndexes(0, 3)).toEqual([]);
    });
    it("getAdjacentCellIndexes()は3次元の隅でconnectivityごとの隣接集合が一致する", () => {
        const grid = new GridIndex([3, 3, 3], [0, 0, 0]);
        expect(grid.getAdjacentCellIndexes(0, 1).sort((a, b) => a - b)).toEqual([1, 3, 9]);
        expect(grid.getAdjacentCellIndexes(0, 2).sort((a, b) => a - b)).toEqual([1, 3, 4, 9, 10, 12]);
        expect(grid.getAdjacentCellIndexes(0, 3).sort((a, b) => a - b)).toEqual([1, 3, 4, 9, 10, 12, 13]);
    });
    it("getAdjacentCellIndexes()は3次元の中心でconnectivityごとの隣接集合が一致する", () => {
        const grid = new GridIndex([3, 3, 3], [0, 0, 0]);
        expect(grid.getAdjacentCellIndexes(13, 1).sort((a, b) => a - b)).toEqual([4, 10, 12, 14, 16, 22]);
        expect(grid.getAdjacentCellIndexes(13, 2).sort((a, b) => a - b)).toEqual([
            1, 3, 4, 5, 7, 9, 10, 11, 12, 14, 15, 16, 17, 19, 21, 22, 23, 25,
        ]);
        expect(grid.getAdjacentCellIndexes(13, 3).sort((a, b) => a - b)).toEqual([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
        ]);
    });
    it("getAdjacentCellIndexes()はindexが負のときRangeError", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(() => grid.getAdjacentCellIndexes(-1, 1)).toThrow(RangeError);
    });
    it("getAdjacentCellIndexes()はindexがsize以上のときRangeError", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(() => grid.getAdjacentCellIndexes(grid.size, 1)).toThrow(RangeError);
        expect(() => grid.getAdjacentCellIndexes(grid.size + 1, 1)).toThrow(RangeError);
    });
    it("getAdjacentCellIndexes()はindexが非整数のときRangeError", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(() => grid.getAdjacentCellIndexes(1.5, 1)).toThrow(RangeError);
    });
    it("getAdjacentCellIndexes()はconnectivityが1未満のときRangeError", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(() => grid.getAdjacentCellIndexes(4, 0)).toThrow(RangeError);
        expect(() => grid.getAdjacentCellIndexes(4, -1)).toThrow(RangeError);
    });
    it("getAdjacentCellIndexes()はconnectivityが次元数を超えるときRangeError", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(() => grid.getAdjacentCellIndexes(4, 3)).toThrow(RangeError);
    });
    it("getAdjacentCellIndexes()はconnectivityが非整数のときRangeError", () => {
        const grid = new GridIndex([3, 3], [0, 0]);
        expect(() => grid.getAdjacentCellIndexes(4, 1.5)).toThrow(RangeError);
    });
    it("小さい4次元グリッドで総当たりの隣接判定と一致する", () => {
        const shape = [3, 3, 3, 3];
        const bases: (0 | 1)[] = [0, 1, 0, 1];
        const grid = new GridIndex(shape, bases);

        // テスト側で独立に座標を復元する。
        const decode = (index: number): number[] => {
            const position: number[] = [];
            for (let d = 0; d < shape.length; d++) {
                position.push((index % shape[d]) + bases[d]);
                index = Math.floor(index / shape[d]);
            }
            return position;
        };

        const positions = Array.from({ length: grid.size }, (_, index) => decode(index));
        for (let index = 0; index < grid.size; index++) {
            const from = positions[index];
            for (let c = 1; c <= shape.length; c++) {
                const expected: number[] = [];
                for (let next = 0; next < grid.size; next++) {
                    const to = positions[next];
                    let movedAxes = 0;
                    let withinOneStep = true;
                    for (let d = 0; d < shape.length; d++) {
                        const diff = Math.abs(to[d] - from[d]);
                        if (diff > 1) {
                            withinOneStep = false;
                            break;
                        }
                        if (diff === 1) movedAxes++;
                    }
                    if (withinOneStep && 1 <= movedAxes && movedAxes <= c) {
                        expected.push(next);
                    }
                }
                const actual = grid.getAdjacentCellIndexes(index, c).sort((a, b) => a - b);
                expect(actual).toEqual(expected);
            }
        }
    });
});
