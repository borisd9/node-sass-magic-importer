/**
 * node-sass-magic-importer
 */
// import cssSelectorExtract from 'css-selector-extract';
// import findup from 'findup-sync';
// import fs from 'fs';
import glob from 'glob';
import path from 'path';

export class NodeSassMagicImporter {
  constructor() {
  }

  _parseUrl(url) {
    let selectorFilterMatch = url.match(/{([^}]+)}/);
    let selectorFilters = [];
    let selectorReplacements = {};
    let prioritizeModuleResolve = false;

    if (selectorFilterMatch) {
      let filterString = selectorFilterMatch[1];
      let filtersAndReplacements = filterString.split(',');
      // Trim unnecessary whitespace.
      filtersAndReplacements = filtersAndReplacements.map(Function.prototype.call, String.prototype.trim);
      // Split selectors and replacement selectors into an array.
      filtersAndReplacements.forEach((currentValue, index) => {
        let filterAndReplacement = currentValue.split(' as ').map(Function.prototype.call, String.prototype.trim);
        let selector = filterAndReplacement[0];
        let replacement = filterAndReplacement[1] || null;
        selectorFilters.push(selector);
        if (replacement) {
          selectorReplacements[selector] = replacement;
        }
      });

      // Remove EOL and split into filters and url.
      url = url.replace(/(\r\n|\n|\r)/gm, ' ').split(' from ')[1].trim();
    }

    if (url.charAt(0) == '~') {
      url = url.slice(1);
      prioritizeModuleResolve = true;
    }

    return {
      url: url,
      selectorFilters: selectorFilters,
      selectorReplacements: selectorReplacements,
      prioritizeModuleResolve: prioritizeModuleResolve
    };
  }

  _resolveGlob(url, includePaths = [process.cwd()]) {
    if (glob.hasMagic(url)) {
      let imports = [];
      includePaths.some((includePath) => {
        let files = glob.sync(url, { cwd: includePath });
        files.forEach((file) => {
          imports.push(`@import '${path.join(includePath, file)}';`);
        });
        if (files.length) {
          return true;
        }
      });
      return imports.join('\n');
    }
    return false;
  }

  _resolveModule(url, cwd = process.cwd()) {
    return new Promise((promiseResolve, promiseReject) => {
      let resolvedUrl;
      let parsedUrl = path.parse(url);
      let urlArray = url.split('/');
      let moduleName = urlArray[0];
      if (urlArray.length == 1) {
        // Only module name given, search for style file
        // in the package.json of the module.
        let globResult = glob.sync(path.join('**', moduleName, 'package.json'), { cwd: path.join(cwd, 'node_modules') });
        if (globResult.length) {
          let packagePath = path.join(cwd, 'node_modules', globResult[0]);
          let packageJson = require(packagePath);
          let fileName = packageJson.sass || packageJson['main.sass'] || packageJson['main.scss'] || packageJson.style || 'index.scss';
          resolvedUrl = path.join(path.dirname(packagePath), fileName);
        }
      } else if (!parsedUrl.ext) {
        // No file ending provided, assume SASS partial naming.
        let partialFileName = `?(_)${parsedUrl.name}.@(scss|sass|css)`;
        let globPattern = path.join(parsedUrl.dir, partialFileName);
        let globResult = glob.sync(path.join('**', globPattern), { cwd: path.join(cwd, 'node_modules') });
        if (globResult.length) {
          resolvedUrl = path.join(cwd, 'node_modules', globResult[0]);
        }
      } else {
        // Load given file from module.
        let globResult = glob.sync(path.join('**', url), { cwd: path.join(cwd, 'node_modules') });
        if (globResult.length) {
          resolvedUrl = path.join(cwd, 'node_modules', globResult[0]);
        }
      }
      // Finish the promise call.
      if (resolvedUrl) {
        promiseResolve(resolvedUrl);
      } else {
        promiseReject(`Module path "${url}" could not be resolved.`);
      }
    });
  }

  _importOnceTrack() {

  }

  _importOnceCheck() {

  }

  _selectorFilter() {

  }

  importer() {
  }
}

const nodeSassMagicImporter = new NodeSassMagicImporter();
export default nodeSassMagicImporter.importer();

// class NodeSassMagicImporter {
//   constructor() {
//     // Keep track of imported files for each importer instance.
//     this.importedSets = new Map();

//     // Default options.
//     this.defaultOptions = {
//       importOnce: true,
//       cssImport: true,
//       extensions: ['.scss']
//     };
//     this.customOptions = {};
//     this.options = {};
//   }

//   importer() {
//     const self = this;

//     return function (url, prev, done) {
//       const nodeSassImporter = this;

//       // Set configurations options.
//       const magicImporterOptions = nodeSassImporter.options.magicImporter;
//       self._configure(magicImporterOptions);

//       // Keep track of imported files.
//       if (!self.importedSets.has(nodeSassImporter.options.importer)) {
//         self.importedSets.set(nodeSassImporter.options.importer, new Set());
//       }
//       const importedFiles = self.importedSets.get(nodeSassImporter.options.importer);

//       // Get a clean url (without selector filters) and
//       // the selector filters from the import url.
//       let { cleanUrl, selectorFilters, prioritizeModules } = self._parseUrl(url);

//       // Create a set of all paths to search for files.
//       const includePaths = new Set();
//       if (path.isAbsolute(prev)) {
//         includePaths.add(path.dirname(prev));
//       }
//       includePaths.add(...nodeSassImporter.options.includePaths.split(path.delimiter));

//       // Check if it is a glob url.
//       if (glob.hasMagic(cleanUrl)) {
//         const imports = [];
//         let selectorFiltersString = '';
//         if (selectorFilters) {
//           selectorFiltersString = `{ ${selectorFilters.map((filter) => filter.join(' as ')).join(',')} } from `;
//         }
//         [...includePaths].some((includePath) => {
//           let files = glob.sync(cleanUrl, { cwd: includePath });
//           files.forEach((file) => {
//             imports.push(`@import "${selectorFiltersString}${prioritizeModules ? '~' : ''}${path.join(includePath, file)}";`);
//           });
//           if (files.length) {
//             return true;
//           }
//         });
//         done({
//           contents: imports.join(this.options.linefeed)
//         });
//         return;
//       }

//       // Find the absolute file path.
//       let filePath;
//       if (prioritizeModules) {
//         filePath = self._getModuleFilePath(cleanUrl) || self._getFilePath(cleanUrl, includePaths);
//       } else {
//         filePath = self._getFilePath(cleanUrl, includePaths) || self._getModuleFilePath(cleanUrl);
//       }

//       // Check if the file is already imported.
//       if (self.options.importOnce && (importedFiles.has(filePath) || importedFiles.has(cleanUrl))) {
//         done({
//           file: '',
//           contents: ''
//         });
//         return;
//       }

//       // If the importer can not find the file,
//       // we return the url and wish node-sass more luck.
//       if (!filePath) {
//         // Add the url to the imported urls.
//         importedFiles.add(cleanUrl);
//         done({
//           file: cleanUrl
//         });
//         return;
//       }

//       // Use the file path as url.
//       cleanUrl = filePath;

//       // Add the url to the imported urls.
//       importedFiles.add(cleanUrl);

//       // Load the file contents if the file has a .css ending
//       // or selectors were found.
//       if (selectorFilters || (self.options.cssImport && path.parse(cleanUrl).ext == '.css')) {
//         let contents = fs.readFileSync(cleanUrl).toString();
//         // Filter and (optionally) replace selectors.
//         if (selectorFilters) {
//           let selectors = [];
//           let replacementSelectors = {};
//           selectorFilters.forEach((selectorArr) => {
//             selectors.push(selectorArr[0]);
//             if (selectorArr[1]) {
//               replacementSelectors[selectorArr[0]] = selectorArr[1];
//             }
//           });
//           contents = cssSelectorExtract.processSync(contents, selectors, replacementSelectors);
//         }
//         done({
//           contents: contents
//         });
//         return;
//       }

//       done({
//         file: cleanUrl
//       });
//       return;
//     };
//   }

//   // Find selectors in the import url and
//   // return a cleaned up url and the selectors.
//   _parseUrl(url) {
//     let cleanUrl = url;
//     let selectorFilters;
//     const selectorFiltersMatch = url.match(/{([^}]+)}/);
//     let prioritizeModules = false;
//     if (selectorFiltersMatch) {
//       cleanUrl = url.replace(/(\r\n|\n|\r)/gm, ' ').split(' from ')[1].trim();
//       // Create an array with selectors and replacement as one value.
//       selectorFilters = selectorFiltersMatch[1].split(',');
//       // Trim unnecessary whitespace.
//       selectorFilters = selectorFilters.map(Function.prototype.call, String.prototype.trim);
//       // Split selectors and replacement selectors into an array.
//       selectorFilters = selectorFilters.map((currentValue, index) => {
//         return currentValue.split(' as ').map(Function.prototype.call, String.prototype.trim);
//       });
//     }
//     if (cleanUrl.charAt(0) == '~') {
//       cleanUrl = cleanUrl.slice(1);
//       prioritizeModules = true;
//     }
//     return { cleanUrl, selectorFilters, prioritizeModules };
//   }

//   // Find the absolute path for a given url.
//   _getAbsoluteUrl(url, includePath) {
//     let absoluteUrl = url;
//     if (!path.isAbsolute(url)) {
//       absoluteUrl = path.join(includePath, url);
//     }
//     // Normalize a path, taking care of '..' and '.' parts.
//     absoluteUrl = path.normalize(absoluteUrl);
//     return absoluteUrl;
//   }

//   // Create possible variants of file paths
//   // with enabled extensions and partial prefix.
//   _getFilePathVariants(filePath) {
//     const filePathVariants = [];
//     const parsedFilePath = path.parse(filePath);
//     if (parsedFilePath.ext) {
//       filePathVariants.push(filePath);
//     } else {
//       this.options.extensions.forEach((extension) => {
//         filePathVariants.push(`${path.join(parsedFilePath.dir, parsedFilePath.base)}${extension}`);
//         filePathVariants.push(`${path.join(parsedFilePath.dir, '_' + parsedFilePath.base)}${extension}`);
//       });
//     }
//     return filePathVariants;
//   }

//   _getFilePath(url, includePaths) {
//     let absoluteFilePath;
//     let filePathVariants;
//     let filePath = false;
//     [...includePaths].some((includePath) => {
//       absoluteFilePath = this._getAbsoluteUrl(url, includePath);
//       filePathVariants = this._getFilePathVariants(absoluteFilePath);
//       return filePathVariants.some((filePathVariant) => {
//         if (fs.existsSync(filePathVariant)) {
//           filePath = filePathVariant;
//           return true;
//         }
//       });
//     });
//     return filePath;
//   }

//   _configure(magicImporterOptions) {
//     // Options.
//     this.customOptions = magicImporterOptions || {};
//     // Merge custom options with default options.
//     Object.assign(this.options, this.defaultOptions, this.customOptions);
//     // Add ".css" to the allowed extensions if CSS import is enabled.
//     if (this.options.cssImport && this.options.extensions.indexOf('.css') == -1) {
//       this.options.extensions.push('.css');
//     }
//   }
// }

// const nodeSassMagicImporter = new NodeSassMagicImporter();

// export default nodeSassMagicImporter.importer();
