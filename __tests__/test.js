import assert from 'node:assert/strict';
import EleventyPluginSlm from '../index.js';

async function runTests() {
	console.log('Starting eleventy-plugin-slm-neo sanity tests...');

	// 1. Mock 11ty Shortcodes and Filters
	let lastCall = null;
	const dummyPairedShortcode = (content, title, lang) => {
		// Capture arguments for inspection
		lastCall = { content, title, lang };
		const langAttr = lang ? ` lang="${lang}"` : '';
		return `<div class="box" title="${title}"${langAttr}>${content}</div>`;
	};

	const asyncDummyPairedShortcode = async (content, title, lang) => {
		lastCall = { content, title, lang };
		const langAttr = lang ? ` lang="${lang}"` : '';
		return `<div class="async-box" title="${title}"${langAttr}>${content}</div>`;
	};

	const dummyShortcode = (linkText, url) => {
		return `<a href="${url}">${linkText}</a>`;
	};

	const asyncDummyShortcode = async (linkText, url) => {
		return `<a href="${url}" class="async">${linkText}</a>`;
	};

	const dummyFilter = (str) => str.toUpperCase();

	const asyncDummyFilter = async (str) => {
		return str.toLowerCase();
	};

	// 2. Mock 11ty Configuration Object
	let compileFunction = null;
	const eleventyConfig = {
		addTemplateFormats: () => {},
		addExtension: (exts, opts) => {
			// Capture the compile function that the plugin provides to 11ty
			compileFunction = opts.compile;
		},
		getFilters: () => ({ upper: dummyFilter, lowerAsync: asyncDummyFilter }),
		getShortcodes: () => ({ myLink: dummyShortcode, myLinkAsync: asyncDummyShortcode }),
		getPairedShortcodes: () => ({ myBox: dummyPairedShortcode, myBoxAsync: asyncDummyPairedShortcode }),
		pathPrefix: '/'
	};

	// 3. Initialize plugin
	EleventyPluginSlm(eleventyConfig);
	assert.ok(compileFunction !== null, 'compile function should be registered via addExtension');

	// 4. Test Slm Compilation & Rendering
	// Case 1: Slm-neo Block Syntax (Indented block)
	const slmSourceBlock = `
== myBox("BoxTitle")
  p Hello \${upper(name)}
`;
	const templateRendererBlock = compileFunction(slmSourceBlock, 'block.slm');
	const outputHTMLBlock = await templateRendererBlock({
		eleventy: { directories: { includes: '_includes' } },
		name: 'John'
	});
	// Assertion Case 1
	const expectedHTMLBlock = `<div class="box" title="BoxTitle"><p>Hello JOHN</p></div>`;
	assert.strictEqual(
		outputHTMLBlock.trim().replace(/\n/g, ''), 
		expectedHTMLBlock.trim(),
		'Block syntax rendering failed'
	);
	assert.ok(lastCall !== null, 'Shortcode should have been called');
	assert.strictEqual(
		lastCall.content.toString().trim().replace(/\n/g, ''),
		'<p>Hello JOHN</p>',
		'Internal content passed to shortcode was incorrect'
	);
	assert.strictEqual(lastCall.title, 'BoxTitle', 'Title argument was incorrect');

	// Case 2: Traditional JS Syntax (Direct call with content as 1st arg)
	const slmSourceJS = `
== myBox("JSContent", "JSTitle")
`;
	const templateRendererJS = compileFunction(slmSourceJS, 'js.slm');
	const outputHTMLJS = await templateRendererJS({
		eleventy: { directories: { includes: '_includes' } }
	});
	// Assertion Case 2
	const expectedHTMLJS = `<div class="box" title="JSTitle">JSContent</div>`;
	assert.strictEqual(
		outputHTMLJS.trim().replace(/\n/g, ''), 
		expectedHTMLJS.trim(),
		'Traditional JS syntax rendering failed'
	);
	assert.strictEqual(
		lastCall.content, 
		'JSContent', 
		'Traditional JS content argument mismatch'
	);
	assert.strictEqual(lastCall.title, 'JSTitle', 'Traditional JS title argument mismatch');

	// Case 3: Slm-neo Block Syntax with 3 Arguments (content + 2 args)
	const slmSourceBlock3 = `
== myBox("Title3", "ja")
  p こんにちは
`;
	const templateRendererBlock3 = compileFunction(slmSourceBlock3, 'block3.slm');
	const outputHTMLBlock3 = await templateRendererBlock3({
		eleventy: { directories: { includes: '_includes' } }
	});
	// Assertion Case 3
	assert.strictEqual(
		outputHTMLBlock3.trim().replace(/\n/g, ''),
		'<div class="box" title="Title3" lang="ja"><p>こんにちは</p></div>',
		'Block syntax with 3 arguments rendering failed'
	);
	assert.strictEqual(
		lastCall.content.toString().trim().replace(/\n/g, ''),
		'<p>こんにちは</p>',
		'Internal content for 3rd arg test was incorrect'
	);
	assert.strictEqual(lastCall.title, 'Title3');
	assert.strictEqual(lastCall.lang, 'ja', 'Third argument (lang) was not passed correctly');

	// Case 4: Interpolation with Shortcode, Pipeline, and Paired Shortcode
	const slmSourceInterpolation = `
p \${=myLink(author, './author.html')}
p \${name | upper}
p \${=myBox('InterContent', 'InterTitle')}
`;
	const templateRendererInterpolation = compileFunction(slmSourceInterpolation, 'interpolation.slm');
	const outputHTMLInterpolation = await templateRendererInterpolation({
		eleventy: { directories: { includes: '_includes' } },
		name: 'John',
		author: 'Ash'
	});

	// Assertion Case 4
	assert.strictEqual(
		outputHTMLInterpolation.trim().replace(/\n/g, ''),
		'<p><a href="./author.html">Ash</a></p><p>JOHN</p><p><div class="box" title="InterTitle">InterContent</div></p>',
		'Interpolation with shortcode or pipeline failed'
	);
	assert.strictEqual(lastCall.content, 'InterContent', 'Paired shortcode content in interpolation mismatch');
	assert.strictEqual(lastCall.title, 'InterTitle', 'Paired shortcode title in interpolation mismatch');

	// Case 5: Async Paired Shortcode (Block Syntax)
	const slmSourceAsyncBlock = `
== myBoxAsync("BoxTitle")
  p Hello \${upper(name)}
`;
	const templateRendererAsyncBlock = compileFunction(slmSourceAsyncBlock, 'async_block.slm');
	const outputHTMLAsyncBlock = await templateRendererAsyncBlock({
		eleventy: { directories: { includes: '_includes' } },
		name: 'John'
	});
	assert.strictEqual(
		outputHTMLAsyncBlock.trim().replace(/\n/g, ''),
		'<div class="async-box" title="BoxTitle"><p>Hello JOHN</p></div>'
	);
	assert.strictEqual(lastCall.title, 'BoxTitle');

	// Case 6: Async Paired Shortcode (Traditional JS Syntax)
	const slmSourceAsyncJS = `
== myBoxAsync("JSContent", "JSTitle")
`;
	const templateRendererAsyncJS = compileFunction(slmSourceAsyncJS, 'async_js.slm');
	const outputHTMLAsyncJS = await templateRendererAsyncJS({
		eleventy: { directories: { includes: '_includes' } }
	});
	assert.strictEqual(outputHTMLAsyncJS.trim().replace(/\n/g, ''), '<div class="async-box" title="JSTitle">JSContent</div>');
	assert.strictEqual(lastCall.content, 'JSContent');

	// Case 7: Async Block Syntax with 3 Arguments
	const slmSourceAsyncBlock3 = `
== myBoxAsync("Title3", "ja")
  p こんにちは
`;
	const templateRendererAsyncBlock3 = compileFunction(slmSourceAsyncBlock3, 'async_block3.slm');
	const outputHTMLAsyncBlock3 = await templateRendererAsyncBlock3({
		eleventy: { directories: { includes: '_includes' } }
	});
	assert.strictEqual(
		outputHTMLAsyncBlock3.trim().replace(/\n/g, ''),
		'<div class="async-box" title="Title3" lang="ja"><p>こんにちは</p></div>'
	);
	assert.strictEqual(lastCall.lang, 'ja');

	// Case 8: Async Interpolation with Shortcode, Pipeline, and Paired Shortcode
	const slmSourceAsyncInterpolation = `
p \${=await myLinkAsync(author, './author.html')}
p \${await lowerAsync(name)}
p \${=await myBoxAsync('InterContent', 'InterTitle')}
`;
	const templateRendererAsyncInterpolation = compileFunction(slmSourceAsyncInterpolation, 'async_inter.slm');
	const outputHTMLAsyncInterpolation = await templateRendererAsyncInterpolation({
		eleventy: { directories: { includes: '_includes' } },
		name: 'JOHN',
		author: 'Ash'
	});
	assert.strictEqual(
		outputHTMLAsyncInterpolation.trim().replace(/\n/g, ''),
		'<p><a href="./author.html" class="async">Ash</a></p><p>john</p><p><div class="async-box" title="InterTitle">InterContent</div></p>',
		'Async interpolation failed'
	);
	assert.strictEqual(lastCall.content, 'InterContent');

	// Case 9: this context in Paired Shortcode (Block syntax)
	// Testing if this.page.url is accessible inside a paired shortcode
	const slmSourceContextPaired = `
== myBox("CtxTitle")
  p URL is \${this.page.url}
`;
	const templateRendererContextPaired = compileFunction(slmSourceContextPaired, 'ctx_paired.slm');
	const outputHTMLContextPaired = await templateRendererContextPaired({
		eleventy: { directories: { includes: '_includes' } },
		page: { url: '/test-url/' }
	});
	assert.ok(outputHTMLContextPaired.includes('URL is /test-url/'), 'this.page.url should be accessible in paired shortcode block');

	// Case 10: this context in Filter
	// Mock a filter that accesses this context
	const contextFilter = function(val) {
		return val + ":" + this.page.url;
	};
	// Re-initialize plugin to include the new filter in mock config
	const eleventyConfigCtx = {
		...eleventyConfig,
		getFilters: () => ({ ...eleventyConfig.getFilters(), ctx: contextFilter })
	};
	EleventyPluginSlm(eleventyConfigCtx);
	// We need to re-capture compileFunction since EleventyPluginSlm was called again
	let compileFunctionCtx = null;
	eleventyConfigCtx.addExtension = (exts, opts) => { compileFunctionCtx = opts.compile; };
	EleventyPluginSlm(eleventyConfigCtx);

	const slmSourceContextFilter = `p \${'val' | ctx}`;
	const templateRendererContextFilter = compileFunctionCtx(slmSourceContextFilter, 'ctx_filter.slm');
	const outputHTMLContextFilter = await templateRendererContextFilter({
		eleventy: { directories: { includes: '_includes' } },
		page: { url: '/filter-url/' }
	});
	assert.ok(outputHTMLContextFilter.includes('val:/filter-url/'), 'this.page.url should be accessible in filters');

	// Case 11: Error handling for undefined filters
	const slmSourceError = `p \${undefinedFilter(name)}`;
	const templateRendererError = compileFunction(slmSourceError, 'error.slm');
	try {
		await templateRendererError({
			eleventy: { directories: { includes: '_includes' } },
			name: 'John'
		});
		assert.fail('Should have thrown an error for undefined filter');
	} catch (e) {
		assert.ok(e instanceof Error, 'Should throw an Error');
		// Slm-neo or JS will throw ReferenceError: undefinedFilter is not defined
	}

	console.log('✅ All tests passed successfully!');
}

runTests().catch(err => {
	console.error('❌ Test failed:', err);
	process.exit(1);
});
