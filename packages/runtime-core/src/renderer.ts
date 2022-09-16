import { isString, ShapeFlags } from '@vue/shared';
import { createVnode, Text } from './vnode';
/**创建渲染器 */
export function createRenderder(renderOptions){

  let {
    insert:hostInsert,
    remove:hostRemove,
    setElementText:hostSetElementText,
    setText:hostSetText,
    querySelector:hostQuerySelector,
    parentNode:hostParentNode,
    nextSibling:hostNextSibling,
    createElement:hostCreateElement,
    createText:hostCreateText,
    patchProp:hostPatchProp
  } = renderOptions;

  /**
   * 转化节点
   * @param child 文件
   * @returns 
   */
  const normalize = (child) => {
    if(isString(child)){
      return createVnode(Text,null,child);
    }
    return child;
  }

  /**
   * 挂载子虚拟节点到容器
   * @param children 子虚拟节点
   * @param container 容器
   */
  const mountChildren = (children,container) => {
    for(let i = 0; i < children.length; i++){
      let child = normalize(children[i]);
      //挂载子节点其实就是直接创建子节点，所以旧的虚拟节点是null
      patch(null,child,container)
    }
  }

  /**
   * 挂载真实dom
   * @param vnode 虚拟节点
   * @param el 挂载目标
   */
  const mountElement = (vnode,container) => {
    let {type,props,children,shapeFlag} = vnode;
    //将真实元素挂载到这个虚拟节点上，后续用于复用节点和更新
    let el = vnode.el = hostCreateElement(type);
    if(props){
      for(let key in props){
        //对比属性
        hostPatchProp(el,key,null,props[key]);
      }
    }
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      //这个虚拟节点是文本，那么直接设置成文本节点
      hostSetElementText(el,children);
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      mountChildren(children,el);
    }
    //挂载到容器上
    hostInsert(el,container);
  }

  /**
   * 处理文本
   * @param n1 老虚拟DOM
   * @param n2 新虚拟DOM
   * @param container 挂载容器
   */
  const processText = (n1,n2,container) => {
    if(n1 == null){
      hostInsert((n2.el = hostCreateText(n2.children)),container)
    }
  }

  /**
   * 对比新老虚拟节点
   * @param n1 老虚拟DOM
   * @param n2 新虚拟DOM
   * @param container 挂载容器
   * @returns 
   */
  const patch = (n1,n2,container)=>{
    if(n1 == n2) return;

    const {type,shapeFlag} = n2;
    if(n1 == null){
      // 初始化操作
      switch(type){
        case Text:
          // 处理文本 h(Text,'hello');
          // 如果children直接就是一个文本是不能通过`document.createElement('文本')`
          // 创建的，所以要定义类型来进行处理
          processText(n1,n2,container);
          break;
        default:
          if(shapeFlag & ShapeFlags.ELEMENT){
            mountElement(n2,container);
          }
      }
    }else{
      // 更新
    }
  }

  /**卸载 */
  const unmount = (vnode) => {
    hostRemove(vnode.el);
  }

  /**
   * 渲染
   * @param vnode 虚拟DOM
   * @param container 容器
   */
  const render = (vnode,container) => {
    if(vnode == null){
      //卸载逻辑
      if(container._vnode){
        unmount(container._vnode);
      }
    }else{
      //既有初始化的逻辑，又有更新的逻辑
      patch(container._vnode || null,vnode,container);
    }
    container._vnode = vnode;
  }
  return {
    render,
  }
}
