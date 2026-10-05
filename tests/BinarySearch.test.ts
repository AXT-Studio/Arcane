import { describe, expect, it } from "vitest";
import { BinarySearch } from "../src/BinarySearch.ts";

describe("BinarySearch - JSDoc @example", () => {
    it("BinarySearch.binary_search()", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.binary_search(arr, 5, (a, b) => a - b)).toBe(true);
        expect(BinarySearch.binary_search(arr, 4, (a, b) => a - b)).toBe(false);
    });
    it("BinarySearch.lower_bound()", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.lower_bound(arr, 4, (a, b) => a - b)).toBe(2);
        expect(BinarySearch.lower_bound(arr, 10, (a, b) => a - b)).toBe(5);
    });
    it("BinarySearch.upper_bound()", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.upper_bound(arr, 2, (a, b) => a - b)).toBe(1);
        expect(BinarySearch.upper_bound(arr, 5, (a, b) => a - b)).toBe(3);
        expect(BinarySearch.upper_bound(arr, 9, (a, b) => a - b)).toBe(5);
    });
});

describe("BinarySearch - Edge Cases", () => {
    it("binary_search()は空配列のときfalse", () => {
        const arr: number[] = [];
        expect(BinarySearch.binary_search(arr, 1, (a, b) => a - b)).toBe(false);
    });
    it("lower_bound()は空配列のとき0", () => {
        const arr: number[] = [];
        expect(BinarySearch.lower_bound(arr, 1, (a, b) => a - b)).toBe(0);
    });
    it("upper_bound()は空配列のとき0", () => {
        const arr: number[] = [];
        expect(BinarySearch.upper_bound(arr, 1, (a, b) => a - b)).toBe(0);
    });
    it("binary_search()は要素が1つのとき、一致ならtrue、不一致ならfalse", () => {
        const arr = [5];
        expect(BinarySearch.binary_search(arr, 5, (a, b) => a - b)).toBe(true);
        expect(BinarySearch.binary_search(arr, 4, (a, b) => a - b)).toBe(false);
    });
    it("lower_bound()は要素が1つのとき、未満なら0、一致なら0、超過なら1", () => {
        const arr = [5];
        expect(BinarySearch.lower_bound(arr, 4, (a, b) => a - b)).toBe(0);
        expect(BinarySearch.lower_bound(arr, 5, (a, b) => a - b)).toBe(0);
        expect(BinarySearch.lower_bound(arr, 6, (a, b) => a - b)).toBe(1);
    });
    it("upper_bound()は要素が1つのとき、未満なら0、一致なら1、超過なら1", () => {
        const arr = [5];
        expect(BinarySearch.upper_bound(arr, 4, (a, b) => a - b)).toBe(0);
        expect(BinarySearch.upper_bound(arr, 5, (a, b) => a - b)).toBe(1);
        expect(BinarySearch.upper_bound(arr, 6, (a, b) => a - b)).toBe(1);
    });
    it("binary_search()は全要素より小さいまたは大きいときfalse", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.binary_search(arr, 0, (a, b) => a - b)).toBe(false);
        expect(BinarySearch.binary_search(arr, 10, (a, b) => a - b)).toBe(false);
    });
    it("lower_bound()は全要素より小さいとき0、全要素より大きいとき配列長", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.lower_bound(arr, 0, (a, b) => a - b)).toBe(0);
        expect(BinarySearch.lower_bound(arr, 10, (a, b) => a - b)).toBe(5);
    });
    it("upper_bound()は全要素より小さいとき0、全要素より大きいとき配列長", () => {
        const arr = [1, 3, 5, 7, 9];
        expect(BinarySearch.upper_bound(arr, 0, (a, b) => a - b)).toBe(0);
        expect(BinarySearch.upper_bound(arr, 10, (a, b) => a - b)).toBe(5);
    });
    it("binary_search()は値が重複するときtrue", () => {
        const arr = [1, 2, 2, 2, 5];
        expect(BinarySearch.binary_search(arr, 2, (a, b) => a - b)).toBe(true);
    });
    it("lower_bound()は値が重複するとき、等しい範囲の先頭", () => {
        const arr = [1, 2, 2, 2, 5];
        expect(BinarySearch.lower_bound(arr, 2, (a, b) => a - b)).toBe(1);
    });
    it("upper_bound()は値が重複するとき、等しい範囲の末尾の次", () => {
        const arr = [1, 2, 2, 2, 5];
        expect(BinarySearch.upper_bound(arr, 2, (a, b) => a - b)).toBe(4);
    });
});

describe("BinarySearch - Random Tests", () => {
    it("binary_search()について、includes()と比較して一致確認", () => {
        const arr = Array.from({ length: 1e2 }, () => 1 + Math.floor(Math.random() * 2e2)).sort((a, b) => a - b);
        for (let x = 1; x <= 2e2; x++) {
            expect(BinarySearch.binary_search(arr, x, (a, b) => a - b)).toBe(arr.includes(x));
        }
    });
    it("lower_bound()について、filter(el => el < x).lengthと比較して一致確認", () => {
        const arr = Array.from({ length: 1e2 }, () => 1 + Math.floor(Math.random() * 2e2)).sort((a, b) => a - b);
        for (let x = 1; x <= 2e2; x++) {
            expect(BinarySearch.lower_bound(arr, x, (a, b) => a - b)).toBe(arr.filter((el) => el < x).length);
        }
    });
    it("upper_bound()について、filter(el => el <= x).lengthと比較して一致確認", () => {
        const arr = Array.from({ length: 1e2 }, () => 1 + Math.floor(Math.random() * 2e2)).sort((a, b) => a - b);
        for (let x = 1; x <= 2e2; x++) {
            expect(BinarySearch.upper_bound(arr, x, (a, b) => a - b)).toBe(arr.filter((el) => el <= x).length);
        }
    });
});
