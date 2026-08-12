import slm from 'slm-neo';
const renderAsync = slm.renderAsync;

export function compile(compileOptions, slmOptions) {

	return function (inputSource, inputPath) {
		return async (data) => {
			const renderModels = {
				filename: inputPath,
				pathPrefix: compileOptions.pathPrefix,
				filters: compileOptions.filters,
				...data
			};

			// Bind each filter to the current renderModels context so filters can access this.page, etc.
			if (renderModels.filters) {
				const boundFilters = {};
				for (const name in renderModels.filters) {
					boundFilters[name] = renderModels.filters[name].bind(renderModels);
				}
				renderModels.filters = boundFilters;
			}

			const renderOptions = {
				filename: inputPath,
				basePath: data.eleventy.directories.includes,
				format: "html",
				...slmOptions
			};
			try {
				const html = await renderAsync(inputSource, renderModels, renderOptions);
				return html;
			} catch (e) {
				console.error(`Error rendering ${inputPath}:`, e);
				throw e;
			}
		};
	}
}
