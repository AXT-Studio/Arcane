import { describe, expect, it } from "vitest";
import { TwoSAT } from "../src/TwoSAT.ts";
import { mulberry32 } from "./utils.ts";

type Clause = [a: number, f: boolean, b: number, g: boolean];

function satisfies(x: boolean[], clauses: Clause[]): boolean {
    return clauses.every(([a, f, b, g]) => x[a] === f || x[b] === g);
}

function existsSatisfyingAssignment(n: number, clauses: Clause[]): boolean {
    const limit = 1 << n;
    for (let mask = 0; mask < limit; mask++) {
        const x = Array.from({ length: n }, (_, i) => ((mask >> i) & 1) === 1);
        if (satisfies(x, clauses)) return true;
    }
    return false;
}

describe("TwoSAT の @example", () => {
    it("constructor", () => {
        expect(() => new TwoSAT(2)).not.toThrow();
    });

    it("addClause", () => {
        const twoSat = new TwoSAT(2);
        expect(() => {
            twoSat.addClause(0, true, 1, true);
            twoSat.addClause(0, false, 1, true);
        }).not.toThrow();
    });

    it("割り当てが存在する例", () => {
        const twoSat = new TwoSAT(2);
        twoSat.addClause(0, true, 1, true);
        twoSat.addClause(0, false, 1, true);
        expect(twoSat.isSatisfiable()).toBe(true);
    });

    it("割り当てが存在しない例", () => {
        const twoSat = new TwoSAT(1);
        twoSat.addClause(0, true, 0, true);
        twoSat.addClause(0, false, 0, false);
        expect(twoSat.isSatisfiable()).toBe(false);
    });

    it("getAnswer", () => {
        const twoSat = new TwoSAT(2);
        twoSat.addClause(0, true, 1, true);
        twoSat.addClause(0, false, 1, true);
        expect(twoSat.isSatisfiable()).toBe(true);
        const x = twoSat.getAnswer();
        expect(x).toHaveLength(2);
        expect(x[0] === true || x[1] === true).toBe(true);
        expect(x[0] === false || x[1] === true).toBe(true);
    });
});

describe("TwoSAT のエラー", () => {
    it("constructor は n が正の整数でないとき RangeError", () => {
        expect(() => new TwoSAT(0)).toThrow(RangeError);
        expect(() => new TwoSAT(-1)).toThrow(RangeError);
        expect(() => new TwoSAT(1.5)).toThrow(RangeError);
    });

    it("addClause は a, b が範囲外・非整数のとき RangeError", () => {
        const twoSat = new TwoSAT(2);
        expect(() => twoSat.addClause(-1, true, 0, true)).toThrow(RangeError);
        expect(() => twoSat.addClause(2, true, 0, true)).toThrow(RangeError);
        expect(() => twoSat.addClause(0.5, true, 0, true)).toThrow(RangeError);
        expect(() => twoSat.addClause(0, true, -1, true)).toThrow(RangeError);
        expect(() => twoSat.addClause(0, true, 2, true)).toThrow(RangeError);
        expect(() => twoSat.addClause(0, true, 0.5, true)).toThrow(RangeError);
    });

    it("getAnswer は isSatisfiable() を先に呼ばないと Error", () => {
        const twoSat = new TwoSAT(1);
        twoSat.addClause(0, true, 0, true);
        expect(() => twoSat.getAnswer()).toThrow(Error);
    });
});

describe("TwoSAT のランダムテスト", () => {
    it("n<=8, 節数<=14 で全探索と一致し、割り当てが条件を満たす", () => {
        const rand = mulberry32(20260906);
        for (let trial = 0; trial < 400; trial++) {
            const n = 1 + Math.floor(rand() * 8);
            const m = Math.floor(rand() * 15);
            const clauses: Clause[] = [];
            for (let i = 0; i < m; i++) {
                clauses.push([Math.floor(rand() * n), rand() < 0.5, Math.floor(rand() * n), rand() < 0.5]);
            }
            const twoSat = new TwoSAT(n);
            for (const [a, f, b, g] of clauses) twoSat.addClause(a, f, b, g);
            const sat = twoSat.isSatisfiable();
            expect(sat).toBe(existsSatisfyingAssignment(n, clauses));
            if (sat) {
                const x = twoSat.getAnswer();
                expect(x).toHaveLength(n);
                expect(satisfies(x, clauses)).toBe(true);
            }
        }
    });
});
