const args = require('minimist')(process.argv.slice(2));
const {resolve} = require("path");
// minimist 是用来解析参数的。

const target = args._[0] || 'reactivity';
const format = args.f || 'global';

// 开发环境只打包某一个
const pkg = require(resolve(__dirname,`../packages/${target}/package.json`));

/**
 * 输出模式
 * iife 立即执行函数，也就是 global
 * cjs node中的模块
 * esm 浏览器中的esModules模块
 */
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';
