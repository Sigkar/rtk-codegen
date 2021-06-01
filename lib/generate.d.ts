import { GenerationOptions } from './types';
export declare function generateApi(
  spec: string,
  {
    exportName,
    reducerPath,
    baseQuery,
    argSuffix,
    responseSuffix,
    baseUrl,
    hooks,
    outputFile,
    isDataResponse,
    compilerOptions,
  }: GenerationOptions
): Promise<string>;
