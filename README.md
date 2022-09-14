## Vue 设计思想
+ Vue3.0 更加注重模块上的拆分，在2.0中无法单独使用部分模块。需要引入完整的Vuejs（例如只想使用响应式的部分，但是需要引入完整的Vuejs），Vue3中的模块之间耦合度低，模块可以独立使用（**拆分模块**）
+ Vue2中很多方法挂载到实例上导致没有使用也会被打包（还有很多组件也一样）。通过构建工具 tree-shaking 机制可以实现按需引入，减少用户打包之后的体积，**重写了API**
+ Vue3有哪些自定义渲染器，扩展能力强。不会发生一起的事情，改写Vue源码改造渲染方式，**扩展方便**

## Vue3 对比 Vue2 的变化
+ Vue2 使用 defineProperty 来进行数据的劫持，需要对属性进行重写添加 getter 和 setter，**性能差**
+ Vue2 当新增属性和删除属性的时候无法进行监控变化，需要通过 `$set`,`$delete`实现
+ 数组不采用 defineProperty 来进行劫持（浪费性能，对所有索引进行劫持会造成性能浪费）需要对数组进行单独的处理

Vue3 使用 proxy 来实现响应式数据的变化，从而解决了上述问题

## Monorepo 管理项目
Monorepo是管理项目代码的一种方式，指的是一个项目仓库（repo）中管理多个模块/包（package）。Vue3源码采用monorepo方式进行管理，将模块拆分到package目录中。
+ 一个仓库可以维护多个模块，不用到处找仓库
+ 方便版本管理和依赖管理，模块之间的应用，调用都非常方便

![alt](/markDownImg/Snipaste_2022-09-06_15-26-45.png)

## 搭建 Monorepo 环境
Vue3 中使用 `pnpm` `workspace`来实现`Monorepo`(pnpm 是快速、节省磁盘空间的包管理器。主要采用符号链接的方式管理模块)

### 全局安装 `pnpm`
```shell
npm install pnpm -g
```

```shell
#初始化配置文件
pnpm init -y
```

### 创建 .npmrc 文件
```
shamefully-hoist = true
```

> 这里可以尝试一下安装`Vue3`,`pnpm install vue@next`此时默认情况下`Vue3`中依赖的模块不会被提升到`node_modules`下。添加这个配置(*羞耻提升*)可以将`Vue3`所依赖的模块提升到`node_modules`中。

### 创建 packages 目录
```shell
mkdir packages
```
这个目录是用来存放依赖包的，不过还需要配置一下才能指定

### 创建 pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
```

### 创建依赖包
在`packages`下创建`reactivity`，因为每个包都是一个模块，所以需要在`packages/reactivity`下运行一下`pnpm init`初始化一下，然后配置`package.json`
```json
{
  "name": "@vue/reactivity",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "buildOptions":{
    //打包出来的模块的名字，之后可以直接使用这个名字
    //如果模块不需要打包出来就不需要配置name
    "name":"VueReactivity",
    "formats":[//打包出来的格式
      "global",//给浏览器使用
      "cjs",//commonjs
      "esm-bundler"//浏览器 esModules
    ]
  }
}
```
每个模块的默认入口都是`src/index.js`，所以还要在模块下创建`src/index.js`.

### 安装`Vue`
现在运行`pnpm install vue`默认就是安装`Vue3`，因为我们将模块进行了区分，所以运行这个命令可能会报错，说不知道这个包是共享的还是私有的。所以还需要在命令后面加个`-w`表示是共享的。
```shell
pnpm install vue -w
```

### 安装开发环境工具
```shell
pnpm install typescript minimist esbuild -w -D
```
+ typescript 带有类型语法的 JavaScript
+ minimist 可以接受命令行传入的参数
+ esbuild 打包构建工具

#### 配置 typescript
```shell
pnpm tsc --init
```
在生成的`tsconfig.js`中
```json
{
  "compilerOptions":{
    "target": "es2016",//目标语法
    "lib": ["ESNext","DOM"],//支持的类库
    "jsx": "preserve",//jsx不转义
    "module": "ESNext",//模块格式
    "moduleResolution": "node",//模块解析方式
    "baseUrl": ".",//模块的基础目录
    "paths": {//模块路径映射
      /** 当遇到 @vue/开头的包路径的时候就去 packages中模块的src 中找 */
      "@vue/*":["packages/*/src"]  
    },
    "resolveJsonModule": true,//解析json模块
    "sourceMap": true,//采用sourcemap
    "outDir": "dist",//输出目录
    "esModuleInterop": true,//运行通过es6语法引入commonjs模块
    "strict": false,//严格模式
  }
}
```

## 创建脚本目录
`scripts`目录，这个目录就是用来配置开发环境的各种打包命令和配置，之后在根目录的`package.json`配置脚本
```json
{
  "scripts":{
    "dev":"node scripts/dev.js reactivity -f global"
  }
}
```
之后创建`scripts/dev.js`,然后可以使用`minimist`来接受传入的参数`reactivity -f global`
```js
const args = require('minimist')(process.argv.slice(2));
```

## Vue3 响应式原理
+ 先创建一个响应式对象 new Proxy()
+ 然后 effect 默认数据变化要更新。先将正在执行的 effect 作为全局变量，渲染取值，在get方法中进行依赖收集
+ 使用 WeakMap 的结构来保存属性对应的effect `{对象:{属性:new Set()}}`
+ 然后在用户数据改变的时候，会通过对象、属性来来查找对应的 effect 集合,然后全部执行


## Vue中解耦，将逻辑分成两个模块
+ 运行时核心（不依赖于平台的 browser test 小程序 app canvas...）靠的是 虚拟DOM
+ 针对不同的平台的运行时（Vue针对的是浏览器平台）
+ 渲染器
