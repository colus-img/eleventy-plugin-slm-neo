import { compile as slmCompile } from './extension.js';

export default function EleventyPluginSlm(eleventyConfig, slmOptions = {}) {

	eleventyConfig.addTemplateFormats(['slm', 'slim']);

	const originalPairedShortcodes = eleventyConfig.getPairedShortcodes() || {};
	const wrappedPairedShortcodes = {};

	for (const [name, func] of Object.entries(originalPairedShortcodes)) {
		wrappedPairedShortcodes[name] = function(...args) {
			const cb = args[args.length - 1];
			let content = "";
			
			// Slm passes a callback function as the last argument for indented blocks
			if (typeof cb === 'function') {
				content = cb.call(this);
				args.pop();
			}

			// Eleventy paired shortcodes expect (content, ...args)
			return func(content, ...args);
		};
	}

	const allFilters = {
		...(eleventyConfig.getFilters() || {}),
		...(eleventyConfig.getShortcodes() || {}),
		...wrappedPairedShortcodes,
	};

	const compilerOptions = {
		filters: allFilters,
		pathPrefix: eleventyConfig.pathPrefix,
	};

	eleventyConfig.addExtension(['slm', 'slim'], {
		outputFileExtension: 'html',
		compile: slmCompile(compilerOptions, slmOptions)
	});
}
