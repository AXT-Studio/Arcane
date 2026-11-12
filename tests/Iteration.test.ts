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
    it("Iteration.setBits() [for-of文における使用]", () => {
        const bitsA: number[] = [];
        for (const bits of Iteration.setBits(0b1010)) bitsA.push(bits);
        expect(bitsA).toEqual([1, 3]);
        const bitsB: number[] = [];
        for (const bits of Iteration.setBits(0b0110)) bitsB.push(bits);
        expect(bitsB).toEqual([1, 2]);
    });
    it("Iteration.setBits() [Arrayへの変換]", () => {
        expect([...Iteration.setBits(0b1010)]).toEqual([1, 3]);
        expect(Array.from(Iteration.setBits(0b0110))).toEqual([1, 2]);
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
    it("setBits()は0のとき[]", () => {
        expect([...Iteration.setBits(0)]).toEqual([]);
        expect([...Iteration.setBits(0n)]).toEqual([]);
    });
    it("setBits()は1のとき[0]", () => {
        expect([...Iteration.setBits(1)]).toEqual([0]);
        expect([...Iteration.setBits(1n)]).toEqual([0]);
    });
    it("setBits()は負のnumberのときRangeError", () => {
        expect(() => [...Iteration.setBits(-1)]).toThrow(RangeError);
    });
    it("setBits()は負のbigintのときRangeError", () => {
        expect(() => [...Iteration.setBits(-1n)]).toThrow(RangeError);
    });
    it("setBits()は安全整数でないnumberのときRangeError", () => {
        expect(() => [...Iteration.setBits(NaN)]).toThrow(RangeError);
        expect(() => [...Iteration.setBits(Infinity)]).toThrow(RangeError);
        expect(() => [...Iteration.setBits(1.5)]).toThrow(RangeError);
        expect(() => [...Iteration.setBits(Number.MAX_SAFE_INTEGER + 1)]).toThrow(RangeError);
    });
    it("setBits()は53ビットを超えるbigintのとき下位から列挙する", () => {
        const x = (1n << 60n) + (1n << 100n);
        expect([...Iteration.setBits(x)]).toEqual([60, 100]);
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
    it("setBits()について、0以上50以下の各ビットを確率rで立てたnumberと比較して一致確認", () => {
        const trials = 5_000;
        for (let t = 0; t < trials; t++) {
            const r = Math.random();
            let x = 0;
            const selected: number[] = [];
            for (let i = 0; i <= 50; i++) {
                if (Math.random() < r) {
                    x += 2 ** i;
                    selected.push(i);
                }
            }
            expect([...Iteration.setBits(x)]).toEqual(selected);
        }
    });
    it("setBits()について、0以上100以下の各ビットを確率rで立てたbigintと比較して一致確認", () => {
        const trials = 3_400;
        for (let t = 0; t < trials; t++) {
            const r = Math.random();
            let x = 0n;
            const selected: number[] = [];
            for (let i = 0; i <= 100; i++) {
                if (Math.random() < r) {
                    x += 2n ** BigInt(i);
                    selected.push(i);
                }
            }
            expect([...Iteration.setBits(x)]).toEqual(selected);
        }
    });
});
