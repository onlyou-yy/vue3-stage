type BoolFun = (param:any)=>boolean;

export const isObject:BoolFun = (val) => {
  return typeof val === "object" && val !== null;
}

export const isString:BoolFun = (val) => {
  return typeof val === "string";
}

export const isNumber:BoolFun = (val) => {
  return typeof val === "number";
}

export const isFunction:BoolFun = (val) => {
  return typeof val === "function";
}

export const isArray:BoolFun = Array.isArray;
export const assign = Object.assign;

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (value,key) => hasOwnProperty.call(value,key);

export const invokeArrayFns = (fns) => {
  for(let i = 0;i < fns.length;i++){
    fns[i]();
  }
}

/**vue3提供的形状标识 */
export const enum ShapeFlags {
  /**元素 */
  ELEMENT = 1,
  /**函数式组件 */
  FUNCTIONAL_COMPONENT = 1 << 1,
  /**有状态的组件 */
  STATEFUL_COMPONENT = 1 << 2,
  /**文本子节点 */
  TEXT_CHILDREN = 1 << 3,
  /**数组子节点 */
  ARRAY_CHILDREN = 1 << 4,
  /**插槽子节点 */
  SLOTS_CHILDREN = 1 << 5,
  /**Teleport 组件 */
  TELEPORT = 1 << 6,
  /**Suspense 组件 */
  SUSPENSE = 1 << 7,
  /**要缓存的组件 */
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  /**已经缓存了的组件 */
  COMPONENT_KEPT_ALIVE = 1 << 9,
  /**组件 */
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

/**靶向更新类型 */
export const enum PatchFlags {
  /**动态文本节点 */
  TEXT = 1,
  /**动态 class */
  CLASS = 1 << 1,
  /**动态 style */
  STYLE = 1 << 2,
  /**除了 class/style 的动态属性 */
  PROPS = 1 << 3,
  /**有key，需要完整diff */
  FULL_PROPS = 1 << 4,
  /**挂载过事件的 */
  HYDRATE_EVENTS = 1 << 5,
  /**稳定序列，子节点顺序不会改变 */
  STABLE_FRAGMENT = 1 << 6,
  /**子节点有key的fragment */
  KEYED_FRAGMENT = 1 << 7,
  /**子节点没有key的fragment */
  UNKEYED_FRAGMENT = 1 << 8,
  /**进行非props比较，ref比较 */
  NEED_PATCH = 1 << 9,
  /**动态插槽 */
  DYNAMIC_SLOTS = 1 << 10,
  DEV_ROOT_FRAGMENT = 1 << 11,
  /**表示静态芥蒂娜，内容变化，不比较儿子 */
  HOISTED = -1,
  /**表示diff算法结束 */
  BAIL = -2
}

//位运算 & ｜ 适合权限的组合 
// | 通常表示包含
// & 表示拥有
//let add = 1,del = 1 << 1,edt = 1 << 2;
//let per = add | del   
//per & add ==> true
//per & edt ==> false