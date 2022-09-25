import { reactive } from '@vue/reactivity';
import { hasOwn } from "@vue/shared";

export function initProps(instance,rawProps){
  const props = {};
  const attrs = {};
  
  // 将在组件中的props（instance.propsOptions -> props）定义了的数据复制到 props 中
  // 其他没有定义的放到 attrs 中
  const options = instance.propsOptions || {};
  if(rawProps){
    for(let key in rawProps){
      let value = rawProps[key];
      if(hasOwn(options,key)){
        props[key] = value;
      }else{
        attrs[key] = value;
      }
    }
  }

  //这里 props 不希望子在组件内部被更改，但是props得是响应式的，
  //因为后续属性变化了需要更新视图
  //所以应该 shallowReactive
  instance.props = reactive(props);
  instance.attrs = attrs;
}