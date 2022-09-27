//h用法 h('div');
//h('div',{style:{color:"red"}})
//h('div',{style:{color:"red"}},'hello');
//h('div','hello')
//h('div',null,'hello')
//h('div',null,'hello','world')
//h('div',null,h('span','123'))
//h('div',null,[h('span','123')])

import { isArray, isObject } from "@vue/shared";
import { createVNode, isVnode } from "./vnode";

/**
 * 创建虚拟节点
 * @param type 类型
 * @param propsChildren 属性或孩子 
 * @param children 孩子
 */
export function h(type,propsChildren,children){
  //其余的处理3个之外的肯定认识孩子
  const l = arguments.length;

  if(l === 2){
    //h('div',{style:{color:"red"}})
    //h('div',h('span'))
    //h('div',[h('span'),h('span')])
    //h('div','hello')
    if(isObject(propsChildren) && !isArray(propsChildren)){
      if(isVnode(propsChildren)){//虚拟节点包装成数组
        return createVNode(type,null,[propsChildren]);
      }
      return createVNode(type,propsChildren);//属性
    }else{
      return createVNode(type,null,propsChildren);//数组或文本
    }
  }else{
    if(l > 3){
      children = Array.from(arguments).slice(2);
    }else if(l === 3 && isVnode(children)){
      //等于3个
      children = [children];
    }
    // 其他
    return createVNode(type,propsChildren,children)
  }
}
