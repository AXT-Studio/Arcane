import { describe, expect, it } from "vitest";
import { TwoSAT } from "../src/TwoSAT.ts";

describe("TwoSAT - JSDoc @example", () => {
    it("new TwoSAT()", () => {
        expect(() => {
            const _twoSat = new TwoSAT(2);
        }).not.toThrow();
    });
    it("addClause()", () => {
        expect(() => {
            const twoSat = new TwoSAT(2);
            twoSat.addClause(0, true, 1, true);
            twoSat.addClause(0, false, 1, true);
        }).not.toThrow();
    });
    it("isSatisfiable() [割り当てが存在する例]", () => {
        const twoSat = new TwoSAT(2);
        twoSat.addClause(0, true, 1, true);
        twoSat.addClause(0, false, 1, true);
        expect(twoSat.isSatisfiable()).toBe(true);
    });
    it("isSatisfiable() [割り当てが存在しない例]", () => {
        const twoSat = new TwoSAT(1);
        twoSat.addClause(0, true, 0, true);
        twoSat.addClause(0, false, 0, false);
        expect(twoSat.isSatisfiable()).toBe(false);
    });
    it("getAnswer()", () => {
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

describe("TwoSAT - Edge Cases", () => {
    it("new TwoSAT()はnが0のときRangeError", () => {
        expect(() => new TwoSAT(0)).toThrow(RangeError);
    });
    it("new TwoSAT()はnが負のときRangeError", () => {
        expect(() => new TwoSAT(-1)).toThrow(RangeError);
    });
    it("new TwoSAT()はnが非整数のときRangeError", () => {
        expect(() => new TwoSAT(1.5)).toThrow(RangeError);
    });
    it("addClause()はaが負のときRangeError", () => {
        const twoSat = new TwoSAT(2);
        expect(() => twoSat.addClause(-1, true, 0, true)).toThrow(RangeError);
    });
    it("addClause()はaがn以上のときRangeError", () => {
        const twoSat = new TwoSAT(2);
        expect(() => twoSat.addClause(2, true, 0, true)).toThrow(RangeError);
    });
    it("addClause()はaが非整数のときRangeError", () => {
        const twoSat = new TwoSAT(2);
        expect(() => twoSat.addClause(0.5, true, 0, true)).toThrow(RangeError);
    });
    it("addClause()はbが負のときRangeError", () => {
        const twoSat = new TwoSAT(2);
        expect(() => twoSat.addClause(0, true, -1, true)).toThrow(RangeError);
    });
    it("addClause()はbがn以上のときRangeError", () => {
        const twoSat = new TwoSAT(2);
        expect(() => twoSat.addClause(0, true, 2, true)).toThrow(RangeError);
    });
    it("addClause()はbが非整数のときRangeError", () => {
        const twoSat = new TwoSAT(2);
        expect(() => twoSat.addClause(0, true, 0.5, true)).toThrow(RangeError);
    });
    it("getAnswer()はisSatisfiable()を先に呼ばないときError", () => {
        const twoSat = new TwoSAT(1);
        twoSat.addClause(0, true, 0, true);
        expect(() => twoSat.getAnswer()).toThrow(Error);
    });
});

describe("TwoSAT - Random Tests", () => {
    it("isSatisfiable(), getAnswer()について、nが8以下の全探索と比較して一致確認", () => {
        type Clause = [a: number, f: boolean, b: number, g: boolean];
        const satisfies = (x: boolean[], clauses: Clause[]): boolean =>
            clauses.every(([a, f, b, g]) => x[a] === f || x[b] === g);
        const existsSatisfyingAssignment = (n: number, clauses: Clause[]): boolean => {
            const limit = 1 << n;
            for (let mask = 0; mask < limit; mask++) {
                const x = Array.from({ length: n }, (_, i) => ((mask >> i) & 1) === 1);
                if (satisfies(x, clauses)) return true;
            }
            return false;
        };
        for (let trial = 0; trial < 400; trial++) {
            const n = 1 + Math.floor(Math.random() * 8);
            const m = Math.floor(Math.random() * 15);
            const clauses: Clause[] = [];
            for (let i = 0; i < m; i++) {
                clauses.push([
                    Math.floor(Math.random() * n),
                    Math.random() < 0.5,
                    Math.floor(Math.random() * n),
                    Math.random() < 0.5,
                ]);
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
