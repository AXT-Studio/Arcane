import { describe, expect, it } from "vitest";
import { ModOps } from "../src/ModOps.ts";

describe("ModOps - JSDoc @example", () => {
    it("new ModOps()", () => {
        expect(() => {
            const _mod7 = new ModOps(7n);
        }).not.toThrow();
    });
    it("normalize()", () => {
        const mod5 = new ModOps(5n);
        expect(mod5.normalize(12n)).toBe(2n);
        expect(mod5.normalize(-3n)).toBe(2n);
    });
    it("add()", () => {
        const mod10 = new ModOps(10n);
        expect(mod10.add(7n, 8n)).toBe(5n);
        expect(mod10.add(-3n, 4n)).toBe(1n);
    });
    it("sum()", () => {
        const mod100 = new ModOps(100n);
        expect(mod100.sum(10n, 20n, 30n)).toBe(60n);
        expect(mod100.sum(-50n, 25n, 75n)).toBe(50n);
    });
    it("sub()", () => {
        const mod10 = new ModOps(10n);
        expect(mod10.sub(7n, 8n)).toBe(9n);
        expect(mod10.sub(-3n, 4n)).toBe(3n);
    });
    it("mul()", () => {
        const mod10 = new ModOps(10n);
        expect(mod10.mul(7n, 8n)).toBe(6n);
        expect(mod10.mul(-3n, 4n)).toBe(8n);
    });
    it("prod()", () => {
        const mod12 = new ModOps(12n);
        expect(mod12.prod(2n, 3n, 4n)).toBe(0n);
        expect(mod12.prod(-1n, 5n)).toBe(7n);
    });
    it("pow()", () => {
        const mod7 = new ModOps(7n);
        expect(mod7.pow(3n, 4n)).toBe(4n);
    });
    it("inv()", () => {
        const mod7 = new ModOps(7n);
        expect(mod7.inv(3n)).toBe(5n);
    });
    it("div()", () => {
        const mod7 = new ModOps(7n);
        expect(mod7.div(3n, 2n)).toBe(5n);
    });
});

describe("ModOps - Edge Cases", () => {
    it("new ModOps()はmodが0のときError", () => {
        expect(() => new ModOps(0n)).toThrow(Error);
    });
    it("new ModOps()はmodが負のときError", () => {
        expect(() => new ModOps(-1n)).toThrow(Error);
    });
    it("pow()は指数が負のときRangeError", () => {
        const mod7 = new ModOps(7n);
        expect(() => mod7.pow(3n, -1n)).toThrow(RangeError);
    });
    it("inv()は逆元が存在しないときError", () => {
        const mod10 = new ModOps(10n);
        expect(() => mod10.inv(2n)).toThrow(Error);
    });
    it("div()は除数の逆元が存在しないときError", () => {
        const mod10 = new ModOps(10n);
        expect(() => mod10.div(3n, 2n)).toThrow(Error);
    });
    it("sum()は引数なしのとき0n", () => {
        const mod7 = new ModOps(7n);
        expect(mod7.sum()).toBe(0n);
    });
    it("prod()は引数なしのとき1n", () => {
        const mod7 = new ModOps(7n);
        expect(mod7.prod()).toBe(1n);
    });
    it("pow()は法が1のとき0n", () => {
        const mod1 = new ModOps(1n);
        expect(mod1.pow(3n, 4n)).toBe(0n);
    });
    it("pow()は法が1で0の0乗のとき0n", () => {
        const mod1 = new ModOps(1n);
        expect(mod1.pow(0n, 0n)).toBe(0n);
    });
});
