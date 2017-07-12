import * as cssNodeExtract from 'css-node-extract';
import * as cssSelectorExtract from 'css-selector-extract';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as postcssScss from 'postcss-scss';
import * as resolve from 'resolve';

import { buildIncludePathsFactory } from './functions/build-include-paths';
import { cleanImportUrlFactory } from './functions/clean-import-url';
import { escapeSelectorFactory } from './functions/escape-selector';
import { extractNodesFactory } from './functions/extract-nodes';
import { extractSelectorsFactory } from './functions/extract-selectors';
import { parseNodeFiltersFactory } from './functions/parse-node-filters';
import { parseSelectorFiltersFactory } from './functions/parse-selector-filters';
import { processRawSelectorFiltersFactory } from './functions/process-raw-selector-filters';
import { resolveGlobUrlFactory } from './functions/resolve-glob-url';
import { resolvePackageKeyFactory } from './functions/resolve-package-key';
import { resolvePackageUrlFactory } from './functions/resolve-package-url';
import { resolveUrlFactory } from './functions/resolve-url';
import { sassGlobPatternFactory } from './functions/sass-glob-pattern';
import { sassUrlVariantsFactory } from './functions/sass-url-variants';
import { splitSelectorFilterFactory } from './functions/split-selector-filter';

// Import interfaces to help TypeScript build the definitions.
import { ISelectorFilter, ISelectorFilterRaw } from './interfaces/ISelectorFilter';

export const buildIncludePaths = buildIncludePathsFactory(path);
export const cleanImportUrl = cleanImportUrlFactory();
export const escapeSelector = escapeSelectorFactory();
export const extractNodes = extractNodesFactory(cssNodeExtract, fs, postcssScss);
export const extractSelectors = extractSelectorsFactory(cssSelectorExtract, fs, postcssScss);
export const parseNodeFilters = parseNodeFiltersFactory();
export const processRawSelectorFilters = processRawSelectorFiltersFactory(escapeSelector);
export const resolvePackageKey = resolvePackageKeyFactory();
export const sassGlobPattern = sassGlobPatternFactory(path);
export const sassUrlVariants = sassUrlVariantsFactory(path);
export const resolveGlobUrl = resolveGlobUrlFactory(glob, path);
export const resolvePackageUrl = resolvePackageUrlFactory(resolve, resolvePackageKey, sassUrlVariants);
export const resolveUrl = resolveUrlFactory(glob, path, sassGlobPattern);
export const splitSelectorFilter = splitSelectorFilterFactory();
export const parseSelectorFilters = parseSelectorFiltersFactory(
  processRawSelectorFilters,
  splitSelectorFilter,
);
