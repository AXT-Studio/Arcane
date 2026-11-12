# AyaExpTech Arcane

AyaExpTech Arcane (`/éɪéksték ɑːkéin/`のように発音)は、主に競技プログラミングに向けた、データ構造やアルゴリズムを提供するTypeScriptライブラリです。

## License

copyright (c) 2026- Ayasaka-Koto(AyaExpTech).  
Released under the [Zero-Clause BSD License](LICENSE).

> [!NOTE]
> 必須ではないですが、もし本ライブラリが役に立ったのであれば、謝辞等で本ライブラリに言及していただけると嬉しいです。
> ただし、これはあくまで任意のお願いであり、ライセンス上の条件ではありません。
>
> Attribution is appreciated, but not required.
> If you find this project useful, a mention or a link to this repository would make me happy.
> This is a non-binding request, not a condition of the license.

> [!NOTE]
> 各ファイルの編集者(AI利用の有無)について
>
> - `tests/`内の各テストファイルは、以下のAI Agentsを用いて作成し、一部人の手を加えています
>     - Grok 4.7 (Cursor)
>     - GPT-6 Astra (Codex)
>     - GPT-6.1 Sol (Codex)
> - それ以外の各ファイルは、原則として人間(Ayasaka-Koto)が作成しています。ただし、以下の例外を含みます
>     - 数行程度の自明な実装で、人間が書いてもAIが書いても同じコードを書くであろうと予想し、実際そうであったもの ("リッチなコピペ"としての利用)
>     - 各ファイルのコードを実装するための、アルゴリズムなどの学習 (主にPerplexity Education Proの"ステップバイステップで学ぶ"を利用しています)

> [!TIP]
> コードを直接コピペしないと使えない環境については、[AXT-AyaKoto/axt-arcane-bundler](https://github.com/AXT-AyaKoto/axt-arcane-bundler)を使用することができます。  
> 自動で出典コメントが付与されるほか、JavaScriptへの変換(Type Stripping)を一緒に行う機能もあります。
> 詳細は[`AXT-AyaKoto/axt-arcane-bundler`のリポジトリ・README](https://github.com/AXT-AyaKoto/axt-arcane-bundler)などを参照してください。

## Usage

[JSRのドキュメントページ](https://jsr.io/@ayaexptech/arcane/doc)及びJSDocコメントを参照してください。

## Installation

このライブラリは[JSR](https://jsr.io/@ayaexptech/arcane)パッケージとして公開されています。

- Web (esm.sh CDN)
    ```js
    import * as arcane from "https://esm.sh/jsr/@ayaexptech/arcane";
    ```
- npm
    ```bash
    npx jsr add @ayaexptech/arcane
    ```
    ```js
    import * as arcane from "@ayaexptech/arcane";
    ```
- pnpm
    ```bash
    pnpm add jsr:@ayaexptech/arcane
    ```
    ```js
    import * as arcane from "@ayaexptech/arcane";
    ```
- Deno (Add Package)
    ```bash
    deno add jsr:@ayaexptech/arcane
    ```
    ```js
    import * as arcane from "@ayaexptech/arcane";
    ```
- Deno (Adhoc Import)
    ```js
    import * as arcane from "jsr:@ayaexptech/arcane";
    ```
- Bun
    ```bash
    bunx jsr add @ayaexptech/arcane
    ```
    ```js
    import * as arcane from "@ayaexptech/arcane";
    ```

## Contributing

- バグ報告: [GitHub Issues](https://github.com/AXT-Studio/Arcane/issues)
- Pull Request: このリポジトリは作者の学習を兼ねたプロジェクトです。原則としてPull Requestは受け付けていません。ご了承ください。

### Developing

以下は開発者(Ayasaka-Koto)向けのメモです。

- Format: `pnpm run fmt` (`pnpm run fmt:check`)
- Lint: `pnpm run lint:fix` (`pnpm run lint`)
- Test: `pnpm run test`
    - Check slow-types: `pnpm run test:jsr`
- Preview JSR Doc: `pnpm run test:doc`
