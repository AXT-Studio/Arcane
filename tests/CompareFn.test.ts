import { describe, expect, it } from "vitest";
import { CompareFn } from "../src/CompareFn.ts";

describe("CompareFn - JSDoc @example", () => {
    it("CompareFn.number_asc() [Array#sort()の比較関数として使用]", () => {
        const arr = [5, 2, 9, 1, 5];
        arr.sort(CompareFn.number_asc);
        expect(arr).toEqual([1, 2, 5, 5, 9]);
    });
    it("CompareFn.number_desc() [Array#sort()の比較関数として使用]", () => {
        const arr = [5, 2, 9, 1, 5];
        arr.sort(CompareFn.number_desc);
        expect(arr).toEqual([9, 5, 5, 2, 1]);
    });
    it("CompareFn.unicode_forward() [Array#sort()の比較関数として使用]", () => {
        const arr = ["banana", "apple", "cherry"];
        arr.sort(CompareFn.unicode_forward);
        expect(arr).toEqual(["apple", "banana", "cherry"]);
    });
    it("CompareFn.unicode_reverse() [Array#sort()の比較関数として使用]", () => {
        const arr = ["banana", "apple", "cherry"];
        arr.sort(CompareFn.unicode_reverse);
        expect(arr).toEqual(["cherry", "banana", "apple"]);
    });
});
