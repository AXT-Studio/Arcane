import { describe, expect, it } from "vitest";
import { RollingHash } from "../src/RollingHash.ts";

describe("RollingHash - JSDoc @example", () => {
    it("new RollingHash()", () => {
        const rh1 = new RollingHash();
        const rh2 = new RollingHash(999983, 94906247);
        const hash1 = rh1.hashOf("abcde");
        const hash2 = rh2.hashOf("abcde");
        expect(Number.isInteger(hash1)).toBe(true);
        expect(hash1).toBeGreaterThanOrEqual(0);
        expect(hash1).toBeLessThan(94906249);
        expect(Number.isInteger(hash2)).toBe(true);
        expect(hash2).toBeGreaterThanOrEqual(0);
        expect(hash2).toBeLessThan(94906247);
    });
    it("hashOf()", () => {
        const rh = new RollingHash();
        const hash = rh.hashOf("abcde");
        expect(Number.isInteger(hash)).toBe(true);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(94906249);
    });
    it("pushToTail()", () => {
        const rh = new RollingHash();
        const abc = rh.hashOf("abc");
        const abcd = rh.pushToTail(abc, "d");
        expect(abcd === rh.hashOf("abcd")).toBe(true);
    });
    it("pushToHead()", () => {
        const rh = new RollingHash();
        const bcd = rh.hashOf("bcd");
        const abcd = rh.pushToHead("a", bcd, 3);
        expect(abcd === rh.hashOf("abcd")).toBe(true);
    });
    it("popFromTail()", () => {
        const rh = new RollingHash();
        const abcd = rh.hashOf("abcd");
        const abc = rh.popFromTail(abcd, "d");
        expect(abc === rh.hashOf("abc")).toBe(true);
    });
    it("popFromHead()", () => {
        const rh = new RollingHash();
        const abcd = rh.hashOf("abcd");
        const bcd = rh.popFromHead("a", abcd, 4);
        expect(bcd === rh.hashOf("bcd")).toBe(true);
    });
    it("concat()", () => {
        const rh = new RollingHash();
        const abc = rh.hashOf("abc");
        const def = rh.hashOf("def");
        const abcdef = rh.concat(abc, def, 3);
        expect(abcdef === rh.hashOf("abcdef")).toBe(true);
    });
});

describe("RollingHash - Edge Cases", () => {
    it("hashOf()は空文字列のとき0", () => {
        const rh = new RollingHash();
        expect(rh.hashOf("")).toBe(0);
    });
    it("concat()はlenBが0のときhashAと一致", () => {
        const rh = new RollingHash();
        const hashA = rh.hashOf("abc");
        const hashB = rh.hashOf("");
        expect(rh.concat(hashA, hashB, 0)).toBe(hashA);
        expect(rh.concat(hashA, hashB, 0)).toBe(rh.hashOf("abc"));
    });
});

describe("RollingHash - Random Tests", () => {
    it("pushToTail(), pushToHead(), popFromTail(), popFromHead()について、デフォルトの(m, h)でhashOf()と比較して一致確認", () => {
        const chars = Array.from("abcdefghijklmnopqrstuvwxyzあいうえおＡ一");
        const rh = new RollingHash();
        for (let trial = 0; trial < 50; trial++) {
            const built: string[] = [];
            let hash = 0;
            for (let step = 0; step < 200; step++) {
                const opCount = built.length === 0 ? 2 : 4;
                const op = Math.floor(Math.random() * opCount);
                if (op === 0) {
                    const c = chars[Math.floor(Math.random() * chars.length)];
                    hash = rh.pushToTail(hash, c);
                    built.push(c);
                } else if (op === 1) {
                    const c = chars[Math.floor(Math.random() * chars.length)];
                    hash = rh.pushToHead(c, hash, built.length);
                    built.unshift(c);
                } else if (op === 2) {
                    const c = built[built.length - 1];
                    hash = rh.popFromTail(hash, c);
                    built.pop();
                } else {
                    const c = built[0];
                    hash = rh.popFromHead(c, hash, built.length);
                    built.shift();
                }
                expect(hash).toBe(rh.hashOf(built.join("")));
            }
        }
    });
    it("pushToTail(), pushToHead(), popFromTail(), popFromHead()について、第2系統の(m, h)でhashOf()と比較して一致確認", () => {
        const chars = Array.from("abcdefghijklmnopqrstuvwxyzあいうえおＡ一");
        const rh = new RollingHash(999983, 94906247);
        for (let trial = 0; trial < 50; trial++) {
            const built: string[] = [];
            let hash = 0;
            for (let step = 0; step < 200; step++) {
                const opCount = built.length === 0 ? 2 : 4;
                const op = Math.floor(Math.random() * opCount);
                if (op === 0) {
                    const c = chars[Math.floor(Math.random() * chars.length)];
                    hash = rh.pushToTail(hash, c);
                    built.push(c);
                } else if (op === 1) {
                    const c = chars[Math.floor(Math.random() * chars.length)];
                    hash = rh.pushToHead(c, hash, built.length);
                    built.unshift(c);
                } else if (op === 2) {
                    const c = built[built.length - 1];
                    hash = rh.popFromTail(hash, c);
                    built.pop();
                } else {
                    const c = built[0];
                    hash = rh.popFromHead(c, hash, built.length);
                    built.shift();
                }
                expect(hash).toBe(rh.hashOf(built.join("")));
            }
        }
    });
    it("concat()について、デフォルトの(m, h)でhashOf()と比較して一致確認", () => {
        const chars = Array.from("abcdefghijklmnopqrstuvwxyzあいうえおＡ一");
        const rh = new RollingHash();
        for (let trial = 0; trial < 100; trial++) {
            const lenA = Math.floor(Math.random() * 40);
            const lenB = Math.floor(Math.random() * 40);
            let a = "";
            let b = "";
            for (let i = 0; i < lenA; i++) a += chars[Math.floor(Math.random() * chars.length)];
            for (let i = 0; i < lenB; i++) b += chars[Math.floor(Math.random() * chars.length)];
            expect(rh.concat(rh.hashOf(a), rh.hashOf(b), b.length)).toBe(rh.hashOf(a + b));
        }
    });
    it("concat()について、第2系統の(m, h)でhashOf()と比較して一致確認", () => {
        const chars = Array.from("abcdefghijklmnopqrstuvwxyzあいうえおＡ一");
        const rh = new RollingHash(999983, 94906247);
        for (let trial = 0; trial < 100; trial++) {
            const lenA = Math.floor(Math.random() * 40);
            const lenB = Math.floor(Math.random() * 40);
            let a = "";
            let b = "";
            for (let i = 0; i < lenA; i++) a += chars[Math.floor(Math.random() * chars.length)];
            for (let i = 0; i < lenB; i++) b += chars[Math.floor(Math.random() * chars.length)];
            expect(rh.concat(rh.hashOf(a), rh.hashOf(b), b.length)).toBe(rh.hashOf(a + b));
        }
    });
});
