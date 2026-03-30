# eleventy-plugin-slm-neo

An [Eleventy](https://github.com/11ty/eleventy) plugin to use [Slm-neo template language](https://github.com/colus-img/slm-neo).
Slm-neo is a JS port of the Ruby [Slim](http://slim-lang.com/) for HTML.

## Features

- **Slm Syntax**: Write templates in Slm, a concise syntax similar to Slim.
- **Async Support**: Slm-neo natively supports async filters, shortcodes and paired shortcodes.

## Installation

Install it directly from GitHub:

```bash
npm i -D colus-img/eleventy-plugin-slm-neo
```

## Usage

Add the plugin in your Eleventy configuration file (usually eleventy.config.mjs or eleventy.config.js):

```javascript
import slmPlugin from "eleventy-plugin-slm-neo";

export default function(eleventyConfig) {

	eleventyConfig.addPlugin(slmPlugin);

};
```

## Accessing Data in Slm Templates

Eleventy data (front matter, global data, etc.) is automatically destructured and available directly. The previous `this.` prefix is no longer required.

```slim
h1 = title
p = page.date
ul
	- for item of items
		li = item.name
```

## Filters and Shortcodes

Eleventy filters and shortcodes are also destructured and can be called directly as JavaScript functions. 
A clean pipeline syntax (`|`) is supported within string interpolations.
Asynchronous filters and shortcodes must be called with `await` just like regular JavaScript functions.

```slim
a href="${url('/my-page')}"
	div = myCustomFilter('value')
	div = myCustomShortcode('value1', 'value2')
	div = await myAsyncFilter('value')
	div Hello ${name | upper}
```

## Paired Shortcodes (Block Syntax)

Eleventy's Paired Shortcodes can be called natively using Slm's block syntax. The plugin automatically evaluates the indented block and injects its rendered HTML as the first argument (`content`) to your Paired Shortcode.
**Note**: Use the unescaped output `==` to render the returned HTML properly.

```slim
== myPairedShortcode('arg1', 'arg2')
	p This block is passed as the first argument.
	div It can contain interpolations too: ${title | upper}
```

## Layouts and Partials

### Layouts
Use Eleventy's standard layout feature. Specify the layout file in the front matter or elsewhere.
In layout file, the content of the original page is passed as data and can be accessed via `content`.

### Partials
Use Slm's `partial` function to include other files.
- **Relative Path**: Resolves relative to the current file's directory.
- **Root-Relative Path** (starting with `/`): Resolves relative to your Eleventy Includes directory (e.g., `src/_includes/`).

### Example

**page.slm**
```slim
---
layout: "layout.slm"
---
p This is content

/ Include ./subcontent.slm
== partial('subcontent.slm')
```

**layout.slm** (located in `src/_includes/`)
```slim
#header
	/ Include src/_includes/lib/header.slm
	== partial('/lib/header')

#main
	/ Output original page content
	== content
```

## Slm-neo API Options

Options passed directly to the 3rd argument of Slm-neo engine's `renderAsync` method.
About Slm-neo API Options, see [slm-neo](https://github.com/colus-img/slm-neo/) for details.

- Type: `Object`
	- Example: `{ someOption: true }`

### Options Example
```javascript
import slmPlugin from "eleventy-plugin-slm-neo";

export default function(eleventyConfig) {

	eleventyConfig.addPlugin(slmPlugin, {
		// Slm-neo options
		someOption: true,
		// ...other slm-neo options
	});

};
```

## License

MIT
