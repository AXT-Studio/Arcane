import { describe, expect, it } from "vitest";
import { IntervalSet } from "../src/IntervalSet.ts";

describe("IntervalSet - JSDoc @example", () => {
    it("new IntervalSet()", () => {
        expect(() => {
            const _intervalSet = new IntervalSet();
        }).not.toThrow();
    });
    it("insert()", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(0, 3);
        expect([...intervalSet]).toEqual([[0, 3]]);
        intervalSet.insert(6, 9);
        expect([...intervalSet]).toEqual([
            [0, 3],
            [6, 9],
        ]);
        intervalSet.insert(2, 6);
        expect([...intervalSet]).toEqual([[0, 9]]);
    });
    it("erase()", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(0, 9);
        intervalSet.erase(3, 6);
        expect([...intervalSet]).toEqual([
            [0, 3],
            [6, 9],
        ]);
    });
    it("contains()", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(2, 5);
        expect(intervalSet.contains(3)).toBe(true);
        expect(intervalSet.contains(5)).toBe(false);
    });
    it("expand()", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(2, 5);
        expect(intervalSet.expand(3)).toEqual([2, 5]);
        expect(intervalSet.expand(6)).toEqual([6, 6]);
    });
    it("mex()", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(2, 5);
        expect(intervalSet.mex(3)).toBe(5);
        expect(intervalSet.mex(6)).toBe(6);
    });
    it("get size", () => {
        const intervalSet = new IntervalSet();
        expect(intervalSet.size).toBe(0);
        intervalSet.insert(0, 3);
        intervalSet.insert(6, 9);
        expect(intervalSet.size).toBe(2);
        intervalSet.insert(2, 6);
        expect(intervalSet.size).toBe(1);
    });
    it("*[Symbol.iterator]() [for...of ループを用いた反復処理]", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(0, 9);
        intervalSet.erase(3, 6);
        const logs: string[] = [];
        for (const [l, r] of intervalSet) logs.push(`[${l}, ${r})`);
        expect(logs[0]).toBe("[0, 3)");
        expect(logs[1]).toBe("[6, 9)");
    });
    it("*[Symbol.iterator]() [イテレーターを手動で手繰る]", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(0, 9);
        intervalSet.erase(3, 6);
        const iterator = intervalSet[Symbol.iterator]();
        expect(iterator.next().value).toEqual([0, 3]);
        expect(iterator.next().value).toEqual([6, 9]);
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().value).toBeUndefined();
    });
});

describe("IntervalSet - Random Tests", () => {
    it("insert(), erase(), contains(), expand(), mex()について、長さ30の被覆配列と比較して一致確認", () => {
        // 空区間・逆順・隣接統合・分割が混ざるよう、端点は独立に選ぶ。
        // 操作5000回のたびに全域を照合するため、25-75msの目安より長くなる。
        const length = 30;
        const covered = Array<boolean>(length).fill(false);
        const set = new IntervalSet();
        const point = () => Math.floor(Math.random() * (length + 1));
        const intervalsOf = (): [number, number][] => {
            const result: [number, number][] = [];
            let start = -1;
            for (let x = 0; x <= length; x++) {
                const on = x < length && covered[x];
                if (on && start < 0) start = x;
                if (!on && start >= 0) {
                    result.push([start, x]);
                    start = -1;
                }
            }
            return result;
        };
        const expandOf = (x: number): [number, number] => {
            if (x < 0 || x >= length || !covered[x]) return [x, x];
            let l = x;
            while (l > 0 && covered[l - 1]) l--;
            let r = x + 1;
            while (r < length && covered[r]) r++;
            return [l, r];
        };
        const expectState = () => {
            const contains: boolean[] = [];
            const expands: [number, number][] = [];
            const mexes: number[] = [];
            const expectedContains: boolean[] = [];
            const expectedExpands: [number, number][] = [];
            const expectedMexes: number[] = [];
            for (let x = 0; x <= length; x++) {
                contains.push(set.contains(x));
                expands.push(set.expand(x));
                mexes.push(set.mex(x));
                expectedContains.push(x < length && covered[x]);
                const expanded = expandOf(x);
                expectedExpands.push(expanded);
                expectedMexes.push(expanded[1]);
            }
            expect({
                intervals: [...set],
                size: set.size,
                contains,
                expands,
                mexes,
            }).toEqual({
                intervals: intervalsOf(),
                size: intervalsOf().length,
                contains: expectedContains,
                expands: expectedExpands,
                mexes: expectedMexes,
            });
        };

        expectState();
        for (let q = 0; q < 5000; q++) {
            const l = point();
            const r = point();
            const insert = Math.random() < 0.5;
            if (l > r) {
                expect(() => (insert ? set.insert(l, r) : set.erase(l, r))).toThrow(RangeError);
            } else if (insert) {
                set.insert(l, r);
                for (let x = l; x < r; x++) covered[x] = true;
            } else {
                set.erase(l, r);
                for (let x = l; x < r; x++) covered[x] = false;
            }
            expectState();
        }
    });
});
