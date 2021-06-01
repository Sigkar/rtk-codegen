import * as ts from 'typescript';
declare type SmartGenerateImportNode = {
  moduleName: string;
  containingFile?: string;
  targetName: string;
  targetAlias: string;
  compilerOptions?: ts.CompilerOptions;
};
export declare const generateSmartImportNode: ({
  moduleName,
  containingFile,
  targetName,
  targetAlias,
  compilerOptions,
}: SmartGenerateImportNode) => ts.ImportDeclaration;
export {};
