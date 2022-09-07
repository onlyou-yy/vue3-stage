const args = require('minimist')(process.argv.slice(2));
const { build } = require('esbuild');
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

const outfile = resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`);

//esbuild 天生支持 ts
build({
  entryPoints: [resolve(__dirname,`../packages/${target}/src/index.js`)],//入口
  outfile,//出口
  bundle:true,//把所有的包全部打包在一起
  sourcemap:true,
  format:outputFormat,//输出的格式
  globalName:pkg.buildOptions?.name,//打包的全局的名字
  platform: format === 'cjs' ? 'node' : 'browser',//平台
  watch:{//监控文件变化
    onRebuild(error){
      if(!error) console.log("rebuild~~~~~~~~~")
    }
  }
}).then(()=>{
  console.log("watching~~~~~")
})
