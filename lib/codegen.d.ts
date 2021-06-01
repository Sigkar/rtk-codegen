import * as ts from 'typescript';
export declare type ObjectPropertyDefinitions = Record<string, ts.Expression>;
export declare function generateObjectProperties(obj: ObjectPropertyDefinitions): ts.PropertyAssignment[];
export declare function generateStringLiteralArray(arr: string[]): ts.ArrayLiteralExpression;
export declare function generateImportNode(
  pkg: string,
  namedImports: Record<string, string>,
  defaultImportName?: string
): ts.ImportDeclaration;
export declare function generateCreateApiCall({
  exportName,
  reducerPath,
  createApiFn,
  baseQuery,
  tagTypes,
  endpointBuilder,
  endpointDefinitions,
}: {
  exportName: string;
  reducerPath?: string;
  createApiFn: ts.Expression;
  baseQuery: ts.Expression;
  tagTypes: ts.Expression;
  endpointBuilder?: ts.Identifier;
  endpointDefinitions: ts.ObjectLiteralExpression;
}): ts.VariableStatement;
export declare function generateEndpointDefinition({
  operationName,
  type,
  Response,
  QueryArg,
  queryFn,
  endpointBuilder,
  extraEndpointsProps,
}: {
  operationName: string;
  type: 'query' | 'mutation';
  Response: ts.TypeReferenceNode;
  QueryArg: ts.TypeReferenceNode;
  queryFn: ts.Expression;
  endpointBuilder?: ts.Identifier;
  extraEndpointsProps: ObjectPropertyDefinitions;
}): ts.PropertyAssignment;
