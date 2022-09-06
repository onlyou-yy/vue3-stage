export const isObject:(param:any)=>boolean = (val) => {
  return typeof val === "object" && val !== null;
}