import { describe, expect, it } from "vitest";
import { StringOperations } from "../src/StringOperations.ts";

describe("StringOperations の @example", () => {
    it("runLengthEncoding", () => {
        expect(StringOperations.runLengthEncoding("aaabb")).toEqual([
            { value: "a", count: 3 },
            { value: "b", count: 2 },
        ]);
        expect(StringOperations.runLengthEncoding([1, 2, 2])).toEqual([
            { value: 1, count: 1 },
            { value: 2, count: 2 },
        ]);
        expect(StringOperations.runLengthEncoding([])).toEqual([]);
    });

    it("zArray", () => {
        expect(StringOperations.zArray("ababc")).toEqual([5, 0, 2, 0, 0]);
        expect(StringOperations.zArray("aaaaa")).toEqual([5, 4, 3, 2, 1]);
        expect(StringOperations.zArray("abcde")).toEqual([5, 0, 0, 0, 0]);
    });

    it("getSuffixArray", () => {
        expect(StringOperations.getSuffixArray("abcaba")).toEqual([5, 3, 0, 4, 1, 2]);
        expect(StringOperations.getSuffixArray([-1000, 0, 1000, -1000, 0, -1000])).toEqual([5, 3, 0, 4, 1, 2]);
    });

    it("getLCPArray", () => {
        const s = "abcaba";
        const sa = StringOperations.getSuffixArray(s);
        expect(sa).toEqual([5, 3, 0, 4, 1, 2]);
        expect(StringOperations.getLCPArray(s, sa)).toEqual([1, 2, 0, 1, 0]);
    });
});

describe("StringOperations のエラー", () => {
    it("getLCPArray は s と sa の長さが異なるとき Error", () => {
        expect(() => StringOperations.getLCPArray("abc", [0, 1])).toThrow(Error);
    });
});

describe("StringOperations の境界・特例", () => {
    it("空入力は空配列を返す", () => {
        expect(StringOperations.zArray("")).toEqual([]);
        expect(StringOperations.zArray([])).toEqual([]);
        expect(StringOperations.getSuffixArray("")).toEqual([]);
        expect(StringOperations.getSuffixArray([])).toEqual([]);
        expect(StringOperations.getLCPArray("", [])).toEqual([]);
        expect(StringOperations.getLCPArray([], [])).toEqual([]);
    });
});
