"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolvePackageUrlFactory(resolve, resolvePackageKey, sassUrlVariants) {
    return (url, extensions, cwd, packageKeys) => {
        let file = null;
        sassUrlVariants(url, extensions).some((urlVariant) => {
            try {
                const resolvedPath = resolve.sync(urlVariant, {
                    basedir: cwd,
                    packageFilter: (packageJson) => resolvePackageKey(packageJson, packageKeys),
                    extensions,
                });
                if (resolvedPath) {
                    file = resolvedPath;
                    return true;
                }
            }
            catch (e) {
                // Prevent the resolve module from throwing an
                // exception if no matching package is found.
            }
            return false;
        });
        return file;
    };
}
exports.resolvePackageUrlFactory = resolvePackageUrlFactory;
//# sourceMappingURL=resolve-package-url.js.map