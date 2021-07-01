import { OpenAPIV3 } from 'openapi-types';
import { OperationDefinition, operationKeys } from '../types';

export function getOperationDefinitions(v3Doc: OpenAPIV3.Document, excludeMethods: Set<string>): OperationDefinition[] {
  const methods = new Set(operationKeys.filter((m) => !excludeMethods.has(m)));
  return Object.entries(v3Doc.paths).flatMap(([path, pathItem]) =>
    Object.entries(pathItem)
      .filter((arg): arg is [typeof operationKeys[number], OpenAPIV3.OperationObject] => methods.has(arg[0] as any))
      .map(([verb, operation]) => ({
        path,
        verb,
        pathItem,
        operation,
      }))
  );
}
