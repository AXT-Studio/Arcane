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
