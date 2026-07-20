import { describe, expect, it } from "vitest";
import { CompareFn } from "../src/CompareFn.ts";

describe("CompareFn @example", () => {
    it("number_asc", () => {
        const arr = [5, 2, 9, 1, 5];
        arr.sort(CompareFn.number_asc);
        expect(arr).toEqual([1, 2, 5, 5, 9]);
    });

    it("number_desc", () => {
        const arr = [5, 2, 9, 1, 5];
        arr.sort(CompareFn.number_desc);
        expect(arr).toEqual([9, 5, 5, 2, 1]);
    });

    it("unicode_forward", () => {
        const arr = ["banana", "apple", "cherry"];
        arr.sort(CompareFn.unicode_forward);
        expect(arr).toEqual(["apple", "banana", "cherry"]);
    });

    it("unicode_reverse", () => {
        const arr = ["banana", "apple", "cherry"];
        arr.sort(CompareFn.unicode_reverse);
        expect(arr).toEqual(["cherry", "banana", "apple"]);
    });
});
