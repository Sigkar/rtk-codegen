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
exports.fnExportExists = void 0;
const ts = __importStar(require('typescript'));
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
function fnExportExists(filePath, fnName) {
  const fileName = path.resolve(process.cwd(), filePath);
  const sourceFile = ts.createSourceFile(
    fileName,
    fs.readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ true
  );
  let found = false;
  ts.forEachChild(sourceFile, (node) => {
    const text = node.getText();
    if (ts.isExportAssignment(node)) {
      if (text.includes(fnName)) {
        found = true;
      }
    } else if (ts.isVariableStatement(node) || ts.isFunctionDeclaration(node) || ts.isExportDeclaration(node)) {
      if (text.includes(fnName) && text.includes('export')) {
        found = true;
      }
    } else if (ts.isExportAssignment(node)) {
      if (text.includes(`export ${fnName}`)) {
        found = true;
      }
    }
  });
  return found;
}
exports.fnExportExists = fnExportExists;
//# sourceMappingURL=fnExportExists.js.map
