import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

/**对DOM属性进行对比处理 */
export function patchProp(el,key,prevValue,nextValue){
  if(key === 'class'){//样式 class
    patchClass(el,nextValue);
  }else if(key === 'style'){//样式 el.style
    patchStyle(el,prevValue,nextValue);
  }else if(/^on[^a-z]/.test(key)){//事件 events
    patchEvent(el,key,nextValue);
  }else{//属性 el.setAttribute
    patchAttr(el,key,nextValue);
  }
}