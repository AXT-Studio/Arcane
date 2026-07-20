import { describe, expect, it } from "vitest";
import { UniqueID } from "../src/UniqueID.ts";

describe("UniqueID の @example", () => {
    it("タイムスタンプなしの generateUUIDv7", () => {
        const uuid1 = UniqueID.generateUUIDv7();
        expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it("タイムスタンプ指定の generateUUIDv7", () => {
        const uuid2 = UniqueID.generateUUIDv7(1672531199000);
        // timestamp 1672531199000 => 0x01856aa0c418 occupies the leading 48 bits
        expect(uuid2.startsWith("01856aa0-c418-7")).toBe(true);
        expect(uuid2).toMatch(/^01856aa0-c418-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
});
