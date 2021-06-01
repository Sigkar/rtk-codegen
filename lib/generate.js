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
exports.generateApi = void 0;
const ts = __importStar(require('typescript'));
const path = __importStar(require('path'));
const lodash_1 = require('lodash');
const generate_1 = __importStar(require('oazapfts/lib/codegen/generate'));
const tscodegen_1 = require('oazapfts/lib/codegen/tscodegen');
const react_hooks_1 = require('./generators/react-hooks');
const utils_1 = require('./utils');
const codegen_1 = require('./codegen');
const smart_import_node_1 = require('./generators/smart-import-node');
const import_node_1 = require('./generators/import-node');
const { factory } = ts;
function defaultIsDataResponse(code) {
  const parsedCode = Number(code);
  return !Number.isNaN(parsedCode) && parsedCode >= 200 && parsedCode < 300;
}
let customBaseQueryNode;
let moduleName;
async function generateApi(
  spec,
  {
    exportName = 'api',
    reducerPath,
    baseQuery = 'fetchBaseQuery',
    argSuffix = 'ApiArg',
    responseSuffix = 'ApiResponse',
    baseUrl,
    hooks,
    outputFile,
    isDataResponse = defaultIsDataResponse,
    compilerOptions,
  }
) {
  var _a, _b;
  const v3Doc = await utils_1.getV3Doc(spec);
  if (typeof baseUrl !== 'string') {
    baseUrl =
      (_b = (_a = v3Doc.servers) === null || _a === void 0 ? void 0 : _a[0].url) !== null && _b !== void 0
        ? _b
        : 'https://example.com';
  } else if (baseQuery !== 'fetchBaseQuery') {
    console.warn(utils_1.MESSAGES.BASE_URL_IGNORED);
  }
  const apiGen = new generate_1.default(v3Doc, {});
  const operationDefinitions = utils_1.getOperationDefinitions(v3Doc);
  const resultFile = ts.createSourceFile(
    'someFileName.ts',
    '',
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const interfaces = {};
  function registerInterface(declaration) {
    const name = declaration.name.escapedText.toString();
    if (name in interfaces) {
      throw new Error(`interface/type alias ${name} already registered`);
    }
    interfaces[name] = declaration;
    return declaration;
  }
  /**
   * --baseQuery handling
   * 1. If baseQuery is specified, we confirm that the file exists
   * 2. If there is a seperator in the path, file presence + named function existence is verified.
   * 3. If there is a not a seperator, file presence + default export existence is verified.
   */
  if (outputFile) {
    outputFile = path.resolve(process.cwd(), outputFile);
  }
  // If a baseQuery was specified as an arg, we try to parse and resolve it. If not, fallback to `fetchBaseQuery` or throw when appropriate.
  let targetName = 'default';
  if (baseQuery !== 'fetchBaseQuery') {
    if (baseQuery.includes(':')) {
      // User specified a named function
      [moduleName, baseQuery] = baseQuery.split(':');
      if (!baseQuery) {
        throw new Error(utils_1.MESSAGES.NAMED_EXPORT_MISSING);
      }
      targetName = baseQuery;
    } else {
      moduleName = baseQuery;
      baseQuery = 'customBaseQuery';
    }
    customBaseQueryNode = smart_import_node_1.generateSmartImportNode({
      moduleName,
      containingFile: outputFile,
      targetName,
      targetAlias: baseQuery,
      compilerOptions,
    });
  }
  const fetchBaseQueryCall = factory.createCallExpression(factory.createIdentifier('fetchBaseQuery'), undefined, [
    factory.createObjectLiteralExpression(
      [factory.createPropertyAssignment(factory.createIdentifier('baseUrl'), factory.createStringLiteral(baseUrl))],
      false
    ),
  ]);
  const isUsingFetchBaseQuery = baseQuery === 'fetchBaseQuery';
  function getBasePackageImportsFromOptions() {
    return hooks
      ? {
          ...(isUsingFetchBaseQuery ? { fetchBaseQuery: 'fetchBaseQuery' } : {}),
        }
      : {
          createApi: 'createApi',
          ...(isUsingFetchBaseQuery ? { fetchBaseQuery: 'fetchBaseQuery' } : {}),
        };
  }
  const hasBasePackageImports = Object.keys(getBasePackageImportsFromOptions()).length > 0;
  const sourceCode = printer.printNode(
    ts.EmitHint.Unspecified,
    factory.createSourceFile(
      [
        // If hooks are specified, we need to import them from the react entry point
        ...(hooks
          ? [
              import_node_1.generateImportNode('@reduxjs/toolkit/query/react', {
                createApi: 'createApi',
              }),
            ]
          : []),
        ...(hasBasePackageImports
          ? [import_node_1.generateImportNode('@reduxjs/toolkit/query', getBasePackageImportsFromOptions())]
          : []),
        ...(customBaseQueryNode ? [customBaseQueryNode] : []),
        codegen_1.generateCreateApiCall({
          exportName,
          reducerPath,
          createApiFn: factory.createIdentifier('createApi'),
          baseQuery: isUsingFetchBaseQuery ? fetchBaseQueryCall : factory.createIdentifier(baseQuery),
          tagTypes: generateTagTypes({ v3Doc, operationDefinitions }),
          endpointDefinitions: factory.createObjectLiteralExpression(
            operationDefinitions.map((operationDefinition) =>
              generateEndpoint({
                operationDefinition,
              })
            ),
            true
          ),
        }),
        ...Object.values(interfaces),
        ...apiGen['aliases'],
        ...(hooks ? [react_hooks_1.generateReactHooks({ exportName, operationDefinitions })] : []),
      ],
      factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None
    ),
    resultFile
  );
  return sourceCode;
  function generateTagTypes(_) {
    return codegen_1.generateStringLiteralArray([]); // TODO
  }
  function generateEndpoint({ operationDefinition }) {
    const {
      verb,
      path,
      pathItem,
      operation,
      operation: { responses, requestBody },
    } = operationDefinition;
    const _isQuery = utils_1.isQuery(verb);
    const returnsJson = apiGen.getResponseType(responses) === 'json';
    let ResponseType = factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    if (returnsJson) {
      const returnTypes = Object.entries(responses || {})
        .map(([code, response]) => [
          code,
          apiGen.resolve(response),
          apiGen.getTypeFromResponse(response) || factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
        ])
        .filter(([status, response]) => isDataResponse(status, apiGen.resolve(response), responses || {}))
        .map(([code, response, type]) =>
          ts.addSyntheticLeadingComment(
            { ...type },
            ts.SyntaxKind.MultiLineCommentTrivia,
            `* status ${code} ${response.description} `,
            false
          )
        )
        .filter((type) => type !== tscodegen_1.keywordType.void);
      if (returnTypes.length > 0) {
        ResponseType = factory.createUnionTypeNode(returnTypes);
      }
    }
    const ResponseTypeName = factory.createTypeReferenceNode(
      registerInterface(
        factory.createTypeAliasDeclaration(
          undefined,
          [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          utils_1.capitalize(generate_1.getOperationName(verb, path, operation.operationId) + responseSuffix),
          undefined,
          ResponseType
        )
      ).name
    );
    const parameters = generate_1.supportDeepObjects([
      ...apiGen.resolveArray(pathItem.parameters),
      ...apiGen.resolveArray(operation.parameters),
    ]);
    const queryArg = {};
    for (const param of parameters) {
      let name = lodash_1.camelCase(param.name);
      queryArg[param.name] = {
        origin: 'param',
        name,
        originalName: param.name,
        type: apiGen.getTypeFromSchema(generate_1.isReference(param) ? param : param.schema),
        required: param.required,
        param,
      };
    }
    if (requestBody) {
      const body = apiGen.resolve(requestBody);
      const schema = apiGen.getSchemaFromContent(body.content);
      const type = apiGen.getTypeFromSchema(schema);
      const schemaName = lodash_1.camelCase(type.name || generate_1.getReferenceName(schema) || 'body');
      let name = schemaName in queryArg ? 'body' : schemaName;
      while (name in queryArg) {
        name = '_' + name;
      }
      queryArg[schemaName] = {
        origin: 'body',
        name,
        originalName: schemaName,
        type: apiGen.getTypeFromSchema(schema),
        required: true,
        body,
      };
    }
    // TODO strip param names where applicable
    //const stripped = camelCase(param.name.replace(/.+\./, ""));
    const propertyName = (name) => {
      if (typeof name === 'string') {
        return tscodegen_1.isValidIdentifier(name) ? factory.createIdentifier(name) : factory.createStringLiteral(name);
      }
      return name;
    };
    const QueryArg = factory.createTypeReferenceNode(
      registerInterface(
        factory.createTypeAliasDeclaration(
          undefined,
          [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          utils_1.capitalize(generate_1.getOperationName(verb, path, operation.operationId) + argSuffix),
          undefined,
          factory.createTypeLiteralNode(
            Object.entries(queryArg).map(([name, def]) => {
              const comment = def.origin === 'param' ? def.param.description : def.body.description;
              const node = factory.createPropertySignature(
                undefined,
                propertyName(name),
                tscodegen_1.createQuestionToken(!def.required),
                def.type
              );
              if (comment) {
                return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, `* ${comment} `, true);
              }
              return node;
            })
          )
        )
      ).name
    );
    return codegen_1.generateEndpointDefinition({
      operationName: generate_1.getOperationName(verb, path, operation.operationId),
      type: _isQuery ? 'query' : 'mutation',
      Response: ResponseTypeName,
      QueryArg,
      queryFn: generateQueryFn({ operationDefinition, queryArg }),
      extraEndpointsProps: _isQuery
        ? generateQueryEndpointProps({ operationDefinition })
        : generateMutationEndpointProps({ operationDefinition }),
    });
  }
  function generateQueryFn({ operationDefinition, queryArg }) {
    const { path, verb } = operationDefinition;
    const pathParameters = Object.values(queryArg).filter((def) => def.origin === 'param' && def.param.in === 'path');
    const queryParameters = Object.values(queryArg).filter((def) => def.origin === 'param' && def.param.in === 'query');
    const headerParameters = Object.values(queryArg).filter(
      (def) => def.origin === 'param' && def.param.in === 'header'
    );
    const cookieParameters = Object.values(queryArg).filter(
      (def) => def.origin === 'param' && def.param.in === 'cookie'
    );
    const bodyParameter = Object.values(queryArg).find((def) => def.origin === 'body');
    const rootObject = factory.createIdentifier('queryArg');
    return factory.createArrowFunction(
      undefined,
      undefined,
      Object.keys(queryArg).length
        ? [
            factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              rootObject,
              undefined,
              undefined,
              undefined
            ),
          ]
        : [],
      undefined,
      factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      factory.createParenthesizedExpression(
        factory.createObjectLiteralExpression(
          [
            factory.createPropertyAssignment(
              factory.createIdentifier('url'),
              generatePathExpression(path, pathParameters, rootObject)
            ),
            utils_1.isQuery(verb)
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('method'),
                  factory.createStringLiteral(verb.toUpperCase())
                ),
            bodyParameter == undefined
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('body'),
                  factory.createPropertyAccessExpression(rootObject, factory.createIdentifier(bodyParameter.name))
                ),
            cookieParameters.length == 0
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('cookies'),
                  generateQuerArgObjectLiteralExpression(cookieParameters, rootObject)
                ),
            headerParameters.length == 0
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('headers'),
                  generateQuerArgObjectLiteralExpression(headerParameters, rootObject)
                ),
            queryParameters.length == 0
              ? undefined
              : factory.createPropertyAssignment(
                  factory.createIdentifier('params'),
                  generateQuerArgObjectLiteralExpression(queryParameters, rootObject)
                ),
          ].filter(utils_1.removeUndefined),
          false
        )
      )
    );
  }
  function generateQueryEndpointProps({}) {
    return {}; /* TODO needs implementation - skip for now */
  }
  function generateMutationEndpointProps({}) {
    return {}; /* TODO needs implementation - skip for now */
  }
}
exports.generateApi = generateApi;
function generatePathExpression(path, pathParameters, rootObject) {
  const expressions = [];
  const head = path.replace(/\{(.*?)\}(.*?)(?=\{|$)/g, (_, expression, literal) => {
    const param = pathParameters.find((p) => p.originalName === expression);
    if (!param) {
      throw new Error(`path parameter ${expression} does not seem to be defined?`);
    }
    expressions.push([param.name, literal]);
    return '';
  });
  return expressions.length
    ? factory.createTemplateExpression(
        factory.createTemplateHead(head),
        expressions.map(([prop, literal], index) =>
          factory.createTemplateSpan(
            factory.createPropertyAccessExpression(rootObject, factory.createIdentifier(prop)),
            index === expressions.length - 1
              ? factory.createTemplateTail(literal)
              : factory.createTemplateMiddle(literal)
          )
        )
      )
    : factory.createNoSubstitutionTemplateLiteral(head);
}
function generateQuerArgObjectLiteralExpression(queryArgs, rootObject) {
  return factory.createObjectLiteralExpression(
    queryArgs.map(
      (param) =>
        tscodegen_1.createPropertyAssignment(
          param.originalName,
          tscodegen_1.isValidIdentifier(param.originalName)
            ? factory.createPropertyAccessExpression(rootObject, factory.createIdentifier(param.originalName))
            : factory.createElementAccessExpression(rootObject, factory.createStringLiteral(param.originalName))
        ),
      true
    )
  );
}
//# sourceMappingURL=generate.js.map
