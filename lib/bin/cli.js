#!/usr/bin/env node
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
const path = __importStar(require('path'));
const fs = __importStar(require('fs'));
const commander_1 = __importDefault(require('commander'));
// tslint:disable-next-line
const meta = require('../../package.json');
const generate_1 = require('../generate');
const utils_1 = require('../utils');
const getTsConfig_1 = require('../utils/getTsConfig');
commander_1.default
  .version(meta.version)
  .usage('</path/to/some-swagger.yaml>')
  .option('--exportName <name>', 'change RTK Query Tree root name')
  .option('--reducerPath <path>', 'pass reducer path')
  .option('--baseQuery <name>', 'pass baseQuery name')
  .option('--argSuffix <name>', 'pass arg suffix')
  .option('--responseSuffix <name>', 'pass response suffix')
  .option('--baseUrl <url>', 'pass baseUrl')
  .option('-h, --hooks', 'generate React Hooks')
  .option('-c, --config <path>', 'pass tsconfig path for resolve path alias')
  .option('-f, --file <filename>', 'output file name (ex: generated.api.ts)')
  .parse(process.argv);
if (commander_1.default.args.length === 0) {
  commander_1.default.help();
} else {
  const schemaLocation = commander_1.default.args[0];
  const schemaAbsPath = utils_1.isValidUrl(schemaLocation)
    ? schemaLocation
    : path.resolve(process.cwd(), schemaLocation);
  const options = [
    'exportName',
    'reducerPath',
    'baseQuery',
    'argSuffix',
    'responseSuffix',
    'baseUrl',
    'hooks',
    'file',
    'config',
  ];
  const outputFile = commander_1.default['file'];
  let tsConfigFilePath = commander_1.default['config'];
  if (tsConfigFilePath) {
    tsConfigFilePath = path.resolve(tsConfigFilePath);
    if (!fs.existsSync(tsConfigFilePath)) {
      throw Error(utils_1.MESSAGES.TSCONFIG_FILE_NOT_FOUND);
    }
  }
  const compilerOptions = getTsConfig_1.getCompilerOptions(tsConfigFilePath);
  const generateApiOptions = {
    ...options.reduce(
      (s, key) =>
        commander_1.default[key]
          ? {
              ...s,
              [key]: commander_1.default[key],
            }
          : s,
      {}
    ),
    outputFile,
    compilerOptions,
  };
  generate_1
    .generateApi(schemaAbsPath, generateApiOptions)
    .then(async (sourceCode) => {
      const outputFile = commander_1.default['file'];
      if (outputFile) {
        fs.writeFileSync(path.resolve(process.cwd(), outputFile), await utils_1.prettify(outputFile, sourceCode));
      } else {
        console.log(await utils_1.prettify(null, sourceCode));
      }
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map
