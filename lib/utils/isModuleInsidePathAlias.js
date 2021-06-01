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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.isModuleInsidePathAlias = void 0;
const path = __importStar(require('path'));
const fs = __importStar(require('fs'));
const glob_to_regexp_1 = __importDefault(require('glob-to-regexp'));
function isAlias(glob, moduleName) {
  return glob_to_regexp_1.default(glob).test(moduleName);
}
const ext = ['js', 'ts'];
function existsModule(moduleName) {
  if (/\.(ts|js)$/.test(moduleName)) {
    return fs.existsSync(moduleName);
  }
  for (let i = 0; i < ext.length; i++) {
    if (fs.existsSync(`${moduleName}.${ext[i]}`)) {
      return true;
    }
  }
  return false;
}
function isModuleInsidePathAlias(options, moduleName) {
  if (!(options.paths && options.baseUrl)) {
    return fs.existsSync(moduleName);
  }
  let baseUrl = options.baseUrl;
  if (!/\/$/.test(baseUrl)) {
    baseUrl = `${baseUrl}/`;
  }
  for (const glob in options.paths) {
    if (isAlias(glob, moduleName)) {
      const before = glob.replace('*', '');
      for (let i = 0; i < options.paths[glob].length; i++) {
        const after = options.paths[glob][i].replace('*', '');
        if (existsModule(path.resolve(baseUrl, after, moduleName.replace(before, '')))) {
          return true;
        }
      }
    }
  }
  return false;
}
exports.isModuleInsidePathAlias = isModuleInsidePathAlias;
//# sourceMappingURL=isModuleInsidePathAlias.js.map
