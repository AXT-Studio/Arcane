// ================================================================
// Imports
// ================================================================

import { Treap } from "./Treap";

// ================================================================
// Exports
// ================================================================

/**
 * 俗に「区間をSetで管理するやつ」と呼ばれる、半開区間を重複のないよう管理するデータ構造です。
 */
export class IntervalSet {
    /** 現在の区間を保持する平衡二分探索木。[key, value)の形で半開区間を表し、重複のないよう管理される。 */
    #heavenTree: Treap<number, number>;

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
        this.#heavenTree = new Treap((a, b) => a - b);
    }

    /**
     * 現在管理対象として追加されている区間の数。
     * 区間の結合が行われるため、必ずしも「insert()の呼び出し回数 - erase()の呼び出し回数」とはならない点に注意してください。
     *
     * 時間計算量: O(1)
     *
     * @example
     * ```ts
     * const intervalSet = new IntervalSet();
     * console.log(intervalSet.size); // => 0
     * ```
     */
    get size(): number {
        return this.#heavenTree.size;
    }

    /**
     * 新たに半開区間[l, r)を追加します。
     * すでに追加されている区間と重複・隣接する場合、それらと結合する形で管理されます。
     *
     * 時間計算量: (TODO: 償却log、最悪Nとかになります？)
     *
     * @param l - 区間の左端 (l自身を含む)
     * @param r - 区間の右端 (r自身は含まない)
     */
    insert(l: number, r: number): void {
        // 右端がl超過となる最初の区間が何番目かをチェック
        // TODO: 先にTreapの機能改善を入れますね！
    }
}
