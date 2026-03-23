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

Eleventyのデータ（フロントマター、グローバルデータなど）は`this`を介して利用可能です。

```slim
h1 = this.title
p = this.page.date
ul
	- for item of this.items
		li = item.name
```

## フィルターとショートコード

Eleventy のフィルターやショートコードは`this.filters`から利用できます。
Slmではフィルターもショートコードもjavascriptの関数として機能するため、使い方は同じです。
非同期フィルターや非同期ショートコードは通常のjavascript関数と同様に、awaitを付けて呼び出す必要があります。

```slim
a href="${this.filters.url('/my-page')}"
	div = this.filters.myCustomFilter('value')
	div = this.filters.myCustomShortcode('value1', 'value2')
	div = await this.filters.myAsyncFilter('value')
```

## レイアウトとパーシャル

### レイアウト
Eleventyの標準的なレイアウト機能を使用します。フロントマターなどでレイアウトファイルを指定してください。
レイアウトファイルでは、元ページのコンテンツはデータとして渡されるので、`this.content`でアクセスできます。

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
	== this.content
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
