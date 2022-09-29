import { createVNodeCall, NodeTypes } from "../ast";

export function transformElement(node,context){
  //期望给所有儿子处理完后，给元素重新添加children属性
  //并且是先转化完儿子的再转化父级的
  //(可以用退出函数处理：就是返回一个函数，当执行处理函数之后再执行返回的函数)
  if(node.type === NodeTypes.ELEMENT){

    return () => {
      // 这里没有实现 block 所以这里直接创建 element 
      
      // 这里对节点的 props 和 children 进行处理生成用于 codegen 的结构
      const vnodeTag = `'${node.tag}'`;
      const vnodeProps = node.props;//属性
      let vnodeChildren = node.children;//子节点
      if (node.children.length > 0) {
        if (node.children.length === 1) {
          // 只有一个孩子节点 ，那么当生成 render 函数的时候就不用 [] 包裹
          const child = node.children[0];
          vnodeChildren = child;
        }
      }

      // 创建一个新的 node 用于 codegen 的时候使用
      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      );
    }
  }
}