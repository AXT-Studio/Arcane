import { describe, expect, it } from "vitest";
import { Vector2DFloat, Vector2DInt } from "../src/Vector2D.ts";

describe("Vector2DFloat - JSDoc @example", () => {
    it("new Vector2DFloat()", () => {
        expect(() => {
            const _v = new Vector2DFloat(1, 2);
        }).not.toThrow();
    });
    it("add()", () => {
        const v1 = new Vector2DFloat(1, 2);
        const v2 = new Vector2DFloat(3, 4);
        const sum = v1.add(v2);
        expect(sum).toEqual(new Vector2DFloat(4, 6));
    });
    it("sub()", () => {
        const v1 = new Vector2DFloat(3, 4);
        const v2 = new Vector2DFloat(1, 2);
        const diff = v1.sub(v2);
        expect(diff).toEqual(new Vector2DFloat(2, 2));
    });
    it("squaredMagnitude()", () => {
        const v = new Vector2DFloat(3, 4);
        expect(v.squaredMagnitude()).toBe(25);
    });
    it("mul()", () => {
        const v = new Vector2DFloat(1, 2);
        const scaled = v.mul(3);
        expect(scaled).toEqual(new Vector2DFloat(3, 6));
    });
    it("dot()", () => {
        const v1 = new Vector2DFloat(1, 1);
        const v2 = new Vector2DFloat(2, 3);
        expect(v1.dot(v2)).toBe(5);
    });
    it("cross()", () => {
        const v1 = new Vector2DFloat(1, 1);
        const v2 = new Vector2DFloat(2, 3);
        expect(v1.cross(v2)).toBe(1);
    });
    it("Vector2DFloat.CCW()", () => {
        const p0 = new Vector2DFloat(0, 0);
        const p1 = new Vector2DFloat(1, 1);
        const p2 = new Vector2DFloat(2, 0);
        expect(Vector2DFloat.CCW(p0, p1, p2)).toBe(-1);
    });
    it("Vector2DFloat.areSegmentsIntersecting()", () => {
        const a1 = new Vector2DFloat(0, 0);
        const a2 = new Vector2DFloat(2, 2);
        const b1 = new Vector2DFloat(0, 2);
        const b2 = new Vector2DFloat(2, 0);
        expect(Vector2DFloat.areSegmentsIntersecting(a1, a2, b1, b2)).toBe(true);
    });
});

describe("Vector2DInt - JSDoc @example", () => {
    it("new Vector2DInt()", () => {
        expect(() => {
            const _v = new Vector2DInt(1n, 2n);
        }).not.toThrow();
    });
    it("add()", () => {
        const v1 = new Vector2DInt(1n, 2n);
        const v2 = new Vector2DInt(3n, 4n);
        const sum = v1.add(v2);
        expect(sum).toEqual(new Vector2DInt(4n, 6n));
    });
    it("sub()", () => {
        const v1 = new Vector2DInt(3n, 4n);
        const v2 = new Vector2DInt(1n, 2n);
        const diff = v1.sub(v2);
        expect(diff).toEqual(new Vector2DInt(2n, 2n));
    });
    it("squaredMagnitude()", () => {
        const v = new Vector2DInt(3n, 4n);
        expect(v.squaredMagnitude()).toBe(25n);
    });
    it("mul()", () => {
        const v = new Vector2DInt(1n, 2n);
        const scaled = v.mul(3n);
        expect(scaled).toEqual(new Vector2DInt(3n, 6n));
    });
    it("dot()", () => {
        const v1 = new Vector2DInt(1n, 1n);
        const v2 = new Vector2DInt(2n, 3n);
        expect(v1.dot(v2)).toBe(5n);
    });
    it("cross()", () => {
        const v1 = new Vector2DInt(1n, 1n);
        const v2 = new Vector2DInt(2n, 3n);
        expect(v1.cross(v2)).toBe(1n);
    });
    it("Vector2DInt.CCW()", () => {
        const p0 = new Vector2DInt(0n, 0n);
        const p1 = new Vector2DInt(1n, 1n);
        const p2 = new Vector2DInt(2n, 0n);
        expect(Vector2DInt.CCW(p0, p1, p2)).toBe(-1);
    });
    it("Vector2DInt.areSegmentsIntersecting()", () => {
        const a1 = new Vector2DInt(0n, 0n);
        const a2 = new Vector2DInt(2n, 2n);
        const b1 = new Vector2DInt(0n, 2n);
        const b2 = new Vector2DInt(2n, 0n);
        expect(Vector2DInt.areSegmentsIntersecting(a1, a2, b1, b2)).toBe(true);
    });
});

describe("Vector2DFloat - Edge Cases", () => {
    it("CCW()は共線のとき0", () => {
        const p0 = new Vector2DFloat(0, 0);
        const p1 = new Vector2DFloat(1, 1);
        const p2 = new Vector2DFloat(2, 2);
        expect(Vector2DFloat.CCW(p0, p1, p2)).toBe(0);
    });
});

describe("Vector2DInt - Edge Cases", () => {
    it("CCW()は共線のとき0", () => {
        const p0 = new Vector2DInt(0n, 0n);
        const p1 = new Vector2DInt(1n, 1n);
        const p2 = new Vector2DInt(2n, 2n);
        expect(Vector2DInt.CCW(p0, p1, p2)).toBe(0);
    });
});
