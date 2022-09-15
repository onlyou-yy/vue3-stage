function createInvoker(callback){
  const invoker = (e) => invoker.value(e);
  invoker.value = callback;
  return invoker;
}

/**
 * 对比事件
 * @param el DOM
 * @param eventName 事件名称 
 * @param nextValue 事件值
 */
export function patchEvent(el,eventName,nextValue){
  //可以先移除掉事件然后在重新绑定事件
  //但是这样会比较消耗性能
  //所以可以给绑定一个自定义事件，然后在这个自定义事件里面再调用 需要绑定的方法

  //那么可以先定义一个变量来缓存一下这些事件
  let invokers = el._vei || (el._vei = {});

  //有没有缓存过
  let exits = invokers[eventName];
  if(exits && nextValue){//已经绑定过了
    exits.value = nextValue;
  }else{
    // onClick => click
    let event = eventName.slice(2).toLowerCase();
    if(nextValue){
      const invoker = invokers[eventName] = createInvoker(nextValue);
      el.addEventListener(event,invoker);
    }else if(exits){//如果有老值，需要将老的绑定事件移除掉
      el.removeEventListener(event,exits);
      invokers[eventName] = undefined;
    }
  }
}