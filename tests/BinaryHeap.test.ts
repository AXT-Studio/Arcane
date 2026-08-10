import { describe, expect, it } from "vitest";
import { BinaryHeap, BinaryHeapLite } from "../src/BinaryHeap.ts";
import { GraphAdjacencyList } from "../src/GraphAdjacencyList.ts";

describe("BinaryHeap の @example", () => {
    it("constructor", () => {
        expect(() => new BinaryHeap<number>((a, b) => a - b)).not.toThrow();
    });

    it("初期値付きの constructor", () => {
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

    it("push 後の peek", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b);
        heap.push(5);
        heap.push(3);
        heap.push(8);
        expect(heap.peek()).toBe(3);
    });

    it("pop", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.pop()).toBe(3);
        expect(heap.pop()).toBe(5);
        expect(heap.pop()).toBe(8);
        expect(heap.pop()).toBeUndefined();
    });

    it("pop 後の peek", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.peek()).toBe(3);
        heap.pop();
        expect(heap.peek()).toBe(5);
    });

    it("remove", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.remove(3)).toBe(true);
        expect(heap.peek()).toBe(5);
        expect(heap.remove(10)).toBe(false);
    });

    it("update", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.peek()).toBe(3);
        heap.update(3, 10);
        expect(heap.peek()).toBe(5);
    });

    it("clear", () => {
        const heap = new BinaryHeap<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.size).toBe(3);
        heap.clear();
        expect(heap.size).toBe(0);
        expect(heap.peek()).toBeUndefined();
    });
});

describe("BinaryHeapLite の @example", () => {
    it("constructor", () => {
        expect(() => new BinaryHeapLite<number>((a, b) => a - b)).not.toThrow();
    });

    it("初期値付きの constructor", () => {
        const minHeap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8, 1]);
        expect(minHeap.pop()).toBe(1);
        expect(minHeap.pop()).toBe(3);
    });

    it("size", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b);
        expect(heap.size).toBe(0);
        heap.push(5);
        expect(heap.size).toBe(1);
        heap.push(3);
        expect(heap.size).toBe(2);
        heap.pop();
        expect(heap.size).toBe(1);
    });

    it("push 後の peek", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b);
        heap.push(5);
        heap.push(3);
        heap.push(8);
        expect(heap.peek()).toBe(3);
    });

    it("pop", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.pop()).toBe(3);
        expect(heap.pop()).toBe(5);
        expect(heap.pop()).toBe(8);
        expect(heap.pop()).toBeUndefined();
    });

    it("pop 後の peek", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.peek()).toBe(3);
        heap.pop();
        expect(heap.peek()).toBe(5);
    });

    it("clear", () => {
        const heap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8]);
        expect(heap.size).toBe(3);
        heap.clear();
        expect(heap.size).toBe(0);
        expect(heap.peek()).toBeUndefined();
    });
});

const solvePassing = (N: number, M: number, A: number[], B: number[], C: number[]): number[] => {
    const graph = new GraphAdjacencyList(N + 1);
    const time = new Map<`${number},${number}`, number>();
    for (let i = 0; i < M; i++) {
        graph.addUndirectedEdge(A[i], B[i]);
        time.set(`${A[i]},${B[i]}`, C[i]);
        time.set(`${B[i]},${A[i]}`, C[i]);
    }
    const pack = (city: number, time: number) => time * 1e6 + city;
    const cityOf = (packed: number) => packed % 1e6;
    const timeOf = (packed: number) => Math.floor(packed / 1e6);
    const from1_time = Array.from({ length: N + 1 }, () => Infinity);
    const from1_pq = new BinaryHeap<number>((a, b) => timeOf(a) - timeOf(b) || cityOf(a) - cityOf(b));
    from1_pq.push(pack(1, 0));
    while (from1_pq.size > 0) {
        const currentPack = from1_pq.pop()!;
        const currentCity = cityOf(currentPack);
        const currentTime = timeOf(currentPack);
        from1_time[currentCity] = currentTime;
        for (const nextCity of graph.getNeighbors(currentCity)) {
            const nextTime = currentTime + time.get(`${currentCity},${nextCity}`)!;
            if (from1_time[nextCity] <= nextTime) continue;
            const isUpdated = from1_pq.update(pack(nextCity, from1_time[nextCity]), pack(nextCity, nextTime));
            if (!isUpdated) {
                from1_pq.push(pack(nextCity, nextTime));
            }
            from1_time[nextCity] = nextTime;
        }
    }
    const fromN_time = Array.from({ length: N + 1 }, () => Infinity);
    const fromN_pq = new BinaryHeap<number>((a, b) => timeOf(a) - timeOf(b) || cityOf(a) - cityOf(b));
    fromN_pq.push(pack(N, 0));
    while (fromN_pq.size > 0) {
        const currentPack = fromN_pq.pop()!;
        const currentCity = cityOf(currentPack);
        const currentTime = timeOf(currentPack);
        fromN_time[currentCity] = currentTime;
        for (const nextCity of graph.getNeighbors(currentCity)) {
            const nextTime = currentTime + time.get(`${currentCity},${nextCity}`)!;
            if (fromN_time[nextCity] <= nextTime) continue;
            const isUpdated = fromN_pq.update(pack(nextCity, fromN_time[nextCity]), pack(nextCity, nextTime));
            if (!isUpdated) {
                fromN_pq.push(pack(nextCity, nextTime));
            }
            fromN_time[nextCity] = nextTime;
        }
    }
    const answers: number[] = [];
    for (let k = 1; k <= N; k++) {
        const answer_onK = from1_time[k] + fromN_time[k];
        answers.push(answer_onK);
    }
    return answers;
};

describe("競プロ典型90問 013 - Passing サンプル通過確認(BinaryHeap)", () => {
    const testcases: { N: number; M: number; A: number[]; B: number[]; C: number[] }[] = [
        { N: 7, M: 9, A: [1, 1, 2, 3, 3, 4, 5, 5, 6], B: [2, 3, 5, 4, 5, 7, 6, 7, 7], C: [2, 3, 2, 1, 4, 5, 1, 6, 3] },
        { N: 4, M: 3, A: [1, 2, 3], B: [2, 3, 4], C: [1, 10, 100] },
        { N: 4, M: 3, A: [1, 1, 1], B: [2, 3, 4], C: [314, 159, 265] },
    ];
    const expecteds: number[][] = [
        [8, 8, 9, 9, 8, 8, 8],
        [111, 111, 111, 111],
        [265, 893, 583, 265],
    ];
    for (let i = 0; i < 3; i++) {
        it(`入出力例${i + 1}`, () => {
            const { N, M, A, B, C } = testcases[i];
            const expected = expecteds[i];
            expect(solvePassing(N, M, A, B, C)).toEqual(expected);
        });
    }
}, 20_000);
