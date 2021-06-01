import * as ts from 'typescript';
import { OperationDefinition } from '../types';
declare type GenerateReactHooksParams = {
  exportName: string;
  operationDefinitions: OperationDefinition[];
};
export declare const generateReactHooks: ({
  exportName,
  operationDefinitions,
}: GenerateReactHooksParams) => ts.VariableStatement;
export {};
