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

    it("forEachPair で隣り合う差を表示", () => {
        const arr = [1, 4, 10, 15];
        const lines: string[] = [];
        Iteration.forEachPair(arr, (a, b, idx) => {
            lines.push(`Pair #${idx}: ${Math.abs(a - b)}`);
        });
        expect(lines).toEqual(["Pair #0: 3", "Pair #1: 6", "Pair #2: 5"]);
    });

    it("accumulate の number 例", () => {
        const nums = [2, 3, 5, 7];
        expect(Iteration.accumulate(nums)).toEqual([2, 5, 10, 17]);
        expect(Iteration.accumulate(nums, (a, b) => a * b)).toEqual([2, 6, 30, 210]);
        expect(Iteration.accumulate(nums, (a, b) => a + b, 0)).toEqual([0, 2, 5, 10, 17]);
    });

    it("accumulate の bigint 例", () => {
        const ints = [2n, 3n, 5n, 7n];
        expect(Iteration.accumulate(ints)).toEqual([2n, 5n, 10n, 17n]);
        expect(Iteration.accumulate(ints, (a, b) => a * b)).toEqual([2n, 6n, 30n, 210n]);
        expect(Iteration.accumulate(ints, (a, b) => a + b, 0n)).toEqual([0n, 2n, 5n, 10n, 17n]);
    });
});

describe("Iteration の境界・特例", () => {
    it("next_product は 0 以下を含むとき何も返さない", () => {
        expect(Array.from(Iteration.next_product([2, 0]))).toEqual([]);
        expect(Array.from(Iteration.next_product([-1]))).toEqual([]);
    });

    it("next_permutation の長さ 0 / 1", () => {
        expect(Array.from(Iteration.next_permutation([], (a, b) => a - b))).toEqual([[]]);
        expect(Array.from(Iteration.next_permutation([42], (a, b) => a - b))).toEqual([[42]]);
    });

    it("next_permutation の重複要素", () => {
        const permutations = Array.from(Iteration.next_permutation([1, 1, 2], (a, b) => a - b));
        expect(permutations).toEqual([
            [1, 1, 2],
            [1, 2, 1],
            [2, 1, 1],
        ]);
    });

    it("forEachPair は長さ 0 / 1 で何もしない", () => {
        let called = 0;
        const cb = () => {
            called++;
        };
        Iteration.forEachPair([], cb);
        expect(called).toBe(0);
        Iteration.forEachPair([42], cb);
        expect(called).toBe(0);
    });

    it("forEachPair はランダム長 2e5 の隣接ペアと index を渡す", () => {
        const n = 200_000;
        const arr = Array.from({ length: n }, () => Math.random());
        let count = 0;
        let mismatch = -1;
        Iteration.forEachPair(arr, (a, b, idx) => {
            if (mismatch < 0 && (idx !== count || a !== arr[count] || b !== arr[count + 1])) {
                mismatch = idx;
            }
            count++;
        });
        expect(mismatch).toBe(-1);
        expect(count).toBe(n - 1);
    });
  
    it("長さ 1000 の加算・乗算 (mod 998244353)", () => {
        const MOD = 998244353n;
        const a = Array.from({ length: 1000 }, () => BigInt(Math.floor(Math.random() * 1e6)) % MOD);
        const add = (x: bigint, y: bigint) => (x + y) % MOD;
        const mul = (x: bigint, y: bigint) => (x * y) % MOD;

        const sums: bigint[] = [a[0]];
        const prods: bigint[] = [a[0]];
        for (let i = 1; i < a.length; i++) {
            sums.push(add(sums[i - 1], a[i]));
            prods.push(mul(prods[i - 1], a[i]));
        }

        expect(Iteration.accumulate(a, add)).toEqual(sums);
        expect(Iteration.accumulate(a, mul)).toEqual(prods);
    });
});
