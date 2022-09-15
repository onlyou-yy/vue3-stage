/**
 * 对比style
 * @param el DOM节点
 * @param prevValue 旧值
 * @param nextValue 新值
 */
export function patchStyle(el,prevValue,nextValue){
  // 先将新的属性全部加入进来
  for(let key in nextValue){
    el.style[key] = nextValue[key];
  }
  //移除在新值上没有的
  if(prevValue){
    for(let key in prevValue){
      if(nextValue[key] == null){
        el.style[key] = null
      }
    }
  }
}