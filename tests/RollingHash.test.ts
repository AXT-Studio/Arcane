import { describe, expect, it } from "vitest";
import { RollingHash } from "../src/RollingHash.ts";

/** seed 固定の疑似乱数生成器 (mulberry32) */
function mulberry32(seed: number): () => number {
    let t = seed >>> 0;
    return () => {
        t = (t + 0x6d2b79f5) >>> 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

/** ASCII 英小文字・ひらがな・全角文字。すべて BMP 内 */
const CHAR_POOL = Array.from("abcdefghijklmnopqrstuvwxyzあいうえおＡ一");

function randomString(rand: () => number, length: number): string {
    let s = "";
    for (let i = 0; i < length; i++) {
        s += CHAR_POOL[Math.floor(rand() * CHAR_POOL.length)];
    }
    return s;
}

function assertRandomWalk(rh: RollingHash, seed: number): void {
    const rand = mulberry32(seed);
    for (let trial = 0; trial < 100; trial++) {
        const chars: string[] = [];
        let hash = 0;
        for (let step = 0; step < 300; step++) {
            const opCount = chars.length === 0 ? 2 : 4;
            const op = Math.floor(rand() * opCount);
            if (op === 0) {
                const c = CHAR_POOL[Math.floor(rand() * CHAR_POOL.length)];
                hash = rh.pushToTail(hash, c);
                chars.push(c);
            } else if (op === 1) {
                const c = CHAR_POOL[Math.floor(rand() * CHAR_POOL.length)];
                hash = rh.pushToHead(c, hash, chars.length);
                chars.unshift(c);
            } else if (op === 2) {
                const c = chars[chars.length - 1];
                hash = rh.popFromTail(hash, c);
                chars.pop();
            } else {
                const c = chars[0];
                hash = rh.popFromHead(c, hash, chars.length);
                chars.shift();
            }
            expect(hash).toBe(rh.hashOf(chars.join("")));
        }
    }
}

function assertRandomConcat(rh: RollingHash, seed: number): void {
    const rand = mulberry32(seed);
    for (let trial = 0; trial < 100; trial++) {
        const a = randomString(rand, Math.floor(rand() * 40));
        const b = randomString(rand, Math.floor(rand() * 40));
        const hashA = rh.hashOf(a);
        const hashB = rh.hashOf(b);
        expect(rh.concat(hashA, hashB, b.length)).toBe(rh.hashOf(a + b));
    }
}

describe("RollingHash の @example", () => {
    it("constructor", () => {
        const rh = new RollingHash();
        const hash = rh.hashOf("abcde");
        expect(Number.isInteger(hash)).toBe(true);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(94906249);
    });

    it("constructor 第2系統", () => {
        const rh = new RollingHash(999983, 94906247);
        const hash = rh.hashOf("abcde");
        expect(Number.isInteger(hash)).toBe(true);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(94906247);
    });

    it("pushToTail", () => {
        const rh = new RollingHash();
        const h = rh.hashOf("abc");
        expect(rh.pushToTail(h, "d")).toBe(rh.hashOf("abcd"));
    });

    it("pushToHead", () => {
        const rh = new RollingHash();
        const h = rh.hashOf("bcd");
        expect(rh.pushToHead("a", h, 3)).toBe(rh.hashOf("abcd"));
    });

    it("popFromTail", () => {
        const rh = new RollingHash();
        const h = rh.hashOf("abcd");
        expect(rh.popFromTail(h, "d")).toBe(rh.hashOf("abc"));
    });

    it("popFromHead", () => {
        const rh = new RollingHash();
        const h = rh.hashOf("abcd");
        expect(rh.popFromHead("a", h, 4)).toBe(rh.hashOf("bcd"));
    });

    it("hashOf 空文字列", () => {
        const rh = new RollingHash();
        expect(rh.hashOf("")).toBe(0);
    });

    it("concat", () => {
        const rh = new RollingHash();
        const abc = rh.hashOf("abc");
        const def = rh.hashOf("def");
        expect(rh.concat(abc, def, 3)).toBe(rh.hashOf("abcdef"));
    });
});

describe("RollingHash のランダム一致", () => {
    it("デフォルトパラメータ", () => {
        assertRandomWalk(new RollingHash(), 20260902);
    });

    it("第2系統 (999983, 94906247)", () => {
        assertRandomWalk(new RollingHash(999983, 94906247), 20260903);
    });

    it("concat デフォルトパラメータ", () => {
        assertRandomConcat(new RollingHash(), 20260904);
    });

    it("concat 第2系統 (999983, 94906247)", () => {
        assertRandomConcat(new RollingHash(999983, 94906247), 20260905);
    });
});

describe("RollingHash の境界・特例", () => {
    it("concat は lenB が 0 のとき hashA と一致する", () => {
        const rh = new RollingHash();
        const hashA = rh.hashOf("abc");
        const hashB = rh.hashOf("");
        expect(rh.concat(hashA, hashB, 0)).toBe(hashA);
        expect(rh.concat(hashA, hashB, 0)).toBe(rh.hashOf("abc"));
    });
});
