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