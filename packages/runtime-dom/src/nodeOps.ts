/**节点渲染器选项 */
export const nodeOps = {
  insert(child,parent,anchor = null){
    parent.insertBefore(child,anchor);//anchor为null时insertBefore 可以等价为 appendChild
  },
  remove(child){
    const parentNode = child.parentNode;
    if(parentNode){
      parentNode.removeChild(child);
    }
  },
  setElementText(el,text){
    el.textContent = text;
  },
  setText(node,text){
    node.nodeValue = text;
  },
  querySelector(selector){
    return document.querySelector(selector);
  },
  parentNode(node){
    return node.parentNode;
  },
  nextSibling(node){
    return node.nextSibling;
  },
  createElement(tagName){
    return document.createElement(tagName);
  },
  createTexgt(text){
    return document.createTextNode(text);
  }
}