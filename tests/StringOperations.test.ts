import { describe, expect, it } from "vitest";
import { StringOperations } from "../src/StringOperations.ts";

describe("StringOperations - JSDoc @example", () => {
    it("StringOperations.runLengthEncoding()", () => {
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
    it("StringOperations.zArray()", () => {
        expect(StringOperations.zArray("ababc")).toEqual([5, 0, 2, 0, 0]);
        expect(StringOperations.zArray("aaaaa")).toEqual([5, 4, 3, 2, 1]);
        expect(StringOperations.zArray("abcde")).toEqual([5, 0, 0, 0, 0]);
    });
    it("StringOperations.getSuffixArray()", () => {
        expect(StringOperations.getSuffixArray("abcaba")).toEqual([5, 3, 0, 4, 1, 2]);
        expect(StringOperations.getSuffixArray([-1000, 0, 1000, -1000, 0, -1000])).toEqual([5, 3, 0, 4, 1, 2]);
    });
    it("StringOperations.getLCPArray()", () => {
        const s = "abcaba";
        const sa = StringOperations.getSuffixArray(s);
        expect(sa).toEqual([5, 3, 0, 4, 1, 2]);
        expect(StringOperations.getLCPArray(s, sa)).toEqual([1, 2, 0, 1, 0]);
    });
});

describe("StringOperations - Edge Cases", () => {
    it("getLCPArray()はsとsaの長さが異なるときError", () => {
        expect(() => StringOperations.getLCPArray("abc", [0, 1])).toThrow(Error);
    });
    it("zArray()は空文字列のとき[]", () => {
        expect(StringOperations.zArray("")).toEqual([]);
    });
    it("zArray()は空配列のとき[]", () => {
        expect(StringOperations.zArray([])).toEqual([]);
    });
    it("getSuffixArray()は空文字列のとき[]", () => {
        expect(StringOperations.getSuffixArray("")).toEqual([]);
    });
    it("getSuffixArray()は空配列のとき[]", () => {
        expect(StringOperations.getSuffixArray([])).toEqual([]);
    });
    it("getLCPArray()はsが空文字列でsaが空のとき[]", () => {
        expect(StringOperations.getLCPArray("", [])).toEqual([]);
    });
    it("getLCPArray()はsが空配列でsaが空のとき[]", () => {
        expect(StringOperations.getLCPArray([], [])).toEqual([]);
    });
});
