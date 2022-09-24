import { isArray, isObject, isString, ShapeFlags } from "@vue/shared";
export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment');
/**判断是否是虚拟节点 */
export function isVnode(value){
  return !!(value && value.__v_isVnode);
}
/**判断是否是同一个虚拟节点 */
export function isSameVnode(n1,n2){
  return n1.type === n2.type && n1.key === n2.key;
}

/**
 * 创建虚拟节点
 * @param type 类型，有组件，元素，文本
 * @param props 属性
 * @param children 子节点
 */
export function createVnode(type,props = {},children = null){
  //组合方案 shapeFlag ，如果需要知道一个元素中包含的是多个儿子还是一个儿子，
  //可以采用标识来确定

  //当前的标签的类型，如果是字符串元素就是一个标签，如果是对象就是一个组件
  let shapeFlag = 
      isString(type) ? ShapeFlags.ELEMENT : 
      isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0;

  //虚拟DOM就是一个对象，diff算法。真实DOM的属性比较多
  const vnode = {
    type,
    props,
    children,
    key:props?.['key'],
    el:null,//虚拟节点上对应的真实节点，后续diff算法
    __v_isVnode:true,
    shapeFlag,
  }

  if(children){
    let type = 0;//默认为文本
    if(isArray(children)){
      type = ShapeFlags.ARRAY_CHILDREN;
    }else{
      children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    //当前节点的类型和子节点的类型进行组合
    vnode.shapeFlag |= type;
  }

  return vnode;
}