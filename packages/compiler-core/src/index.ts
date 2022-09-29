import { generate } from "./codegen";
import { parse } from "./parse";
import { transform } from "./transform";

/**解析模版
 * @param template 模版字符串
 */
export function compiler(template){
  //将模版转成抽象语法树
  const ast = parse(template);//这里需要将html语法转化成js语法——编译原理

  // 对ast语法树进行一些预处理
  // 在代码生成之前要做一些转化，将 <div>{{aa}} 123</div> --> createElementVnode('div',toDisplayString(aa) + 123)
  // 需要去搜集所需的方法 createElementVnode toDisplayString
  // 为了在生成代码的时候更方便会在转化的时候生成一些属性
  // 属性、元素、表达式、文本
  transform(ast);


  // //代码生成
  return generate(ast);//最终生成代码 和vue2一样
}
