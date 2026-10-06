import { describe, expect, it } from "vitest";
import { GridIndex2D } from "../src/GridIndex2D.ts";

describe("GridIndex2D - JSDoc @example", () => {
    it("new GridIndex2D() [1-indexedの場合]", () => {
        expect(() => {
            const _gridIndex = new GridIndex2D(5, 3, 1);
        }).not.toThrow();
    });
    it("indexOf()", () => {
        const gridIndex = new GridIndex2D(5, 3, 1);
        expect(gridIndex.indexOf(1, 1)).toBe(0);
        expect(gridIndex.indexOf(2, 2)).toBe(4);
        expect(gridIndex.indexOf(5, 3)).toBe(14);
    });
    it("positionOf()", () => {
        const gridIndex = new GridIndex2D(5, 3, 1);
        expect(gridIndex.positionOf(0)).toEqual([1, 1]);
        expect(gridIndex.positionOf(4)).toEqual([2, 2]);
        expect(gridIndex.positionOf(14)).toEqual([5, 3]);
    });
    it("getAdjacentCellIndexes()", () => {
        const gridIndex = new GridIndex2D(3, 3, 1);
        expect(gridIndex.getAdjacentCellIndexes(4, 4)).toEqual([1, 3, 5, 7]);
        expect(gridIndex.getAdjacentCellIndexes(4, 8)).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
        expect(gridIndex.getAdjacentCellIndexes(0, 4)).toEqual([1, 3]);
        expect(gridIndex.getAdjacentCellIndexes(5, 8)).toEqual([1, 2, 4, 7, 8]);
    });
    it("isInGrid()", () => {
        const gridIndex = new GridIndex2D(5, 3, 1);
        expect(gridIndex.isInGrid(1, 1)).toBe(true);
        expect(gridIndex.isInGrid(5, 3)).toBe(true);
        expect(gridIndex.isInGrid(0, 0)).toBe(false);
        expect(gridIndex.isInGrid(6, 4)).toBe(false);
    });
});

describe("GridIndex2D - Edge Cases", () => {
    it("H, W, baseはコンストラクタ引数を保持する", () => {
        const gridIndex = new GridIndex2D(5, 3, 1);
        expect(gridIndex.H).toBe(5);
        expect(gridIndex.W).toBe(3);
        expect(gridIndex.base).toBe(1);
    });
    it("new GridIndex2D()はHが0のときError", () => {
        expect(() => new GridIndex2D(0, 3, 1)).toThrow(Error);
    });
    it("new GridIndex2D()はWが0のときError", () => {
        expect(() => new GridIndex2D(3, 0, 1)).toThrow(Error);
    });
    it("new GridIndex2D()はHが負のときError", () => {
        expect(() => new GridIndex2D(-1, 3, 1)).toThrow(Error);
    });
    it("new GridIndex2D()はWが負のときError", () => {
        expect(() => new GridIndex2D(3, -1, 1)).toThrow(Error);
    });
    it("new GridIndex2D()はHが非整数のときError", () => {
        expect(() => new GridIndex2D(1.5, 3, 1)).toThrow(Error);
    });
    it("new GridIndex2D()はWが非整数のときError", () => {
        expect(() => new GridIndex2D(3, 1.5, 1)).toThrow(Error);
    });
    it("new GridIndex2D()はH*Wが安全整数でないときError", () => {
        expect(() => new GridIndex2D(2 ** 27, 2 ** 27, 0)).toThrow(Error);
    });
    it("indexOf()は0-indexedのとき行優先のインデックス", () => {
        const gridIndex = new GridIndex2D(5, 3, 0);
        expect(gridIndex.indexOf(0, 0)).toBe(0);
        expect(gridIndex.indexOf(1, 1)).toBe(4);
        expect(gridIndex.indexOf(4, 2)).toBe(14);
    });
    it("positionOf()は0-indexedのとき座標を返す", () => {
        const gridIndex = new GridIndex2D(5, 3, 0);
        expect(gridIndex.positionOf(0)).toEqual([0, 0]);
        expect(gridIndex.positionOf(4)).toEqual([1, 1]);
        expect(gridIndex.positionOf(14)).toEqual([4, 2]);
    });
    it("indexOf()とpositionOf()は0-indexedで往復する", () => {
        const gridIndex = new GridIndex2D(4, 5, 0);
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 5; c++) {
                expect(gridIndex.positionOf(gridIndex.indexOf(r, c))).toEqual([r, c]);
            }
        }
        for (let index = 0; index < 20; index++) {
            const [r, c] = gridIndex.positionOf(index);
            expect(gridIndex.indexOf(r, c)).toBe(index);
        }
    });
    it("indexOf()とpositionOf()は1-indexedで往復する", () => {
        const gridIndex = new GridIndex2D(4, 5, 1);
        for (let r = 1; r <= 4; r++) {
            for (let c = 1; c <= 5; c++) {
                expect(gridIndex.positionOf(gridIndex.indexOf(r, c))).toEqual([r, c]);
            }
        }
        for (let index = 0; index < 20; index++) {
            const [r, c] = gridIndex.positionOf(index);
            expect(gridIndex.indexOf(r, c)).toBe(index);
        }
    });
    it("indexOf(), positionOf(), getAdjacentCellIndexes()は1x1の0-indexedで端の値", () => {
        const gridIndex = new GridIndex2D(1, 1, 0);
        expect(gridIndex.indexOf(0, 0)).toBe(0);
        expect(gridIndex.positionOf(0)).toEqual([0, 0]);
        expect(gridIndex.getAdjacentCellIndexes(0, 4)).toEqual([]);
        expect(gridIndex.getAdjacentCellIndexes(0, 8)).toEqual([]);
    });
    it("indexOf(), positionOf(), getAdjacentCellIndexes()は1x1の1-indexedで端の値", () => {
        const gridIndex = new GridIndex2D(1, 1, 1);
        expect(gridIndex.indexOf(1, 1)).toBe(0);
        expect(gridIndex.positionOf(0)).toEqual([1, 1]);
        expect(gridIndex.getAdjacentCellIndexes(0, 4)).toEqual([]);
        expect(gridIndex.getAdjacentCellIndexes(0, 8)).toEqual([]);
    });
    it("indexOf()とpositionOf()は1行のとき列番号がインデックス", () => {
        const gridIndex = new GridIndex2D(1, 5, 0);
        expect(gridIndex.indexOf(0, 0)).toBe(0);
        expect(gridIndex.indexOf(0, 4)).toBe(4);
        expect(gridIndex.positionOf(2)).toEqual([0, 2]);
    });
    it("indexOf()とpositionOf()は1列のとき行番号がインデックス", () => {
        const gridIndex = new GridIndex2D(5, 1, 0);
        expect(gridIndex.indexOf(0, 0)).toBe(0);
        expect(gridIndex.indexOf(4, 0)).toBe(4);
        expect(gridIndex.positionOf(2)).toEqual([2, 0]);
    });
    it("getAdjacentCellIndexes()は1行のとき左右のマスだけ", () => {
        const gridIndex = new GridIndex2D(1, 5, 0);
        expect(gridIndex.getAdjacentCellIndexes(0, 4)).toEqual([1]);
        expect(gridIndex.getAdjacentCellIndexes(2, 4)).toEqual([1, 3]);
        expect(gridIndex.getAdjacentCellIndexes(4, 4)).toEqual([3]);
        expect(gridIndex.getAdjacentCellIndexes(0, 8)).toEqual([1]);
        expect(gridIndex.getAdjacentCellIndexes(2, 8)).toEqual([1, 3]);
        expect(gridIndex.getAdjacentCellIndexes(4, 8)).toEqual([3]);
    });
    it("getAdjacentCellIndexes()は1列のとき上下のマスだけ", () => {
        const gridIndex = new GridIndex2D(5, 1, 0);
        expect(gridIndex.getAdjacentCellIndexes(0, 4)).toEqual([1]);
        expect(gridIndex.getAdjacentCellIndexes(2, 4)).toEqual([1, 3]);
        expect(gridIndex.getAdjacentCellIndexes(4, 4)).toEqual([3]);
        expect(gridIndex.getAdjacentCellIndexes(0, 8)).toEqual([1]);
        expect(gridIndex.getAdjacentCellIndexes(2, 8)).toEqual([1, 3]);
        expect(gridIndex.getAdjacentCellIndexes(4, 8)).toEqual([3]);
    });
    it("isInGrid()は0-indexedでグリッド内ならtrue、外ならfalse", () => {
        const gridIndex = new GridIndex2D(5, 3, 0);
        expect(gridIndex.isInGrid(0, 0)).toBe(true);
        expect(gridIndex.isInGrid(4, 2)).toBe(true);
        expect(gridIndex.isInGrid(-1, 0)).toBe(false);
        expect(gridIndex.isInGrid(5, 0)).toBe(false);
        expect(gridIndex.isInGrid(0, -1)).toBe(false);
        expect(gridIndex.isInGrid(0, 3)).toBe(false);
    });
    it("getAdjacentCellIndexes()は四隅の4近傍で辺で接する2マス", () => {
        const gridIndex = new GridIndex2D(3, 3, 0);
        expect(gridIndex.getAdjacentCellIndexes(0, 4)).toEqual([1, 3]);
        expect(gridIndex.getAdjacentCellIndexes(2, 4)).toEqual([1, 5]);
        expect(gridIndex.getAdjacentCellIndexes(6, 4)).toEqual([3, 7]);
        expect(gridIndex.getAdjacentCellIndexes(8, 4)).toEqual([5, 7]);
    });
    it("getAdjacentCellIndexes()は四隅の8近傍で接する3マス", () => {
        const gridIndex = new GridIndex2D(3, 3, 0);
        expect(gridIndex.getAdjacentCellIndexes(0, 8)).toEqual([1, 3, 4]);
        expect(gridIndex.getAdjacentCellIndexes(2, 8)).toEqual([1, 4, 5]);
        expect(gridIndex.getAdjacentCellIndexes(6, 8)).toEqual([3, 4, 7]);
        expect(gridIndex.getAdjacentCellIndexes(8, 8)).toEqual([4, 5, 7]);
    });
    it("getAdjacentCellIndexes()は上辺中央のとき、4近傍は3マス、8近傍は5マス", () => {
        const gridIndex = new GridIndex2D(3, 3, 0);
        expect(gridIndex.getAdjacentCellIndexes(1, 4)).toEqual([0, 2, 4]);
        expect(gridIndex.getAdjacentCellIndexes(1, 8)).toEqual([0, 2, 3, 4, 5]);
    });
    it("getAdjacentCellIndexes()は隣接インデックスを昇順で返す", () => {
        const gridIndex = new GridIndex2D(3, 3, 0);
        for (const mode of [4, 8] as const) {
            for (let index = 0; index < 9; index++) {
                const adjacent = gridIndex.getAdjacentCellIndexes(index, mode);
                expect(adjacent).toEqual([...adjacent].sort((a, b) => a - b));
            }
        }
    });
    it("indexOf()とpositionOf()はHとWが10^6のとき端点を変換できる", () => {
        const H = 10 ** 6;
        const W = 10 ** 6;
        const gridIndex = new GridIndex2D(H, W, 0);
        expect(gridIndex.indexOf(0, 0)).toBe(0);
        expect(gridIndex.indexOf(H - 1, W - 1)).toBe(H * W - 1);
        expect(gridIndex.positionOf(0)).toEqual([0, 0]);
        expect(gridIndex.positionOf(H * W - 1)).toEqual([H - 1, W - 1]);
    });
});
