"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolveGlobUrlFactory(glob, path) {
    return (url, includePaths = []) => {
        const filePaths = new Set();
        if (glob.hasMagic(url)) {
            includePaths.forEach((includePath) => {
                const globPaths = glob.sync(url, { cwd: includePath });
                globPaths.forEach((relativePath) => {
                    filePaths.add(path.resolve(includePath, relativePath)
                        .split(`\\`).join(`/`));
                });
            });
        }
        return [...filePaths];
    };
}
exports.resolveGlobUrlFactory = resolveGlobUrlFactory;
//# sourceMappingURL=resolve-glob-url.js.map