import { describe, expect, it } from "vitest";
import { CubicBezierEasing } from "../src/Easings.ts";

describe("CubicBezierEasing - JSDoc @example", () => {
    it("CubicBezierEasing.ctrlPts", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        expect(
            Math.abs(CubicBezierEasing.apply(0.5, CubicBezierEasing.ctrlPts.easeInLinear) - 0.5),
        ).toBeLessThanOrEqual(1.5e-6);
    });
    it("CubicBezierEasing.apply()", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        expect(Math.abs(CubicBezierEasing.apply(0.5, [1 / 3, 0, 2 / 3, 0]) - 0.125)).toBeLessThanOrEqual(1.5e-6);
        expect(Math.abs(CubicBezierEasing.apply(-1, CubicBezierEasing.ctrlPts.easeInSine) - 0)).toBeLessThanOrEqual(
            1.5e-6,
        );
        expect(Math.abs(CubicBezierEasing.apply(2, CubicBezierEasing.ctrlPts.easeInSine) - 1)).toBeLessThanOrEqual(
            1.5e-6,
        );
    });
    it("CubicBezierEasing.invert()", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        expect(Math.abs(CubicBezierEasing.invert(0.125, [1 / 3, 0, 2 / 3, 0]) - 0.5)).toBeLessThanOrEqual(1.5e-6);
    });
});

describe("CubicBezierEasing - Edge Cases", () => {
    it("apply()はxが0未満のとき0", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expect(Math.abs(CubicBezierEasing.apply(-0.3, easing) - 0)).toBeLessThanOrEqual(1.5e-6);
    });
    it("apply()はxが0のとき0", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expect(Math.abs(CubicBezierEasing.apply(0, easing) - 0)).toBeLessThanOrEqual(1.5e-6);
    });
    it("apply()はxが1のとき1", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expect(Math.abs(CubicBezierEasing.apply(1, easing) - 1)).toBeLessThanOrEqual(1.5e-6);
    });
    it("apply()はxが1超過のとき1", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expect(Math.abs(CubicBezierEasing.apply(1.7, easing) - 1)).toBeLessThanOrEqual(1.5e-6);
    });
    it("invert()はyが0未満のとき0", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expect(Math.abs(CubicBezierEasing.invert(-0.3, easing) - 0)).toBeLessThanOrEqual(1.5e-6);
    });
    it("invert()はyが0のとき0", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expect(Math.abs(CubicBezierEasing.invert(0, easing) - 0)).toBeLessThanOrEqual(1.5e-6);
    });
    it("invert()はyが1のとき1", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expect(Math.abs(CubicBezierEasing.invert(1, easing) - 1)).toBeLessThanOrEqual(1.5e-6);
    });
    it("invert()はyが1超過のとき1", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expect(Math.abs(CubicBezierEasing.invert(1.7, easing) - 1)).toBeLessThanOrEqual(1.5e-6);
    });
});

describe("CubicBezierEasing - Random Tests", () => {
    it("apply()について、ランダムな制御点で0.01刻みに単調非減少であることを確認", () => {
        for (let trial = 0; trial < 100; trial++) {
            const easing: [number, number, number, number] = [
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random(),
            ];
            let prev = CubicBezierEasing.apply(0, easing);
            for (let i = 1; i <= 100; i++) {
                const y = CubicBezierEasing.apply(i / 100, easing);
                expect(y).toBeGreaterThanOrEqual(prev);
                prev = y;
            }
        }
    });
    it("apply(), invert()について、ランダムな制御点で往復すると元の値に戻ることを確認", () => {
        // 誤差は高々 1.5 * eps (eps = 1e-6)
        for (let trial = 0; trial < 100; trial++) {
            const easing: [number, number, number, number] = [
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random(),
            ];
            for (let i = 0; i <= 10; i++) {
                const x = i / 10;
                expect(
                    Math.abs(CubicBezierEasing.invert(CubicBezierEasing.apply(x, easing), easing) - x),
                ).toBeLessThanOrEqual(1.5e-6);
            }
        }
    });
});
