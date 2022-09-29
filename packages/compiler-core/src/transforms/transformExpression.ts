import { NodeTypes } from "../ast";

/**表达式的转化 */
export function transformExpression(node,context){
  // 对表达式可以直接进行转化 {{aa}} -> _ctx.aa
  // 并且需要在 context.helpers 添加方法 toDisplayString
  
  if(node.type === NodeTypes.INTERPOLATION){
    let content = node.content.content;
    node.content.content = `_ctx.${content}`;
  }
}