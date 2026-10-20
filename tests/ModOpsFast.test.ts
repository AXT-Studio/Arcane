import { describe, expect, it } from "vitest";
import { ModOps } from "../src/ModOps.ts";
import { ModOpsFast } from "../src/ModOpsFast.ts";

describe("ModOpsFast - JSDoc @example", () => {
    it("new ModOpsFast()", () => {
        expect(() => {
            const _mod7 = new ModOpsFast(7);
        }).not.toThrow();
    });
    it("normalize()", () => {
        const mod5 = new ModOpsFast(5);
        expect(mod5.normalize(12)).toBe(2);
        expect(mod5.normalize(-3)).toBe(2);
    });
    it("add()", () => {
        const mod10 = new ModOpsFast(10);
        expect(mod10.add(7, 8)).toBe(5);
        expect(mod10.add(-3, 4)).toBe(1);
    });
    it("sum()", () => {
        const mod100 = new ModOpsFast(100);
        expect(mod100.sum(10, 20, 30)).toBe(60);
        expect(mod100.sum(-50, 25, 75)).toBe(50);
    });
    it("sub()", () => {
        const mod10 = new ModOpsFast(10);
        expect(mod10.sub(7, 8)).toBe(9);
        expect(mod10.sub(-3, 4)).toBe(3);
    });
    it("mul()", () => {
        const mod10 = new ModOpsFast(10);
        expect(mod10.mul(7, 8)).toBe(6);
        expect(mod10.mul(-3, 4)).toBe(8);
    });
    it("mulAdd()", () => {
        const mod10 = new ModOpsFast(10);
        expect(mod10.mulAdd(1, 2, 3, 4)).toBe(4);
        expect(mod10.mulAdd(2, 3, 1, 4)).toBe(0);
        expect(mod10.mulAdd(-1, 1, 2, -3)).toBe(3);
    });
    it("prod()", () => {
        const mod12 = new ModOpsFast(12);
        expect(mod12.prod(2, 3, 4)).toBe(0);
        expect(mod12.prod(-1, 5)).toBe(7);
    });
    it("pow()", () => {
        const mod7 = new ModOpsFast(7);
        expect(mod7.pow(3, 4)).toBe(4);
    });
    it("inv()", () => {
        const mod7 = new ModOpsFast(7);
        expect(mod7.inv(3)).toBe(5);
    });
    it("div()", () => {
        const mod7 = new ModOpsFast(7);
        expect(mod7.div(3, 2)).toBe(5);
    });
});

describe("ModOpsFast - Edge Cases", () => {
    it("new ModOpsFast()はmodが0のときError", () => {
        expect(() => new ModOpsFast(0)).toThrow(Error);
    });
    it("new ModOpsFast()はmodが負のときError", () => {
        expect(() => new ModOpsFast(-1)).toThrow(Error);
    });
    it("new ModOpsFast()はmodが2^31以上のときError", () => {
        expect(() => new ModOpsFast(2 ** 31)).toThrow(Error);
        expect(() => new ModOpsFast(2 ** 31 + 1)).toThrow(Error);
    });
    it("new ModOpsFast()はmodが整数でないときError", () => {
        for (const mod of [1.5, NaN, Infinity, -Infinity]) {
            expect(() => new ModOpsFast(mod)).toThrow(Error);
        }
    });
    it("mul(), mulAdd()は法が2^31-1でも積を正確に計算する", () => {
        const mod = 2 ** 31 - 1;
        const modMax = new ModOpsFast(mod);
        expect(modMax.mul(mod - 1, mod - 1)).toBe(1);
        expect(modMax.mulAdd(mod - 1, mod - 1, mod - 1, mod - 1)).toBe(2);
    });
    it("pow()は指数が2^32以上のときRangeError", () => {
        const mod7 = new ModOpsFast(7);
        expect(() => mod7.pow(3, 2 ** 32)).toThrow(RangeError);
        expect(() => mod7.pow(3, 2 ** 32 + 1)).toThrow(RangeError);
    });
    it("pow()は指数が整数でないときRangeError", () => {
        const mod7 = new ModOpsFast(7);
        for (const exponent of [1.5, NaN, Infinity, -Infinity]) {
            expect(() => mod7.pow(3, exponent)).toThrow(RangeError);
        }
    });
    it("pow()は指数が2^32-1のときも計算できる", () => {
        const mod7 = new ModOpsFast(7);
        // 3^6 ≡ 1 (mod 7)、(2^32-1) mod 6 = 3。
        expect(mod7.pow(3, 2 ** 32 - 1)).toBe(6);
    });
    it("pow()は指数が負のときRangeError", () => {
        const mod7 = new ModOpsFast(7);
        expect(() => mod7.pow(3, -1)).toThrow(RangeError);
    });
    it("inv()は逆元が存在しないときError", () => {
        const mod10 = new ModOpsFast(10);
        expect(() => mod10.inv(2)).toThrow(Error);
    });
    it("div()は除数の逆元が存在しないときError", () => {
        const mod10 = new ModOpsFast(10);
        expect(() => mod10.div(3, 2)).toThrow(Error);
    });
    it("sum()は引数なしのとき0", () => {
        const mod7 = new ModOpsFast(7);
        expect(mod7.sum()).toBe(0);
    });
    it("prod()は引数なしのとき1", () => {
        const mod7 = new ModOpsFast(7);
        expect(mod7.prod()).toBe(1);
    });
    it("pow()は法が1のとき0", () => {
        const mod1 = new ModOpsFast(1);
        expect(mod1.pow(3, 4)).toBe(0);
    });
    it("pow()は法が1で0の0乗のとき0", () => {
        const mod1 = new ModOpsFast(1);
        expect(mod1.pow(0, 0)).toBe(0);
    });
});

describe("ModOpsFast - Random Tests", () => {
    it("mul()について、ModOpsのbigint演算と比較して一致確認", () => {
        const mod = 998244353;
        const fast = new ModOpsFast(mod);
        const reference = new ModOps(BigInt(mod));
        // 入力は負数や法以上の値を含む、[-2^32, 2^32)の整数。
        for (let i = 0; i < 200; i++) {
            const a = Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            const b = Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            expect(fast.mul(a, b), `a=${a}, b=${b}`).toBe(Number(reference.mul(BigInt(a), BigInt(b))));
        }
    });
    it("pow()について、ModOpsのbigint演算と比較して一致確認", () => {
        const mod = 998244353;
        const fast = new ModOpsFast(mod);
        const reference = new ModOps(BigInt(mod));
        for (let i = 0; i < 200; i++) {
            const a = Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            // 指数はModOpsFastが受け付ける[0, 2^32)の整数。
            const b = Math.floor(Math.random() * 2 ** 32);
            expect(fast.pow(a, b), `a=${a}, b=${b}`).toBe(Number(reference.pow(BigInt(a), BigInt(b))));
        }
    });
    it("mulAdd()について、ModOpsのmul()とadd()の組み合わせと比較して一致確認", () => {
        const mod = 998244353;
        const fast = new ModOpsFast(mod);
        const reference = new ModOps(BigInt(mod));
        for (let i = 0; i < 200; i++) {
            const a = Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            const b = Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            const c = Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            const d = Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            const expected = reference.add(reference.mul(BigInt(a), BigInt(b)), reference.mul(BigInt(c), BigInt(d)));
            expect(fast.mulAdd(a, b, c, d), `a=${a}, b=${b}, c=${c}, d=${d}`).toBe(Number(expected));
        }
    });
    it("inv()について、ModOpsのbigint演算と比較して結果と例外の一致確認", () => {
        const mod = 998244353;
        const fast = new ModOpsFast(mod);
        const reference = new ModOps(BigInt(mod));
        for (let i = 0; i < 200; i++) {
            // 逆元が存在しないケースも必ず検証するため、10件ごとに法の倍数を生成する。
            const a =
                i % 10 === 0
                    ? (Math.floor(Math.random() * 9) - 4) * mod
                    : Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            // 法は素数なので、その倍数だけ逆元が存在しない。エラーメッセージは比較しない。
            if (a % mod === 0) {
                expect(() => reference.inv(BigInt(a)), `a=${a}`).toThrow(Error);
                expect(() => fast.inv(a), `a=${a}`).toThrow(Error);
            } else {
                expect(fast.inv(a), `a=${a}`).toBe(Number(reference.inv(BigInt(a))));
            }
        }
    });
    it("div()について、ModOpsのbigint演算と比較して結果と例外の一致確認", () => {
        const mod = 998244353;
        const fast = new ModOpsFast(mod);
        const reference = new ModOps(BigInt(mod));
        for (let i = 0; i < 200; i++) {
            const a = Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            // 10件ごとに、除数を法の倍数にして逆元が存在しないケースを生成する。
            const b =
                i % 10 === 0
                    ? (Math.floor(Math.random() * 9) - 4) * mod
                    : Math.floor(Math.random() * 2 ** 33) - 2 ** 32;
            // 両実装は異なるメッセージで例外を投げるため、Errorの発生だけを確認する。
            if (b % mod === 0) {
                expect(() => reference.div(BigInt(a), BigInt(b)), `a=${a}, b=${b}`).toThrow(Error);
                expect(() => fast.div(a, b), `a=${a}, b=${b}`).toThrow(Error);
            } else {
                expect(fast.div(a, b), `a=${a}, b=${b}`).toBe(Number(reference.div(BigInt(a), BigInt(b))));
            }
        }
    });
});
