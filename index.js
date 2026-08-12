import slm from 'slm-neo';
import { compile as slmCompile } from './extension.js';

export default function EleventyPluginSlm(eleventyConfig, slmOptions = {}) {

	eleventyConfig.addTemplateFormats(['slm', 'slim']);

	const originalPairedShortcodes = eleventyConfig.getPairedShortcodes() || {};
	const wrappedPairedShortcodes = {};

	for (const [name, func] of Object.entries(originalPairedShortcodes)) {
		wrappedPairedShortcodes[name] = function(...args) {
			const cb = args[args.length - 1];
			
			// Slm passes a callback function as the last argument for indented blocks.
			// If the last argument is a function, we assume it's a Slm block call.
			if (typeof cb === 'function') {
				return slm.yieldBlock(this, cb, async (content) => {
					// (content, ...remaining_args)
					return slm.safe(await func.apply(this, [content, ...args.slice(0, -1)]));
				});
			}

			// If not a function, it's a traditional JS-style call: (content, ...args)
			// These are already in the correct order in args.
			const result = func.apply(this, args);
			return (result instanceof Promise) ? result.then(v => slm.safe(v)) : slm.safe(result);
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

	const slmOpts = {
		helpersName: 'filters',
		...slmOptions
	};

	eleventyConfig.addExtension(['slm', 'slim'], {
		outputFileExtension: 'html',
		compile: slmCompile(compilerOptions, slmOpts)
	});
}
