import { ICustomFilter } from 'css-node-extract/src/interfaces/ICustomFilter';
export declare const defaultOptions: {
    cwd: string;
    extensions: string[];
    packageKeys: string[];
    packagePrefix: string;
    disableImportOnce: boolean;
    customFilters?: ICustomFilter[];
};
