# AyaExpTech Arcane

AyaExpTech Arcane (`/éɪéksték ɑːkéin/`のように発音)は、主に競技プログラミングに向けた、データ構造やアルゴリズムを提供するTypeScriptライブラリです。

## License

copyright (c) 2026- Ayasaka-Koto(AyaExpTech).  
Released under the [MIT License](LICENSE).

- 公開されているコードを複製すること、またそれを改変することを(別途明示的に)許可します
    - ただし、以下のような情報を含むコメントを添えることにより出典を辿れるようにしてある場合に限ります
        - リポジトリURL: `https://github.com/AXT-Studio/Arcane`
        - JSR package URL: `https://jsr.io/@ayaexptech/arcane`
        - パッケージ名: `jsr:@ayaexptech/arcane`
        - ライブラリ名: `AyaExpTech Arcane` (略称: `AXT Arcane`)
    - ライブラリについての情報さえ書かれていれば、作者名“Ayasaka-Koto”は書かなくてもよいです
- 各ファイルの編集者(AI利用の有無)について
    - `tests/`を除く各ファイルは、(一部はAIを使いながら勉強した上で)Ayasaka-Kotoにより作成されています
    - `tests/`内の各テストファイルは、以下のAI Agentsを用いて作成し、一部人の手を加えています
        - Grok 4.7 (Cursor)
        - GPT-6 Astra (Codex)

> [!TIP]
> コードを直接コピペしないと使えない環境については、[AXT-AyaKoto/axt-arcane-bundler](https://github.com/AXT-AyaKoto/axt-arcane-bundler)を使用することができます。  
> 自動で出典コメントが付与されるほか、JavaScriptへの変換(Type Stripping)を一緒に行う機能もあります。
> 詳細は[`AXT-AyaKoto/axt-arcane-bundler`のリポジトリ・README](https://github.com/AXT-AyaKoto/axt-arcane-bundler)などを参照してください。

> [!TIP]
> 2026年10月4日に行われた「ABC, ARC, AGCにおける生成AI対策ルール」の更新([参照](https://atcoder.jp/posts/algorithm_rules_20261014_ja))に伴い、ライセンスを少しゆるくしました。
> “AyaExpTech Arcaneから持ってきたコードである”ことを何かしらで明示し、出典としてGitHubリポジトリにたどり着けるようにすれば、厳密にはMIT Licenseの条件を満たせない状況でもこのライブラリを使うことができます。
> コード内への直接のコメントのほか、`package.json`をはじめとする依存関係を管理する設定ファイルを参照することでGitHubリポジトリにたどり着ける場合も許可されます。
> なお、上記のライセンスの変更はAyaExpTech Arcaneの過去のバージョンにも準用されるものと考えてよいです。(今回の変更は暗黙的な認可を明示的に書いたものだ、と考えてください。)

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
