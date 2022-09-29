import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

/**ast 节点类型 */
export const enum NodeTypes {
  /**根节点 */
  ROOT,
  /**元素 */
  ELEMENT,
  /**文本 */
  TEXT,
  /**注释 */
  COMMENT,
  /**简单表达式 :src="xx" */
  SIMPLE_EXPRESSION,
  /**模版表达式 {{aa}} */
  INTERPOLATION,
  ATTRIBUTE,
  DIRECTIVE,
  //containers
  /**复合表达式 {{aa}} abc */
  COMPOUND_EXPRESSION,
  IF,
  IF_BRANCH,
  FOR,
  /**文本调用 */
  TEXT_CALL,
  //codegen
  /**元素调用 */
  VNODE_CALL,
  /**js调用表达式 */
  JS_CALL_EXPRESSION,
}

/**创建用于 codegen 的虚拟节点 */
export function createVNodeCall(context,tag,props?,children?){
  if(context){
    context.helper(CREATE_ELEMENT_VNODE);
  }

  return {
    // vue3 里面这里的 type 是 VNODE_CALL
    // 是为了 block 而 mini-vue 里面没有实现 block 
    // 所以创建的是 Element 类型就够用了
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}