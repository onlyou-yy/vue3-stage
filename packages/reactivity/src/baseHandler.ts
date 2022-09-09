import { isObject } from "@vue/shared";
import { reactive } from "./reactive";
import { track, trigger } from "./effect";

/**代理标识 */
export const enum  ReactiveFlags {
  /**是否已经代理过 */
  IS_REACTIVE = "__v_isReactive",
}

/**
 * 判读值是否是一个响应式数据
 * @param value 
 */
export function isReactive(value){
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}

export const mutableHandlers = {
  /**
   * @param target 就是目标 object
   * @param key 访问的属性
   * @param receiver 当前的代理对象 proxy
   */
  get(target,key,receiver){
    // 添加代理标识判断，表示这个对象已经代理过了
    if(key === ReactiveFlags.IS_REACTIVE){
      return true;
    }
    track(target,"get",key);

    //如果获取的值是一个对象并且没有被代理过就进行代理返回
    //不用在一开始的时候就递归代理对象，节约性能
    let res = Reflect.get(target,key,receiver);
    if(isObject(res)){
      return reactive(res);
    }

    return res;
  },
  /**
   * @param target 就是目标 object
   * @param key 访问的属性
   * @param value 要赋的值
   * @param receiver 当前的代理对象 proxy
   */
  set(target,key,value,receiver){
    //必须返回 true 表示修改成功才会起作用
    let oldValue = target[key];
    //Reflect.set 会返回设置是否通过
    let result = Reflect.set(target,key,value,receiver);
    if(oldValue !== value){
      trigger(target,'set',key,value,oldValue);
    }
    return result
  },
}