// ================================================================
// Exports
// ================================================================

/**
 * 遅延評価セグメント木 (Lazy Segment Tree) です。
 * 長さNの配列に対して、区間全要素への作用と区間の総モノイド積の計算をそれぞれO(log N)で行えます。
 * ただし、以下を定義できることが求められます。
 * - `S`: 配列の要素の型
 * - 区間総積について、以下が定義できること
 *     - `op`: 2つのSのモノイド積を求める関数
 *         - `op`は結合律、すなわち`op(a, op(b, c)) === op(op(a, b), c)`を満たす必要があります。
 *     - `e`: opの単位元 (`S`型の値)
 *         - `e`は単位元の性質、すなわち任意の`s: S`に対して`op(s, e) === op(e, s) === s`を満たす必要があります。
 * - 区間作用について、以下が定義できること
 *     - `F`: 作用を行う関数がパラメーターとして求める情報の型
 *     - `mapping`: 要素(`S`)と作用のパラメーター(`F`)を受け取り、作用適用後の要素(`S`)を返す関数
 *     - `id`: F型 mappingに渡すと要素を変更しないような作用のパラメーター
 *         - 任意の`s: S`に対して`mapping(s, id) === s`を満たす必要があります。
 *     - `composition`: 2つの作用のパラメーター(F)を1つのFに合成する関数
 *         - `(newF: F, oldF: F) => F`を指定します。引数の順序(あとに適用する作用が先に記述される)に注意してください。
 *         - `composition`は結合律、すなわち任意の`s: S`, `f1: F`, `f2: F`に対して`mapping(mapping(s, f1), f2) === mapping(s, composition(f2, f1))`を満たす必要があります。
 *
 * 以下の点に注意してください。
 * - 配列は0-indexedで管理されます。つまり、最初の要素のindexは`0`、最後の要素のindexは`size - 1`になります。
 * - `S`や`F`がPrimitiveでない場合に発生するオーバーヘッドが、競技プログラミングにおいて実行時間制限を超える原因になることがあります。使用時には十分注意してください。
 *
 * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
 * ```ts
 * const lazySegTree = new LazySegmentTree(
 *     -Infinity, // e: 区間の最大値の単位元は負の無限大
 *     (a, b) => Math.max(a, b), // op: 区間の最大値を求める関数
 *     (s, f) => Math.max(s, f), // mapping: 作用は「sをfで更新する(ただしfがsより大きい場合のみ)」
 *     -Infinity, // id: 作用の単位元は負の無限大 (これをmappingに渡してもsは更新されない)
 *     (newF, oldF) => Math.max(newF, oldF), // composition: 作用の合成は「新しい作用と古い作用のうち大きい方」
 *     100, // size: セグメント木のサイズ
 * );
 * ```
 *
 * @example 作用: 区間の要素に値を加算 / 区間総積: 区間の最小値
 * ```ts
 * const lazySegTree = new LazySegmentTree<number, number>(
 *  Infinity,
 *     (a, b) => Math.min(a, b),
 *     (s, f) => s + f,
 *     0,
 *     (newF, oldF) => newF + oldF,
 *     100,
 * );
 * ```
 *
 * @example 作用: 区間の要素に値を加算 / 区間総積: 区間の最大値
 * ```ts
 * const lazySegTree = new LazySegmentTree<number, number>(
 *     -Infinity,
 *     (a, b) => Math.max(a, b),
 *     (s, f) => s + f,
 *     0,
 *     (newF, oldF) => newF + oldF,
 *     100,
 * );
 * ```
 *
 * @example 作用: 区間の要素を値で更新(上書き) / 区間総積: 区間の最小値
 * ```ts
 * const lazySegTree = new LazySegmentTree<number, number | null>(
 *     Infinity,
 *     (a, b) => Math.min(a, b),
 *     (s, f) => f === null ? s : f,
 *     null,
 *     (newF, oldF) => newF === null ? oldF : newF,
 *     100,
 * );
 * ```
 *
 * @example 作用: 区間の要素を値で更新(上書き) / 区間総積: 区間の最大値
 * ```ts
 * const lazySegTree = new LazySegmentTree<number, number | null>(
 *     -Infinity,
 *     (a, b) => Math.max(a, b),
 *     (s, f) => f === null ? s : f,
 *     null,
 *     (newF, oldF) => newF === null ? oldF : newF,
 *     100,
 * );
 * ```
 *
 * @example 作用: 区間の要素に値を加算 / 区間総積: 区間の合計値
 * ```ts
 * const lazySegTree = new LazySegmentTree<{ value: number; size: number }, number>(
 *     { value: 0, size: 0 },
 *     (a, b) => ({ value: a.value + b.value, size: a.size + b.size }),
 *     (s, f) => ({ value: s.value + f * s.size, size: s.size }),
 *     0,
 *     (newF, oldF) => newF + oldF,
 *     100,
 *     // 初期値を指定する場合は、{ value: 初期値, size: 1 } の配列にする必要があります
 * );
 * ```
 *
 * @example 作用: 区間の要素を値で更新(上書き) / 区間総積: 区間の合計値
 * ```ts
 * const lazySegTree = new LazySegmentTree<{ value: number; size: number }, number | null>(
 *     { value: 0, size: 0 },
 *     (a, b) => ({ value: a.value + b.value, size: a.size + b.size }),
 *     (s, f) => f === null ? s : { value: f * s.size, size: s.size },
 *     null,
 *     (newF, oldF) => newF === null ? oldF : newF,
 *     100,
 *     // 初期値を指定する場合は、{ value: 初期値, size: 1 } の配列にする必要があります
 * );
 * ```
 *
 * @example 作用: 区間アフィン変換(区間各要素にa掛けてb足す) / 区間総積: 区間の合計値
 * ```ts
 * const lazySegTree = new LazySegmentTree<{ value: number; size: number }, { a: number; b: number }>(
 *     { value: 0, size: 0 },
 *     (x, y) => ({ value: x.value + y.value, size: x.size + y.size }),
 *     (s, f) => ({ value: f.a * s.value + f.b * s.size, size: s.size }),
 *     { a: 1, b: 0 },
 *     (newF, oldF) => ({ a: newF.a * oldF.a, b: newF.a * oldF.b + newF.b }),
 *     100,
 *     // 初期値を指定する場合は、{ value: 初期値, size: 1 } の配列にする必要があります
 * );
 * ```
 *
 * @template S - 配列の要素の型
 * @template F - 作用のパラメーターの型
 */
export class LazySegmentTree<S, F> {
    /** 単位元 */
    #e: S;
    /** モノイド演算を表す関数 */
    #op: (a: S, b: S) => S;
    /** 作用を表す関数 */
    #mapping: (s: S, f: F) => S;
    /** 作用の単位元 */
    #id: F;
    /** 作用の合成を表す関数 */
    #composition: (newF: F, oldF: F) => F;
    /** セグメント木の高さ */
    #log: number;
    /** セグメント木のサイズ */
    #size: number;
    /** セグメント木のコンストラクタに渡されたサイズ */
    #originalSize: number;
    /** セグメント木の内部配列 */
    #data: S[];
    /** 遅延配列 */
    #lazy: F[];

    /**
     * 新しいLazySegmentTreeインスタンスを生成します。
     * 初期値として配列を与えることができます。初期値の長さが`size`に満たない場合、残りの要素はすべて`e`で初期化されます。
     *
     * 時間計算量: O(N) (Nはセグメント木のサイズ`size`)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(
     *     -Infinity, // e: 区間の最大値の単位元は負の無限大
     *     (a, b) => Math.max(a, b), // op: 区間の最大値を求める関数
     *     (s, f) => Math.max(s, f), // mapping: 作用は「sをfで更新する(ただしfがsより大きい場合のみ)」
     *     -Infinity, // id: 作用の単位元は負の無限大 (これをmappingに渡してもsは更新されない)
     *     (newF, oldF) => Math.max(newF, oldF), // composition: 作用の合成は「新しい作用と古い作用のうち大きい方」
     *     100, // size: セグメント木のサイズ
     * );
     * ```
     *
     * @param e - [区間総積] モノイド演算の単位元
     * @param op - [区間総積] モノイド演算を表す関数
     * @param mapping - [区間作用] 作用を行う関数
     * @param id - [区間作用] 作用において「何もしない」ことを表す単位元
     * @param composition - [区間作用] 2つの作用を1つにまとめる関数
     * @param size - セグメント木のサイズ
     * @param [initialValues] - 初期値の配列(未指定時およびsizeに満たない分はeで埋められます)
     */
    constructor(
        e: S,
        op: (a: S, b: S) => S,
        mapping: (s: S, f: F) => S,
        id: F,
        composition: (newF: F, oldF: F) => F,
        size: number,
        initialValues?: S[],
    ) {
        // e, op, mapping, id, compositionはそのまま保存
        this.#e = e;
        this.#op = op;
        this.#mapping = mapping;
        this.#id = id;
        this.#composition = composition;
        this.#originalSize = size;
        // sizeは与えられたsize以上の最小の2冪に設定
        this.#log = Math.ceil(Math.log2(size));
        this.#size = 2 ** this.#log;
        // lazyを初期化
        this.#lazy = Array.from({ length: this.#size * 2 }, () => id);
        // data配列を初期化
        this.#data = Array.from({ length: this.#size * 2 }, () => e);
        // initialValuesが与えられた場合、data配列の後半にセット
        if (initialValues) {
            for (let i = 0; i < initialValues.length; i++) {
                this.#data[this.#size + i] = initialValues[i];
            }
            // 前半を構築 (initialValuesが与えられなかった場合はeのままなので飛ばされる)
            for (let i = this.#size - 1; i > 0; i--) {
                this.#data[i] = this.#op(this.#data[i * 2], this.#data[i * 2 + 1]);
            }
        }
    }

    /**
     * @private
     * `tree`の`index`番目の要素に、操作`f`を作用させます。
     * @param index - 要素のインデックス (0-indexed)
     * @param f - 作用
     */
    #all_apply(index: number, f: F): void {
        this.#data[index] = this.#mapping(this.#data[index], f);
        if (index < this.#size) {
            this.#lazy[index] = this.#composition(f, this.#lazy[index]);
        }
    }

    /**
     * @private
     * lazyの`index`番目に格納されている遅延タグを子ノードに伝播させ、lazy[index]を初期化します。
     * @param index - ノードのインデックス (0-indexed)
     */
    #push(index: number): void {
        const l = index * 2;
        const r = index * 2 + 1;
        // lに伝播
        this.#all_apply(l, this.#lazy[index]);
        // rに伝播
        this.#all_apply(r, this.#lazy[index]);
        // lazy[index]を初期化
        this.#lazy[index] = this.#id;
    }

    /**
     * @private
     * treeの`index`番目のノードを、treeの2つの子ノードから計算し更新します。
     * @param index - ノードのインデックス
     */
    #update(index: number): void {
        this.#data[index] = this.#op(this.#data[index * 2], this.#data[index * 2 + 1]);
    }

    /**
     * @private
     * 範囲[l, r)と共通部分を持つが[l, r)に収まっていないノードについて、
     * 遅延タグを葉まで伝播させます。
     * @param l - 区間の左端のindex (0-indexed, 含む)
     * @param r - 区間の右端のindex (0-indexed, 含まない)
     */
    #pushToLeaves(l: number, r: number): void {
        const left = l + this.#size;
        const right = r + this.#size;
        // 木の高さから1までループを回せばよい
        for (let i = this.#log; i > 0; i--) {
            // left側のノードを伝播
            if ((left >> i) << i !== left) {
                const leftNode = left >> i;
                this.#push(leftNode);
            }
            // right側のノードを伝播
            if ((right >> i) << i !== right) {
                const rightNode = (right - 1) >> i;
                this.#push(rightNode);
            }
        }
    }

    /**
     * @private
     * 範囲[l, r)と共通部分を持つが[l, r)に収まっていないノードについて、
     * 変更されたtreeの子ノードの情報をもとに親ノードの値を(根まで)再計算します。
     * @param l - 区間の左端のindex (0-indexed, 含む)
     * @param r - 区間の右端のindex (0-indexed, 含まない)
     */
    #updateFromLeaves(l: number, r: number): void {
        const left = l + this.#size;
        const right = r + this.#size;
        for (let i = 1; i <= this.#log; i++) {
            // left側のノードを更新
            if ((left >> i) << i !== left) {
                const leftNode = left >> i;
                this.#update(leftNode);
            }
            // right側のノードを更新
            if ((right >> i) << i !== right) {
                const rightNode = (right - 1) >> i;
                this.#update(rightNode);
            }
        }
    }

    /**
     * 配列の`l`番目から`r - 1`番目までのすべての要素に、`f`で表される作用を作用させます。
     *
     * 時間計算量: O(log N) (Nはセグメント木のサイズ)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * lazySegTree.apply(10, 20, 15); //10番目から19番目までの要素を、現在の値と15を比較して大きい方に更新する
     * ```
     *
     * @param l - 区間の左端のindex (0-indexed, 含む)
     * @param r - 区間の右端のindex (0-indexed, 含まない)
     * @param f - 作用
     */
    apply(l: number, r: number, f: F): void {
        // lとrに対応する葉ノードの位置を求める
        let left = l + this.#size;
        let right = r + this.#size;
        // 1. 前処理: 範囲に関係する部分の遅延をすべて出し切る
        this.#pushToLeaves(l, r);
        // 2. 区間[l, r)に作用fを作用させる
        while (left < right) {
            if (left % 2 === 1) {
                this.#all_apply(left, f);
                left++;
            }
            if (right % 2 === 1) {
                right--;
                this.#all_apply(right, f);
            }
            left = Math.floor(left / 2);
            right = Math.floor(right / 2);
        }
        // 3. 後処理: 変更があった部分の親ノードを再計算する
        this.#updateFromLeaves(l, r);
    }

    /**
     * 配列の`l`番目から`r - 1`番目までのすべての要素のモノイド積を計算して返します。
     *
     * 時間計算量: O(log N) (Nはセグメント木のサイズ)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * lazySegTree.apply(10, 20, 15); //10番目から19番目までの要素を、現在の値と15を比較して大きい方に更新する
     * console.log(lazySegTree.query(5, 15)); // => 15 (5〜9番目に-Infinity、10〜14番目に15が入っているので、最大値は15)
     * console.log(lazySegTree.query(25, 30)); // => -Infinity (25〜29番目は初期値のままなので、最大値は-Infinity)
     * ```
     *
     * @param l - 区間の左端のindex (0-indexed, 含む)
     * @param r - 区間の右端のindex (0-indexed, 含まない)
     * @returns 指定された区間の総モノイド積
     */
    query(l: number, r: number): S {
        // lとrに対応する葉ノードの位置を求める
        let left = l + this.#size;
        let right = r + this.#size;
        // 1. 前処理: 遅延させていたタグをすべて計算する
        this.#pushToLeaves(l, r);
        // 2. 区間[l, r)のモノイド積を計算する
        let res_left = this.#e;
        let res_right = this.#e;
        while (left < right) {
            if (left % 2 === 1) {
                res_left = this.#op(res_left, this.#data[left]);
                left++;
            }
            if (right % 2 === 1) {
                right--;
                res_right = this.#op(this.#data[right], res_right);
            }
            left = Math.floor(left / 2);
            right = Math.floor(right / 2);
        }
        // 3. 結果を返す
        return this.#op(res_left, res_right);
    }

    /**
     * 半開区間`[l, r)`のモノイド積で、`l`を固定したときに条件`fn`を満たす最大の`r`を返します。
     *
     * 時間計算量: O(log N) (Nはセグメント木のサイズ)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * lazySegTree.apply(10, 20, 15); // 区間[10, 20)の要素に対して、値15を適用
     * lazySegTree.apply(15, 25, 30); // 区間[15, 25)の要素に対して、値30を適用
     * // l = 5から始めて、区間総積が20未満である最大のrを探索
     * const maxRight = lazySegTree.maxRight(5, (x) => x < 20);
     * console.log(maxRight); // => 15 (区間[5, 15)の最大値は(15で)20未満であるが、区間[5, 16)の最大値は(30で)20以上になるため)
     * ```
     *
     * @param l - 区間の左端のindex (0-indexed, 含む)
     * @param fn - 条件を表す関数
     * @returns 条件を満たす最大のr (l以上size以下。sizeを返した場合、`r`を`size`まで広げても条件を満たすことを意味します)
     * @throws `fn(e)`が`true`を返さない場合、および`l`が範囲外の場合に例外をスローします。
     */
    maxRight(l: number, fn: (s: S) => boolean): number {
        // fn(e)がtrueであることを確認
        if (!fn(this.#e)) {
            throw new Error("fn(e) must be true");
        }
        // lの範囲チェック
        if (l < 0 || l > this.#originalSize) {
            throw new Error("l must be in range [0, size]");
        }
        // lがsizeと等しい場合、sizeを返す
        if (l === this.#originalSize) {
            return this.#originalSize;
        }
        // lに対応する葉ノードの位置を求める
        const left = l + this.#size;
        // 前処理: l側の遅延させていたタグは先にすべて計算しておく
        this.#pushToLeaves(l, l + 1);
        // モノイド積の初期値
        let product = this.#e;
        // maxRightの探索
        let pos = left;
        do {
            // posが右の子ノードである場合、親ノードに移動
            while (pos % 2 === 0) pos = Math.floor(pos / 2);
            // 今のブロック(tree[pos])を足すと条件を満たさなくなるかチェックする
            if (!fn(this.#op(product, this.#data[pos]))) {
                // 満たさない -> 境界はこのブロックの範囲 -> 葉まで降りていく
                while (pos < this.#size) {
                    // 遅延タグを伝播させる
                    this.#push(pos);
                    // 左の子に降りる
                    pos = pos * 2;
                    // 今のブロックを足しても条件を満たすなら、足して右の子へ
                    if (fn(this.#op(product, this.#data[pos]))) {
                        product = this.#op(product, this.#data[pos]);
                        pos++;
                    }
                }
                // 葉ノードに到達したら、そのindexを結果として返す
                return pos - this.#size;
            }
            // 今のブロックを足しても条件を満たすなら、足して次へ
            product = this.#op(product, this.#data[pos]);
            pos++;
        } while ((pos & -pos) !== pos); // posが2冪になるまで繰り返す
        // すべて足しても条件を満たす場合、sizeを返す
        return this.#originalSize;
    }

    /**
     * 半開区間`[0, r)`のモノイド積で、`r`を固定したときに条件`fn`を満たす最小の`l`を返します。
     *
     * 時間計算量: O(log N) (Nはセグメント木のサイズ)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * lazySegTree.apply(10, 20, 15); // 区間[10, 20)の要素に対して、値15を適用
     * lazySegTree.apply(15, 25, 30); // 区間[15, 25)の要素に対して、値30を適用
     * // r = 30から始めて、区間総積が20未満である最小のlを探索
     * const minLeft = lazySegTree.minLeft(30, (x) => x < 20);
     * console.log(minLeft); // => 25 (区間[25, 30)の最大値は20未満だが、区間[24, 30)の最大値は30以上になるため)
     * ```
     *
     * @param r - 区間の右端のindex (0-indexed, 含まない)
     * @param fn - 条件を表す関数
     * @returns 条件を満たす最小のl (0以上r以下。0を返した場合、`l`を0まで狭めても条件を満たすことを意味します)
     * @throws `fn(e)`が`true`を返さない場合、および`r`が範囲外の場合に例外をスローします。
     */
    minLeft(r: number, fn: (s: S) => boolean): number {
        // fn(e)がtrueであることを確認
        if (!fn(this.#e)) {
            throw new Error("fn(e) must be true");
        }
        // rの範囲チェック
        if (r < 0 || r > this.#originalSize) {
            throw new Error("r must be in range [0, size]");
        }
        // rが0と等しい場合、0を返す
        if (r === 0) {
            return 0;
        }
        // rに対応する葉ノードの位置を求める
        const right = r + this.#size;
        // 前処理: r側の遅延させていたタグは先にすべて計算しておく
        this.#pushToLeaves(r - 1, r);
        // モノイド積の初期値
        let product = this.#e;
        // minLeftの探索
        let pos = right;
        do {
            // 半開区間なので、とりあえず一個左に移動
            pos--;
            // 登れるだけ親に登る
            while (pos > 1 && pos % 2 === 1) {
                pos = Math.floor(pos / 2);
            }
            // 今のブロック(tree[pos])を足すと条件を満たさなくなるかチェックする
            if (!fn(this.#op(this.#data[pos], product))) {
                // 満たさない -> 境界はこのブロックの範囲 -> 葉まで降りていく
                while (pos < this.#size) {
                    // 遅延タグを伝播させる
                    this.#push(pos);
                    // 右の子に降りる
                    pos = pos * 2 + 1;
                    // 右の子なら結合しても大丈夫か？をチェック
                    if (fn(this.#op(this.#data[pos], product))) {
                        // 大丈夫なら結合して、左の子へ (さらに左を探る)
                        product = this.#op(this.#data[pos], product);
                        pos--; // 左の子へ
                    }
                }
                // 葉ノードに到達したら、そのindexを結果として返す
                return pos + 1 - this.#size;
            }
            // 今のブロックを足しても条件を満たすなら、足して次へ
            product = this.#op(this.#data[pos], product);
        } while ((pos & -pos) !== pos); // posが2冪になるまで繰り返す
        // すべて足しても条件を満たす場合、0を返す
        return 0;
    }

    /**
     * 配列全体のモノイド積を返します。
     *
     * 時間計算量: O(1)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * lazySegTree.apply(10, 20, 15); // 区間[10, 20)の要素に対して、値15を適用
     * lazySegTree.apply(15, 25, 30); // 区間[15, 25)の要素に対して、値30を適用
     * // 配列全体の区間総積を計算
     * console.log(lazySegTree.queryAll()); // => 30 (全体の最大値は30になるため)
     * ```
     *
     * @returns 配列全体のモノイド積
     */
    queryAll(): S {
        return this.#data[1];
    }

    /**
     * `index`番目の要素に、`f`で表される作用を作用させます。
     * `apply(index, index + 1, f)`のエイリアスです。
     *
     * 時間計算量: O(log N) (Nはセグメント木のサイズ)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * lazySegTree.applyAt(10, 15); // 10番目の要素を、現在の値と15を比較して大きい方に更新する
     * console.log(lazySegTree.get(10)); // => 15 (10番目の要素は15に更新されるため)
     * ```
     *
     * @param index - 要素のインデックス (0-indexed)
     * @param f - 作用
     */
    applyAt(index: number, f: F): void {
        this.apply(index, index + 1, f);
    }

    /**
     * `index`番目の要素を返します。
     * `query(index, index + 1)`のエイリアスです。
     *
     * 時間計算量: O(log N) (Nはセグメント木のサイズ)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * lazySegTree.apply(10, 20, 15); // 10番目から19番目までの要素を、現在の値と15を比較して大きい方に更新する
     * console.log(lazySegTree.get(12)); // => 15 (12番目の要素は15に更新されるため)
     * console.log(lazySegTree.get(5)); // => -Infinity (5番目の要素は初期値のままなので、-Infinity)
     * ```
     *
     * @param index - 要素のインデックス (0-indexed)
     * @returns index番目の要素
     */
    get(index: number): S {
        return this.query(index, index + 1);
    }

    /**
     * `index`番目の要素を`value`に上書きします。
     *
     * 時間計算量: O(log N) (Nはセグメント木のサイズ)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * lazySegTree.applyAt(10, 15); // 10番目の要素を、現在の値と15を比較して大きい方に更新する
     * lazySegTree.set(10, 20); // 10番目の要素を強制的に20に上書きする
     * console.log(lazySegTree.get(10)); // => 20 (10番目の要素は20に上書きされるため)
     * ```
     *
     * @param index - 要素のインデックス (0-indexed)
     * @param value - 新しい値
     */
    set(index: number, value: S): void {
        // indexに対応する葉ノードの位置を求める
        const leaf = index + this.#size;
        // 前処理: 上にある遅延を邪魔にならないように全部落とす
        this.#pushToLeaves(index, index + 1);
        // 値を上書き (遅延タグlazyはここには溜まっていないはずなのでdataだけでOK)
        this.#data[leaf] = value;
        // 後処理: 親を再計算
        this.#updateFromLeaves(index, index + 1);
    }

    /**
     * セグメント木のサイズを返します。
     *
     * 時間計算量: O(1)
     *
     * @example 作用: 作用の値が現在の値を超えるなら更新 / 区間総積: 区間の最大値
     * ```ts
     * const lazySegTree = new LazySegmentTree(-Infinity, (a, b) => Math.max(a, b), (s, f) => Math.max(s, f), -Infinity, (newF, oldF) => Math.max(newF, oldF), 100);
     * console.log(lazySegTree.size); // => 100 (セグメント木のサイズは100のまま)
     * ```
     *
     * @returns セグメント木のサイズ
     */
    get size(): number {
        return this.#originalSize;
    }
}
