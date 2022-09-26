import { currentInstance, setCurrentInstance } from "./component";

export const enum LifecycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u'
}

function createHook(type){
  //hook需要绑定到对应的实例上
  //使用的方法和之前写的依赖收集类似 activeEffect
  //因为生命周期函数是在setup中执行的，那么可以在setup执行之前记录当前的组件实例
  //然后执行之后进行重置，这样就可以在生命周期钩子执行的时候获取到组件的实例
  return (hook,target = currentInstance) => {
    if(target){
      const hooks = target[type] || (target[type] = []);
      //但是有可能在生命周期函数里面会调用 getCurrentInstance 来获取实例
      //但在执行完setup之后就已经被重置为null
      //所以可以包裹一下钩子
      const wrapperHook = () => {
        setCurrentInstance(target);
        hook();
        setCurrentInstance(null);
      }
      hooks.push(wrapperHook);
    }
  }
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);