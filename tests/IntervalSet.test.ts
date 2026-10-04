import { describe, expect, it } from "vitest";
import { IntervalSet } from "../src/IntervalSet.ts";
import { mulberry32 } from "./utils.ts";

type Interval = readonly [number, number];

type UpdateCase = {
    name: string;
    initial: readonly Interval[];
    l: number;
    r: number;
    expected: readonly Interval[];
};

function createIntervalSet(intervals: readonly Interval[]): IntervalSet {
    const set = new IntervalSet();
    for (const [l, r] of intervals) set.insert(l, r);
    return set;
}

function listIntervals(set: IntervalSet): Interval[] {
    return [...set];
}

function intervalAt(intervals: readonly Interval[], index: number): Interval {
    const interval = intervals[index];
    if (interval == null) throw new Error(`interval index ${index} is out of range`);
    return interval;
}

/** 区間列が非空・昇順・非重複・非隣接で、size と一致しなければその理由を返す。 */
function invariantError(set: IntervalSet): string | undefined {
    const actual = listIntervals(set);
    if (set.size !== actual.length) {
        return `size (${set.size}) と区間数 (${actual.length}) が一致しない`;
    }
    for (const [l, r] of actual) {
        if (!(l < r)) return `空または逆順の区間 [${l}, ${r})`;
    }
    for (let i = 1; i < actual.length; i++) {
        const prev = intervalAt(actual, i - 1);
        const next = intervalAt(actual, i);
        if (!(prev[1] < next[0])) {
            return `[${prev[0]}, ${prev[1]}) と [${next[0]}, ${next[1]}) は昇順・非重複・非隣接ではない`;
        }
    }
    return undefined;
}

function expectState(set: IntervalSet, expected: readonly Interval[]): void {
    expect(listIntervals(set)).toEqual([...expected]);
    expect(set.size).toBe(expected.length);
    expect(invariantError(set)).toBeUndefined();
}

function expectUnchanged(set: IntervalSet, before: readonly Interval[]): void {
    expect(listIntervals(set)).toEqual([...before]);
    expect(set.size).toBe(before.length);
}

function testUpdate(method: "insert" | "erase", { initial, l, r, expected }: UpdateCase): void {
    const set = createIntervalSet(initial);
    expectState(set, initial);
    const before = listIntervals(set);
    set[method](l, r);
    expectState(set, expected);
    if (l === r) expectUnchanged(set, before);
}

function expectRangeErrorLeavesState(method: "insert" | "erase"): void {
    const set = createIntervalSet([[2, 8]]);
    expectState(set, [[2, 8]]);
    const before = listIntervals(set);
    expect(() => set[method](8, 3)).toThrow(RangeError);
    expectUnchanged(set, before);
    expectState(set, before);
}

function permutations<T>(items: readonly T[]): T[][] {
    if (items.length <= 1) return [items.slice()];
    const result: T[][] = [];
    for (const [index, head] of items.entries()) {
        const rest = items.filter((_, itemIndex) => itemIndex !== index);
        for (const perm of permutations(rest)) result.push([head, ...perm]);
    }
    return result;
}

const insertCases: UpdateCase[] = [
    { name: "空区間を空集合に挿入", initial: [], l: 3, r: 3, expected: [] },
    { name: "空区間を既存区間内に挿入", initial: [[2, 8]], l: 5, r: 5, expected: [[2, 8]] },
    {
        name: "空区間を隙間に挿入",
        initial: [
            [1, 3],
            [7, 9],
        ],
        l: 5,
        r: 5,
        expected: [
            [1, 3],
            [7, 9],
        ],
    },
    { name: "同一区間を再挿入", initial: [[2, 8]], l: 2, r: 8, expected: [[2, 8]] },
    { name: "既存区間の内部に挿入", initial: [[2, 10]], l: 4, r: 7, expected: [[2, 10]] },
    { name: "左端を共有する短い区間", initial: [[2, 10]], l: 2, r: 7, expected: [[2, 10]] },
    { name: "右端を共有する短い区間", initial: [[2, 10]], l: 4, r: 10, expected: [[2, 10]] },
    {
        name: "全区間より左に独立挿入",
        initial: [[5, 8]],
        l: 1,
        r: 3,
        expected: [
            [1, 3],
            [5, 8],
        ],
    },
    {
        name: "全区間より右に独立挿入",
        initial: [[1, 3]],
        l: 5,
        r: 8,
        expected: [
            [1, 3],
            [5, 8],
        ],
    },
    {
        name: "隙間に独立挿入",
        initial: [
            [1, 3],
            [9, 11],
        ],
        l: 5,
        r: 7,
        expected: [
            [1, 3],
            [5, 7],
            [9, 11],
        ],
    },
    { name: "左側からの隣接", initial: [[5, 8]], l: 2, r: 5, expected: [[2, 8]] },
    { name: "右側への隣接", initial: [[2, 5]], l: 5, r: 8, expected: [[2, 8]] },
    {
        name: "隙間をちょうど埋める",
        initial: [
            [1, 3],
            [7, 9],
        ],
        l: 3,
        r: 7,
        expected: [[1, 9]],
    },
    { name: "左側から一部重複", initial: [[5, 10]], l: 2, r: 7, expected: [[2, 10]] },
    { name: "右側へ一部重複", initial: [[2, 7]], l: 5, r: 10, expected: [[2, 10]] },
    { name: "同じ左端から右へ拡張", initial: [[2, 7]], l: 2, r: 10, expected: [[2, 10]] },
    { name: "同じ右端まで左へ拡張", initial: [[5, 10]], l: 2, r: 10, expected: [[2, 10]] },
    {
        name: "複数区間を内包して統合",
        initial: [
            [3, 5],
            [7, 9],
            [11, 13],
        ],
        l: 1,
        r: 15,
        expected: [[1, 15]],
    },
    {
        name: "複数区間の一部だけ統合",
        initial: [
            [0, 2],
            [4, 6],
            [8, 10],
            [12, 14],
            [16, 18],
        ],
        l: 5,
        r: 13,
        expected: [
            [0, 2],
            [4, 14],
            [16, 18],
        ],
    },
    {
        name: "吸収で右端が伸びても次の区間は残す",
        initial: [
            [2, 5],
            [7, 12],
            [14, 16],
        ],
        l: 4,
        r: 8,
        expected: [
            [2, 12],
            [14, 16],
        ],
    },
];

const eraseCases: UpdateCase[] = [
    { name: "空集合から削除", initial: [], l: 2, r: 8, expected: [] },
    { name: "空区間を削除", initial: [[2, 8]], l: 5, r: 5, expected: [[2, 8]] },
    { name: "全区間より左を削除", initial: [[5, 8]], l: 1, r: 3, expected: [[5, 8]] },
    { name: "全区間より右を削除", initial: [[2, 5]], l: 7, r: 9, expected: [[2, 5]] },
    {
        name: "隙間だけ削除",
        initial: [
            [1, 3],
            [7, 9],
        ],
        l: 4,
        r: 6,
        expected: [
            [1, 3],
            [7, 9],
        ],
    },
    {
        name: "隙間を境界まで削除",
        initial: [
            [1, 3],
            [7, 9],
        ],
        l: 3,
        r: 7,
        expected: [
            [1, 3],
            [7, 9],
        ],
    },
    { name: "既存区間の左端に接するだけ", initial: [[5, 8]], l: 2, r: 5, expected: [[5, 8]] },
    { name: "既存区間の右端に接するだけ", initial: [[2, 5]], l: 5, r: 8, expected: [[2, 5]] },
    { name: "同一区間を削除", initial: [[2, 8]], l: 2, r: 8, expected: [] },
    { name: "既存区間を内包して削除", initial: [[3, 7]], l: 1, r: 9, expected: [] },
    { name: "左端から一部削除", initial: [[2, 10]], l: 2, r: 5, expected: [[5, 10]] },
    { name: "左側から重ねて削除", initial: [[2, 10]], l: 0, r: 5, expected: [[5, 10]] },
    { name: "右端まで一部削除", initial: [[2, 10]], l: 7, r: 10, expected: [[2, 7]] },
    { name: "右側まで重ねて削除", initial: [[2, 10]], l: 7, r: 12, expected: [[2, 7]] },
    {
        name: "中央の整数一つだけ削除",
        initial: [[2, 10]],
        l: 5,
        r: 6,
        expected: [
            [2, 5],
            [6, 10],
        ],
    },
    {
        name: "一つの区間だけ完全削除",
        initial: [
            [1, 3],
            [5, 7],
            [9, 11],
        ],
        l: 5,
        r: 7,
        expected: [
            [1, 3],
            [9, 11],
        ],
    },
    {
        name: "複数区間をまたいで両端を残す",
        initial: [
            [1, 5],
            [7, 9],
            [11, 15],
        ],
        l: 3,
        r: 13,
        expected: [
            [1, 3],
            [13, 15],
        ],
    },
    {
        name: "複数区間を削除し左残片だけ残す",
        initial: [
            [1, 5],
            [7, 9],
        ],
        l: 3,
        r: 12,
        expected: [[1, 3]],
    },
    {
        name: "複数区間を削除し右残片だけ残す",
        initial: [
            [3, 5],
            [7, 11],
        ],
        l: 1,
        r: 9,
        expected: [[9, 11]],
    },
    {
        name: "離れた前後の区間を保存",
        initial: [
            [0, 2],
            [4, 8],
            [10, 14],
            [16, 18],
        ],
        l: 6,
        r: 12,
        expected: [
            [0, 2],
            [4, 6],
            [12, 14],
            [16, 18],
        ],
    },
    {
        name: "全区間を削除",
        initial: [
            [1, 3],
            [5, 7],
            [9, 11],
        ],
        l: 0,
        r: 12,
        expected: [],
    },
];

const adjacentInsertionOrders = permutations<Interval>([
    [1, 3],
    [3, 5],
    [5, 7],
]).map((order) => ({
    name: order.map(([l, r]) => `[${l}, ${r})`).join(" → "),
    order,
}));

describe("IntervalSet の @example", () => {
    it("constructor", () => {
        const intervalSet = new IntervalSet();
        expect(intervalSet).toBeInstanceOf(IntervalSet);
        expectState(intervalSet, []);
    });

    it("insert", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(0, 3);
        expectState(intervalSet, [[0, 3]]);
        intervalSet.insert(6, 9);
        expectState(intervalSet, [
            [0, 3],
            [6, 9],
        ]);
        intervalSet.insert(2, 6);
        expectState(intervalSet, [[0, 9]]);
    });

    it("erase", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(0, 9);
        intervalSet.erase(3, 6);
        expectState(intervalSet, [
            [0, 3],
            [6, 9],
        ]);
    });

    it("contains", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(2, 5);
        expect(intervalSet.contains(3)).toBe(true);
        expect(intervalSet.contains(5)).toBe(false);
        expectState(intervalSet, [[2, 5]]);
    });

    it("expand", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(2, 5);
        expect(intervalSet.expand(3)).toEqual([2, 5]);
        expect(intervalSet.expand(6)).toEqual([6, 6]);
        expectState(intervalSet, [[2, 5]]);
    });

    it("mex", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(2, 5);
        expect(intervalSet.mex(3)).toBe(5);
        expect(intervalSet.mex(6)).toBe(6);
        expectState(intervalSet, [[2, 5]]);
    });

    it("size", () => {
        const intervalSet = new IntervalSet();
        expect(intervalSet.size).toBe(0);
        intervalSet.insert(0, 3);
        intervalSet.insert(6, 9);
        expect(intervalSet.size).toBe(2);
        expectState(intervalSet, [
            [0, 3],
            [6, 9],
        ]);
        intervalSet.insert(2, 6);
        expect(intervalSet.size).toBe(1);
        expectState(intervalSet, [[0, 9]]);
    });

    it("[Symbol.iterator] を for...of で走査", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(0, 9);
        intervalSet.erase(3, 6);

        const logs: string[] = [];
        for (const [l, r] of intervalSet) logs.push(`[${l}, ${r})`);
        expect(logs).toEqual(["[0, 3)", "[6, 9)"]);
        expectState(intervalSet, [
            [0, 3],
            [6, 9],
        ]);
    });

    it("[Symbol.iterator] を手動で手繰る", () => {
        const intervalSet = new IntervalSet();
        intervalSet.insert(0, 9);
        intervalSet.erase(3, 6);

        const iterator = intervalSet[Symbol.iterator]();
        expect(iterator.next().value).toEqual([0, 3]);
        expect(iterator.next().value).toEqual([6, 9]);
        expect(iterator.next().done).toBe(true);
        expect(iterator.next().value).toBeUndefined();
        expectState(intervalSet, [
            [0, 3],
            [6, 9],
        ]);
    });
});

describe("insert の追加ケース", () => {
    it.each(insertCases)("$name", (updateCase) => {
        testUpdate("insert", updateCase);
    });

    it("同じ区間を繰り返し挿入しても区間列と size は変わらない", () => {
        const set = new IntervalSet();
        set.insert(4, 9);
        expectState(set, [[4, 9]]);
        const before = listIntervals(set);
        for (let i = 0; i < 5; i++) {
            set.insert(4, 9);
            expectUnchanged(set, before);
            expectState(set, before);
        }
    });

    it.each(adjacentInsertionOrders)("挿入順 $name でも [1, 7) になる", ({ order }) => {
        const set = new IntervalSet();
        for (const [l, r] of order) {
            set.insert(l, r);
            expect(invariantError(set)).toBeUndefined();
        }
        expectState(set, [[1, 7]]);
    });

    it("区間がある状態で insert(8, 3) は RangeError になり状態は変わらない", () => {
        expectRangeErrorLeavesState("insert");
    });
});

describe("erase の追加ケース", () => {
    it.each(eraseCases)("$name", (updateCase) => {
        testUpdate("erase", updateCase);
    });

    it("同じ範囲を二回削除すると二回目は状態が変わらない", () => {
        const set = createIntervalSet([[0, 10]]);
        set.erase(3, 7);
        expectState(set, [
            [0, 3],
            [7, 10],
        ]);
        const before = listIntervals(set);
        set.erase(3, 7);
        expectUnchanged(set, before);
        expectState(set, before);
    });

    it("erase(3, 7) のあと insert(3, 7) で [0, 10) に戻る", () => {
        const set = createIntervalSet([[0, 10]]);
        set.erase(3, 7);
        expectState(set, [
            [0, 3],
            [7, 10],
        ]);
        set.insert(3, 7);
        expectState(set, [[0, 10]]);
    });

    it("erase(3, 7) のあと insert(4, 6) で三区間になる", () => {
        const set = createIntervalSet([[0, 10]]);
        set.erase(3, 7);
        expectState(set, [
            [0, 3],
            [7, 10],
        ]);
        set.insert(4, 6);
        expectState(set, [
            [0, 3],
            [4, 6],
            [7, 10],
        ]);
    });

    it("全削除の後に再挿入でき、検索・列挙・size が動作する", () => {
        const set = createIntervalSet([
            [1, 3],
            [5, 7],
            [9, 11],
        ]);
        set.erase(0, 12);
        expectState(set, []);

        set.insert(3, 8);
        expectState(set, [[3, 8]]);
        expect(set.contains(3)).toBe(true);
        expect(set.contains(7)).toBe(true);
        expect(set.contains(8)).toBe(false);
        expect(set.contains(0)).toBe(false);
        expect(set.expand(5)).toEqual([3, 8]);
        expect(set.expand(8)).toEqual([8, 8]);
        expect(set.mex(5)).toBe(8);
        expect(set.mex(8)).toBe(8);
        expect([...set]).toEqual([[3, 8]]);
        expect(set.size).toBe(1);
    });

    it("区間がある状態で erase(8, 3) は RangeError になり状態は変わらない", () => {
        expectRangeErrorLeavesState("erase");
    });
});

describe("検索と数値の境界", () => {
    describe("空集合の検索", () => {
        it.each([-5, 0, 5])("x = %i", (x) => {
            const set = new IntervalSet();
            expect(set.contains(x)).toBe(false);
            expect(set.expand(x)).toEqual([x, x]);
            expect(set.mex(x)).toBe(x);
            expectState(set, []);
        });
    });

    describe("区間の境界と隙間", () => {
        const rows: { x: number; contains: boolean; expand: [number, number]; mex: number }[] = [
            { x: 1, contains: false, expand: [1, 1], mex: 1 },
            { x: 2, contains: true, expand: [2, 5], mex: 5 },
            { x: 4, contains: true, expand: [2, 5], mex: 5 },
            { x: 5, contains: false, expand: [5, 5], mex: 5 },
            { x: 7, contains: false, expand: [7, 7], mex: 7 },
            { x: 8, contains: true, expand: [8, 11], mex: 11 },
            { x: 10, contains: true, expand: [8, 11], mex: 11 },
            { x: 11, contains: false, expand: [11, 11], mex: 11 },
            { x: 12, contains: false, expand: [12, 12], mex: 12 },
        ];

        it.each(rows)("x = $x", ({ x, contains, expand, mex }) => {
            const set = createIntervalSet([
                [2, 5],
                [8, 11],
            ]);
            expectState(set, [
                [2, 5],
                [8, 11],
            ]);
            expect(set.contains(x)).toBe(contains);
            expect(set.expand(x)).toEqual(expand);
            expect(set.mex(x)).toBe(mex);
            expectState(set, [
                [2, 5],
                [8, 11],
            ]);
        });
    });

    it("隣接区間を挿入したあと expand と mex は統合後の区間を返す", () => {
        const set = new IntervalSet();
        set.insert(2, 5);
        set.insert(5, 8);
        expectState(set, [[2, 8]]);
        expect(set.expand(3)).toEqual([2, 8]);
        expect(set.expand(5)).toEqual([2, 8]);
        expect(set.mex(3)).toBe(8);
        expect(set.mex(5)).toBe(8);
    });

    it("中央を削除したあと expand と mex は残片ごとに分かれる", () => {
        const set = createIntervalSet([[2, 10]]);
        set.erase(5, 7);
        expectState(set, [
            [2, 5],
            [7, 10],
        ]);
        expect(set.expand(4)).toEqual([2, 5]);
        expect(set.expand(5)).toEqual([5, 5]);
        expect(set.expand(7)).toEqual([7, 10]);
        expect(set.mex(4)).toBe(5);
        expect(set.mex(5)).toBe(5);
        expect(set.mex(7)).toBe(10);
    });

    it("検索を繰り返しても区間列と size は変わらない", () => {
        const set = createIntervalSet([
            [2, 5],
            [8, 11],
        ]);
        const before = listIntervals(set);
        for (let round = 0; round < 3; round++) {
            for (const x of [1, 2, 4, 5, 7, 8, 10, 11, 12]) {
                set.contains(x);
                set.expand(x);
                set.mex(x);
            }
        }
        expectUnchanged(set, before);
        expectState(set, before);
    });

    it("空集合の列挙結果は空配列", () => {
        const set = new IntervalSet();
        expect([...set]).toEqual([]);
        expectState(set, []);
    });

    it("同じ状態を二回列挙すると同じ昇順の区間列を得る", () => {
        const set = createIntervalSet([
            [8, 11],
            [2, 5],
        ]);
        const first = [...set];
        const second = [...set];
        expect(first).toEqual([
            [2, 5],
            [8, 11],
        ]);
        expect(second).toEqual(first);
        expectState(set, first);
    });

    it("負数をまたいで統合し、ゼロ付近を削除できる", () => {
        const set = new IntervalSet();
        set.insert(-5, -2);
        set.insert(-2, 3);
        expectState(set, [[-5, 3]]);
        expect(set.contains(-5)).toBe(true);
        expect(set.contains(0)).toBe(true);
        expect(set.contains(3)).toBe(false);
        expect(set.mex(-4)).toBe(3);

        set.erase(-1, 1);
        expectState(set, [
            [-5, -1],
            [1, 3],
        ]);
        expect(set.contains(-1)).toBe(false);
        expect(set.contains(0)).toBe(false);
        expect(set.contains(1)).toBe(true);
    });

    it("[0, 1) は 0 だけを含み、削除すると空になる", () => {
        const set = new IntervalSet();
        set.insert(0, 1);
        expectState(set, [[0, 1]]);
        expect(set.contains(-1)).toBe(false);
        expect(set.contains(0)).toBe(true);
        expect(set.contains(1)).toBe(false);
        expect(set.mex(0)).toBe(1);

        set.erase(0, 1);
        expectState(set, []);
        expect(set.contains(0)).toBe(false);
    });

    it("MAX_SAFE_INTEGER の直前を挿入・削除できる", () => {
        const MAX = Number.MAX_SAFE_INTEGER;
        const set = new IntervalSet();
        set.insert(MAX - 2, MAX);
        expectState(set, [[MAX - 2, MAX]]);
        expect(set.contains(MAX - 1)).toBe(true);
        expect(set.contains(MAX)).toBe(false);
        expect(set.expand(MAX - 1)).toEqual([MAX - 2, MAX]);
        expect(set.mex(MAX - 1)).toBe(MAX);

        set.erase(MAX - 1, MAX);
        expectState(set, [[MAX - 2, MAX - 1]]);
    });

    it("MIN_SAFE_INTEGER から始まる区間を挿入・削除できる", () => {
        const MIN = Number.MIN_SAFE_INTEGER;
        const set = new IntervalSet();
        set.insert(MIN, MIN + 2);
        expectState(set, [[MIN, MIN + 2]]);
        expect(set.contains(MIN)).toBe(true);
        expect(set.contains(MIN + 2)).toBe(false);
        expect(set.mex(MIN)).toBe(MIN + 2);

        set.erase(MIN, MIN + 1);
        expectState(set, [[MIN + 1, MIN + 2]]);
    });
});

const RANDOM_SEEDS = [1, 2, 3, 4, 5];
const RANDOM_UPDATES = 500;
const ENDPOINT_MIN = -20;
const ENDPOINT_MAX = 21;
const QUERY_MIN = -25;
const QUERY_MAX = 25;

function pickEndpoint(rand: () => number): number {
    const count = ENDPOINT_MAX - ENDPOINT_MIN + 1;
    return ENDPOINT_MIN + Math.floor(rand() * count);
}

function referenceExpand(model: ReadonlySet<number>, x: number): [number, number] {
    if (!model.has(x)) return [x, x];
    let l = x;
    while (model.has(l - 1)) l--;
    let r = x + 1;
    while (model.has(r)) r++;
    return [l, r];
}

function referenceMex(model: ReadonlySet<number>, x: number): number {
    let y = x;
    while (model.has(y)) y++;
    return y;
}

function referenceIntervals(model: ReadonlySet<number>): Interval[] {
    const points = [...model].sort((a, b) => a - b);
    const intervals: [number, number][] = [];
    for (const x of points) {
        const last = intervals[intervals.length - 1];
        if (last != null && last[1] === x) last[1] = x + 1;
        else intervals.push([x, x + 1]);
    }
    return intervals;
}

function assertRandomStep(
    set: IntervalSet,
    model: ReadonlySet<number>,
    seed: number,
    step: number,
    history: readonly string[],
): void {
    const fail = (detail: string): never => {
        throw new Error(`seed=${seed} step=${step}\n${history.join("\n")}\n${detail}`);
    };

    for (let x = QUERY_MIN; x <= QUERY_MAX; x++) {
        const actual = { contains: set.contains(x), mex: set.mex(x), expand: set.expand(x) };
        const expected = { contains: model.has(x), mex: referenceMex(model, x), expand: referenceExpand(model, x) };
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            fail(`x=${x}\nactual: ${JSON.stringify(actual)}\nexpected: ${JSON.stringify(expected)}`);
        }
    }

    const actualIntervals = listIntervals(set);
    const expectedIntervals = referenceIntervals(model);
    if (JSON.stringify(actualIntervals) !== JSON.stringify(expectedIntervals)) {
        fail(
            [
                "intervals",
                `actual: ${JSON.stringify(actualIntervals)}`,
                `expected: ${JSON.stringify(expectedIntervals)}`,
                `size: ${set.size}`,
            ].join("\n"),
        );
    }
    const broken = invariantError(set);
    if (broken != null) fail(broken);
}

describe("ランダム照合", () => {
    it.each(RANDOM_SEEDS.map((seed) => ({ seed })))("seed $seed で 500 回更新し Set<number> と照合する", ({ seed }) => {
        const rand = mulberry32(seed);
        const set = new IntervalSet();
        const model = new Set<number>();
        const history: string[] = [];

        for (let step = 1; step <= RANDOM_UPDATES; step++) {
            const left = pickEndpoint(rand);
            const right = pickEndpoint(rand);
            const l = Math.min(left, right);
            const r = Math.max(left, right);
            const method = rand() < 0.5 ? "insert" : "erase";
            if (method === "insert") {
                set.insert(l, r);
                for (let x = l; x < r; x++) model.add(x);
            } else {
                set.erase(l, r);
                for (let x = l; x < r; x++) model.delete(x);
            }
            history.push(`${method}(${l}, ${r})`);
            assertRandomStep(set, model, seed, step, history);
        }
    });
});
