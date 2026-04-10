// ================================================================
// Utilities
// ================================================================

/**
 * Treapのノードを表すクラス
 * @template K - キーの型
 * @template V - 値の型
 */
class TreapNode<K, V> {
    /** ノードのキー */
    key: K;
    /** ノードの値 */
    value: V;
    /**  0以上1以下の値で、大きい値のほうが優先度が高いことを表します */
    priority: number;
    /** 自分自身を含むサブツリーの要素数 */
    size: number;
    /** 左の子ノード */
    left: TreapNode<K, V> | null;
    /** 右の子ノード */
    right: TreapNode<K, V> | null;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
        this.priority = Math.random();
        this.left = null;
        this.right = null;
        this.size = 1;
    }
}

// ================================================================
// Exports
// ================================================================

/**
 * 平衡二分探索木の一種であるTreapを実装したクラスです。
 *
 * @template K - キーの型
 * @template V - 値の型
 */
export class Treap<K, V> {
    root: TreapNode<K, V> | null;
    /** キーを比較するための関数。aがbより先なら負、aがbより後なら正、順序が等しいなら0を返す。 */
    #keyCompareFn: (a: K, b: K) => number;

    /**
     * 新しいTreapインスタンスを生成します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * ```
     *
     * @param keyCompareFn - キーを比較するための関数。aがbより先なら負、aがbより後なら正、順序が等しいなら0を返す。
     */
    constructor(keyCompareFn: (a: K, b: K) => number) {
        this.root = null;
        this.#keyCompareFn = keyCompareFn;
    }

    /**
     * @private
     * 2つのTreapをマージして、新しいTreapを返します。
     */
    static #merge<K, V>(
        left: TreapNode<K, V> | null,
        right: TreapNode<K, V> | null,
    ): TreapNode<K, V> | null {
        if (!left) return right;
        if (!right) return left;
        if (left.priority > right.priority) {
            left.right = Treap.#merge(left.right, right);
            left.size = 1 + Treap.#getSize(left.left) + Treap.#getSize(left.right);
            return left;
        } else {
            right.left = Treap.#merge(left, right.left);
            right.size = 1 + Treap.#getSize(right.left) + Treap.#getSize(right.right);
            return right;
        }
    }

    /**
     * @private
     * Treapをkを基準に"keyがk以下の木"と"keyがkより大きい木"に分割します。
     * @param rootNode - 分割対象のTreapの根となるノード
     * @param k - 分割の基準となるキー
     * @param keyCompareFn - キーを比較するための関数。aがbより先なら負、aがbより後なら正、順序が等しいなら0を返す。
     */
    static #split<K, V>(
        rootNode: TreapNode<K, V> | null,
        k: K,
        keyCompareFn: (a: K, b: K) => number,
    ): { left: TreapNode<K, V> | null; right: TreapNode<K, V> | null } {
        if (!rootNode) return { left: null, right: null };
        if (keyCompareFn(rootNode.key, k) <= 0) {
            // 根がk以下 -> rootNodeが左の木 / rootNode.rightを分割して左をrootNode.right、右を右の木に
            const right_split = Treap.#split(rootNode.right, k, keyCompareFn);
            rootNode.right = right_split.left;
            rootNode.size = 1 + Treap.#getSize(rootNode.left) + Treap.#getSize(rootNode.right);
            return { left: rootNode, right: right_split.right };
        } else {
            // 根がkより大きい -> rootNodeが右の木 / rootNode.leftを分割して左を左の木、右をrootNode.leftに
            const left_split = Treap.#split(rootNode.left, k, keyCompareFn);
            rootNode.left = left_split.right;
            rootNode.size = 1 + Treap.#getSize(rootNode.left) + Treap.#getSize(rootNode.right);
            return { left: left_split.left, right: rootNode };
        }
    }

    /**
     * @private
     * Treapをkを基準に"keyがk未満の木"・"keyがkと等しいノード"・"keyがkより大きい木"に分割します。
     * @param rootNode - 分割対象のTreapの根となるノード
     * @param k - 分割の基準となるキー
     * @param keyCompareFn - キーを比較するための関数。aがbより先なら負、aがbより後なら正、順序が等しいなら0を返す。
     */
    static #splitThreeWays<K, V>(
        rootNode: TreapNode<K, V> | null,
        k: K,
        keyCompareFn: (a: K, b: K) => number,
    ): {
        less: TreapNode<K, V> | null;
        equal: TreapNode<K, V> | null;
        greater: TreapNode<K, V> | null;
    } {
        if (!rootNode) return { less: null, equal: null, greater: null };
        // - split1.left: key以下 / split1.right: keyより大きい
        const split1 = Treap.#split(rootNode, k, keyCompareFn);
        // - split2.left: key未満 / split2.right: keyと等しい
        const split2 = Treap.#split(split1.left, k, (a, b) => {
            const cmp = keyCompareFn(a, b);
            return cmp === 0 ? 1 : cmp; // 等しい場合は常にa > bとみなす
        });
        return {
            less: split2.left,
            equal: split2.right,
            greater: split1.right,
        };
    }

    /**
     * @private
     * TreapNodeのサイズを安全に取得します。
     * @param node
     */
    static #getSize<K, V>(node: TreapNode<K, V> | null): number {
        return node ? node.size : 0;
    }

    /**
     * キーと値のペアをTreapに挿入します。
     * すでに同じキーが存在する場合は、その値を上書きします。
     *
     * 時間計算量: O(log N) (NはTreap内の要素数)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.set(1, 'one');
     * treap.set(2, 'two');
     * treap.set(1, 'uno'); // 1のvalueは"uno"に上書きされる
     * console.log(treap.get(1)); // => "uno"
     * console.log(treap.get(2)); // => "two"
     * ```
     */
    set(key: K, value: V): void {
        // ==== 現在の木を"key未満"・"keyと等しい"・"keyより大きい"の3つに分割して等しいやつは破棄 ====
        const { less, greater } = Treap.#splitThreeWays(this.root, key, this.#keyCompareFn);
        const less_nodes = less;
        const greater_nodes = greater;
        // ==== 新しいノードを作成 ====
        const newNode = new TreapNode(key, value);
        // ==== 3つの木をマージして新しい木を作成 ====
        // 先にlessとnewNodeをマージ
        const merged_left = Treap.#merge<K, V>(less_nodes, newNode);
        // さらにgreaterとマージして完成
        this.root = Treap.#merge<K, V>(merged_left, greater_nodes);
    }

    /**
     * キーに対応する値をTreapから削除します。
     * そのキーが存在しない場合は何もしません。
     *
     * 時間計算量: O(log N) (NはTreap内の要素数)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.set(1, 'one');
     * treap.set(2, 'two');
     * treap.delete(1);
     * console.log(treap.get(1)); // => undefined
     * console.log(treap.get(2)); // => "two"
     * treap.delete(3); // 存在しないキーの削除は無視される
     * console.log(treap.get(2)); // => "two" (影響なし)
     * ```
     *
     * @param key - 削除する要素のキー
     */
    delete(key: K): void {
        // ==== 現在の木を"key未満"・"keyと等しい"・"keyより大きい"の3つに分割して等しいやつは破棄 ====
        const { less, greater } = Treap.#splitThreeWays<K, V>(this.root, key, this.#keyCompareFn);
        const less_nodes = less;
        const greater_nodes = greater;
        // ==== 2つの木をマージして新しい木を作成 ====
        this.root = Treap.#merge<K, V>(less_nodes, greater_nodes);
    }

    /**
     * キーに対応する値をTreapから取得します。
     * そのキーが存在しない場合は`undefined`を返します。
     *
     * 時間計算量: O(log N) (NはTreap内の要素数)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.set(1, 'one');
     * treap.set(2, 'two');
     * console.log(treap.get(1)); // => "one"
     * console.log(treap.get(2)); // => "two"
     * console.log(treap.get(3)); // => undefined (存在しないキー)
     * ```
     *
     * @remarks
     * - キーが存在しない場合は`undefined`を返すため、値の型Vに`undefined`が含まれる場合は注意が必要です。
     *
     * @param key - 取得する要素のキー
     * @returns 指定されたキーの要素の値、存在しない場合は`undefined`
     */
    get(key: K): V | undefined {
        let currentTargetNode = this.root;
        while (currentTargetNode) {
            const cmp = this.#keyCompareFn(key, currentTargetNode.key);
            if (cmp === 0) return currentTargetNode.value;
            currentTargetNode = cmp < 0 ? currentTargetNode.left : currentTargetNode.right;
        }
        return undefined;
    }

    /**
     * キー"以上"と判定される最小のキーとその値を取得します。
     * そのようなキーが存在しない場合は`undefined`を返します。
     *
     * 時間計算量: O(log N) (NはTreap内の要素数)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.set(1, 'one');
     * treap.set(3, 'three');
     * treap.set(5, 'five');
     * console.log(treap.lowerBound(0)); // => { key: 1, value: 'one' } (1が0以上の最小のキー)
     * console.log(treap.lowerBound(3)); // => { key: 3, value: 'three' } (3が3以上の最小のキー)
     * console.log(treap.lowerBound(6)); // => undefined (6以上のキーは存在しない)
     * ```
     *
     * @remarks
     * - キーが存在しない場合は`undefined`を返すため、値の型Vに`undefined`が含まれる場合は注意が必要です。
     *
     * @param key - 基準となるキー
     * @returns キーがkey以上の最小のキーとその値、存在しない場合は`undefined`
     */
    lowerBound(key: K): { key: K; value: V } | undefined {
        let currentTargetNode = this.root;
        /** @type {TreapNode<K,V> | undefined} */
        let candidateNode: TreapNode<K, V> | undefined;
        while (currentTargetNode) {
            const cmp = this.#keyCompareFn(key, currentTargetNode.key);
            if (cmp === 0) {
                return {
                    key: currentTargetNode.key,
                    value: currentTargetNode.value,
                };
            } else if (cmp < 0) {
                candidateNode = currentTargetNode;
                currentTargetNode = currentTargetNode.left;
            } else {
                currentTargetNode = currentTargetNode.right;
            }
        }
        if (candidateNode) {
            return { key: candidateNode.key, value: candidateNode.value };
        } else {
            return undefined;
        }
    }

    /**
     * キー"より大きい"と判定される最小のキーとその値を取得します。
     * そのようなキーが存在しない場合は`undefined`を返します。
     *
     * 時間計算量: O(log N) (NはTreap内の要素数)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.set(1, 'one');
     * treap.set(3, 'three');
     * treap.set(5, 'five');
     * console.log(treap.upperBound(0)); // => { key: 1, value: 'one' } (1が0より大きい最小のキー)
     * console.log(treap.upperBound(3)); // => { key: 5, value: 'five' } (5が3より大きい最小のキー)
     * console.log(treap.upperBound(5)); // => undefined (5より大きいキーは存在しない)
     * ```
     *
     * @remarks
     * - キーが存在しない場合は`undefined`を返すため、値の型Vに`undefined`が含まれる場合は注意が必要です。
     *
     * @param key - 基準となるキー
     * @returns キーがkeyより大きい最小のキーとその値、存在しない場合は`undefined`
     */
    upperBound(key: K): { key: K; value: V } | undefined {
        let currentTargetNode = this.root;
        /** @type {TreapNode<K,V> | undefined} */
        let candidateNode: TreapNode<K, V> | undefined;
        while (currentTargetNode) {
            const cmp = this.#keyCompareFn(key, currentTargetNode.key);
            if (cmp < 0) {
                candidateNode = currentTargetNode;
                currentTargetNode = currentTargetNode.left;
            } else {
                currentTargetNode = currentTargetNode.right;
            }
        }
        if (candidateNode) {
            return { key: candidateNode.key, value: candidateNode.value };
        } else {
            return undefined;
        }
    }

    /**
     * Treap内でk番目に小さい要素のキーと値を取得します。
     * kは0始まりのインデックスです。
     * そのような要素が存在しない場合は`undefined`を返します。
     *
     * 時間計算量: O(log N) (NはTreap内の要素数)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.set(10, 'ten');
     * treap.set(20, 'twenty');
     * treap.set(30, 'thirty');
     * console.log(treap.kthElement(0)); // => { key: 10, value: 'ten' } (0番目に小さい要素)
     * console.log(treap.kthElement(1)); // => { key: 20, value: 'twenty' } (1番目に小さい要素)
     * console.log(treap.kthElement(2)); // => { key: 30, value: 'thirty' } (2番目に小さい要素)
     * console.log(treap.kthElement(3)); // => undefined (3番目に小さい要素は存在しない)
     * ```
     *
     * @remarks
     * - kは0以上である必要があり、これを満たさない場合は例外がスローされます。
     * - kがTreap内の要素数以上の場合は`undefined`を返します。
     *
     * @param k - 取得する要素のインデックス (0-indexed)
     * @returns k番目に小さい要素のキーと値、存在しない場合は`undefined`
     * @throws RangeError - kが0未満の場合
     */
    kthElement(k: number): { key: K; value: V } | undefined {
        let currentTargetNode = this.root;
        let currentK = k;
        if (currentK < 0) {
            throw new RangeError("k is out of bounds");
        }
        while (currentTargetNode) {
            const leftSize = Treap.#getSize(currentTargetNode.left);
            if (currentK < leftSize) {
                currentTargetNode = currentTargetNode.left;
            } else if (currentK === leftSize) {
                return {
                    key: currentTargetNode.key,
                    value: currentTargetNode.value,
                };
            } else {
                currentK -= leftSize + 1;
                currentTargetNode = currentTargetNode.right;
            }
        }
        return undefined;
    }

    /**
     * このTreap内にある、キーがkey(未満|以下|以上|超過)の要素の数を取得します。
     *
     * 時間計算量: O(log N) (NはTreap内の要素数)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.set(10, 'ten');
     * treap.set(20, 'twenty');
     * treap.set(30, 'thirty');
     * const counts = treap.countAllComparisons(20);
     * console.log(counts);
     * // => {
     * //   less: 1,       // 20未満の要素は10の1つ
     * //   lessEqual: 2,  // 20以下の要素は10と20の2つ
     * //   greater: 1,    // 20より大きい要素は30の1つ
     * //   greaterEqual: 2 // 20以上の要素は20と30の2つ
     * // }
     * ```
     *
     * @param key - 比較の基準となるキー
     * @returns key未満(less)・key以下(lessEqual)・keyより大きい(greater)・key以上(greaterEqual)の要素数を含むオブジェクト
     */
    countAllComparisons(key: K): {
        less: number;
        lessEqual: number;
        greater: number;
        greaterEqual: number;
    } {
        if (!this.root) {
            return { less: 0, lessEqual: 0, greater: 0, greaterEqual: 0 };
        }
        // 現在の木を"key未満"・"keyと等しい"・"keyより大きい"の3つに分割
        const { less, equal, greater } = Treap.#splitThreeWays<K, V>(
            this.root,
            key,
            this.#keyCompareFn,
        );
        // それぞれの要素数を取得
        const lessCount = Treap.#getSize<K, V>(less);
        const equalCount = Treap.#getSize<K, V>(equal);
        const greaterCount = Treap.#getSize<K, V>(greater);
        // 元の木に戻す
        const merged_left = Treap.#merge<K, V>(less, equal);
        this.root = Treap.#merge<K, V>(merged_left, greater);
        // 返す
        return {
            less: lessCount,
            lessEqual: lessCount + equalCount,
            greater: greaterCount,
            greaterEqual: equalCount + greaterCount,
        };
    }

    /**
     * @private
     * 再帰的にTreapを走査するためのジェネレーターです。
     * 自身とその子孫について、in-orderで走査してyieldします
     *
     * @param node - 走査の開始点となるノード
     * @returns ジェネレーターは、Treap内の要素をキーの昇順で{ key, value }の形でyieldします。
     */
    *#inOrderTraversal(
        node: TreapNode<K, V> | null,
    ): Generator<{ key: K; value: V }, void, undefined> {
        if (!node) return;
        yield* this.#inOrderTraversal(node.left);
        yield { key: node.key, value: node.value };
        yield* this.#inOrderTraversal(node.right);
    }

    /**
     * Treap内の全要素をキーの"昇順"に列挙するイテレーターを返します。
     * このイテレーターは、Treap内の要素を{ key, value }の形でyieldします。
     *
     * 時間計算量: 全要素の反復がO(N) (NはTreap内の要素数)
     *
     * @example for...of ループを用いた反復処理
     * このメソッドが存在することで、`for...of`ループを使用して`Treap`内の要素を反復処理できます。
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.insert(3, 'three');
     * treap.insert(1, 'one');
     * treap.insert(2, 'two');
     *
     * for (const { key, value } of treap) {
     *     console.log(key, value);
     * }
     * // Expected Log Outputs :
     * // <number> 1 <string> "one"
     * // <number> 2 <string> "two"
     * // <number> 3 <string> "three"
     * ```
     *
     * @example イテレーターを手動で手繰る
     * 返されたイテレーターオブジェクトの`next()`メソッドを手動で呼び出すことで、反復処理の制御を細かく行うこともできます。
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * treap.insert(3, 'three');
     * treap.insert(1, 'one');
     * treap.insert(2, 'two');
     *
     * const iterator = treap[Symbol.iterator]();
     * console.log(iterator.next().value); // Expected Log Output : { key: 1, value: 'one' }
     * console.log(iterator.next().value); // Expected Log Output : { key: 2, value: 'two' }
     * console.log(iterator.next().value); // Expected Log Output : { key: 3, value: 'three' }
     * console.log(iterator.next().done);  // Expected Log Output : true
     * console.log(iterator.next().value); // Expected Log Output : undefined
     * ```
     *
     * @remarks
     * - イテレーターは、Treap内の要素をキーの昇順で列挙します。
     * - イテレーターは、Treap内の要素を{ key, value }の形でyieldします。
     *
     * @yields Treap内の要素をキーの昇順で{ key, value }の形でyieldします。
     */
    *[Symbol.iterator](): Generator<{ key: K; value: V }, void, undefined> {
        yield* this.#inOrderTraversal(this.root);
    }

    /**
     * Treap全体の要素数を取得します。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const treap = new Treap((a, b) => a - b);
     * console.log(treap.size); // => 0 (初期状態)
     * treap.set(1, 'one');
     * treap.set(2, 'two');
     * console.log(treap.size); // => 2 (要素が2つ追加された)
     * treap.delete(1);
     * console.log(treap.size); // => 1 (要素が1つ削除された)
     * ```
     *
     * @returns Treap全体の要素数
     */
    get size(): number {
        return Treap.#getSize<K, V>(this.root);
    }
}
