import { reactive } from '@vue/reactivity';
import { hanOwn, isFunction } from './../../shared/src/index';
import { initProps } from "./componentProps";

/**根据虚拟节点创建组件实例 */
export function createComponentInstance(vnode){
  //组件的实例
  const instance = { 
    data:null,
    //在Vue2的源码中组件的虚拟节点叫 $vnode,渲染的内容叫 _vnode
    //在Vue3的源码中组件的虚拟节点叫 vnode,渲染的内容叫 subTree
    vnode,
    subTree:null,
    isMounted:false,//是否已经被挂载
    update:null,//更新方法
    propsOptions:vnode.type.props,
    props:{},
    attrs:{},
    proxy:null,//访问代理
    render:null,//渲染器
  }

  return instance;
}

/**公开的属性 */
const publicPropertyMap = {
  $attrs:(i) => i.attrs
}
const publicInstanceProxy = {
  get(target,key){
    let {data,props} = target;
    if(data && hanOwn(data,key)){
      return data[key];
    }else if(props && hanOwn(props,key)){
      return props[key];
    }
    //this.$attrs
    let getter = publicPropertyMap[key];
    if(getter){
      return getter(target);
    }
  },
  set(target,key,value){
    let {data,props} = target;
    if(data && hanOwn(data,key)){
      data[key] = value;
      return true;
      // 用户操作的属性是代理对象，这里被屏蔽了
      // 但是可以通过instance.props拿到真实的porps
    }else if(props && hanOwn(props,key)){
      console.warn('不能修改props中的数据：' + (key as string));
      return false;
    }
    return true;
  }
}
/**给组件实例赋值 */
export function setupComponent(instance){
  let {props,type} = instance.vnode;//type就是用户定义的组件
  // 初始化props
  initProps(instance,props);
  instance.proxy = new Proxy(instance,publicInstanceProxy)

  let data = type.data;
  if(data){
    if(!isFunction(data)) return console.warn("必须是一个函数");
    instance.data = reactive(data.call(instance.proxy));//pinia 源码就是 reactive({})作为组件的状态
  }
  //记录用户定义的渲染函数
  instance.render = type.render;
}