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
exports.getCompilerOptions = void 0;
const path = __importStar(require('path'));
const fs = __importStar(require('fs'));
const ts = __importStar(require('typescript'));
function readConfig(configPath) {
  const result = ts.readConfigFile(configPath, ts.sys.readFile);
  if (result.error) {
    return undefined;
  }
  return ts.parseJsonConfigFileContent(result.config, ts.sys, path.dirname(configPath), undefined, configPath);
}
function findConfig(baseDir) {
  const configFileName = 'tsconfig.json';
  function loop(dir) {
    const parentPath = path.dirname(dir);
    // It is root directory if parent and current dirname are the same
    if (dir === parentPath) {
      return undefined;
    }
    const configPath = path.join(dir, configFileName);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    return loop(parentPath);
  }
  return loop(baseDir);
}
function getCompilerOptions(configPath) {
  if (!configPath) {
    configPath = findConfig(process.cwd());
  }
  if (!configPath) {
    return;
  }
  const config = readConfig(configPath);
  if (config) {
    return config.options;
  }
}
exports.getCompilerOptions = getCompilerOptions;
//# sourceMappingURL=getTsConfig.js.map
