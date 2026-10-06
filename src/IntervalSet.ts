// ================================================================
// Imports
// ================================================================

import { Treap } from "./Treap";

// ================================================================
// Exports
// ================================================================

/**
 * 俗に「区間をSetで管理するやつ」と呼ばれる、半開区間を重複のないよう管理するデータ構造です。
 * 原則として区間の端点が(安全な)整数となるような区間を管理することを想定しています。
 * いくつかのメソッドは区間の端点が安全な整数でない場合でも動作しますが、動作の保証はされません。
 *
 * @since 1.8.0
 */
export class IntervalSet {
    /** 現在の区間を保持する平衡二分探索木。[key, value)の形で半開区間を表し、重複・隣接のないよう管理される。 */
    #intervals: Treap<number, number>;

    /**
     * 新しいIntervalSetインスタンスを作成します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const intervalSet = new IntervalSet();
     * ```
     */
    constructor() {
        this.#intervals = new Treap((a, b) => a - b);
    }

    /**
     * @private key(左端)がx以下である最も右の区間を取得します(なければundefined)
     */
    #floor(x: number): { key: number; value: number } | undefined {
        const next = this.#intervals.upperBound(x);
        const index = (next?.index ?? this.#intervals.size) - 1;
        return index >= 0 ? this.#intervals.kthElement(index) : undefined;
    }

    /**
     * 区間[l, r)を管理対象に追加します。
     * すでに追加されている区間と重複・隣接する場合は、それらと結合する形で管理されます。
     *
     * 時間計算量: 期待 O((k+1) log(m+1)) (kは統合のために取り除かれる区間数、mは現在管理対象の区間数)
     * ただし、空の状態からq回の更新(insert or erase)を行う場合、1回あたりは償却期待 O(log(q+1))。
     *
     * @example
     * ```ts
     * const intervalSet = new IntervalSet();
     * intervalSet.insert(0, 3); // [0, 3)を追加
     * intervalSet.insert(6, 9); // [6, 9)を追加
     * intervalSet.insert(2, 6); // [2, 6)を追加 (前後とマージされて[0, 9)として管理される)
     * ```
     *
     * @param l - 追加する区間の左端(l自身を含む, 整数推奨)
     * @param r - 追加する区間の右端(r自身を含まない, 整数推奨)
     * @throws {RangeError} - l > rのとき
     */
    insert(l: number, r: number): void {
        if (l > r) throw new RangeError("l must not exceed r");
        if (l === r) return;
        let insertionL = l;
        let insertionR = r;
        // #floor(l)が存在して右端がl以上なら吸収する必要がある
        const floorL = this.#floor(l);
        if (floorL != null && l <= floorL.value) {
            insertionL = floorL.key;
            if (insertionR < floorL.value) insertionR = floorL.value;
            this.#intervals.delete(floorL.key);
        }
        // 左端がl以上である一番左の区間を取得し、それが[l, r)と重複・隣接関係なら消すことを繰り返す
        const scanIndex = this.#intervals.lowerBound(l)?.index ?? this.#intervals.size;
        while (scanIndex < this.#intervals.size) {
            const current = this.#intervals.kthElement(scanIndex)!;
            if (insertionR < current.key) break;
            if (insertionR < current.value) insertionR = current.value;
            this.#intervals.delete(current.key);
        }
        // [insertionL, insertionR)を足す
        this.#intervals.set(insertionL, insertionR);
    }

    /**
     * 区間[l, r)を管理対象から削除します。
     * すでに追加されている区間は適切に分割されることがあります。
     *
     * 時間計算量: 期待 O((k+1) log(m+1)) (kは削除・分割のために取り除かれる区間数、mは現在管理対象の区間数)
     * ただし、空の状態からq回の更新(insert or erase)を行う場合、1回あたりは償却期待 O(log(q+1))。
     *
     * @example
     * ```ts
     * const intervalSet = new IntervalSet();
     * intervalSet.insert(0, 9); // [0, 9)を追加
     * intervalSet.erase(3, 6); // [3, 6)を削除 (-> [0, 3)と[6, 9)が管理対象として残る)
     * ```
     *
     * @param l - 削除する区間の左端(l自身を含む, 整数推奨)
     * @param r - 削除する区間の右端(r自身を含まない, 整数推奨)
     * @throws {RangeError} - l > rのとき
     */
    erase(l: number, r: number): void {
        if (l > r) throw new RangeError("l must not exceed r");
        if (l === r) return;
        // 削除(or分割)対象となる最初の区間を持ってくる
        let current = this.#floor(l);
        if (current == null || current.value <= l) current = this.#intervals.lowerBound(l);
        // 次の区間を持ってきながら削除と分割部分の追加を繰り返す
        while (current != null && current.key < r) {
            this.#intervals.delete(current.key);
            if (current.key < l) this.#intervals.set(current.key, l);
            if (r < current.value) {
                this.#intervals.set(r, current.value);
                break;
            }
            current = this.#intervals.lowerBound(l);
        }
    }

    /**
     * 現在管理対象の区間の中にxが含まれているかを返します。
     *
     * 時間計算量: 期待 O(log (m+1)) (mは現在管理対象の区間数)
     *
     * @example
     * ```ts
     * const intervalSet = new IntervalSet();
     * intervalSet.insert(2, 5); // [2, 5)を追加
     * console.log(intervalSet.contains(3)); // => true
     * console.log(intervalSet.contains(5)); // => false (半開区間なので)
     * ```
     *
     * @param x - 現在管理されている区間に含まれているかを確認したい値(整数推奨)
     */
    contains(x: number): boolean {
        const floor = this.#floor(x);
        return floor != null && x < floor.value;
    }

    /**
     * xが含まれる現在管理対象の連続した区間を返します。
     * (自分が含まれる区間いっぱいに拡げた結果を返すと考えるとよいです。)
     * xが現在管理対象の区間に含まれない場合は[x, x)を返します。
     *
     * 時間計算量: 期待 O(log (m+1)) (mは現在管理対象の区間数)
     *
     * @example
     * ```ts
     * const intervalSet = new IntervalSet();
     * intervalSet.insert(2, 5); // [2, 5)を追加
     * console.log(intervalSet.expand(3)); // => [2, 5] (半開区間[2, 5)をこの形で返します)
     * console.log(intervalSet.expand(6)); // => [6, 6]
     * ```
     *
     * @param x - 自身を含む現在管理されている連続した区間を得たい値(整数推奨)
     */
    expand(x: number): [l: number, r: number] {
        const floor = this.#floor(x);
        if (floor != null && x < floor.value) {
            return [floor.key, floor.value];
        } else {
            return [x, x];
        }
    }

    /**
     * x以上で現在の管理対象区間に含まれない最小の整数を返します。
     * xが現在管理対象の区間に含まれない場合は`x`を返します。
     * (区間の両端として非整数を用いた場合、このメソッドは正しく動作しません。)
     *
     * 時間計算量: 期待 O(log (m+1)) (mは現在管理対象の区間数)
     *
     * @example
     * ```ts
     * const intervalSet = new IntervalSet();
     * intervalSet.insert(2, 5); // [2, 5)を追加
     * console.log(intervalSet.mex(3)); // => 5
     * console.log(intervalSet.mex(6)); // => 6
     * ```
     *
     * @param x - 自身以上で現在管理されている区間に含まれない最小の整数を得たい値(整数必須)
     * @returns - x以上で現在管理されている区間に含まれない最小の整数
     */
    mex(x: number): number {
        return this.expand(x)[1];
    }

    /**
     * 管理対象となっている区間の数を取得します。
     * 別々に追加された区間でも結合されることがあり、結合された区間は1つとカウントされることに注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const intervalSet = new IntervalSet();
     * console.log(intervalSet.size); // => 0
     * intervalSet.insert(0, 3); // [0, 3)を追加
     * intervalSet.insert(6, 9); // [6, 9)を追加
     * console.log(intervalSet.size); // => 2
     * intervalSet.insert(2, 6); // [2, 6)を追加 (前後とマージされて[0, 9)として管理される)
     * console.log(intervalSet.size); // => 1
     * ```
     */
    get size(): number {
        return this.#intervals.size;
    }

    /**
     * 現在の管理対象である区間を左から順に列挙するイテレーターを返します。
     * このイテレーターは、管理対象の区間を`[l, r]`([l, r)を表す)の形でyieldします。
     * ただし、列挙の途中で管理区間の更新を行った場合の動作は未定義です。
     *
     * 時間計算量: 全要素の反復がO(m) (mは管理対象となっている区間数)
     *
     * @example for...of ループを用いた反復処理
     * このメソッドにより、`for...of`ループを使用して区間で反復処理を行うことができます。
     * ```ts
     * const intervalSet = new IntervalSet();
     * intervalSet.insert(0, 9); // [0, 9)を追加
     * intervalSet.erase(3, 6); // [3, 6)を削除 (-> [0, 3)と[6, 9)が管理対象として残る)
     * for (const [l, r] of intervalSet) console.log(`[${l}, ${r})`);
     * // Expected Log Outputs:
     * // "[0, 3)"
     * // "[6, 9)"
     * ```
     *
     * @example イテレーターを手動で手繰る
     * 返されたイテレーターオブジェクトの`next()`メソッドを手動で呼び出すことで、反復処理の制御を細かく行うこともできます。
     * ```ts
     * const intervalSet = new IntervalSet();
     * intervalSet.insert(0, 9); // [0, 9)を追加
     * intervalSet.erase(3, 6); // [3, 6)を削除 (-> [0, 3)と[6, 9)が管理対象として残る)
     * const iterator = intervalSet[Symbol.iterator]();
     * console.log(iterator.next().value); // => [0, 3]
     * console.log(iterator.next().value); // => [6, 9]
     * console.log(iterator.next().done);  // Expected Log Output : true
     * console.log(iterator.next().value); // Expected Log Output : undefined
     * ```
     *
     * @yields 管理対象の区間を左から順に`[l, r]`([l, r)を表す)の形でyieldします。
     */
    *[Symbol.iterator](): Generator<readonly [l: number, r: number], void, undefined> {
        for (const { key, value } of this.#intervals) {
            yield [key, value];
        }
    }
}
