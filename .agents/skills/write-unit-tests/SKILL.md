---
name: write-unit-tests
description: このリポジトリにおけるユニットテストファイルの書き方のお作法。ユニットテストを新規作成・追加・修正するときに読む。
---

## 概要

このリポジトリのユニットテストファイルは、以下に説明される形で統一される必要があります。
ユニットテストを新しく作る、テストケースを追加・削除する、テストケースを修正するときは、以下に説明される形を守ってください。

## テストケースの種類

このリポジトリでは、各クラス・メソッドに対して、以下の4種類のテストを書きます。

1. **exampleテスト**: JSDoc `@example`の正しさの保証
2. **エッジテスト**: エッジケースの正しさの確認
3. **ランダムテスト**: ランダムケースにおける愚直実装との一致チェック
4. **シナリオテスト**: 競プロの問題など、実際の使用例における挙動のサンプルチェック

このうち、exampleテストは(JSDoc `@example`がある場合)必須です。JSDoc `@example`は必ずexampleテストによって正しいことが保証されなければなりません。
他の3種類のテストは、必要性に応じて書く任意のものです。
主要なメソッドに対するランダムテストは書くことを推奨しますが、指示がない限りは提案のみに留めて良いです。

> [!NOTE] テスト新規作成時に書くテスト
>
> - まだテストがない対象に対するテストを追加するときは、(人間に確認を取らずに)exampleテストを追加してよいです
> - エッジ・ランダム・シナリオテストは、人間の指示(どのようなテストをするか)がない限り追加しなくてよいです
>     - ただし、あなたが必要性を感じたなら、人間に「このようなエッジ/ランダム/シナリオテストを追加することをおすすめしますが、追加しますか？」と提案することが望ましいです
>     - エッジ・ランダム・シナリオテストは、テスト方法の詳細を個別に決定します。詳細は人間が与えることもあるし、あなたが提案することもできます

## 各テストの書き方

補遺: `tests/BinaryHeap.test.ts`が模範例となるでしょう。

### 全体

`src`側のと1対1対応する形でファイルを`tests`フォルダに用意します。
例えば、`src/hoge.ts`で実装されているもののテストファイルは、`tests/hoge.test.ts`です。

各テストファイルでは、(クラス, テスト種別)ごとに`describe`を使ってまとめます。

```ts
import { describe, expect, it } from "vitest";
import { Hoge, Fuga } from "../src/hoge.ts";

describe("Hoge - JSDoc @example", () => {
    // (Hogeのexampleテストを書く)
});
describe("Fuga - JSDoc @example", () => {
    // (Fugaのexampleテストを書く)
});
describe("Hoge - Edge Cases", () => {
    // (Hogeのエッジテストを書く)
});
describe("Fuga - Edge Cases", () => {
    // (Fugaのエッジテストを書く)
});
describe("Hoge - Random Tests", () => {
    // (Hogeのランダムテストを書く)
});
describe("Fuga - Random Tests", () => {
    // (Fugaのランダムテストを書く)
});
describe("Hoge - Scenario Tests", () => {
    // (Hogeのシナリオテストを書く)
});
describe("Fuga - Scenario Tests", () => {
    // (Fugaのシナリオテストを書く)
});
```

- `describe`は「exampleテスト → エッジテスト → ランダムテスト → シナリオテスト」の順に書きます
- 各`describe`の`name`は上記例の通り、`{Target} - {種別ごと固定文字列}`とします
    - exampleテスト → `{Target} - JSDoc @example`
    - エッジテスト → `{Target} - Edge Cases`
    - ランダムテスト → `{Target} - Random Tests`
    - シナリオテスト → `{Target} - Scenario Tests`
- 複数クラスのテストを書く場合、テスト種別単位でまとめるような順番で書きます
- 複数のテストで共通する処理があったとしても、それを別の関数にまとめる必要はありません
    - 各テスト(`it`)はその中身だけを見れば理解できるようにすべきです

### exampleテスト

exampleテストは、対象(基本的にクラス)の公開API(constructor、メソッド、プロパティ、getter/setter……)のJSDocに含まれるすべての`@example`について、実装ファイル内での記述順に書きます。

- `describe`内では、`@example`ごとに1つずつ`it`を書き、そこにテストするコードを記述します
- 各`it`の`name`は、`{API名} [そのexampleの説明]`とします
    - `[そのexampleの説明]`は必ずしも原文と一致しなくてもよく、多少の言い換えによって短くすることが許されます
    - ただし、そのAPIに`@example`が1つしかないなどで名前がついていない場合は、単に`{API名}`とすることができます
    - `{API名}`は、constructorは`new ClassName()`、メソッドは`method()`、プロパティは`prop`、getterは`get prop`、setterは`set prop`とします
        - getterとsetterの両方が実装されていて同時にチェックする必要がある`@example`に対しては`get/set prop`
        - generatorは例えば`*[Symbol.iterator]()`のように`*`をつけて書けば良い
        - static memberはクラス名から書きます
            - 例: `UniqueID.generateUUIDv7()`, `CompareFn.number_asc()`など

```ts
// BinaryHeapLiteの例
describe("BinaryHeapLite - JSDoc @example", () => {
    it("new BinaryHeapLite() [初期値なし]", () => {
        expect(() => {
            const _minHeap = new BinaryHeapLite<number>((a, b) => a - b);
        }).not.toThrow();
    });
    it("new BinaryHeapLite() [初期値を与える]", () => {
        const minHeap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8, 1]);
        expect(minHeap.pop()).toBe(1);
        expect(minHeap.pop()).toBe(3);
    });
    it("get size", () => {
        /* ... */
    });
    it("push()", () => {
        /* ... */
    });
    it("pop()", () => {
        /* ... */
    });
    it("peek()", () => {
        /* ... */
    });
    it("clear()", () => {
        /* ... */
    });
});
```

各`it`は、「出力の確認が不要なもの」と「出力の確認が必要なもの」に分かれます。

「出力の確認が不要なもの」では、単に例示コードが例外を起こさないことを確認すればよいです。
そのため、例示コード全体を`expect`に入れて、`.not.toThrow()`を確認します。

```ts
// 例示コード
const minHeap = new BinaryHeapLite<number>((a, b) => a - b);
// ↓
// テスト
it(/* ... */, () => {
    expect(() => {
        const _minHeap = new BinaryHeapLite<number>((a, b) => a - b);
    }).not.toThrow();
});
```

「出力の確認が必要なもの」では、例示コードにおいて値が例示されているものを`expect`する形に置き換えたコードを実行します。
単に値を例示しているもののほか、`console.log()`や`// Expected Log Outputs:`などの記述も`expect`による値の確認の対象になります。
Primitive値は`toBe`で比較すればよいですが、ObjectやArrayについては`toEqual`を使う必要があります。

```ts
// 例示コード
const minHeap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8, 1]);
console.log(minHeap.pop()); // => 1
console.log(minHeap.pop()); // => 3
// ↓
// テスト
it(/* ... */, () => {
    const minHeap = new BinaryHeapLite<number>((a, b) => a - b, [5, 3, 8, 1]);
    expect(minHeap.pop()).toBe(1);
    expect(minHeap.pop()).toBe(3);
});
```

### エッジテスト

各`it`内で純粋にエッジテストをやればよいです。

- `it`の`name`はそのテストケースの簡潔な説明にすると良いでしょう
    - たとえば、`it("kthElement(k)はkが負のときRangeError", () => { ... })`のように、「対象」「状況・条件」「そのとき起こることが期待されること」をまとめると良いです
- 「空要素」「1要素」「範囲外」「例外」はカバーしておくとよいでしょう
    - それ以上は人間から指示があるか、あなたが提案して人間がそれに賛同したとき以外は追加しなくてよいです

### ランダムテスト

各`it`内で純粋にランダムテストをやればよいです。

- `it`の`name`は`{対象}について、{愚直実装の概要}と比較して一致確認`のようにするとよいでしょう
    - 実例: `"push(), pop()について、挿入時にソートするArrayと比較して一致確認"` (`BinaryHeap`・`BinaryHeapLite`)
- 各`it`における試行回数や値の範囲などは、とくに理由がない限り`it`1つあたり25-75ms程度で終わる程度に設定すればよいです
    - 値や試行回数を大きくすると愚直実装のテストに極端に時間がかかってしまうため
    - もしそれ以上時間がかかるテストを追加するならば、そのテストの意義などを簡潔にコメントで残しておくべきでしょう
- 乱数について、シード固定などは不要です
    - 普通に`Math.random()`を使って実装してよいです

### シナリオテスト

各`it`内で純粋にシナリオテストをやればよいです。

- `it`の`name`はシナリオテストの簡潔な説明にすべきでしょう。
- 基本的にシナリオテストは人間が提案してくるので、`name`とテスト内容を人間からもらって(不足していれば聞いて)実装してください。

## その他の諸注意

- ここで説明されていないテストを追加したいときは人間に確認を取るべきです
