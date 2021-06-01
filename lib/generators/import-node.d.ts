import * as ts from 'typescript';
export declare function generateImportNode(
  pkg: string,
  namedImports: Record<string, string>,
  defaultImportName?: string
): ts.ImportDeclaration;
