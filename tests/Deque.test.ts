import { describe, expect, it } from "vitest";
import { Deque } from "../src/Deque.ts";

describe("Deque の @example", () => {
    it("constructor と unshift / push", () => {
        const deque = new Deque<number>([1, 2, 3]);
        expect(deque.toArray()).toEqual([1, 2, 3]);
        deque.unshift(0);
        deque.push(4);
        expect(deque.toArray()).toEqual([0, 1, 2, 3, 4]);
    });

    it("unshift のあと push", () => {
        const deque = new Deque<number>();
        deque.unshift(3);
        deque.unshift(2);
        deque.unshift(1);
        expect(deque.toArray()).toEqual([1, 2, 3]);
        deque.push(4);
        deque.push(5);
        expect(deque.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it("shift と pop", () => {
        const deque = new Deque<number>([1, 2, 3, 4, 5]);
        expect(deque.toArray()).toEqual([1, 2, 3, 4, 5]);
        expect(deque.shift()).toBe(1);
        expect(deque.toArray()).toEqual([2, 3, 4, 5]);
        expect(deque.pop()).toBe(5);
        expect(deque.toArray()).toEqual([2, 3, 4]);
    });

    it("first と last", () => {
        const deque = new Deque<number>([1, 2, 3]);
        expect(deque.first()).toBe(1);
        expect(deque.last()).toBe(3);
        expect(deque.toArray()).toEqual([1, 2, 3]);
    });

    it("get", () => {
        const deque = new Deque<number>([1, 2, 3]);
        expect(deque.get(0)).toBe(1);
        expect(deque.get(1)).toBe(2);
        expect(deque.get(2)).toBe(3);
        expect(deque.get(3)).toBeUndefined();
        expect(deque.get(-1)).toBeUndefined();
    });

    it("set", () => {
        const deque = new Deque<number>([1, 2, 3]);
        deque.set(0, 4);
        expect(deque.toArray()).toEqual([4, 2, 3]);
        deque.set(1, 5);
        expect(deque.toArray()).toEqual([4, 5, 3]);
        deque.set(2, 6);
        expect(deque.toArray()).toEqual([4, 5, 6]);
        expect(() => deque.set(3, 7)).toThrow(RangeError);
    });

    it("isEmpty", () => {
        const deque = new Deque<number>();
        expect(deque.isEmpty()).toBe(true);
        deque.push(1);
        expect(deque.isEmpty()).toBe(false);
        deque.pop();
        expect(deque.isEmpty()).toBe(true);
    });

    it("size", () => {
        const deque = new Deque<number>([1, 2, 3]);
        expect(deque.size).toBe(3);
        deque.unshift(0);
        deque.push(4);
        expect(deque.size).toBe(5);
    });
});

describe("Deque のエラー", () => {
    it("set はインデックスが範囲外のとき RangeError", () => {
        const deque = new Deque<number>([1, 2, 3]);
        expect(() => deque.set(-1, 0)).toThrow(RangeError);
        expect(() => deque.set(3, 0)).toThrow(RangeError);
    });
});

describe("Deque の境界・特例", () => {
    it("空のとき shift / pop / first / last は undefined", () => {
        const deque = new Deque<number>();
        expect(deque.shift()).toBeUndefined();
        expect(deque.pop()).toBeUndefined();
        expect(deque.first()).toBeUndefined();
        expect(deque.last()).toBeUndefined();
    });
});
