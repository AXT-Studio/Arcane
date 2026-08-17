import { describe, expect, it } from "vitest";
import { CubicBezierEasing } from "../src/Easing.ts";

/** ドキュメントどおり、戻り値の誤差は高々 1.5 * eps */
const DEFAULT_EPS = 1e-6;
const MAX_ERR = 1.5 * DEFAULT_EPS;
/** apply と invert を合成したときの誤差の余裕 */
const ROUNDTRIP_ERR = 4 * DEFAULT_EPS;
/**
 * 端点 0/1 付近では、曲線が 1 に丸まって二分探索の t が eps より大きくずれることがある。
 */
const ENDPOINT_ERR = 1e-5;

const SHAPES = ["Linear", "Sine", "Quad", "Cubic", "Quart", "Quint", "Expo", "Circ"] as const;
const DIRS = ["In", "Out", "InOut", "OutIn"] as const;
const SAMPLE = [0, 0.01, 0.25, 0.5, 0.75, 0.99, 1];

function namedKey(dir: (typeof DIRS)[number], shape: (typeof SHAPES)[number]) {
    return `ease${dir}${shape}` as const;
}

function expectClose(actual: number, expected: number, err: number = MAX_ERR) {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(err);
}

describe("CubicBezierEasing の @example", () => {
    it("ctrlPts", () => {
        expectClose(CubicBezierEasing.apply(0.5, CubicBezierEasing.ctrlPts.easeInLinear), 0.5);
    });

    it("apply", () => {
        expectClose(CubicBezierEasing.apply(0.5, [1 / 3, 0, 2 / 3, 0]), 0.125);
        expectClose(CubicBezierEasing.apply(-1, CubicBezierEasing.ctrlPts.easeInSine), 0);
        expectClose(CubicBezierEasing.apply(2, CubicBezierEasing.ctrlPts.easeInSine), 1);
    });

    it("invert", () => {
        expectClose(CubicBezierEasing.invert(0.125, [1 / 3, 0, 2 / 3, 0]), 0.5);
    });
});

describe("CubicBezierEasing の境界・特例", () => {
    it("名前付きイージングの端点は 0 と 1", () => {
        for (const dir of DIRS) {
            for (const shape of SHAPES) {
                const easing = CubicBezierEasing.ctrlPts[namedKey(dir, shape)];
                expectClose(CubicBezierEasing.apply(0, easing), 0, ENDPOINT_ERR);
                expectClose(CubicBezierEasing.apply(1, easing), 1, ENDPOINT_ERR);
                expectClose(CubicBezierEasing.invert(0, easing), 0, ENDPOINT_ERR);
                expectClose(CubicBezierEasing.invert(1, easing), 1, ENDPOINT_ERR);
            }
        }
    });

    it("線形イージングは恒等写像", () => {
        for (const key of ["easeInLinear", "easeOutLinear", "easeInOutLinear", "easeOutInLinear"] as const) {
            const easing = CubicBezierEasing.ctrlPts[key];
            for (const x of SAMPLE) {
                expectClose(CubicBezierEasing.apply(x, easing), x);
                expectClose(CubicBezierEasing.invert(x, easing), x);
            }
        }
    });

    it("x³ になる制御点", () => {
        const cubicIn: [number, number, number, number] = [1 / 3, 0, 2 / 3, 0];
        for (const x of SAMPLE) {
            expectClose(CubicBezierEasing.apply(x, cubicIn), x ** 3);
            expectClose(CubicBezierEasing.invert(x ** 3, cubicIn), x);
        }
    });

    it("apply と invert の往復", () => {
        const names = ["easeInLinear", "easeInSine", "easeOutCirc", "easeInOutExpo", "easeOutInQuad"] as const;
        for (const name of names) {
            const easing = CubicBezierEasing.ctrlPts[name];
            for (const x of SAMPLE) {
                expectClose(CubicBezierEasing.invert(CubicBezierEasing.apply(x, easing), easing), x, ROUNDTRIP_ERR);
                expectClose(CubicBezierEasing.apply(CubicBezierEasing.invert(x, easing), easing), x, ROUNDTRIP_ERR);
            }
        }
    });

    it("apply は非減少", () => {
        for (const dir of DIRS) {
            for (const shape of SHAPES) {
                const easing = CubicBezierEasing.ctrlPts[namedKey(dir, shape)];
                let prev = CubicBezierEasing.apply(0, easing);
                for (let i = 1; i <= 20; i++) {
                    const y = CubicBezierEasing.apply(i / 20, easing);
                    expect(y).toBeGreaterThanOrEqual(prev);
                    prev = y;
                }
            }
        }
    });

    it("OutIn は対応する InOut の逆関数", () => {
        for (const shape of SHAPES) {
            const inOut = CubicBezierEasing.ctrlPts[namedKey("InOut", shape)];
            const outIn = CubicBezierEasing.ctrlPts[namedKey("OutIn", shape)];
            for (const x of SAMPLE) {
                expectClose(CubicBezierEasing.apply(x, outIn), CubicBezierEasing.invert(x, inOut), ROUNDTRIP_ERR);
                expectClose(CubicBezierEasing.apply(x, inOut), CubicBezierEasing.invert(x, outIn), ROUNDTRIP_ERR);
            }
        }
    });

    it("区間外は端点に張り付く", () => {
        const easing = CubicBezierEasing.ctrlPts.easeOutCirc;
        expectClose(CubicBezierEasing.apply(-0.3, easing), 0, ENDPOINT_ERR);
        expectClose(CubicBezierEasing.apply(1.7, easing), 1, ENDPOINT_ERR);
        expectClose(CubicBezierEasing.invert(-0.3, easing), 0, ENDPOINT_ERR);
        expectClose(CubicBezierEasing.invert(1.7, easing), 1, ENDPOINT_ERR);
    });
});
