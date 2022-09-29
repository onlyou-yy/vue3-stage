import { NodeTypes } from "../ast";

export function transformElement(node,context){
  //期望给所有儿子处理完后，给元素重新添加children属性
  //并且是先转化完儿子的再转化父级的
  //(可以用退出函数处理：就是返回一个函数，当执行处理函数之后再执行返回的函数)
  if(node.type === NodeTypes.ELEMENT){
    console.log('in Element');
    return () => {
      console.log('out Element');
    }
  }
}