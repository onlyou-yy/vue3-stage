import { isString, ShapeFlags } from '@vue/shared';
import { getSequence } from './sequence';
import { createVnode, isSameVnode, Text, Fragment } from './vnode';
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
  const normalize = (children,i) => {
    if(isString(children[i])){
      let vnode = createVnode(Text,null,children[i]);
      children[i] = vnode;
    }
    return children[i];
  }

  /**
   * 挂载子虚拟节点到容器
   * @param children 子虚拟节点
   * @param container 容器
   */
  const mountChildren = (children,container) => {
    for(let i = 0; i < children.length; i++){
      let child = normalize(children,i);//转化之后替换，不然之后在卸载的时候还需要进行判断转化
      //挂载子节点其实就是直接创建子节点，所以旧的虚拟节点是null
      patch(null,child,container)
    }
  }

  /**
   * 挂载真实dom
   * @param vnode 虚拟节点
   * @param el 挂载目标
   */
  const mountElement = (vnode,container,anchor) => {
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
    hostInsert(el,container,anchor);
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
    }else{
      const el = n2.el = n1.el;
      if(n2.children !== n1.children){
        hostSetText(el,n2.children);
      }
    }
  }

  /**
   * 对比属性
   * @param oldProps 老节点属性
   * @param newProps 新节点属性
   * @param el 元素
   */
  const patchProps = (oldProps,newProps,el) => {
    for(let key in newProps){
      hostPatchProp(el,key,oldProps[key],newProps[key]);
    }
    for(let key in oldProps){
      if(newProps[key] == null){
        hostPatchProp(el,key,oldProps[key],undefined);
      }
    }
  }  

  /**卸载子节点
   * @param children 子虚拟节点数组
   */
  const unmountChildren = (children) => {
    for(let i = 0;i < children.length;i++){
      unmount(children[i]);
    }
  }

  /**
   * 全量比对（只比对同一级的）
   * @param c1 新子节点
   * @param c2 就子节点
   * @param el 容器
   */
  const patchKeyedChildren = (c1,c2,el) => {
    let i = 0;//头指针
    let e1 = c1.length - 1;//新节点的尾指针
    let e2 = c2.length - 1;//老节点的尾指针

    // 简单的情况可以特殊处理来优化
    // -----------------------------------------------
    
    // 从头部开始比较
    // a b c -> a b c d
    while(i <= e1 && i <= e2){//只要有一方停止就跳出
      const n1 = c1[i];
      const n2 = c2[i];
      if(isSameVnode(n1,n2)){
        //两节点是相同的讲究继续比较子节点
        patch(n1,n2,el);
      }else{
        break;
      }
      i++;
    }
    //从尾部开始比较
    //a b c -> d e b c
    while(i <= e1 && i <= e2){
      const n1 = c1[e1];
      const n2 = c2[e2];
      if(isSameVnode(n1,n2)){
        patch(n1,n2,el);
      }else{
        break;
      }
      e1--;
      e2--;
    }

    //对比完差异之后，要么就是新增，要目就是卸载

    if(i > e1){
      // 如果 i 比 e1 大就说明有新增,i 和 e2 之间的就是新增的部分
      if(i <= e2){
        while(i <= e2){
          //新增是向前新增还是向后新增？
          // 可以通过 e2 的下一个节点是否存在老确定
          // 如果下一个节点存在就是向前新增，否则向后新增
          const nextPos = e2 + 1;//下一个位置
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null,c2[i],el,anchor);//创建新节点
          i++;
        }
      }
    }else if(i > e2){
      //  i 比 e2 大说明要卸载，i 到 e1 之间的就是要卸载的
      if(i <= e2){
        while(i <= e1){
          unmount(c1[i]);
          i++;
        }
      }
    }
    
    //优化完毕
    //----------------------------------------------

    //之后就是复杂的情况——乱序比对
    /**
     * a b c d e   f g
     * a b e c d h f g
     */
    // 进过上面的遍历之后 i = 2;e1 = 4;e2 = 5
    console.log(i,e1,e2);
    let s1 = i;
    let s2 = i;
    //给新节点变化节点的区间的节点定义一个映射，方便后面查找
    const keyToNewIndexMap = new Map();//key -> index
    for(let i = s2;i <= e2; i++){
      keyToNewIndexMap.set(c2[i].key,i);
    }
    // 循环老元素，看一下新的里面有没有，
    // 如果有就要比较差异，没有就要添加到列表中，
    // 老的有新的没有要删除
    const toBePatched = e2 - s2 + 1;//新的总数
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);//记录已经对比过的节点（在旧节点中已经存在的节点）的列表

    for(let i = s1; i <= e1;i++){
      const oldChild = c1[i];//老节点
      let newIndex = keyToNewIndexMap.get(oldChild.key);
      if(newIndex == undefined){
        unmount(oldChild);//删除多余的
      }else{
        //新的位置对应的老的位置,i+1是因为等等要根据是否大于0来表示是否已经被patch过
        newIndexToOldIndexMap[newIndex - s2] = i+1;//用来标记所patch的节点
        patch(oldChild,c2[newIndex],el)
      }
    }

    //获取最长增长子序列
    let increment = getSequence(newIndexToOldIndexMap);
    console.log(increment);
    //需要移动的位置
    let j = increment.length - 1;
    //在移除完多余的子节点之后就可以将新的节点倒序插入到之前的DOM中
    //也就是说需要移动节点
    for(let i = toBePatched - 1;i >= 0;i--){
      let index = i + s2;
      let current = c2[index];//找到新增部分的最后一个
      let anchor = index + 1 < c2.length ? c2[index + 1].el : null;
      //需要注意 c2 中的是还没有被挂载过的虚拟节点
      if(newIndexToOldIndexMap[i] === 0){
        //新增的节点，还没有挂载过，所以需要先创建真实DOM
        patch(null,current,el,anchor);
      }else{
        //已经比对过，就是已经存在真实DOM可以复用
        // hostInsert(current.el,el,anchor);//这种方式比较耗费性能，因为无论如何都需要进行一遍倒序插入

        //其实可以不用这样做，可以根据刚才的数组来减少插入次数
        //1.可以把连续的节点看做是一个节点来批量插入
        //  比如现在的newIndexToOldIndexMap = [5,3,4,0] 可以把 3,4 当成一块来插入
        //2.也可以直接跳过连续的节点
        //  比如newIndexToOldIndexMap = [5,3,4,0]，在倒序插入的时候先创建并插入了0，然后可以发现[3,4]本来就应该是在当前的位置了，
        //  再进行插入的话也不会有变化，所以不需要再做操作
        //  这种也可以直接跳过连续的节点方式在Vue3中叫做：最长递增子序列
        //  不过这里拿到的序列是节点的索引序列。
        if(i != increment[j]){
          hostInsert(current.el,el,anchor)
        }else{
          j--;
          console.log('插入')
        }
      }
    }
  }

  /**
   * 对比子节点
   * @param n1 
   * @param n2 
   * @param el 当前节点
   */
  const patchChildren = (n1,n2,el) => {
    //对比两个虚拟节点的子节点的差异
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    //文本 空的/null 数组
    /**
     * * 新儿子——旧儿子——操作
     * 1.文本——数组——删除老儿子，设置文本内容
     * 2.文本——文本——更新文本即可
     * 3.文本——空——更新文本即可
     * 4.数组——数组——diff算法
     * 5.数组——文本——清空文本，进行挂载
     * 6.数组——空——进行挂载
     * 7.空——数组——删除所有儿子
     * 8.空——文本——清空文本
     * 9.空——空——无需处理
     */
    // 所有去掉重复的操作就只有1，2，4，5，7，8需要考虑
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
        //@1 -> 文本——数组
        //删除老儿子
        unmountChildren(c1);
      }
      if(c1 !== c2){//@2|3 -> 文本——文本 | 文本——空
        //设置文本内容
        hostSetElementText(el,c2);
      }
    }else{
      // 新的为数组或为空
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
          //@4 -> 数组——数组
          patchKeyedChildren(c1,c2,el);//全量比对（只进行同级比较）
        }else{
          //@7 -> 空——数组
          unmountChildren(c1);
        }
      }else{
        //@5 -> 数组——文本
        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
          //@8 -> 空——文本
          hostSetElementText(el,'');
        }
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
          //@6 -> 数组——空
          mountChildren(c2,el);
        }
      }
    }
  }

  /**
   * 对比元素
   * @param n1 
   * @param n2 
   * @param container 
   */
  const patchElement = (n1,n2,container) => {
    //先复用节点，再比较属性，在比较儿子
    let el = n2.el = n1.el;
    
    let oldProps = n1.props || {};
    let newProps = n2.props || {};
    patchProps(oldProps,newProps,el);
    patchChildren(n1,n2,el);
  }

  /**
   * 处理元素
   * @param n1 
   * @param n2 
   * @param container 
   */
  const processElement = (n1,n2,container,anchor) => {
    if(n1 === null){
      //初始挂载
      mountElement(n2,container,anchor);
    }else{
      //更新
      //如果前后完成没关系，删除老的 添加新的
      //老的和新的一样，复用，属性可能不一样，在对比属性，更新属性
      //比较子节点
      patchElement(n1,n2,container);
    }
  }

  /**处理文档碎片，进行一次性处理; */
  const processFragment = (n1,n2,container) => {
    if(n1 == null){
      mountChildren(n2.children,container)
    }else{
      patchChildren(n1,n2,container);//中diff算法
    }
  }

  /**
   * 对比新老虚拟节点,当 n1 为null时表示新增n2
   * @param n1 老虚拟DOM
   * @param n2 新虚拟DOM
   * @param container 挂载容器
   * @param anchor 参照物，决定要挂载的位置
   * @returns 
   */
  const patch = (n1,n2,container,anchor = null)=>{
    if(n1 == n2) return;

    //如果两个元素不一样就删除老的，之后再添加新的
    if(n1 && !isSameVnode(n1,n2)){
      unmount(n1);//删除老的
      n1 = null;
    }

    const {type,shapeFlag} = n2;
    switch(type){
      case Text:
        // 处理文本 h(Text,'hello');
        // 如果children直接就是一个文本是不能通过`document.createElement('文本')`
        // 创建的，所以要定义类型来进行处理
        processText(n1,n2,container);
        break;
      case Fragment:
        // 处理文档碎片，进行一次性处理;
        // h(Fragment,[h(Text,'hello'),h(Text,'world')])
        processFragment(n1,n2,container);
        break;
      default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          processElement(n1,n2,container,anchor);
        }
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
