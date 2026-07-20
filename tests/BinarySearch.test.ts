import { describe, expect, it } from "vitest";
import { BinarySearch } from "../src/BinarySearch.ts";

describe("BinarySearch の @example", () => {
    it("binary_search", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.binary_search(arr, 5, (a, b) => a - b)).toBe(true);
        expect(BinarySearch.binary_search(arr, 4, (a, b) => a - b)).toBe(false);
    });

    it("lower_bound", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.lower_bound(arr, 4, (a, b) => a - b)).toBe(2);
        expect(BinarySearch.lower_bound(arr, 10, (a, b) => a - b)).toBe(5);
    });

    it("upper_bound", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.upper_bound(arr, 2, (a, b) => a - b)).toBe(1);
        expect(BinarySearch.upper_bound(arr, 5, (a, b) => a - b)).toBe(3);
        expect(BinarySearch.upper_bound(arr, 9, (a, b) => a - b)).toBe(5);
    });
});

describe("BinarySearch の境界・特例", () => {
    it("空配列", () => {
        const arr: number[] = [];
        expect(BinarySearch.binary_search(arr, 1, (a, b) => a - b)).toBe(false);
        expect(BinarySearch.lower_bound(arr, 1, (a, b) => a - b)).toBe(0);
        expect(BinarySearch.upper_bound(arr, 1, (a, b) => a - b)).toBe(0);
    });

    it("全域外（全要素より小さい / 大きい）", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.lower_bound(arr, 0, (a, b) => a - b)).toBe(0);
        expect(BinarySearch.upper_bound(arr, 0, (a, b) => a - b)).toBe(0);
        expect(BinarySearch.lower_bound(arr, 10, (a, b) => a - b)).toBe(5);
        expect(BinarySearch.upper_bound(arr, 10, (a, b) => a - b)).toBe(5);
        expect(BinarySearch.binary_search(arr, 0, (a, b) => a - b)).toBe(false);
        expect(BinarySearch.binary_search(arr, 10, (a, b) => a - b)).toBe(false);
    });

    it("重複ありの lower_bound / upper_bound", () => {
        const arr = [1, 2, 2, 2, 5];
        expect(BinarySearch.lower_bound(arr, 2, (a, b) => a - b)).toBe(1);
        expect(BinarySearch.upper_bound(arr, 2, (a, b) => a - b)).toBe(4);
        expect(BinarySearch.binary_search(arr, 2, (a, b) => a - b)).toBe(true);
    });
});
