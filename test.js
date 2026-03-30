import assert from 'node:assert/strict';
import EleventyPluginSlm from './index.js';

async function runTests() {
	console.log('Starting eleventy-plugin-slm-neo sanity tests...');

	// 1. Mock 11ty Shortcodes and Filters
	const dummyPairedShortcode = (content, title) => {
		return `<div class="box" title="${title}">${content}</div>`;
	};

	const dummyShortcode = (linkText, url) => {
		return `<a href="${url}">${linkText}</a>`;
	};

	const dummyFilter = (str) => str.toUpperCase();

	// 2. Mock 11ty Configuration Object
	let compileFunction = null;
	const eleventyConfig = {
		addTemplateFormats: () => {},
		addExtension: (exts, opts) => {
			// Capture the compile function that the plugin provides to 11ty
			compileFunction = opts.compile;
		},
		getFilters: () => ({ upper: dummyFilter }),
		getShortcodes: () => ({ myLink: dummyShortcode }),
		getPairedShortcodes: () => ({ myBox: dummyPairedShortcode }),
		pathPrefix: '/'
	};

	// 3. Initialize plugin
	EleventyPluginSlm(eleventyConfig);
	assert.ok(compileFunction !== null, 'compile function should be registered via addExtension');

	// 4. Test Slm Compilation & Rendering
	const slmSource = `
== this.filters.myBox("BoxTitle")
  p Hello \${this.filters.upper(this.name)}
== this.filters.myLink("Click Here", "/about")
`;

	// The compile function returned to 11ty takes (inputSource, inputPath)
	// and returns an async rendering function.
	const templateRenderer = compileFunction(slmSource, 'test.slm');

	// 5. Render with Mock Data
	const outputHTML = await templateRenderer({
		eleventy: { directories: { includes: '_includes' } },
		name: 'John'
	});

	// 6. Assertions
	const expectedHTML = `&lt;div class=&quot;box&quot; title=&quot;BoxTitle&quot;&gt;&lt;p&gt;Hello JOHN&lt;/p&gt;&lt;/div&gt;<a href="/about">Click Here</a>`;
	
	assert.strictEqual(
		outputHTML.trim().replace(/\\n/g, ''), 
		expectedHTML.trim(),
		'Rendered HTML did not match expected output'
	);

	console.log('✅ All tests passed successfully!');
}

runTests().catch(err => {
	console.error('❌ Test failed:', err);
	process.exit(1);
});
