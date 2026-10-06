import { describe, expect, it } from "vitest";
import { UniqueID } from "../src/UniqueID.ts";

describe("UniqueID - JSDoc @example", () => {
    it("UniqueID.generateUUIDv7() [現在時刻に基づいてUUIDv7を生成する例]", () => {
        const uuid1 = UniqueID.generateUUIDv7();
        expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
    it("UniqueID.generateUUIDv7() [タイムスタンプを指定してUUIDv7を生成する例]", () => {
        const uuid2 = UniqueID.generateUUIDv7(1672531199000);
        expect(uuid2.startsWith("01856aa0-c418-7")).toBe(true);
        expect(uuid2).toMatch(/^01856aa0-c418-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
});

describe("UniqueID - Edge Cases", () => {
    it("UniqueID.generateUUIDv7()はtimestampが負のときTypeError", () => {
        expect(() => UniqueID.generateUUIDv7(-1)).toThrow(TypeError);
    });
    it("UniqueID.generateUUIDv7()はtimestampが非整数のときTypeError", () => {
        expect(() => UniqueID.generateUUIDv7(1.5)).toThrow(TypeError);
    });
    it("UniqueID.generateUUIDv7()はtimestampが2^48のときTypeError", () => {
        expect(() => UniqueID.generateUUIDv7(2 ** 48)).toThrow(TypeError);
    });
});
