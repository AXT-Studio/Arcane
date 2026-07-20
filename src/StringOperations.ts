// ================================================================
// Utilities
// ================================================================

/**
 * @private
 * 指定された数列のSuffix Arrayを構築します。
 * ただし、番兵データはすでに追加されているものとします。
 */
const sa_is = (s: number[]): number[] => {
    const n = s.length;
    // S型・L型の分類をする
    const isS = new Array(n).fill(false);
    isS[n - 1] = true;
    for (let i = n - 2; i >= 0; i--) {
        if (s[i] > s[i + 1]) {
            isS[i] = false; // L型
        } else if (s[i] < s[i + 1]) {
            isS[i] = true; // S型
        } else {
            isS[i] = isS[i + 1];
        }
    }
    // LMS(直前がLのS型のindex)を列挙する
    const lmsIndices: number[] = [];
    for (let i = 1; i < n; i++) {
        if (isS[i] && !isS[i - 1]) lmsIndices.push(i);
    }
    const isLMS = new Array(n).fill(false);
    for (let i = 0; i < lmsIndices.length; i++) {
        isLMS[lmsIndices[i]] = true;
    }
    // S内に登場する数値の最大値を確認する
    const S_max = s.reduce((a, c) => Math.max(a, c));
    // 0以上S以下の数値が、それぞれ何回出てくるかカウントする
    const countInS = new Array(S_max + 1).fill(0);
    for (let i = 0; i < n; i++) countInS[s[i]]++;
    // カウントの累積和を取る
    const scan = [countInS[0]];
    for (let i = 1; i <= S_max; i++) scan[i] = scan[i - 1] + countInS[i];
    // 各数字に対応するバケツ領域の先頭と末尾のindexを取得
    const heads_1 = [0, ...scan.slice(0, -1)];
    const tails_1a = scan.map((n) => n - 1);
    // Induced Sorting (1回目)
    const sa = new Array(n).fill(-1);
    // 1. LMSを仮置きする (先頭文字のバケツ領域の末尾)
    for (let i = 0; i < lmsIndices.length; i++) {
        const lmsIndex = lmsIndices[i];
        const char = s[lmsIndex];
        sa[tails_1a[char]] = lmsIndex;
        tails_1a[char]--;
    }
    // 2. L型を埋める (文字のバケツ領域の先頭)
    for (let i = 0; i < n; i++) {
        if (sa[i] === -1) continue;
        const v = sa[i];
        if (v > 0 && !isS[v - 1]) {
            sa[heads_1[s[v - 1]]] = v - 1;
            heads_1[s[v - 1]]++;
        }
    }
    // 3. S型を埋める (文字のバケツ領域の末尾)
    const tails_1b = scan.map((n) => n - 1);
    for (let i = n - 1; i >= 0; i--) {
        if (sa[i] === -1) continue;
        const v = sa[i];
        if (v > 0 && isS[v - 1]) {
            sa[tails_1b[s[v - 1]]] = v - 1;
            tails_1b[s[v - 1]]--;
        }
    }
    // saからLMSを指す数値だけ抜き出し、もとの文字列のindexに変えて並べる
    /** 辞書順にソートされたLMSのインデックス */
    const sortedLMS: number[] = [];
    for (let i = 0; i < n; i++) {
        const v = sa[i];
        if (v > 0 && isS[v] && !isS[v - 1]) sortedLMS.push(v);
    }
    // LMS部分文字列に対して名前をつけていく
    const names = new Array(n).fill(-1);
    let nameCounter = 0;
    names[sortedLMS[0]] = nameCounter;
    for (let i = 1; i < sortedLMS.length; i++) {
        const prevLMS = sortedLMS[i - 1];
        const currLMS = sortedLMS[i];
        // biome-ignore lint/correctness/noConstantCondition: どこかでbreakするので問題ない
        for (let d = 0; true; d++) {
            // 文字そのものが違えば不一致
            if (s[prevLMS + d] !== s[currLMS + d]) {
                names[currLMS] = ++nameCounter;
                break;
            }
            // どちらかが次のLMSに到達したかどうかの判定
            if (d > 0) {
                const prevIsEnd = isLMS[prevLMS + d];
                const currIsEnd = isLMS[currLMS + d];
                // 両方trueなら一致
                if (prevIsEnd && currIsEnd) {
                    names[currLMS] = nameCounter;
                    break;
                }
                // 片方がtrueなら不一致
                if (prevIsEnd || currIsEnd) {
                    names[currLMS] = ++nameCounter;
                    break;
                }
            }
        }
    }
    // LMS部分文字列のランクを元の文字列における出現順に並べた配列を作る
    const S1: number[] = [];
    for (let i = 0; i < names.length; i++) {
        if (names[i] !== -1) S1.push(names[i]);
    }
    // S1のSuffix Arrayを取得する
    const SA1: number[] = [];
    if (nameCounter + 1 === S1.length) {
        for (let i = 0; i < S1.length; i++) {
            SA1[S1[i]] = i;
        }
    } else {
        const recursion = sa_is(S1);
        recursion.forEach((element) => {
            SA1.push(element);
        });
    }
    // Induced Sorting (2回目)
    const heads_2 = [0, ...scan.slice(0, -1)];
    const tails_2a = scan.map((n) => n - 1);
    const tails_2b = scan.map((n) => n - 1);
    const answer = new Array(n).fill(-1);
    // 1. LMSを埋める (末尾)
    for (let i = SA1.length - 1; i >= 0; i--) {
        const lmsIndex = lmsIndices[SA1[i]];
        const char = s[lmsIndex];
        answer[tails_2a[char]] = lmsIndex;
        tails_2a[char]--;
    }
    // 2. L型を埋める (先頭)
    for (let i = 0; i < n; i++) {
        if (answer[i] === -1) continue;
        const v = answer[i];
        if (v > 0 && !isS[v - 1]) {
            answer[heads_2[s[v - 1]]] = v - 1;
            heads_2[s[v - 1]]++;
        }
    }
    // 3. S型を埋める (末尾)
    for (let i = n - 1; i >= 0; i--) {
        if (answer[i] === -1) continue;
        const v = answer[i];
        if (v > 0 && isS[v - 1]) {
            answer[tails_2b[s[v - 1]]] = v - 1;
            tails_2b[s[v - 1]]--;
        }
    }
    return answer;
};

// ================================================================
// Exports
// ================================================================

/**
 * 文字列や数列に対する操作メソッド群を提供するユーティリティクラスです。
 * - 連長圧縮 (Run-Length Encoding)
 * - Z Array (Z Algorithm)
 * - Suffix Array
 * - LCP Array
 */
export class StringOperations {
    /**
     * 文字列・数列を連長圧縮(Run-Length Encoding)します。
     *
     * 時間計算量: O(N) (Nは文字列・数列の長さ)
     *
     * @example
     * ```ts
     * console.log(StringOperations.runLengthEncoding("aaabb")); // [{ value: 'a', count: 3 }, { value: 'b', count: 2 }]
     * console.log(StringOperations.runLengthEncoding([1, 2, 2])); // [{ value: 1, count: 1 }, { value: 2, count: 2 }]
     * console.log(StringOperations.runLengthEncoding([])); // []
     * ```
     *
     * @param sequence - 連長圧縮する文字列や数列。ArrayLikeで各要素が比較可能であれば、文字列や数列以外の型も扱えます。
     * @returns 連長圧縮された配列。各要素は `{ value: 値, count: 連続する個数 }` の形式のオブジェクト。
     */
    static runLengthEncoding<T>(sequence: ArrayLike<T>): { value: T; count: number }[] {
        const result: { value: T; count: number }[] = [];
        if (sequence.length === 0) return result;
        let currentValue = sequence[0];
        let currentCount = 1;
        for (let i = 1; i < sequence.length; i++) {
            if (sequence[i] === currentValue) {
                currentCount++;
            } else {
                result.push({ value: currentValue, count: currentCount });
                currentValue = sequence[i];
                currentCount = 1;
            }
        }
        result.push({ value: currentValue, count: currentCount });
        return result;
    }

    /**
     * 文字列・数列のZ Arrayを構築します。
     * Z Arrayは、文字列・数列の各位置から始まる接尾辞と、文字列・数列そのものとの最長共通接頭辞の長さを格納する配列です。
     * 長さ0の列が渡された場合は、空の配列を返します。
     *
     * 時間計算量: O(N) (Nは文字列・数列の長さ)
     *
     * @example
     * ```ts
     * console.log(StringOperations.zArray("ababc")); // [5, 0, 2, 0, 0]
     * console.log(StringOperations.zArray("aaaaa")); // [5, 4, 3, 2, 1]
     * console.log(StringOperations.zArray("abcde")); // [5, 0, 0, 0, 0]
     * ```
     *
     * @param s - Z Arrayを構築する文字列や数列。ArrayLikeで各要素が比較可能であれば、文字列や数列以外の型も扱えます。
     * @returns Z Array。戻り値を`z`として、`z[i]`は`s`の位置`i`から始まる接尾辞と、`s`そのものとの最長共通接頭辞の長さを表す。
     */
    static zArray<T>(s: ArrayLike<T>): number[] {
        if (s.length === 0) return [];
        const z = new Array(s.length).fill(0);
        z[0] = s.length;
        // 今わかっている中で、一番右に伸びている s[0...r-l) と s[l..r) が完全一致する区間 (z-box)
        let l = 0,
            r = 0;
        for (let i = 1; i < s.length; i++) {
            // iがz-boxの範囲内の場合: Math.min(prefix側のZ[i-l], z-boxの末端までの文字数)以上なのは確定する
            if (i < r) {
                z[i] = Math.min(z[i - l], r - i);
            }
            // 伸ばせるだけ右に伸ばす
            while (z[i] + i < s.length && s[z[i]] === s[i + z[i]]) z[i]++;
            // 右端を更新した場合、l, rを今の情報に更新
            if (r < i + z[i]) {
                l = i;
                r = i + z[i];
            }
        }
        return z;
    }

    /**
     * 文字列・数列のSuffix Arrayを構築します。
     * Suffix Arrayは、文字列・数列の接尾辞を辞書順に並べたときの、元の文字列・数列における開始位置を格納する配列です。
     * 長さ0の列が渡された場合は、空の配列を返します。
     *
     * 時間計算量: 以下の通り
     * - s: ArrayLike<number>で、sの最大値と最小値の差が255以下の場合: O(N) (Nは数列の長さ)
     * - s: ArrayLike<string>で、すべての文字がASCII範囲(U+0000からU+007F)に収まる場合: O(N) (Nは文字列の長さ)
     * - 上記以外の場合: O(N log N) (Nは文字列・数列の長さ。座標圧縮にO(N log N)かかるため)
     *
     * @example
     * ```ts
     * console.log(StringOperations.getSuffixArray("abcaba")); // [5, 3, 0, 4, 1, 2]
     * console.log(StringOperations.getSuffixArray([-1000, 0, 1000, -1000, 0, -1000])); // [5, 3, 0, 4, 1, 2]
     * ```
     *
     * @param s - Suffix Arrayを構築する文字列か数列。ArrayLikeでも各要素が文字列か数列であれば渡せます。
     * @returns Suffix Array。すなわち、「文字列sの接尾辞を辞書順に並べたときの、各接尾辞の開始位置」をまとめた配列。
     */
    static getSuffixArray<T extends string | number>(s: ArrayLike<T>): number[] {
        if (s.length === 0) return [];
        // 数値の配列に変換する
        const transformedArray: number[] = [];
        if (typeof s[0] === "string") {
            // 文字列の場合はUnicode Core Point + 1を取得することで数値の配列に変換する
            for (let i = 0; i < s.length; i++) {
                transformedArray.push((s[i] as string).codePointAt(0) ?? 0 + 1);
            }
        } else {
            // 数値の場合はそのままコピーする
            for (let i = 0; i < s.length; i++) {
                transformedArray.push(s[i] as number);
            }
        }
        // 最小値と最大値を取得する
        const minValue = transformedArray.reduce((a, c) => Math.min(a, c), Infinity);
        const maxValue = transformedArray.reduce((a, c) => Math.max(a, c), -Infinity);
        let result: number[];
        if (maxValue - minValue <= 255) {
            // 最大値と最小値の差が255以下の場合、座圧せずにminValueが1になるように変換し、番兵0を追加してSA-ISにわたす
            const s2 = transformedArray.map((v) => v - minValue + 1);
            s2.push(0); // 番兵
            result = sa_is(s2);
        } else {
            // 差が255以上ある場合、座圧してから番兵を追加してSA-ISにわたす
            const sortedUniqueValues = [...new Set(transformedArray)].sort((a, b) => a - b);
            const valueToCompressed = new Map<number, number>();
            sortedUniqueValues.forEach((v, i) => {
                valueToCompressed.set(v, i + 1);
            });
            const s2 = transformedArray.map((v) => valueToCompressed.get(v) ?? 0);
            s2.push(0); // 番兵
            result = sa_is(s2);
        }
        // 番兵を削除する
        result.shift();
        // 結果を返す
        return result;
    }

    /**
     * 文字列・数列のLCP Arrayを構築します。
     * LCP Arrayは、Suffix Arrayの隣接する要素が指す接尾辞同士の最長共通接頭辞の長さを格納する配列です。
     * 長さ0の列・Suffix Arrayが渡された場合は、空の配列を返します。
     *
     * 時間計算量: O(N) (Nは文字列・数列の長さ)
     *
     * @example
     * ```ts
     * const s = "abcaba";
     * const sa = StringOperations.getSuffixArray(s); // [5, 3, 0, 4, 1, 2]
     * console.log(StringOperations.getLCPArray(s, sa)); // [1, 2, 0, 1, 0]
     * ```
     *
     * @param s - LCP Arrayを構築する文字列か数列。ArrayLikeでも各要素が文字列か数列であれば渡せます。
     * @param sa - 文字列sのSuffix Array。`getSuffixArray(s)`で取得できます。
     * @returns LCP Array。すなわち、「文字列sの接尾辞を辞書順に並べたときの、隣り合う接尾辞同士の最長共通接頭辞の長さ」をまとめた配列。
     * @throws {Error} - 列sの長さとSuffix Arrayの長さが等しくない場合。
     */
    static getLCPArray<T extends string | number>(s: ArrayLike<T>, sa: number[]): number[] {
        if (s.length !== sa.length) {
            throw new Error("Length of s and sa must be the same.");
        }
        if (s.length === 0) return [];
        const n = s.length;
        // 1. rank配列の構築
        const rank = new Array(n);
        for (let i = 0; i < n; i++) {
            rank[sa[i]] = i;
        }
        // LCP配列の長さは要素数-1になる
        const lcp = new Array(n - 1).fill(0);
        let h = 0;
        // 2. 元の文字列の順番で処理していく
        for (let i = 0; i < n; i++) {
            // 先頭の要素は、比較する「1つ上の要素」がないためスキップ
            if (rank[i] === 0) continue;
            // 3. Suffix Array上で1つ前にある接尾辞の、元の文字列での開始位置
            const j = sa[rank[i] - 1];
            // 4. 前回の共通部分の長さ h の位置から比較をスタート
            while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
            // 5. 計算したLCPの長さを記録
            lcp[rank[i] - 1] = h;
            // 6. 次の接尾辞に進むため、hを1だけ減らす（0未満にはならない）
            if (h > 0) h--;
        }
        return lcp;
    }
}
