import { mutableHandlers, ReactiveFlags } from './baseHandler';
import { isObject } from "@vue/shared";

/**
 * 弱应用map，不会导致内存泄漏，key只能是对象,当key的对象设置为null时内存会被释放
 * 用来缓存代理的对象避免重复代理
 */
const reactiveMap = new WeakMap();

/**
 * 将数据转化成响应式的数据
 * 只能做对象的代理
 * 当
 * @param object 要劫持的数据
 */
export function reactive(target){
  if(!isObject(target)){
    return;
  }

  //判读传入的对象是否是一个已经代理过的对象
  //并没有添加属性，而是在访问属性的时候会触发 proxy 的 get
  //在get中进行判断，如果没有代理过的对象是不会触发 proxy 的 get 的
  if(target[ReactiveFlags.IS_REACTIVE]){
    return target;
  }

  //查看缓存中有没有
  const exisitingProxy = reactiveMap.get(target);
  if(exisitingProxy){
    return exisitingProxy;
  }

  // 并没有重新定义属性，只是代理，在取值的时候会调用get，赋值的时候会调用 set
  const proxy = new Proxy(target,mutableHandlers)
  //缓存代理
  reactiveMap.set(target,proxy);
  return proxy;
}



/**为什么 Proxy 要搭配 Reflect 使用？*/
// let data = {
//   name:'jack',
//   get alias(){
//     return this.name;
//   }
// }
// const proxy = new Proxy(data,{
//   get(target,key,receiver){
//     return target[key];
//   },
//   set(target,key,value,receiver){
//     target[key] = value;
//     return true;
//   },
// })
// console.log(proxy.alias);
/**
 * proxy.alias 访问的时候会执行 proxy 中的 get,此时是通过 target[key] 来获取值的，
 * 也就是执行了 data.alias ，然后触发了 data 中的 get，这里的get又访问了 name 属性就直接是 data.name
 * 而没有走 proxy.name，也就没有执行 proxy 的 get。此时 proxy 就相当于失效了。
 * 
 * Reflect 在执行的时候将 target 反射到 receiver 上，也就是 proxy ，可以保持访问代理对象的属性时一直在 proxy 上。
 */




