import { NodeTypes } from "./ast";

/**创建解析上下文 */
function createParserContext(template){
  return {
    line:1,//当前解析到的行数
    column:1,//当前解析到列数
    offset:0,//偏移量
    source:template,//这个字段会被不断剪切 slice
    originalSource:template//原始数据
  }
}

/**解析是否结束 */
function isEnd(context){
  const source = context.source;
  if(source.startsWith("</")) return true;
  return !source
}

function getCursor(context){
  let {line,column,offset} = context;
  return {line,column,offset};
}

/**更新最新的行、列、偏移量信息 */
function advancePositionWithMutation(context,source,endIndex){
  let linesCount = 0;//行数
  let linePos = -1;

  for(let i = 0;i < endIndex;i++){
    //回车的 ascii 码是 10
    if(source.charCodeAt(i) == 10){
      linesCount++;
      linePos = i;
    }
  }

  context.line += linesCount;
  context.column = linePos === -1 ? context.column + endIndex : endIndex - linePos;
  context.offset += endIndex;
}

/**截取和更新内容 */
function advanceBy(context,endIndex) {
  //每次删除内容的时候都要更新最新的行、列、偏移量信息
  let source = context.source
  advancePositionWithMutation(context,source,endIndex);

  context.source = source.slice(endIndex);
}

/**处理文本 */
function parseTextData(context,endIndex){
  const rawText = context.source.slice(0,endIndex);
  advanceBy(context,endIndex);
  return rawText;
}

/**获取当前开始和结束的位置 */
function getSelection(context,start,end?){
  end = end || getCursor(context);
  return {
    start,
    end,
    source:context.originalSource.slice(start.offset,end.offset)
  }
}

/**解析文本 */
function parseText(context){
  // 在解析文本的时候要看后面到那里结束，abc {{x}} <a></a>
  let endTokens = ['<','{{'];
  let endIndex = context.source.length;//默认到最后结束
  for(let i = 0;i < endTokens.length;i++){
    let index = context.source.indexOf(endTokens[i],1);
    if(index !== -1 && endIndex > index){
      endIndex = index;
    }
  }

  // 创建行列信息

  // 开始数据
  const start = getCursor(context);
  // 截取内容
  const content = parseTextData(context,endIndex);
  
  return {
    type:NodeTypes.TEXT,
    content:content,
    loc:getSelection(context,start),//位置信息
  }
}

/**
 * 解析表达式
 */
function parseInterpolation(context){
  const start = getCursor(context);
  const closeIndex = context.source.indexOf("}}",2);//查找结束的大括号

  advanceBy(context,2);//去除开头的 {{

  const innerStart = getCursor(context);//表达式内容开始位置
  const innerEnd = getCursor(context);//表达式内容介绍位置

  const rawContentLength = closeIndex - 2;//表达式内容长度
  let preContent = parseTextData(context,rawContentLength);//获取内容并删除，更新位置信息
  let content = preContent.trim();//取出前后空格
  let startOffset =  preContent.indexOf(content);//开始的偏移量 {{ xxx }}
  if(startOffset > 0){//前面有空格
    advancePositionWithMutation(innerStart,preContent,startOffset);//更新开始的位置信息
  }

  let endOffset = startOffset + content.length
  advancePositionWithMutation(innerEnd,preContent,endOffset);//更新结束的位置信息

  advanceBy(context,2);//去除结尾的 }}
  
  return {
    type:NodeTypes.INTERPOLATION,//表达式
    content:{
      type:NodeTypes.SIMPLE_EXPRESSION,//简单表达式
      content,
      loc:getSelection(context,innerStart,innerEnd)
    },
    loc:getSelection(context,start)
  }
  
}

/**去除空格 */
function advanceBySpaces(context) {
  let match = /^[ \t\r\n]+/.exec(context.source);
  if(match){
    advanceBy(context,match[0].length);//删除 <div
  }
}

/**解析属性值 */
function parseAttributeValue(context){
  let start = getCursor(context);
  let quote = context.source[0];
  let content;
  if(quote === "'" || quote === '"'){
    advanceBy(context,1);//删除 '|"
    const endIndex = context.source.indexOf(quote)
    content = parseTextData(context,endIndex);
    advanceBy(context,1);//删除 '|"
  }
  return {
    content,
    loc:getSelection(context,start),
  }
}

/**解析属性对 */
function parseAttribute(context){
  let start = getCursor(context);
  //属性名
  let match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
  let name = match[0];

  advanceBy(context,name.length);//去掉属性名

  advanceBySpaces(context);//删掉空格 a = "1"
  advanceBy(context,1);//删掉 =

  let value = parseAttributeValue(context);

  return {
    type:NodeTypes.ATTRIBUTE,
    name,
    value:{
      type:NodeTypes.TEXT,
      ...value,
    },
    loc:getSelection(context,start),
  }
}

/**解析标签属性 */
function parseAttributes(context){
  const props = [];

  while(context.source.length && !context.source.startsWith(">")){
    const prop = parseAttribute(context);
    props.push(prop);
    advanceBySpaces(context);
  }
  
  return props;
}

/**解析标签 */
function parseTag(context){
  let start = getCursor(context);
  
  //标签 <br /> <div class="ss"> </div>
  let match = /^<\/?([a-z][^ \t\r\n>]*)/.exec(context.source);
  const tag = match[1];//标签名
  advanceBy(context,match[0].length);//删除 <div
  advanceBySpaces(context);//去除空格

  //解析属性 <div class="ss"> </div>
  let props = parseAttributes(context);

  /**是否是自闭和标签 */
  let isSelfClosing = context.source.startsWith("/>");

  advanceBy(context,isSelfClosing ? 2 : 1);//删除 /> 或者 >

  return {
    type:NodeTypes.ELEMENT,
    tag,
    props,
    isSelfClosing,
    children:[],
    loc:getSelection(context,start)
  }
}

/**解析标签 */
function parseElement(context){
  //假如输入的是 <div></div>
  let ele = parseTag(context);//处理之后就是 </div>
  
  //处理其中的内容（子元素）
  let children = parseChildren(context);//可能没有儿子，需要在parseChildren的isEnd添加条件，遇到 </ 也直接结束，否则会导致死循环

  if(context.source.startsWith("</")){//去除 </div>
    parseTag(context)
  }
  // 更新位置信息
  ele.loc = getSelection(context,ele.loc.start);
  ele.children = children;
  return ele;
}

/**将模版转成抽象语法树 */
function parse(template) {

  // 解析规则就是一个个字符进行判断，并且解析完毕后删除已经解析过的字符串

  // 创建一个解析上下文（解析位置标记等）来进行处理
  const context = createParserContext(template);

  let start = getCursor(context);

  //解析内容（子元素）
  let nodes = createRoot(parseChildren(context),getSelection(context,start));
  

  console.log(nodes);
}

/**创建 Fragment 包裹子节点 */
function createRoot(children,loc){
  return {
    type:NodeTypes.ROOT,
    children,
    loc
  }
}

/**解析内容（子元素） */
function parseChildren(context){
  /**
   * 内容情况
   * 1. <  :元素
   * 2. {{}} :表达式
   * 3. 其他情况 :文本
   */
  const nodes = [];
  while(!isEnd(context)){
    const source = context.source;
    let node;
    if(source.startsWith("{{")){//表达式
      node = parseInterpolation(context);
    }else if(source[0] == "<"){//元素
      node = parseElement(context);
    }
    if(!node){//文本
      node = parseText(context);
    }
    nodes.push(node);
  }
  //去除没有意义的空白节点
  nodes.forEach((node,i) => {
    if(node.type === NodeTypes.TEXT && !/[^\t\r\n\f ]/.test(node.content)){
      nodes[i] = null;
    }
  })

  return nodes.filter(Boolean);
}

/**解析模版
 * @param template 模版字符串
 */
export function compiler(template){
  //将模版转成抽象语法树
  const ast = parse(template);//这里需要将html语法转化成js语法——编译原理

  // //对ast语法树进行一些预处理
  // transform(ast);//会生成一些信息

  // //代码生成
  // return generate(ast);//最终生成代码 和vue2一样

  return ast;
}
