import { NodeTypes } from "./ast";

function transformElement(node,context){
  console.log("111")
}

function transformText(node,context){
  console.log("222")
}

function transformExpression(node,context){
  console.log("333")
}


/**创建转化上下文  */
function createTransformContext(root){
  const context = {
    currentNode:root,//当前正在转化的节点
    parent:null,//当前正在转化的节点的父节点
    helpers:new Map(),//存储转化用到方法的次数，用来做优化，超过20个相同的节点会转化成字符串
    helper(name){//g根据使用过的方法进行优化
      const count = context.helpers.get(name) || 0;
      context.helpers.set(name,count+1);
      return name;
    },
    nodeTransforms:[
      transformElement,
      transformText,
      transformExpression
    ]
  }
  return context;
}

/**遍历节点进行处理 */
function traverse(node,context){
  context.currentNode = node;
  const transforms = context.nodeTransforms;
  for(let i = 0;i < transforms.length;i++){
    transforms[i](node,context);//在执行的时候有可能会把这个node删除掉
    //如果当前节点被删除就不用处理儿子了
    if(!context.currentNode) return;
  }
  //继续处理子节点，元素 和 根节点才有子节点
  switch(node.type){
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      for(let i = 0;i < node.children.length;i++){
        context.parent = node;
        traverse(node.children[i],context);
      }
  }
}

/**转化/预处理 ast */
export function transform(ast) {
  //创建转化上下文 
  const context = createTransformContext(ast);
  //遍历节点进行处理
  traverse(ast,context);
}