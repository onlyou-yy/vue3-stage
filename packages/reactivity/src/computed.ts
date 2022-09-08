import { isFunction } from "@vue/shared";
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";

class ComputedRefImpl{
  public effect;
  public _dirty = true;
  public __v_isReadonly = true;
  public __v_isRef = true;
  public _value;
  public dep = new Set;
  constructor(public getter,public setter){
    //将用户的getter放到effect中，这里面的属性就会被这个effect收集
    this.effect = new ReactiveEffect(getter,()=>{
      //之后依赖的属性发生变化就会执行此函数
      if(!this._dirty){
        this._dirty = true;

        // 触发外层的 effect 更新。
        // 如果这个effect 中有使用到当前的计算属性就会触发 get
        // 从而获取到最新的值
        triggerEffects(this.dep)
      }
    })
  }
  get value(){
    //当在 effect(()=>{ app.innerHTML = fullName.value }) 这种情况下，
    //当计算属性的值发生改变的时候
    //外层的effect也是需要执行的，所以可能计算属性当成是一个普通属性，
    //所以也需要去收集一下依赖的effect
    trackEffects(this.dep);

    if(this._dirty){
      this._dirty = false;
      this._value = this.effect.run();
    }
    
    return this._value;
  }
  set value(newValue){
    this.setter(newValue);
  }
}

export const computed = (getterOrOptions) => {
  let onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if(onlyGetter){
    getter = getterOrOptions;
    setter = ()=>{console.log("no set")};
  }else{
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter,setter);
}