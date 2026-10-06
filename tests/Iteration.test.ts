import { describe, expect, it } from "vitest";
import { Iteration } from "../src/Iteration.ts";

describe("Iteration - JSDoc @example", () => {
    it("Iteration.next_permutation() [順列を配列に展開する]", () => {
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
    it("Iteration.next_permutation() [順列を1つずつ処理する]", () => {
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
    it("Iteration.next_product() [bit全探索]", () => {
        const products = Array.from(Iteration.next_product([2, 2]));
        expect(products).toEqual([
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
        ]);
    });
    it("Iteration.next_product() [桁ごとに上限を変える場合]", () => {
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
    it("Iteration.next_product() [空配列の場合]", () => {
        const products = Array.from(Iteration.next_product([]));
        expect(products).toEqual([[]]);
    });
    it("Iteration.forEachPair()", () => {
        const arr = [1, 4, 10, 15];
        const lines: string[] = [];
        Iteration.forEachPair(arr, (a, b, idx) => {
            lines.push(`Pair #${idx}: ${Math.abs(a - b)}`);
        });
        expect(lines).toEqual(["Pair #0: 3", "Pair #1: 6", "Pair #2: 5"]);
    });
    it("Iteration.accumulate()", () => {
        const nums = [2, 3, 5, 7];
        expect(Iteration.accumulate(nums)).toEqual([2, 5, 10, 17]);
        expect(Iteration.accumulate(nums, (a, b) => a * b)).toEqual([2, 6, 30, 210]);
        expect(Iteration.accumulate(nums, (a, b) => a + b, 0)).toEqual([0, 2, 5, 10, 17]);
        const ints = [2n, 3n, 5n, 7n];
        expect(Iteration.accumulate(ints)).toEqual([2n, 5n, 10n, 17n]);
        expect(Iteration.accumulate(ints, (a, b) => a * b)).toEqual([2n, 6n, 30n, 210n]);
        expect(Iteration.accumulate(ints, (a, b) => a + b, 0n)).toEqual([0n, 2n, 5n, 10n, 17n]);
    });
});

describe("Iteration - Edge Cases", () => {
    it("next_product()は0を含むとき[]", () => {
        expect(Array.from(Iteration.next_product([2, 0]))).toEqual([]);
    });
    it("next_product()は負数を含むとき[]", () => {
        expect(Array.from(Iteration.next_product([-1]))).toEqual([]);
    });
    it("next_permutation()は長さ0のとき[[]]", () => {
        expect(Array.from(Iteration.next_permutation([], (a, b) => a - b))).toEqual([[]]);
    });
    it("next_permutation()は長さ1のとき[[42]]", () => {
        expect(Array.from(Iteration.next_permutation([42], (a, b) => a - b))).toEqual([[42]]);
    });
    it("next_permutation()は重複要素のとき辞書順の3通り", () => {
        const permutations = Array.from(Iteration.next_permutation([1, 1, 2], (a, b) => a - b));
        expect(permutations).toEqual([
            [1, 1, 2],
            [1, 2, 1],
            [2, 1, 1],
        ]);
    });
    it("forEachPair()は長さ0のときcallbackを呼ばない", () => {
        let called = 0;
        Iteration.forEachPair([], () => {
            called++;
        });
        expect(called).toBe(0);
    });
    it("forEachPair()は長さ1のときcallbackを呼ばない", () => {
        let called = 0;
        Iteration.forEachPair([42], () => {
            called++;
        });
        expect(called).toBe(0);
    });
});

describe("Iteration - Random Tests", () => {
    it("forEachPair()について、隣接要素と添字を直接参照して一致確認", () => {
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
    it("accumulate()について、長さ1000の加算(mod 998244353)を愚直計算して一致確認", () => {
        const MOD = 998244353n;
        const a = Array.from({ length: 1000 }, () => BigInt(Math.floor(Math.random() * 1e6)) % MOD);
        const add = (x: bigint, y: bigint) => (x + y) % MOD;
        const sums: bigint[] = [a[0]];
        for (let i = 1; i < a.length; i++) {
            sums.push(add(sums[i - 1], a[i]));
        }
        expect(Iteration.accumulate(a, add)).toEqual(sums);
    });
    it("accumulate()について、長さ1000の乗算(mod 998244353)を愚直計算して一致確認", () => {
        const MOD = 998244353n;
        const a = Array.from({ length: 1000 }, () => BigInt(Math.floor(Math.random() * 1e6)) % MOD);
        const mul = (x: bigint, y: bigint) => (x * y) % MOD;
        const prods: bigint[] = [a[0]];
        for (let i = 1; i < a.length; i++) {
            prods.push(mul(prods[i - 1], a[i]));
        }
        expect(Iteration.accumulate(a, mul)).toEqual(prods);
    });
});
