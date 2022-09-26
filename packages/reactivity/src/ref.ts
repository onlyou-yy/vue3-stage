import { isObject,isArray } from '@vue/shared';
import { trackEffects, triggerEffects } from './effect';
import { reactive } from './reactive';


function toReactive(value){
  return isObject(value) ? reactive(value) : value;
}
class RefImpl{
  public _value;
  public dep = new Set;
  public __v_isRef = true;
  constructor(public rawValue){
    this._value = toReactive(rawValue);
  }
  get value(){
    trackEffects(this.dep);
    return this._value
  }
  set value(newValue){
    if(newValue !== this.rawValue){
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      triggerEffects(this.dep);
    }
  }
}

/**转化普通数据成响应式数据 */
export function ref(value){
  return new RefImpl(value)
}

/**将 .value 代理到原始数据上 */
class ObjectRefImpl{
  constructor(public object,public key){}
  get value(){
    return this.object[this.key];
  }
  set value(newValue){
    this.object[this.key] = newValue;
  }
}

/**
 * @param object 响应式对象
 * @param key 访问的key
 * @returns 
 */
export function toRef(object,key){
  return new ObjectRefImpl(object,key);
}

/**
 * 将结构出来的属性转为响应式数据
 * let {name} = reactive({name:'jack'}) name会失去响应式功能
 * @param object 响应式对象
 * @returns 
 */
export function toRefs(object){
  let result = isArray(object) ? new Array(object.length) : {};
  for(let key in object){
    result[key] = toRef(object,key);
  }
  return result;
}

/**
 * 将 ref 重新代理成 proxy
 * 主要解决在模版中需要通过 .value 来访问值的情况
 * @param object ref数据
 */
export function proxyRefs(object){
  return new Proxy(object,{
    get(target,key,recevier){
      let r = Reflect.get(target,key,recevier);
      return r.__v_isRef ? r.value : r;
    },
    set(target,key,value,recevier){
      let oldValue = target[key];
      if(oldValue.__v_isRef){
        oldValue.value = value;
        return true;
      }else{
        return Reflect.set(target,key,value,recevier);
      }
    }
  })
}