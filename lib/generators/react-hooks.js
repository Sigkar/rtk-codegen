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
exports.generateReactHooks = void 0;
const ts = __importStar(require('typescript'));
const generate_1 = require('oazapfts/lib/codegen/generate');
const utils_1 = require('../utils');
const { factory } = ts;
const getReactHookName = ({ operationDefinition: { verb, path, operation } }) =>
  factory.createBindingElement(
    undefined,
    undefined,
    factory.createIdentifier(
      `use${utils_1.capitalize(generate_1.getOperationName(verb, path, operation.operationId))}${
        utils_1.isQuery(verb) ? 'Query' : 'Mutation'
      }`
    ),
    undefined
  );
const generateReactHooks = ({ exportName, operationDefinitions }) =>
  factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createObjectBindingPattern(
            operationDefinitions.map((operationDefinition) => getReactHookName({ operationDefinition }))
          ),
          undefined,
          undefined,
          factory.createIdentifier(exportName)
        ),
      ],
      ts.NodeFlags.Const
    )
  );
exports.generateReactHooks = generateReactHooks;
//# sourceMappingURL=react-hooks.js.map
