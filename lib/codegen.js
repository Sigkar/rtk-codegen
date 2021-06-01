'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.generateEndpointDefinition = exports.generateCreateApiCall = exports.generateImportNode = exports.generateStringLiteralArray = exports.generateObjectProperties = void 0;
const ts = __importStar(require('typescript'));
const { factory } = ts;
const defaultEndpointBuilder = factory.createIdentifier('build');
function generateObjectProperties(obj) {
  return Object.entries(obj).map(([k, v]) => factory.createPropertyAssignment(factory.createIdentifier(k), v));
}
exports.generateObjectProperties = generateObjectProperties;
function generateStringLiteralArray(arr) {
  return factory.createArrayLiteralExpression(
    arr.map((elem) => factory.createStringLiteral(elem)),
    false
  );
}
exports.generateStringLiteralArray = generateStringLiteralArray;
function generateImportNode(pkg, namedImports, defaultImportName) {
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      false,
      defaultImportName !== undefined ? factory.createIdentifier(defaultImportName) : undefined,
      factory.createNamedImports(
        Object.entries(namedImports).map(([propertyName, name]) =>
          factory.createImportSpecifier(
            name === propertyName ? undefined : factory.createIdentifier(propertyName),
            factory.createIdentifier(name)
          )
        )
      )
    ),
    factory.createStringLiteral(pkg)
  );
}
exports.generateImportNode = generateImportNode;
function generateCreateApiCall({
  exportName,
  reducerPath,
  createApiFn,
  baseQuery,
  tagTypes,
  endpointBuilder = defaultEndpointBuilder,
  endpointDefinitions,
}) {
  return factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(exportName),
          undefined,
          undefined,
          factory.createCallExpression(createApiFn, undefined, [
            factory.createObjectLiteralExpression(
              generateObjectProperties({
                ...(!reducerPath ? {} : { reducerPath: factory.createStringLiteral(reducerPath) }),
                baseQuery,
                tagTypes,
                endpoints: factory.createArrowFunction(
                  undefined,
                  undefined,
                  [
                    factory.createParameterDeclaration(
                      undefined,
                      undefined,
                      undefined,
                      endpointBuilder,
                      undefined,
                      undefined,
                      undefined
                    ),
                  ],
                  undefined,
                  factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                  factory.createParenthesizedExpression(endpointDefinitions)
                ),
              }),
              true
            ),
          ])
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}
exports.generateCreateApiCall = generateCreateApiCall;
function generateEndpointDefinition({
  operationName,
  type,
  Response,
  QueryArg,
  queryFn,
  endpointBuilder = defaultEndpointBuilder,
  extraEndpointsProps,
}) {
  return factory.createPropertyAssignment(
    factory.createIdentifier(operationName),
    factory.createCallExpression(
      factory.createPropertyAccessExpression(endpointBuilder, factory.createIdentifier(type)),
      [Response, QueryArg],
      [
        factory.createObjectLiteralExpression(
          generateObjectProperties({ query: queryFn, ...extraEndpointsProps }),
          true
        ),
      ]
    )
  );
}
exports.generateEndpointDefinition = generateEndpointDefinition;
//# sourceMappingURL=codegen.js.map
