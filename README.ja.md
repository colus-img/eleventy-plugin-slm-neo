# eleventy-plugin-slm-neo

Eleventyで[Slm-neoテンプレートエンジン](https://github.com/colus-img/slm-neo)を使用するためのプラグインです。
SlmはHTML用のRuby [Slim](http://slim-lang.com/)のJS移植版です。

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

最新の`slm-neo`の自動分割代入機能により、Eleventyが提供するデータ（フロントマター、グローバルデータなど）は`this.`というプレフィックスを付けずに直接記述・参照できるようになりました。（従来の`this.xxx`記法も引き続き動作します）

```slim
h1 = title
p = page.date
ul
	- for item of items
		li = item.name
```

## FiltersとShortcodes

EleventyのFiltersやShortcodesは、slmの直感的なパイプライン記法（`${...|...}`）で利用可能です。この**パイプライン記法では非同期関数が自動的にサポートされる**ため、明示的に`await`を書く必要はありません。
また、通常のJavaScript関数として使うこともできます。この場合も関数名に、`this.helpers.`などは不要です。`=`や`==`の直後で非同期関数を使う場合は、`await`が不要です。
どちらの記法でも、非同期関数を関数の引数として使う場合は、明示的に`await`を書く必要があります。

```slim
a href="${url('/my-page')}"
	div = myCustomFilter('value')
	div = myCustomShortcode('value1', 'value2')
	div = myAsyncFilter('value')
	div Hello ${name | upper}
	div ${'value1', 'value2' | myCustomShortcode}
	div Hello ${postId | myAsyncFilter | upper}
```

## Paired Shortcode

EleventyのPaired Shortcodeは、Slmのインデントブロック構文を使って直感的に呼び出すことができます。
インデントとして書かれた中身はプラグインによって自動的に評価され、HTML文字列としてショートコード機能の第1引数（`content`）に渡されます。

```slim
= myPairedShortcode('arg1', 'arg2')
	p このブロック内部のHTMLが第一引数に渡されます。
	.feature
		div ${title | upper}のようにここでフィルターを使うこともできます！
```

## レイアウトとパーシャル

### レイアウト
Eleventyの標準的なレイアウト機能を使用します。フロントマターなどでレイアウトファイルを指定してください。
レイアウトファイルでは、元ページのコンテンツは`content()`でアクセスできます。

### パーシャル
Slmの`partial`関数を使用して他のファイルをインクルードできます。

- **相対パス**: 現在のファイルのディレクトリからの相対パスとして解決されます。
- **ルート相対パス** (`/`で始まるパス): EleventyのIncludesディレクトリ（例:`src/_includes/`）からの相対パスとして解決されます。

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
	== content()
```

## Slm-neoのAPIオプション

Slm-neoエンジンの`renderAsync`メソッドに渡されるオプションオブジェクトです。
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
