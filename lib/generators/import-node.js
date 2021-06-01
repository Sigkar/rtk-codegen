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
exports.generateImportNode = void 0;
const ts = __importStar(require('typescript'));
const { factory } = ts;
function generateImportNode(pkg, namedImports, defaultImportName) {
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      false,
      defaultImportName !== undefined ? factory.createIdentifier(defaultImportName) : undefined,
      factory.createNamedImports(
        Object.entries(namedImports)
          .filter((args) => args[1])
          .map(([propertyName, name]) =>
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
//# sourceMappingURL=import-node.js.map
