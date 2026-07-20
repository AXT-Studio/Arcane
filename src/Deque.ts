// ================================================================
// Exports
// ================================================================

/**
 * 双方向キュー (Deque: Double-Ended Queue) です。
 * 両端に対する要素の追加・削除、添字アクセス(参照・置換)、要素数の取得を 償却O(1) で行うことができます。
 *
 * @template T - Dequeに格納する要素の型
 */
export class Deque<T> {
    /**
     * @private
     * #frontはDequeの先頭側にある要素を**逆順で**保持します。
     */
    #front: T[];
    /**
     * @private
     * #backはDequeの末尾側にある要素を**正順**で保持します。
     */
    #back: T[];

    /**
     * 新しいDequeインスタンスを生成します。
     * 初期値を与えた場合は、その要素を先頭から順にDeque(の末尾)に追加します。
     *
     * 時間計算量: NをinitialValuesの要素数とすると、O(N) (初期値を与えた場合)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3]);
     * console.log(deque.toArray()); // [1, 2, 3]
     * deque.unshift(0);
     * deque.push(4);
     * console.log(deque.toArray()); // [0, 1, 2, 3, 4]
     * ```
     *
     * @param [initialValues] - 初期値の配列
     */
    constructor(initialValues: Iterable<T> = []) {
        this.#front = [];
        this.#back = [...initialValues];
    }
    /**
     * @private
     * #frontから#backに要素を移動します。 (バランス処理, プライベートメソッド)
     */
    #balance_FrontToBack(): void {
        // #frontにある要素を逆順にして#backに追加する
        while (this.#front.length > 0) {
            this.#back.push(this.#front.pop() as T);
        }
    }
    /**
     * @private
     * #backから#frontに要素を移動します。 (バランス処理, プライベートメソッド)
     */
    #balance_BackToFront(): void {
        // #backにある要素を逆順にして#frontに追加する
        while (this.#back.length > 0) {
            this.#front.push(this.#back.pop() as T);
        }
    }
    /**
     * Dequeの先頭に値を挿入します。
     *
     * 時間計算量: NをDequeの要素数として、償却O(1)・最悪O(N)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>();
     * deque.unshift(3);
     * deque.unshift(2);
     * deque.unshift(1);
     * console.log(deque.toArray()); // [1, 2, 3]
     * deque.push(4);
     * deque.push(5);
     * console.log(deque.toArray()); // [1, 2, 3, 4, 5]
     * ```
     *
     * @param value - 挿入する値
     */
    unshift(value: T): void {
        // 先頭に値を追加する場合は、#frontにpushするだけでOK (逆順なのでpush)
        this.#front.push(value);
    }
    /**
     * Dequeの末尾に値を挿入します。
     *
     * 時間計算量: NをDequeの要素数として、償却O(1)・最悪O(N)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>();
     * deque.unshift(3);
     * deque.unshift(2);
     * deque.unshift(1);
     * console.log(deque.toArray()); // [1, 2, 3]
     * deque.push(4);
     * deque.push(5);
     * console.log(deque.toArray()); // [1, 2, 3, 4, 5]
     * ```
     *
     * @param value - 挿入する値
     */
    push(value: T): void {
        // 末尾に値を追加する場合は、#backにpushするだけでOK
        this.#back.push(value);
    }
    /**
     * Dequeの先頭の値を削除して返します。
     * 参照のみしたい場合は、`first()`を使用してください。
     * Dequeが空の場合は`undefined`を返します。
     *
     * 時間計算量: NをDequeの要素数として、償却O(1)・最悪O(N)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3, 4, 5]);
     * console.log(deque.toArray()); // [1, 2, 3, 4, 5]
     * console.log(deque.shift()); // 1
     * console.log(deque.toArray()); // [2, 3, 4, 5]
     * console.log(deque.pop()); // 5
     * console.log(deque.toArray()); // [2, 3, 4]
     * ```
     *
     * @returns Dequeの先頭の値 またはDequeが空の場合は`undefined`
     */
    shift(): T | undefined {
        // #frontが空なら、#backから#frontに要素を移動する
        if (this.#front.length === 0) {
            this.#balance_BackToFront();
        }
        // #frontから値をpopして返す (逆順なのでpop)
        return this.#front.pop();
    }
    /**
     * Dequeの末尾の値を削除して返します。
     * 参照のみしたい場合は、`last()`を使用してください。
     * Dequeが空の場合は`undefined`を返します。
     *
     * 時間計算量: NをDequeの要素数として、償却O(1)・最悪O(N)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3, 4, 5]);
     * console.log(deque.toArray()); // [1, 2, 3, 4, 5]
     * console.log(deque.shift()); // 1
     * console.log(deque.toArray()); // [2, 3, 4, 5]
     * console.log(deque.pop()); // 5
     * console.log(deque.toArray()); // [2, 3, 4]
     * ```
     *
     * @returns Dequeの末尾の値 またはDequeが空の場合は`undefined`
     */
    pop(): T | undefined {
        // #backが空なら、#frontから#backに要素を移動する
        if (this.#back.length === 0) {
            this.#balance_FrontToBack();
        }
        // #backから値をpopして返す
        return this.#back.pop();
    }
    /**
     * Dequeの先頭の値を参照します。
     * 参照だけでなく削除も行いたい場合は、`shift()`を使用してください。
     * Dequeが空の場合は`undefined`を返します。
     *
     * 時間計算量: NをDequeの要素数として、償却O(1)・最悪O(N)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3]);
     * console.log(deque.first()); // 1
     * console.log(deque.last()); // 3
     * console.log(deque.toArray()); // [1, 2, 3]
     * ```
     *
     * @returns Dequeの先頭の値 またはDequeが空の場合は`undefined`
     */
    first(): T | undefined {
        // #frontが空なら、#back[0]を返す
        if (this.#front.length === 0) {
            return this.#back[0];
        }
        // #frontの最後の値を返す (逆順なので最後が先頭)
        return this.#front[this.#front.length - 1];
    }
    /**
     * Dequeの末尾の値を参照します。
     * 参照だけでなく削除も行いたい場合は、`pop()`を使用してください。
     * Dequeが空の場合は`undefined`を返します。
     *
     * 時間計算量: NをDequeの要素数として、償却O(1)・最悪O(N)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3]);
     * console.log(deque.first()); // 1
     * console.log(deque.last()); // 3
     * console.log(deque.toArray()); // [1, 2, 3]
     * ```
     *
     * @returns Dequeの末尾の値 またはDequeが空の場合は`undefined`
     */
    last(): T | undefined {
        // #backが空なら、#front[0]を返す
        if (this.#back.length === 0) {
            return this.#front[0];
        }
        // #backの最後の値を返す
        return this.#back[this.#back.length - 1];
    }
    /**
     * Dequeの先頭から`i`番目の値を取得します。(`i`は0-indexed)
     * ただし、`i`が0未満、あるいはDeque全体の長さ以上であった場合、`undefined`を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3]);
     * console.log(deque.get(0)); // 1
     * console.log(deque.get(1)); // 2
     * console.log(deque.get(2)); // 3
     * console.log(deque.get(3)); // undefined
     * console.log(deque.get(-1)); // undefined
     * ```
     *
     * @param i - 取得する要素のインデックス (0-indexed)
     * @returns Dequeの先頭から`i`番目の値 または`i`が0未満、あるいはDeque全体の長さ以上の場合は`undefined`
     */
    get(i: number): T | undefined {
        if (i < 0 || i >= this.size) {
            return undefined;
        }
        if (i < this.#front.length) {
            return this.#front[this.#front.length - 1 - i] as T;
        }
        return this.#back[i - this.#front.length] as T;
    }
    /**
     * Dequeの`i`番目の要素を`value`に置換します。(`i`は0-indexed)
     * ただし、`i`が0未満、あるいはDeque全体の長さ以上であった場合、RangeErrorをthrowします。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3]);
     * deque.set(0, 4);
     * console.log(deque.toArray()); // [4, 2, 3]
     * deque.set(1, 5);
     * console.log(deque.toArray()); // [4, 5, 3]
     * deque.set(2, 6);
     * console.log(deque.toArray()); // [4, 5, 6]
     * deque.set(3, 7); // RangeError: Index out of range
     * ```
     *
     * @throws {RangeError} - `i`が0未満、あるいはDeque全体の長さ以上の場合
     *
     * @param i - 置換する要素のインデックス (0-indexed)
     * @param value - 新しい値
     */
    set(i: number, value: T): void {
        if (i < 0 || i >= this.size) {
            throw new RangeError("Index out of range");
        }
        if (i < this.#front.length) {
            this.#front[this.#front.length - 1 - i] = value as T;
        } else {
            this.#back[i - this.#front.length] = value as T;
        }
    }
    /**
     * Dequeが空かどうかを判定します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>();
     * console.log(deque.isEmpty()); // true
     * deque.push(1);
     * console.log(deque.isEmpty()); // false
     * deque.pop();
     * console.log(deque.isEmpty()); // true
     * ```
     *
     * @returns Dequeが空の場合は`true`、そうでない場合は`false`
     */
    isEmpty(): boolean {
        // #frontと#backの両方が空ならtrue
        return this.#front.length === 0 && this.#back.length === 0;
    }
    /**
     * Dequeの要素を配列として返します。
     *
     * 時間計算量: O(N) (NはDequeの要素数)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3]);
     * console.log(deque.toArray()); // [1, 2, 3]
     * deque.unshift(0);
     * deque.push(4);
     * console.log(deque.toArray()); // [0, 1, 2, 3, 4]
     * ```
     *
     * @returns Dequeの要素を配列として返します。
     */
    toArray(): T[] {
        // #frontを逆順にして#backと結合した配列を返す
        return [...this.#front].reverse().concat(this.#back);
    }
    /**
     * Dequeの要素数を返します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const deque = new Deque<number>([1, 2, 3]);
     * console.log(deque.size); // 3
     * deque.unshift(0);
     * deque.push(4);
     * console.log(deque.size); // 5
     * ```
     *
     * @returns Dequeの要素数
     */
    get size(): number {
        // #frontと#backの長さを合計して返す
        return this.#front.length + this.#back.length;
    }
}
