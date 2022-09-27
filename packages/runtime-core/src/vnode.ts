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
 * @param patchFlag 动态子节点类型
 */
export function createVNode(type,props = {},children = null,patchFlag = 0){
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
    patchFlag,//动态节点标识，表示哪个类型会改变
  }

  if(children){
    let type = 0;//默认为文本
    if(isArray(children)){
      type = ShapeFlags.ARRAY_CHILDREN;
    }else if(isObject(children)){
      type = ShapeFlags.SLOTS_CHILDREN;//这个组件带有插槽
    }else{
      children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    //当前节点的类型和子节点的类型进行组合
    vnode.shapeFlag |= type;
  }

  //收集vnode
  if(currentBlock && patchFlag > 0){
    currentBlock.push(vnode);
  }

  return vnode;
}

/**
 * 临时动态节点容器
 * 
 * 作用是用来收集动态节点
 * 收集的动态节点是以树为单位来收集的，特点是比较的时候可以只动态节点
 */
let currentBlock = null;
/**创建当前block容器 */
export function openBlock(){
  // 收集多个动态节点
  currentBlock = [];
}

/**给block填入内容
 * @param patchFlag 动态节点类型，会在模版变异生产渲染函数的时候传入
 * 
 * 调用这个函数生成的虚拟节点多出一个dynamicChildren属性，这个就是block的作用
 * block可以收集所有后代动态节点，这样后续更新的时候就可以跳过静态节点，实现靶向更新
 */
export function createElementBlock(type,props,children,patchFlag){
  return setupBlock(createVNode(type,props,children,patchFlag));
}
function setupBlock(vnode){
  vnode.dynamicChildren = currentBlock;
  currentBlock = null;
  return vnode;
}

export { createVNode as createElementVNode }

/**创建文本虚拟节点 */
export function createTextVNode(text) {
  return createVNode(Text, {}, text);
}

/**将值转化成字符串 */
export function toDisplayString(val){
  return isString(val) ? val : val == null ? '' : isObject(val) ? JSON.stringify(val) : String(val);
}

