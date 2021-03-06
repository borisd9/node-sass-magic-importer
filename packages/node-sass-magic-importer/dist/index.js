"use strict";
const cssNodeExtract = require("css-node-extract");
const cssSelectorExtract = require("css-selector-extract");
const fs = require("fs");
const getInstalledPath = require("get-installed-path");
const hash = require("object-hash");
const path = require("path");
const postcssSyntax = require("postcss-scss");
const default_options_1 = require("./default-options");
const toolbox_1 = require("./toolbox");
const EMPTY_IMPORT = {
    file: ``,
    contents: ``,
};
const DIRECTORY_SEPARATOR = `/`;
function getStoreId(resolvedUrl, selectorFilters = null, nodeFilters = null) {
    return hash({
        resolvedUrl,
        selectorFilters,
        nodeFilters,
    }, { unorderedArrays: true });
}
module.exports = function magicImporter(userOptions) {
    const options = Object.assign({}, default_options_1.defaultOptions, userOptions);
    if (options.hasOwnProperty(`prefix`)) {
        process.emitWarning('Using the `prefix` option is not supported anymore, use `packagePrefix` instead.');
    }
    if (options.hasOwnProperty(`inlcudePaths`)) {
        process.emitWarning('Using the `inlcudePaths` option is not supported anymore, Use the node-sass `includePaths` option instead.');
    }
    const escapedPackagePrefix = options.packagePrefix.replace(/[-/\\^$*+?.()|[\]{}]/g, `\\$&`);
    const matchPackageUrl = new RegExp(`^${escapedPackagePrefix}(?!/)`);
    return function importer(url, prev) {
        const nodeSassOptions = this.options;
        // Create a context for the current importer run.
        // An importer run is different from an importer instance,
        // one importer instance can spawn infinite importer runs.
        if (!this.nodeSassOnceImporterContext) {
            this.nodeSassOnceImporterContext = { store: new Set() };
        }
        // Each importer run has it's own new store, otherwise
        // files already imported in a previous importer run
        // would be detected as multiple imports of the same file.
        const store = this.nodeSassOnceImporterContext.store;
        const includePaths = toolbox_1.buildIncludePaths(nodeSassOptions.includePaths, prev);
        let data = null;
        let filterPrefix = ``;
        let filteredContents = null;
        let cleanedUrl = toolbox_1.cleanImportUrl(url);
        let resolvedUrl = null;
        const isPackageUrl = cleanedUrl.match(matchPackageUrl);
        if (isPackageUrl) {
            cleanedUrl = cleanedUrl.replace(matchPackageUrl, ``);
            const packageName = cleanedUrl.split(DIRECTORY_SEPARATOR)[0];
            const packagePath = getInstalledPath.sync(packageName, {
                cwd: options.cwd,
                local: true,
            });
            cleanedUrl = path.resolve(path.dirname(packagePath), cleanedUrl);
            resolvedUrl = toolbox_1.resolvePackageUrl(cleanedUrl, options.extensions, options.cwd, options.packageKeys);
            if (resolvedUrl) {
                data = { file: resolvedUrl };
            }
        }
        else {
            resolvedUrl = toolbox_1.resolveUrl(cleanedUrl, includePaths);
        }
        const nodeFilters = toolbox_1.parseNodeFilters(url);
        const selectorFilters = toolbox_1.parseSelectorFilters(url);
        const hasFilters = nodeFilters.length || selectorFilters.length;
        const globFilePaths = toolbox_1.resolveGlobUrl(cleanedUrl, includePaths);
        const storeId = getStoreId(resolvedUrl, selectorFilters, nodeFilters);
        if (hasFilters) {
            filterPrefix = `${url.split(` from `)[0]} from `;
        }
        if (globFilePaths.length) {
            const contents = globFilePaths
                .filter((x) => !store.has(getStoreId(x, selectorFilters, nodeFilters)))
                .map((x) => `@import '${filterPrefix}${x}';`)
                .join(`\n`);
            return { contents };
        }
        if (store.has(storeId)) {
            return EMPTY_IMPORT;
        }
        if (resolvedUrl && hasFilters) {
            filteredContents = fs.readFileSync(resolvedUrl, { encoding: `utf8` });
            if (selectorFilters.length) {
                filteredContents = cssSelectorExtract.processSync({
                    css: filteredContents,
                    filters: selectorFilters,
                    postcssSyntax,
                    preserveLines: true,
                });
            }
            if (nodeFilters.length) {
                filteredContents = cssNodeExtract.processSync({
                    css: filteredContents,
                    filters: nodeFilters,
                    customFilters: options.customFilters,
                    postcssSyntax,
                    preserveLines: true,
                });
            }
        }
        if (!options.disableImportOnce) {
            store.add(storeId);
        }
        if (filteredContents) {
            data = {
                file: resolvedUrl,
                contents: filteredContents,
            };
        }
        return data;
    };
};
//# sourceMappingURL=index.js.map