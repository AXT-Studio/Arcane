import { describe, expect, it } from "vitest";
import { GridIndex2D } from "../src/GridIndex2D.ts";

describe("GridIndex2D の @example", () => {
    it("constructor (1-indexed)", () => {
        const gridIndex = new GridIndex2D(5, 3, 1);
        expect(gridIndex.H).toBe(5);
        expect(gridIndex.W).toBe(3);
        expect(gridIndex.base).toBe(1);
    });

    it("indexOf", () => {
        const gridIndex = new GridIndex2D(5, 3, 1);
        expect(gridIndex.indexOf(1, 1)).toBe(0);
        expect(gridIndex.indexOf(2, 2)).toBe(4);
        expect(gridIndex.indexOf(5, 3)).toBe(14);
    });

    it("positionOf", () => {
        const gridIndex = new GridIndex2D(5, 3, 1);
        expect(gridIndex.positionOf(0)).toEqual([1, 1]);
        expect(gridIndex.positionOf(4)).toEqual([2, 2]);
        expect(gridIndex.positionOf(14)).toEqual([5, 3]);
    });

    it("getAdjacentCellIndexes", () => {
        const gridIndex = new GridIndex2D(3, 3, 1);
        expect(gridIndex.getAdjacentCellIndexes(4, 4)).toEqual([1, 3, 5, 7]);
        expect(gridIndex.getAdjacentCellIndexes(4, 8)).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
        expect(gridIndex.getAdjacentCellIndexes(0, 4)).toEqual([1, 3]);
        expect(gridIndex.getAdjacentCellIndexes(5, 8)).toEqual([1, 2, 4, 7, 8]);
    });

    it("isInGrid", () => {
        const gridIndex = new GridIndex2D(5, 3, 1);
        expect(gridIndex.isInGrid(1, 1)).toBe(true);
        expect(gridIndex.isInGrid(5, 3)).toBe(true);
        expect(gridIndex.isInGrid(0, 0)).toBe(false);
        expect(gridIndex.isInGrid(6, 4)).toBe(false);
    });
});

describe("GridIndex2D のエラー", () => {
    it("constructor は H, W が正の安全整数でないとき Error", () => {
        expect(() => new GridIndex2D(0, 3, 1)).toThrow(Error);
        expect(() => new GridIndex2D(3, 0, 1)).toThrow(Error);
        expect(() => new GridIndex2D(-1, 3, 1)).toThrow(Error);
        expect(() => new GridIndex2D(3, -1, 1)).toThrow(Error);
        expect(() => new GridIndex2D(1.5, 3, 1)).toThrow(Error);
        expect(() => new GridIndex2D(3, 1.5, 1)).toThrow(Error);
    });

    it("constructor は H*W が安全整数でないとき Error", () => {
        expect(() => new GridIndex2D(2 ** 27, 2 ** 27, 0)).toThrow(Error);
    });
});

describe("GridIndex2D の境界・特例", () => {
    it("0-indexed の indexOf / positionOf", () => {
        const gridIndex = new GridIndex2D(5, 3, 0);
        expect(gridIndex.indexOf(0, 0)).toBe(0);
        expect(gridIndex.indexOf(1, 1)).toBe(4);
        expect(gridIndex.indexOf(4, 2)).toBe(14);
        expect(gridIndex.positionOf(0)).toEqual([0, 0]);
        expect(gridIndex.positionOf(4)).toEqual([1, 1]);
        expect(gridIndex.positionOf(14)).toEqual([4, 2]);
    });

    it("indexOf と positionOf の往復 (0-indexed)", () => {
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

    it("indexOf と positionOf の往復 (1-indexed)", () => {
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

    it("1x1 グリッド", () => {
        const zeroBased = new GridIndex2D(1, 1, 0);
        expect(zeroBased.indexOf(0, 0)).toBe(0);
        expect(zeroBased.positionOf(0)).toEqual([0, 0]);
        expect(zeroBased.getAdjacentCellIndexes(0, 4)).toEqual([]);
        expect(zeroBased.getAdjacentCellIndexes(0, 8)).toEqual([]);

        const oneBased = new GridIndex2D(1, 1, 1);
        expect(oneBased.indexOf(1, 1)).toBe(0);
        expect(oneBased.positionOf(0)).toEqual([1, 1]);
        expect(oneBased.getAdjacentCellIndexes(0, 4)).toEqual([]);
        expect(oneBased.getAdjacentCellIndexes(0, 8)).toEqual([]);
    });

    it("細長いグリッド (1行 / 1列)", () => {
        const row = new GridIndex2D(1, 5, 0);
        expect(row.indexOf(0, 0)).toBe(0);
        expect(row.indexOf(0, 4)).toBe(4);
        expect(row.positionOf(2)).toEqual([0, 2]);

        const col = new GridIndex2D(5, 1, 0);
        expect(col.indexOf(0, 0)).toBe(0);
        expect(col.indexOf(4, 0)).toBe(4);
        expect(col.positionOf(2)).toEqual([2, 0]);
    });

    it("細長いグリッドの隣接 (4近傍 / 8近傍)", () => {
        const row = new GridIndex2D(1, 5, 0);
        expect(row.getAdjacentCellIndexes(0, 4)).toEqual([1]);
        expect(row.getAdjacentCellIndexes(2, 4)).toEqual([1, 3]);
        expect(row.getAdjacentCellIndexes(4, 4)).toEqual([3]);
        expect(row.getAdjacentCellIndexes(0, 8)).toEqual([1]);
        expect(row.getAdjacentCellIndexes(2, 8)).toEqual([1, 3]);
        expect(row.getAdjacentCellIndexes(4, 8)).toEqual([3]);

        const col = new GridIndex2D(5, 1, 0);
        expect(col.getAdjacentCellIndexes(0, 4)).toEqual([1]);
        expect(col.getAdjacentCellIndexes(2, 4)).toEqual([1, 3]);
        expect(col.getAdjacentCellIndexes(4, 4)).toEqual([3]);
        expect(col.getAdjacentCellIndexes(0, 8)).toEqual([1]);
        expect(col.getAdjacentCellIndexes(2, 8)).toEqual([1, 3]);
        expect(col.getAdjacentCellIndexes(4, 8)).toEqual([3]);
    });

    it("0-indexed の isInGrid 境界", () => {
        const gridIndex = new GridIndex2D(5, 3, 0);
        expect(gridIndex.isInGrid(0, 0)).toBe(true);
        expect(gridIndex.isInGrid(4, 2)).toBe(true);
        expect(gridIndex.isInGrid(-1, 0)).toBe(false);
        expect(gridIndex.isInGrid(5, 0)).toBe(false);
        expect(gridIndex.isInGrid(0, -1)).toBe(false);
        expect(gridIndex.isInGrid(0, 3)).toBe(false);
    });

    it("四隅の隣接 (4近傍 / 8近傍)", () => {
        const gridIndex = new GridIndex2D(3, 3, 0);
        expect(gridIndex.getAdjacentCellIndexes(0, 4)).toEqual([1, 3]);
        expect(gridIndex.getAdjacentCellIndexes(2, 4)).toEqual([1, 5]);
        expect(gridIndex.getAdjacentCellIndexes(6, 4)).toEqual([3, 7]);
        expect(gridIndex.getAdjacentCellIndexes(8, 4)).toEqual([5, 7]);

        expect(gridIndex.getAdjacentCellIndexes(0, 8)).toEqual([1, 3, 4]);
        expect(gridIndex.getAdjacentCellIndexes(2, 8)).toEqual([1, 4, 5]);
        expect(gridIndex.getAdjacentCellIndexes(6, 8)).toEqual([3, 4, 7]);
        expect(gridIndex.getAdjacentCellIndexes(8, 8)).toEqual([4, 5, 7]);
    });

    it("辺上（隅以外）の隣接", () => {
        const gridIndex = new GridIndex2D(3, 3, 0);
        expect(gridIndex.getAdjacentCellIndexes(1, 4)).toEqual([0, 2, 4]);
        expect(gridIndex.getAdjacentCellIndexes(1, 8)).toEqual([0, 2, 3, 4, 5]);
    });

    it("getAdjacentCellIndexes の戻り値は昇順", () => {
        const gridIndex = new GridIndex2D(3, 3, 0);
        for (const mode of [4, 8] as const) {
            for (let index = 0; index < 9; index++) {
                const adjacent = gridIndex.getAdjacentCellIndexes(index, mode);
                expect(adjacent).toEqual([...adjacent].sort((a, b) => a - b));
            }
        }
    });

    it("大きな合法な H, W でも constructor と相互変換が動く", () => {
        const H = 10 ** 6;
        const W = 10 ** 6;
        const gridIndex = new GridIndex2D(H, W, 0);
        expect(gridIndex.indexOf(0, 0)).toBe(0);
        expect(gridIndex.indexOf(H - 1, W - 1)).toBe(H * W - 1);
        expect(gridIndex.positionOf(0)).toEqual([0, 0]);
        expect(gridIndex.positionOf(H * W - 1)).toEqual([H - 1, W - 1]);
    });
});
