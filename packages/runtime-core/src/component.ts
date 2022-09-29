import { proxyRefs, reactive } from '@vue/reactivity';
import { hasOwn, isFunction, isObject, ShapeFlags } from '@vue/shared';
import { initProps } from "./componentProps";

export let currentInstance = null;
export const setCurrentInstance = (instance) => currentInstance = instance;
export const getCurrentInstance = () => currentInstance;

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
    setupState:{},//setup函数返回的对象
    slots:{},//插槽相关内容
  }

  return instance;
}

/**公开的属性 */
const publicPropertyMap = {
  $attrs:(i) => i.attrs,
  $slots:(i) => i.slots,
}
const publicInstanceProxy = {
  get(target,key){
    let {data,props,setupState} = target;
    if(data && hasOwn(data,key)){
      return data[key];
    }else if(setupState && hasOwn(setupState,key)){
      return setupState[key];
    }else if(props && hasOwn(props,key)){
      return props[key];
    }
    //this.$attrs
    let getter = publicPropertyMap[key];
    if(getter){
      return getter(target);
    }
  },
  set(target,key,value){
    let {data,props,setupState} = target;
    if(data && hasOwn(data,key)){
      data[key] = value;
      return true;
      // 用户操作的属性是代理对象，这里被屏蔽了
      // 但是可以通过instance.props拿到真实的porps
    }else if(setupState && hasOwn(setupState,key)){
      setupState[key] = value;
      return true;
    }else if(props && hasOwn(props,key)){
      console.warn('不能修改props中的数据：' + (key as string));
      return false;
    }
    return true;
  }
}

function initSlots(instance,children){
  if(instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN){
    instance.slots = children;
  }
}
/**给组件实例赋值 */
export function setupComponent(instance){
  let {props,type,children} = instance.vnode;//type就是用户定义的组件
  // 初始化props
  initProps(instance,props);
  // 初始化插槽
  initSlots(instance,children);
  instance.proxy = new Proxy(instance,publicInstanceProxy)

  let data = type.data;
  if(data){
    if(!isFunction(data)) return console.warn("必须是一个函数");
    instance.data = reactive(data.call(instance.proxy));//pinia 源码就是 reactive({})作为组件的状态
  }
  let setup = type.setup;
  if(setup){
    const setupContext = {
      emit:(event,...args) => {//事件的实现原理
        let eventName = `on${event[0].toUpperCase()}${event.slice(1)}`;
        //虚拟节点的属性有存放props
        let handler = instance.vnode.props[eventName];
        handler && handler(...args);
      },
      attrs:instance.attrs,
      slots:instance.slots,
    };

    setCurrentInstance(instance);
    const setupResult = setup(instance.props,setupContext);
    setCurrentInstance(null);

    if(isFunction(setupResult)){
      instance.render = setupResult;
    }else if(isObject(setupResult)){
      instance.setupState = proxyRefs(setupResult);
    }
  }
  if(!instance.render){
    //记录用户定义的渲染函数
    instance.render = type.render;
  }
}

/**对比属性是否变化*/
export const hasPropsChange = (prevProps = {},nextProps = {}) => {
  const nextKeys = Object.keys(nextProps);
  // 属性的个数是否变化
  if(nextKeys.length !== Object.keys(prevProps).length){
    return true;
  }

  // 值是否变化
  for(let i = 0; i < nextKeys.length;i++){
    const key = nextKeys[i];
    if(nextProps[key] !== prevProps[key]){
      return true;
    }
  }
  return false

}

/**更新组件 */
export function updateProps(prevProps,nextProps){
  //更新值
  for(let key in nextProps){
    prevProps[key] = nextProps[key];
  }
  //删除可能多余的项
  for(let key in prevProps){
    if(!hasOwn(nextProps,key)){
      delete prevProps[key];
    }
  }
}

let compile;
export function registerRuntimeCompiler(_compile) {
  compile = _compile;
}