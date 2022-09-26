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

//位运算 & ｜ 适合权限的组合 
// | 通常表示包含
// & 表示拥有
//let add = 1,del = 1 << 1,edt = 1 << 2;
//let per = add | del   
//per & add ==> true
//per & edt ==> false