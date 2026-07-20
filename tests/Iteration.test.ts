import { describe, expect, it } from "vitest";
import { Iteration } from "../src/Iteration.ts";

describe("Iteration の @example", () => {
    it("next_permutation を Array.from で展開", () => {
        const arr = [1, 2, 3];
        const permutations = Array.from(Iteration.next_permutation(arr, (a, b) => a - b));
        expect(permutations).toEqual([
            [1, 2, 3],
            [1, 3, 2],
            [2, 1, 3],
            [2, 3, 1],
            [3, 1, 2],
            [3, 2, 1],
        ]);
    });

    it("next_permutation を for-of で走査", () => {
        const arr = [1, 2, 3];
        const permutations: number[][] = [];
        for (const perm of Iteration.next_permutation(arr, (a, b) => a - b)) {
            permutations.push(perm);
        }
        expect(permutations).toEqual([
            [1, 2, 3],
            [1, 3, 2],
            [2, 1, 3],
            [2, 3, 1],
            [3, 1, 2],
            [3, 2, 1],
        ]);
    });

    it("next_product による bit 全探索", () => {
        const products = Array.from(Iteration.next_product([2, 2]));
        expect(products).toEqual([
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
        ]);
    });

    it("上限が異なる next_product", () => {
        const products = Array.from(Iteration.next_product([2, 3]));
        expect(products).toEqual([
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 0],
            [1, 1],
            [1, 2],
        ]);
    });

    it("空配列の next_product", () => {
        const products = Array.from(Iteration.next_product([]));
        expect(products).toEqual([[]]);
    });
});
