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
  const source = context.source
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
    let index = context.source.indexOf(endTokens[i]);
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

/**将模版转成抽象语法树 */
function parse(template) {

  // 解析规则就是一个个字符进行判断，并且解析完毕后删除已经解析过的字符串

  // 创建一个解析上下文（解析位置标记等）来进行处理
  const context = createParserContext(template);

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
    
    }else if(source[0] == "<"){//元素
    
    }
    if(!node){//文本
      node = parseText(context);
    }
    nodes.push(node);
    console.log(nodes);
    break;
  }
  
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
