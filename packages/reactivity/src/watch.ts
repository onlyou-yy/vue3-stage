import { isFunction, isObject } from "@vue/shared";
import { isReactive } from "./baseHandler";
import { ReactiveEffect } from "./effect";

/**遍历数据，触发proxy的get */
function traversal(value,set = new Set()){
  //不是对象不需要递归
  if(!isObject(value)) return value;

  //需要考虑对象中有循环引用的问题
  if(set.has(value)) return value;
  set.add(value);
  for(let key in value){
    traversal(value[key],set);
  }

  return value;
}

/**
 * 数据监测
 * @param source 要监控的数据
 * @param cb 回调
 */
export function watch(source,cb){
  let getter;
  if(isReactive(source)){
    //对用户输入的数据进行循环（递归循环，只要循环就会访问对象上的每一个属性，访问属性的时候就会收集依赖）
    getter = () => traversal(source);
  }else if(isFunction(source)){
    getter = source;
  }else{
    return;
  }
  let cleanup;//保存用户的函数
  const onCleanup = (fn) => {
    cleanup = fn;
  }
  let oldValue;
  const job = () => {
    if(cleanup) cleanup();//下一次watch开始触发上一次watch的清理
    const newValue = effect.run();
    cb(newValue,oldValue);
    oldValue = newValue;
  }
  const effect = new ReactiveEffect(getter,job);//监控自己构造的函数，变化后重新执行job
  oldValue = effect.run()
}