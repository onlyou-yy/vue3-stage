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