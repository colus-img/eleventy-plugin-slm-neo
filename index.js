import { compile as slmCompile } from './extension.js';

export default function EleventyPluginSlm(eleventyConfig, slmOptions = {}) {

	eleventyConfig.addTemplateFormats(['slm', 'slim']);

	const allFilters = {
		...(eleventyConfig.getFilters() || {}),
		...(eleventyConfig.getShortcodes() || {}),
		...(eleventyConfig.getPairedShortcodes() || {}),
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
