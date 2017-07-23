# ts-jasmine-example

このファイルセットは次の要件を満たす開発環境を構築するために作成したものです：

* npmによるパッケージ管理を行う
* gulpによるビルド・タスク管理を行う
* Visual StudioなどのIDEでなくAtomでコーディングできる構成にする
* TypeScriptによるコーディングを行う
* 依存パッケージのAPIへのアクセスは`*.d.ts`ファイルが提供する型情報を通じて行う
* Jasmineによる単体テスト作成を行う
* 配布用ファイルには`*.min.js`と`*.d.ts`と`*.min.js.map`を含める
* メイン・コードにJasmineのAPIを利用するコードが絶対に紛れ込まないようにする

## ビルド方法

開発環境にまだ[npm](https://www.npmjs.com/get-npm)や[gulp-cli](https://www.npmjs.com/package/gulp-cli)がインストールされていないようであればインストールします。

その上でプロジェクトのルートディレクトリにて`npm install`を実行すると、`package.json`の記述内容に基づいて依存性パッケージがダウンロードされます。

その後、次の各種コマンドを実行することでビルドを行うことができます：

コマンド|説明
---|---
`gulp build`|`main/`配下のTypeScriptコードをトランスパイルし、圧縮・難読化（uglify）した上で、`dist/`配下にファイル出力します。このときメインの成果物である`*.min.js`とともに`*.d.ts`と`*.min.js.map`も出力されます。
`gulp test`|`main/`配下のTypeScriptコードとともに`test/`配下の同コードもトランスパイルした上で、`*.spec.js`を対象にしてJasmineテスト・ドライバーを実行します。圧縮・難読化やソースマップの生成は行いません。
`gulp clean`|ビルド・タスクにより生成されたファイルをすべて削除します。

## コーディング

開発環境にまだ[Atom](https://atom.io/)がインストールされていないようであればインストールします。
Atomには[Atom TypeScript](https://atom.io/packages/atom-typescript)パッケージをインストールしておきます。

ビルド方法のところで説明した`npm install`までが完了したら、プロジェクトのディレクトリをAtomでオープンします。
所定のディレクトリ`main/src`や`test/src`に格納されたTypeScriptファイルを編集し保存すると、自動的にトランスパイが行われて`{main|test}/src/generated`配下に`*.js`ファイルが生成されます。

テストのコードからメインのコードをインポートする場合は `import ... from '../../main/src/(filename)'`形式で記述します。

## ファイル構成

```
├── LICENSE
├── README.md
├── dist                    ... gulp buildの成果物が格納されるディレクトリ
├── gulpfile.js             ... gulp.jsタスクランナーのためのタスク定義ファイル
├── main                    ... メインのコードと設定情報を格納するディレクトリ
│   ├── generated           ... トランスパイルの成果物が格納されるディレクトリ
│   ├── src
│   │   └── example.ts      ... メインのコード（の例）
│   └── tsconfig.json       ... メイン固有の`tsc`オプション
├── node_modules            ... このパッケージの依存性パッケージが格納されるディレクトリ
├── package.json            ... このパッケージのメタ情報
├── test                    ... テストのコードと設定情報を格納するディレクトリ
│   ├── generated           ... トランスパイルの成果物が格納されるディレクトリ
│   ├── src
│   │   └── example.spec.ts ... テストのコード（の例）
│   └── tsconfig.json       ... テスト固有の`tsc`オプション
└── tsconfig.json           ... メインとテストに共通する`tsc`オプション
```
