# eleventy-plugin-slm-neo

Eleventyで [Slm-neo テンプレートエンジン](https://github.com/colus-img/slm-neo)を使用するためのプラグインです。
SlmはHTML用のRuby [Slim](http://slim-lang.com/) のJS移植版です。

## 機能

- **Slm構文**: Slimに似た簡潔なSlm構文でテンプレートを記述できます。
- **非同期対応**: Slm-neoはネイティブで非同期フィルター、ショートコード、ペアショートコードをサポートしています。

## インストール

GitHubから直接インストールしてください:

```bash
npm i -D colus-img/eleventy-plugin-slm-neo
```

## 使い方

Eleventyの設定ファイル（通常は`eleventy.config.mjs`または`eleventy.config.js`）でプラグインを追加します:

```javascript
import slmPlugin from "eleventy-plugin-slm-neo";

export default function(eleventyConfig) {

	eleventyConfig.addPlugin(slmPlugin);

};
```

## テンプレート内でのデータ参照

最新の `slm-neo` の自動分割代入（Destructuring）機能により、Eleventyのデータ（フロントマター、グローバルデータなど）は `this.` というプレフィックスを付けずに直接記述・参照できるようになりました。（従来の `this.xxx` 記法も引き続き動作します）

```slim
h1 = title
p = page.date
ul
	- for item of items
		li = item.name
```

## フィルターとショートコード

Eleventyのフィルターやショートコードも、直下のJavaScript関数として直接呼び出すことができます。
また、文字列補間（`${...}`）内では、直感的なパイプライン記法（`|`）が利用可能です。
非同期関数は通常のJavaScript関数と同様に、`await`を付けて呼び出します。

```slim
a href="${url('/my-page')}"
	div = myCustomFilter('value')
	div = myCustomShortcode('value1', 'value2')
	div = await myAsyncFilter('value')
	div Hello ${name | upper}
```

## Paired Shortcode (ブロック構文) の利用

Eleventyのペアショートコード（Paired Shortcode）は、Slmのインデントブロック構文を使ってそのまま直感的に呼び出すことができます。
インデントとして書かれた中身はプラグインによって自動的に評価され、HTML文字列としてショートコード機能の第1引数（`content`）に渡されます。
**注意**: ショートコード関数が全容として返すHTMLタグを画面に正しく描画するため、必ずエスケープなしの出力記号 `==` を使用してください。

```slim
== myPairedShortcode('arg1', 'arg2')
	p このブロック内部のHTMLが第一引数に渡されます。
	div もちろん補完（ ${title | upper} ）なども使えます！
```

## レイアウトとパーシャル

### レイアウト
Eleventyの標準的なレイアウト機能を使用します。フロントマターなどでレイアウトファイルを指定してください。
レイアウトファイルでは、元ページのコンテンツはデータとして渡されるので、`content`でアクセスできます。

### パーシャル
Slmの`partial`関数を使用して他のファイルをインクルードできます。

- **相対パス**: 現在のファイルのディレクトリからの相対パスとして解決されます。
- **ルート相対パス** (`/` で始まるパス): EleventyのIncludesディレクトリ（例: `src/_includes/`）からの相対パスとして解決されます。

### 使用例

**page.slm**
```slim
---
layout: "layout.slm"
---
p This is content

/ ./subcontent.slm を出力
== partial('subcontent.slm')
```

**layout.slm** (`src/_includes/` に配置)
```slim
#header
	/ src/_includes/lib/header.slm を出力
	== partial('/lib/header')

#main
	/ 元ページの内容を出力
	== content
```

## Slm-neoのAPIオプション

Slm-neo エンジンの `renderAsync` メソッドの第3引数に直接渡されるオプションオブジェクトです。
オプションの詳細は[slm-neo](https://github.com/colus-img/slm-neo/)を参照してください。

- 型: `Object`
	- 例: `{ someOption: true }`

### オプション使用例
```javascript
import slmPlugin from "eleventy-plugin-slm-neo";

export default function(eleventyConfig) {

	eleventyConfig.addPlugin(slmPlugin, {
		// Slm-neoのオプション
		someOption: true,
		// ... その他のslm-neoオプション
	});

};
```

## ライセンス

MIT
