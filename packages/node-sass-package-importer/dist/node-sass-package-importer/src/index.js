"use strict";
const toolbox_1 = require("../../../packages/node-sass-magic-importer/dist/toolbox");
const default_options_1 = require("./default-options");
module.exports = function packageImporter(userOptions) {
    const options = Object.assign({}, default_options_1.defaultOptions, userOptions);
    if (options.hasOwnProperty(`prefix`)) {
        process.emitWarning('Using the `prefix` option is not supported anymore, use `packagePrefix` instead.');
    }
    const escapedPrefix = options.packagePrefix.replace(/[-/\\^$*+?.()|[\]{}]/g, `\\$&`);
    const matchPackageUrl = new RegExp(`^${escapedPrefix}(?!/)`);
    return function importer(url, prev) {
        const nodeSassOptions = this.options;
        if (!url.match(matchPackageUrl)) {
            return null;
        }
        const includePaths = toolbox_1.buildIncludePaths(nodeSassOptions.includePaths, prev);
        const cleanedUrl = url.replace(matchPackageUrl, ``);
        const file = toolbox_1.resolvePackageUrl(cleanedUrl, options.extensions, options.cwd, options.packageKeys);
        return file ? { file: file.replace(/\.css$/, ``) } : null;
    };
};
//# sourceMappingURL=index.js.map