var VueCompilerCore = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b ||= {})
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/compiler-core/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    compiler: () => compiler
  });

  // packages/shared/src/index.ts
  var isString = (val) => {
    return typeof val === "string";
  };
  var isArray = Array.isArray;

  // packages/compiler-core/src/runtimeHelpers.ts
  var TO_DISPLAY_STRING = Symbol("toDisplayString");
  var CREATE_ELEMENT_VNODE = Symbol("createElementVNode");
  var helperMap = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    [CREATE_ELEMENT_VNODE]: "createElementVNode"
  };

  // packages/compiler-core/src/ast.ts
  function createVNodeCall(context, tag, props, children) {
    if (context) {
      context.helper(CREATE_ELEMENT_VNODE);
    }
    return {
      type: 1 /* ELEMENT */,
      tag,
      props,
      children
    };
  }

  // packages/compiler-core/src/codegen.ts
  function generate(ast, options = {}) {
    const context = createCodegenContext(ast, options);
    const { push, mode } = context;
    if (mode === "module") {
      genModulePreamble(ast, context);
    } else {
      genFunctionPreamble(ast, context);
    }
    const functionName = "render";
    const args = ["_ctx"];
    const signature = args.join(", ");
    push(`function ${functionName}(${signature}) {`);
    push("return ");
    genNode(ast.codegenNode, context);
    push("}");
    return {
      code: context.code
    };
  }
  function genFunctionPreamble(ast, context) {
    const { runtimeGlobalName, push, newline } = context;
    const VueBinging = runtimeGlobalName;
    const aliasHelper = (s) => `${helperMap[s]} : _${helperMap[s]}`;
    if (ast.helpers.length > 0) {
      push(
        `
        const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging} 

      `
      );
    }
    newline();
    push(`return `);
  }
  function genNode(node, context) {
    switch (node.type) {
      case 5 /* INTERPOLATION */:
        genInterpolation(node, context);
        break;
      case 4 /* SIMPLE_EXPRESSION */:
        genExpression(node, context);
        break;
      case 1 /* ELEMENT */:
        genElement(node, context);
        break;
      case 8 /* COMPOUND_EXPRESSION */:
        genCompoundExpression(node, context);
        break;
      case 2 /* TEXT */:
        genText(node, context);
        break;
      default:
        break;
    }
  }
  function genCompoundExpression(node, context) {
    const { push } = context;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (isString(child)) {
        push(child);
      } else {
        genNode(child, context);
      }
    }
  }
  function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
  }
  function genElement(node, context) {
    const { push, helper } = context;
    const { tag, props, children } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullableArgs([tag, props, children]), context);
    push(`)`);
  }
  function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (isString(node)) {
        push(`${node}`);
      } else {
        genNode(node, context);
      }
      if (i < nodes.length - 1) {
        push(", ");
      }
    }
  }
  function genNullableArgs(args) {
    let i = args.length;
    while (i--) {
      if (args[i] != null)
        break;
    }
    return args.slice(0, i + 1).map((arg) => arg || "null");
  }
  function genExpression(node, context) {
    context.push(node.content, node);
  }
  function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
  }
  function genModulePreamble(ast, context) {
    const { push, newline, runtimeModuleName } = context;
    if (ast.helpers.length) {
      const code = `import {${ast.helpers.map((s) => `${helperMap[s]} as _${helperMap[s]}`).join(", ")} } from ${JSON.stringify(runtimeModuleName)}`;
      push(code);
    }
    newline();
    push(`export `);
  }
  function createCodegenContext(ast, { runtimeModuleName = "vue", runtimeGlobalName = "Vue", mode = "function" }) {
    const context = {
      code: "",
      mode,
      runtimeModuleName,
      runtimeGlobalName,
      helper(key) {
        return `_${helperMap[key]}`;
      },
      push(code) {
        context.code += code;
      },
      newline() {
        context.code += "\n";
      }
    };
    return context;
  }

  // packages/compiler-core/src/parse.ts
  function createParserContext(template) {
    return {
      line: 1,
      column: 1,
      offset: 0,
      source: template,
      originalSource: template
    };
  }
  function isEnd(context) {
    const source = context.source;
    if (source.startsWith("</"))
      return true;
    return !source;
  }
  function getCursor(context) {
    let { line, column, offset } = context;
    return { line, column, offset };
  }
  function advancePositionWithMutation(context, source, endIndex) {
    let linesCount = 0;
    let linePos = -1;
    for (let i = 0; i < endIndex; i++) {
      if (source.charCodeAt(i) == 10) {
        linesCount++;
        linePos = i;
      }
    }
    context.line += linesCount;
    context.column = linePos === -1 ? context.column + endIndex : endIndex - linePos;
    context.offset += endIndex;
  }
  function advanceBy(context, endIndex) {
    let source = context.source;
    advancePositionWithMutation(context, source, endIndex);
    context.source = source.slice(endIndex);
  }
  function parseTextData(context, endIndex) {
    const rawText = context.source.slice(0, endIndex);
    advanceBy(context, endIndex);
    return rawText;
  }
  function getSelection(context, start, end) {
    end = end || getCursor(context);
    return {
      start,
      end,
      source: context.originalSource.slice(start.offset, end.offset)
    };
  }
  function parseText(context) {
    let endTokens = ["<", "{{"];
    let endIndex = context.source.length;
    for (let i = 0; i < endTokens.length; i++) {
      let index = context.source.indexOf(endTokens[i], 1);
      if (index !== -1 && endIndex > index) {
        endIndex = index;
      }
    }
    const start = getCursor(context);
    const content = parseTextData(context, endIndex);
    return {
      type: 2 /* TEXT */,
      content,
      loc: getSelection(context, start)
    };
  }
  function parseInterpolation(context) {
    const start = getCursor(context);
    const closeIndex = context.source.indexOf("}}", 2);
    advanceBy(context, 2);
    const innerStart = getCursor(context);
    const innerEnd = getCursor(context);
    const rawContentLength = closeIndex - 2;
    let preContent = parseTextData(context, rawContentLength);
    let content = preContent.trim();
    let startOffset = preContent.indexOf(content);
    if (startOffset > 0) {
      advancePositionWithMutation(innerStart, preContent, startOffset);
    }
    let endOffset = startOffset + content.length;
    advancePositionWithMutation(innerEnd, preContent, endOffset);
    advanceBy(context, 2);
    return {
      type: 5 /* INTERPOLATION */,
      content: {
        type: 4 /* SIMPLE_EXPRESSION */,
        content,
        loc: getSelection(context, innerStart, innerEnd)
      },
      loc: getSelection(context, start)
    };
  }
  function advanceBySpaces(context) {
    let match = /^[ \t\r\n]+/.exec(context.source);
    if (match) {
      advanceBy(context, match[0].length);
    }
  }
  function parseAttributeValue(context) {
    let start = getCursor(context);
    let quote = context.source[0];
    let content;
    if (quote === "'" || quote === '"') {
      advanceBy(context, 1);
      const endIndex = context.source.indexOf(quote);
      content = parseTextData(context, endIndex);
      advanceBy(context, 1);
    }
    return {
      content,
      loc: getSelection(context, start)
    };
  }
  function parseAttribute(context) {
    let start = getCursor(context);
    let match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
    let name = match[0];
    advanceBy(context, name.length);
    advanceBySpaces(context);
    advanceBy(context, 1);
    let value = parseAttributeValue(context);
    return {
      type: 6 /* ATTRIBUTE */,
      name,
      value: __spreadValues({
        type: 2 /* TEXT */
      }, value),
      loc: getSelection(context, start)
    };
  }
  function parseAttributes(context) {
    const props = [];
    while (context.source.length && !context.source.startsWith(">")) {
      const prop = parseAttribute(context);
      props.push(prop);
      advanceBySpaces(context);
    }
    return props;
  }
  function parseTag(context) {
    let start = getCursor(context);
    let match = /^<\/?([a-z][^ \t\r\n>]*)/.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceBySpaces(context);
    let props = parseAttributes(context);
    let isSelfClosing = context.source.startsWith("/>");
    advanceBy(context, isSelfClosing ? 2 : 1);
    return {
      type: 1 /* ELEMENT */,
      tag,
      props,
      isSelfClosing,
      children: [],
      loc: getSelection(context, start)
    };
  }
  function parseElement(context) {
    let ele = parseTag(context);
    let children = parseChildren(context);
    if (context.source.startsWith("</")) {
      parseTag(context);
    }
    ele.loc = getSelection(context, ele.loc.start);
    ele.children = children;
    return ele;
  }
  function parse(template) {
    const context = createParserContext(template);
    let start = getCursor(context);
    let nodes = createRoot(parseChildren(context), getSelection(context, start));
    return nodes;
  }
  function createRoot(children, loc) {
    return {
      type: 0 /* ROOT */,
      children,
      loc,
      helpers: []
    };
  }
  function parseChildren(context) {
    const nodes = [];
    while (!isEnd(context)) {
      const source = context.source;
      let node;
      if (source.startsWith("{{")) {
        node = parseInterpolation(context);
      } else if (source[0] == "<") {
        node = parseElement(context);
      }
      if (!node) {
        node = parseText(context);
      }
      nodes.push(node);
    }
    nodes.forEach((node, i) => {
      if (node.type === 2 /* TEXT */ && !/[^\t\r\n\f ]/.test(node.content)) {
        nodes[i] = null;
      }
    });
    return nodes.filter(Boolean);
  }

  // packages/compiler-core/src/transforms/transformElement.ts
  function transformElement(node, context) {
    if (node.type === 1 /* ELEMENT */) {
      return () => {
        const vnodeTag = `'${node.tag}'`;
        const vnodeProps = node.props;
        let vnodeChildren = node.children;
        if (node.children.length > 0) {
          if (node.children.length === 1) {
            const child = node.children[0];
            vnodeChildren = child;
          }
        }
        node.codegenNode = createVNodeCall(
          context,
          vnodeTag,
          vnodeProps,
          vnodeChildren
        );
      };
    }
  }

  // packages/compiler-core/src/transforms/transformExpression.ts
  function transformExpression(node, context) {
    if (node.type === 5 /* INTERPOLATION */) {
      let content = node.content.content;
      node.content.content = `_ctx.${content}`;
    }
  }

  // packages/compiler-core/src/transforms/transformText.ts
  function transformText(node, context) {
    if (node.type === 1 /* ELEMENT */ || node.type === 0 /* ROOT */) {
      return () => {
        const children = node.children;
        let currentContainer;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (isText(child)) {
            for (let j = i + 1; j < children.length; j++) {
              const next = children[j];
              if (isText(next)) {
                if (!currentContainer) {
                  currentContainer = children[i] = {
                    type: 8 /* COMPOUND_EXPRESSION */,
                    loc: child.loc,
                    children: [child]
                  };
                }
                currentContainer.children.push(` + `, next);
                children.splice(j, 1);
                j--;
              } else {
                currentContainer = void 0;
                break;
              }
            }
          }
        }
      };
    }
  }
  function isText(node) {
    return node.type === 5 /* INTERPOLATION */ || node.type === 2 /* TEXT */;
  }

  // packages/compiler-core/src/transform.ts
  function createTransformContext(root) {
    const context = {
      currentNode: root,
      parent: null,
      helpers: /* @__PURE__ */ new Map(),
      helper(name) {
        const count = context.helpers.get(name) || 0;
        context.helpers.set(name, count + 1);
        return name;
      },
      nodeTransforms: [
        transformElement,
        transformText,
        transformExpression
      ]
    };
    return context;
  }
  function traverse(node, context) {
    context.currentNode = node;
    const transforms = context.nodeTransforms;
    const exitFns = [];
    for (let i2 = 0; i2 < transforms.length; i2++) {
      let onExit = transforms[i2](node, context);
      if (onExit)
        exitFns.push(onExit);
      if (!context.currentNode)
        return;
    }
    switch (node.type) {
      case 5 /* INTERPOLATION */:
        context.helper(TO_DISPLAY_STRING);
        break;
      case 1 /* ELEMENT */:
      case 0 /* ROOT */:
        for (let i2 = 0; i2 < node.children.length; i2++) {
          context.parent = node;
          traverse(node.children[i2], context);
        }
    }
    context.currentNode = node;
    let i = exitFns.length;
    while (i--) {
      exitFns[i]();
    }
  }
  function createRootCodegen(root, context) {
    const { children } = root;
    const child = children[0];
    if (child.type === 1 /* ELEMENT */ && child.codegenNode) {
      const codegenNode = child.codegenNode;
      root.codegenNode = codegenNode;
    } else {
      root.codegenNode = child;
    }
  }
  function transform(ast) {
    const context = createTransformContext(ast);
    traverse(ast, context);
    createRootCodegen(ast, context);
    ast.helpers.push(...context.helpers.keys());
  }

  // packages/compiler-core/src/index.ts
  function compiler(template) {
    const ast = parse(template);
    transform(ast);
    return generate(ast);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=compiler-core.global.js.map
