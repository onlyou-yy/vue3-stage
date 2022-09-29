import { NodeTypes } from "../ast";

export function transformText(node,context){
  //期望将多个子节点拼凑中一起
  //但是需要在遇到元素的时候才能处理多个节点
  if(node.type === NodeTypes.ELEMENT || node.type === NodeTypes.ROOT){
    console.log('in Text');
    return () => {
      console.log('out Text');
    }
  }
}