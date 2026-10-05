import { describe, expect, it } from "vitest";
import { BinaryHeap, BinaryHeapLite } from "../src/BinaryHeap.ts";

describe("BinaryHeap - JSDoc @example", () => {
    it("constructor() [初期値なし]", () => {
        expect(() => {
            const _minHeap = new BinaryHeap<number>((a, b) => a - b);
        }).not.toThrow();
    });
    it("constructor() [初期値を与える]", () => {
        const minHeap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8, 1]);
        expect(minHeap.pop()).toBe(1);
        expect(minHeap.pop()).toBe(3);
    });
    it("size", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b);
        expect(heap.size).toBe(0);
        heap.push(5);
        expect(heap.size).toBe(1);
        heap.push(3);
        expect(heap.size).toBe(2);
        heap.pop();
        expect(heap.size).toBe(1);
    });
    it("push()", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b);
        heap.push(5);
        heap.push(3);
        heap.push(8);
        expect(heap.peek()).toBe(3);
    });
    it("pop()", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.pop()).toBe(3);
        expect(heap.pop()).toBe(5);
        expect(heap.pop()).toBe(8);
        expect(heap.pop()).toBeUndefined();
    });
    it("peek()", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.peek()).toBe(3);
        heap.pop();
        expect(heap.peek()).toBe(5);
    });
    it("remove()", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.remove(3)).toBe(true);
        expect(heap.peek()).toBe(5);
        expect(heap.remove(10)).toBe(false);
    });
    it("update()", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.peek()).toBe(3);
        heap.update(3, 10);
        expect(heap.peek()).toBe(5);
    });
    it("clear()", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.size).toBe(3);
        heap.clear();
        expect(heap.size).toBe(0);
        expect(heap.peek()).toBeUndefined();
    });
});

describe("BinaryHeapLite - JSDoc @example", () => {
    it("constructor() [初期値なし]", () => {
        expect(() => {
            const _minHeap = new BinaryHeapLite<number>((a, b) => a - b);
        }).not.toThrow();
    });
    it("constructor() [初期値を与える]", () => {
        const minHeap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8, 1]);
        expect(minHeap.pop()).toBe(1);
        expect(minHeap.pop()).toBe(3);
    });
    it("size", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b);
        expect(heap.size).toBe(0);
        heap.push(5);
        expect(heap.size).toBe(1);
        heap.push(3);
        expect(heap.size).toBe(2);
        heap.pop();
        expect(heap.size).toBe(1);
    });
    it("push()", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b);
        heap.push(5);
        heap.push(3);
        heap.push(8);
        expect(heap.peek()).toBe(3);
    });
    it("pop()", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.pop()).toBe(3);
        expect(heap.pop()).toBe(5);
        expect(heap.pop()).toBe(8);
        expect(heap.pop()).toBeUndefined();
    });
    it("peek()", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.peek()).toBe(3);
        heap.pop();
        expect(heap.peek()).toBe(5);
    });
    it("clear()", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.size).toBe(3);
        heap.clear();
        expect(heap.size).toBe(0);
        expect(heap.peek()).toBeUndefined();
    });
});

describe("BinaryHeap - ランダムテスト", () => {
    it("挿入時にソートするArrayと比較", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b);
        const array: number[] = [];
        for (let q = 0; q < 1e4; q++) {
            const op = array.length / 1e2 <= Math.random() ? "push" : "pop";
            if (op === "push") {
                const n = Math.floor(Math.random() * 1e4);
                heap.push(n);
                array.push(n);
                array.sort((a, b) => a - b);
            } else {
                expect(heap.pop()!).toBe(array.shift()!);
            }
        }
        while (array.length > 0) {
            expect(heap.pop()!).toBe(array.shift()!);
        }
    });
});
