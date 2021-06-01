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
exports.generateSmartImportNode = void 0;
const fs = __importStar(require('fs'));
const utils_1 = require('../utils');
const isModuleInsidePathAlias_1 = require('../utils/isModuleInsidePathAlias');
const import_node_1 = require('./import-node');
const fnExportExists_1 = require('../utils/fnExportExists');
const resolveImportPath_1 = require('../utils/resolveImportPath');
const generateSmartImportNode = ({ moduleName, containingFile, targetName, targetAlias, compilerOptions }) => {
  if (fs.existsSync(moduleName)) {
    if (fnExportExists_1.fnExportExists(moduleName, targetName)) {
      return import_node_1.generateImportNode(
        utils_1.stripFileExtension(
          containingFile ? resolveImportPath_1.resolveImportPath(moduleName, containingFile) : moduleName
        ),
        {
          [targetName]: targetAlias,
        }
      );
    }
    if (targetName === 'default') {
      throw new Error(utils_1.MESSAGES.DEFAULT_EXPORT_MISSING);
    }
    throw new Error(utils_1.MESSAGES.NAMED_EXPORT_MISSING);
  }
  if (!compilerOptions) {
    throw new Error(utils_1.MESSAGES.FILE_NOT_FOUND);
  }
  // maybe moduleName is path alias
  if (isModuleInsidePathAlias_1.isModuleInsidePathAlias(compilerOptions, moduleName)) {
    return import_node_1.generateImportNode(utils_1.stripFileExtension(moduleName), {
      [targetName]: targetAlias,
    });
  }
  throw new Error(utils_1.MESSAGES.FILE_NOT_FOUND);
};
exports.generateSmartImportNode = generateSmartImportNode;
//# sourceMappingURL=smart-import-node.js.map
