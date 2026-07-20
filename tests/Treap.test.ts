import { describe, expect, it } from "vitest";
import { Treap } from "../src/Treap.ts";

describe("Treap @example", () => {
    it("constructor", () => {
        expect(() => new Treap<number, string>((a, b) => a - b)).not.toThrow();
    });

    it("set overwrites value", () => {
        const treap = new Treap<number, string>((a, b) => a - b);
        treap.set(1, "one");
        treap.set(2, "two");
        treap.set(1, "uno");
        expect(treap.get(1)).toBe("uno");
        expect(treap.get(2)).toBe("two");
    });

    it("delete", () => {
        const treap = new Treap<number, string>((a, b) => a - b);
        treap.set(1, "one");
        treap.set(2, "two");
        treap.delete(1);
        expect(treap.get(1)).toBeUndefined();
        expect(treap.get(2)).toBe("two");
        treap.delete(3);
        expect(treap.get(2)).toBe("two");
    });

    it("get", () => {
        const treap = new Treap<number, string>((a, b) => a - b);
        treap.set(1, "one");
        treap.set(2, "two");
        expect(treap.get(1)).toBe("one");
        expect(treap.get(2)).toBe("two");
        expect(treap.get(3)).toBeUndefined();
    });

    it("lowerBound", () => {
        const treap = new Treap<number, string>((a, b) => a - b);
        treap.set(1, "one");
        treap.set(3, "three");
        treap.set(5, "five");
        expect(treap.lowerBound(0)).toEqual({ key: 1, value: "one" });
        expect(treap.lowerBound(3)).toEqual({ key: 3, value: "three" });
        expect(treap.lowerBound(6)).toBeUndefined();
    });

    it("upperBound", () => {
        const treap = new Treap<number, string>((a, b) => a - b);
        treap.set(1, "one");
        treap.set(3, "three");
        treap.set(5, "five");
        expect(treap.upperBound(0)).toEqual({ key: 1, value: "one" });
        expect(treap.upperBound(3)).toEqual({ key: 5, value: "five" });
        expect(treap.upperBound(5)).toBeUndefined();
    });

    it("kthElement", () => {
        const treap = new Treap<number, string>((a, b) => a - b);
        treap.set(10, "ten");
        treap.set(20, "twenty");
        treap.set(30, "thirty");
        expect(treap.kthElement(0)).toEqual({ key: 10, value: "ten" });
        expect(treap.kthElement(1)).toEqual({ key: 20, value: "twenty" });
        expect(treap.kthElement(2)).toEqual({ key: 30, value: "thirty" });
        expect(treap.kthElement(3)).toBeUndefined();
    });

    it("countAllComparisons", () => {
        const treap = new Treap<number, string>((a, b) => a - b);
        treap.set(10, "ten");
        treap.set(20, "twenty");
        treap.set(30, "thirty");
        expect(treap.countAllComparisons(20)).toEqual({
            less: 1,
            lessEqual: 2,
            greater: 1,
            greaterEqual: 2,
        });
    });

    it("size", () => {
        const treap = new Treap<number, string>((a, b) => a - b);
        expect(treap.size).toBe(0);
        treap.set(1, "one");
        treap.set(2, "two");
        expect(treap.size).toBe(2);
        treap.delete(1);
        expect(treap.size).toBe(1);
    });
});
