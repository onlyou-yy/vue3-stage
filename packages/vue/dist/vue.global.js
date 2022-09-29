var Vue = (() => {
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

  // packages/vue/src/index.ts
  var src_exports2 = {};
  __export(src_exports2, {
    Fragment: () => Fragment,
    LifecycleHooks: () => LifecycleHooks,
    ReactiveEffect: () => ReactiveEffect,
    Text: () => Text,
    activeEffect: () => activeEffect,
    computed: () => computed,
    createApp: () => createApp,
    createComponentInstance: () => createComponentInstance,
    createElementBlock: () => createElementBlock,
    createElementVNode: () => createVNode,
    createRenderder: () => createRenderder,
    createTextVNode: () => createTextVNode,
    createVNode: () => createVNode,
    currentInstance: () => currentInstance,
    effect: () => effect,
    getCurrentInstance: () => getCurrentInstance,
    h: () => h,
    hasPropsChange: () => hasPropsChange,
    isSameVnode: () => isSameVnode,
    isVnode: () => isVnode,
    onBeforeMount: () => onBeforeMount,
    onBeforeUpdate: () => onBeforeUpdate,
    onMounted: () => onMounted,
    onUpdated: () => onUpdated,
    openBlock: () => openBlock,
    proxyRefs: () => proxyRefs,
    reactive: () => reactive,
    ref: () => ref,
    registerRuntimeCompiler: () => registerRuntimeCompiler,
    setCurrentInstance: () => setCurrentInstance,
    setupComponent: () => setupComponent,
    toDisplayString: () => toDisplayString,
    toRef: () => toRef,
    toRefs: () => toRefs,
    track: () => track,
    trackEffects: () => trackEffects,
    trigger: () => trigger,
    triggerEffects: () => triggerEffects,
    updateProps: () => updateProps,
    watch: () => watch
  });

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Fragment: () => Fragment,
    LifecycleHooks: () => LifecycleHooks,
    ReactiveEffect: () => ReactiveEffect,
    Text: () => Text,
    activeEffect: () => activeEffect,
    computed: () => computed,
    createApp: () => createApp,
    createComponentInstance: () => createComponentInstance,
    createElementBlock: () => createElementBlock,
    createElementVNode: () => createVNode,
    createRenderder: () => createRenderder,
    createTextVNode: () => createTextVNode,
    createVNode: () => createVNode,
    currentInstance: () => currentInstance,
    effect: () => effect,
    getCurrentInstance: () => getCurrentInstance,
    h: () => h,
    hasPropsChange: () => hasPropsChange,
    isSameVnode: () => isSameVnode,
    isVnode: () => isVnode,
    onBeforeMount: () => onBeforeMount,
    onBeforeUpdate: () => onBeforeUpdate,
    onMounted: () => onMounted,
    onUpdated: () => onUpdated,
    openBlock: () => openBlock,
    proxyRefs: () => proxyRefs,
    reactive: () => reactive,
    ref: () => ref,
    registerRuntimeCompiler: () => registerRuntimeCompiler,
    setCurrentInstance: () => setCurrentInstance,
    setupComponent: () => setupComponent,
    toDisplayString: () => toDisplayString,
    toRef: () => toRef,
    toRefs: () => toRefs,
    track: () => track,
    trackEffects: () => trackEffects,
    trigger: () => trigger,
    triggerEffects: () => triggerEffects,
    updateProps: () => updateProps,
    watch: () => watch
  });

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  function cleanupEffect(effect2) {
    let { deps } = effect2;
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    deps.length = 0;
  }
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.parent = null;
      this.active = true;
      this.deps = [];
    }
    run() {
      if (!this.active)
        return this.fn();
      try {
        this.parent = activeEffect;
        activeEffect = this;
        cleanupEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = null;
      }
    }
    stop() {
      if (this.active) {
        this.active = false;
        cleanupEffect(this);
      }
    }
  };
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, type, key) {
    if (!activeEffect)
      return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    trackEffects(dep);
  }
  function trackEffects(dep) {
    if (activeEffect) {
      let shouldTrack = !dep.has(activeEffect);
      if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
      }
    }
  }
  function trigger(target, type, key, value, oldValue) {
    let depMap = targetMap.get(target);
    if (!depMap)
      return;
    let effects = depMap.get(key);
    if (effects) {
      triggerEffects(effects);
    }
  }
  function triggerEffects(effects) {
    effects = new Set(effects);
    effects.forEach((effect2) => {
      if (effect2 !== activeEffect) {
        if (effect2.scheduler) {
          effect2.scheduler();
        } else {
          effect2.run();
        }
      }
    });
  }

  // packages/shared/src/index.ts
  var isObject = (val) => {
    return typeof val === "object" && val !== null;
  };
  var isString = (val) => {
    return typeof val === "string";
  };
  var isNumber = (val) => {
    return typeof val === "number";
  };
  var isFunction = (val) => {
    return typeof val === "function";
  };
  var isArray = Array.isArray;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (value, key) => hasOwnProperty.call(value, key);
  var invokeArrayFns = (fns) => {
    for (let i = 0; i < fns.length; i++) {
      fns[i]();
    }
  };

  // packages/reactivity/src/baseHandler.ts
  function isReactive(value) {
    return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
  }
  var mutableHandlers = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, "get", key);
      let res = Reflect.get(target, key, receiver);
      if (isObject(res)) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      let oldValue = target[key];
      let result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, "set", key, value, oldValue);
      }
      return result;
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target)) {
      return;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    const exisitingProxy = reactiveMap.get(target);
    if (exisitingProxy) {
      return exisitingProxy;
    }
    const proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }

  // packages/reactivity/src/computed.ts
  var ComputedRefImpl = class {
    constructor(getter, setter) {
      this.getter = getter;
      this.setter = setter;
      this._dirty = true;
      this.__v_isReadonly = true;
      this.__v_isRef = true;
      this.dep = /* @__PURE__ */ new Set();
      this.effect = new ReactiveEffect(getter, () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffects(this.dep);
        }
      });
    }
    get value() {
      trackEffects(this.dep);
      if (this._dirty) {
        this._dirty = false;
        this._value = this.effect.run();
      }
      return this._value;
    }
    set value(newValue) {
      this.setter(newValue);
    }
  };
  var computed = (getterOrOptions) => {
    let onlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    if (onlyGetter) {
      getter = getterOrOptions;
      setter = () => {
        console.log("no set");
      };
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
  };

  // packages/reactivity/src/watch.ts
  function traversal(value, set = /* @__PURE__ */ new Set()) {
    if (!isObject(value))
      return value;
    if (set.has(value))
      return value;
    set.add(value);
    for (let key in value) {
      traversal(value[key], set);
    }
    return value;
  }
  function watch(source, cb) {
    let getter;
    if (isReactive(source)) {
      getter = () => traversal(source);
    } else if (isFunction(source)) {
      getter = source;
    } else {
      return;
    }
    let cleanup;
    const onCleanup = (fn) => {
      cleanup = fn;
    };
    let oldValue;
    const job = () => {
      if (cleanup)
        cleanup();
      const newValue = effect2.run();
      cb(newValue, oldValue);
      oldValue = newValue;
    };
    const effect2 = new ReactiveEffect(getter, job);
    oldValue = effect2.run();
  }

  // packages/reactivity/src/ref.ts
  function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
  }
  var RefImpl = class {
    constructor(rawValue) {
      this.rawValue = rawValue;
      this.dep = /* @__PURE__ */ new Set();
      this.__v_isRef = true;
      this._value = toReactive(rawValue);
    }
    get value() {
      trackEffects(this.dep);
      return this._value;
    }
    set value(newValue) {
      if (newValue !== this.rawValue) {
        this._value = toReactive(newValue);
        this.rawValue = newValue;
        triggerEffects(this.dep);
      }
    }
  };
  function ref(value) {
    return new RefImpl(value);
  }
  var ObjectRefImpl = class {
    constructor(object, key) {
      this.object = object;
      this.key = key;
    }
    get value() {
      return this.object[this.key];
    }
    set value(newValue) {
      this.object[this.key] = newValue;
    }
  };
  function toRef(object, key) {
    return new ObjectRefImpl(object, key);
  }
  function toRefs(object) {
    let result = isArray(object) ? new Array(object.length) : {};
    for (let key in object) {
      result[key] = toRef(object, key);
    }
    return result;
  }
  function proxyRefs(object) {
    return new Proxy(object, {
      get(target, key, recevier) {
        let r = Reflect.get(target, key, recevier);
        return r.__v_isRef ? r.value : r;
      },
      set(target, key, value, recevier) {
        let oldValue = target[key];
        if (oldValue.__v_isRef) {
          oldValue.value = value;
          return true;
        } else {
          return Reflect.set(target, key, value, recevier);
        }
      }
    });
  }

  // packages/runtime-core/src/componentProps.ts
  function initProps(instance, rawProps) {
    const props = {};
    const attrs = {};
    const options = instance.propsOptions || {};
    if (rawProps) {
      for (let key in rawProps) {
        let value = rawProps[key];
        if (hasOwn(options, key)) {
          props[key] = value;
        } else {
          attrs[key] = value;
        }
      }
    }
    instance.props = reactive(props);
    instance.attrs = attrs;
  }

  // packages/runtime-core/src/component.ts
  var currentInstance = null;
  var setCurrentInstance = (instance) => currentInstance = instance;
  var getCurrentInstance = () => currentInstance;
  function createComponentInstance(vnode) {
    const instance = {
      data: null,
      vnode,
      subTree: null,
      isMounted: false,
      update: null,
      propsOptions: vnode.type.props,
      props: {},
      attrs: {},
      proxy: null,
      render: null,
      setupState: {},
      slots: {}
    };
    return instance;
  }
  var publicPropertyMap = {
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots
  };
  var publicInstanceProxy = {
    get(target, key) {
      let { data, props, setupState } = target;
      if (data && hasOwn(data, key)) {
        return data[key];
      } else if (setupState && hasOwn(setupState, key)) {
        return setupState[key];
      } else if (props && hasOwn(props, key)) {
        return props[key];
      }
      let getter = publicPropertyMap[key];
      if (getter) {
        return getter(target);
      }
    },
    set(target, key, value) {
      let { data, props, setupState } = target;
      if (data && hasOwn(data, key)) {
        data[key] = value;
        return true;
      } else if (setupState && hasOwn(setupState, key)) {
        setupState[key] = value;
        return true;
      } else if (props && hasOwn(props, key)) {
        console.warn("\u4E0D\u80FD\u4FEE\u6539props\u4E2D\u7684\u6570\u636E\uFF1A" + key);
        return false;
      }
      return true;
    }
  };
  function initSlots(instance, children) {
    if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
      instance.slots = children;
    }
  }
  function setupComponent(instance) {
    let { props, type, children } = instance.vnode;
    initProps(instance, props);
    initSlots(instance, children);
    instance.proxy = new Proxy(instance, publicInstanceProxy);
    let data = type.data;
    if (data) {
      if (!isFunction(data))
        return console.warn("\u5FC5\u987B\u662F\u4E00\u4E2A\u51FD\u6570");
      instance.data = reactive(data.call(instance.proxy));
    }
    let setup = type.setup;
    if (setup) {
      const setupContext = {
        emit: (event, ...args) => {
          let eventName = `on${event[0].toUpperCase()}${event.slice(1)}`;
          let handler = instance.vnode.props[eventName];
          handler && handler(...args);
        },
        attrs: instance.attrs,
        slots: instance.slots
      };
      setCurrentInstance(instance);
      const setupResult = setup(instance.props, setupContext);
      setCurrentInstance(null);
      if (isFunction(setupResult)) {
        instance.render = setupResult;
      } else if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
      }
    }
    if (!instance.render) {
      instance.render = type.render;
    }
  }
  var hasPropsChange = (prevProps = {}, nextProps = {}) => {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      if (nextProps[key] !== prevProps[key]) {
        return true;
      }
    }
    return false;
  };
  function updateProps(prevProps, nextProps) {
    for (let key in nextProps) {
      prevProps[key] = nextProps[key];
    }
    for (let key in prevProps) {
      if (!hasOwn(nextProps, key)) {
        delete prevProps[key];
      }
    }
  }
  var compile;
  function registerRuntimeCompiler(_compile) {
    compile = _compile;
  }

  // packages/runtime-core/src/scheduler.ts
  var queue = [];
  var isFlushing = false;
  var resolvePromise = Promise.resolve();
  function queueJob(job) {
    if (!queue.includes(job)) {
      queue.push(job);
    }
    if (!isFlushing) {
      isFlushing = true;
      resolvePromise.then(() => {
        isFlushing = false;
        let copy = queue.slice(0);
        queue.length = 0;
        for (let i = 0; i < copy.length; i++) {
          let job2 = copy[i];
          job2();
        }
        copy.length = 0;
      });
    }
  }

  // packages/runtime-core/src/sequence.ts
  function getSequence(arr) {
    const len = arr.length;
    const result = [0];
    const p = new Array(len).fill(0);
    let resultLastIndex;
    let start;
    let end;
    let middle;
    for (let i2 = 0; i2 < len; i2++) {
      let arrI = arr[i2];
      if (arrI !== 0) {
        resultLastIndex = result[result.length - 1];
        if (arr[resultLastIndex] < arrI) {
          result.push(i2);
          p[i2] = resultLastIndex;
          continue;
        }
        start = 0;
        end = result.length - 1;
        while (start < end) {
          middle = (start + end) / 2 | 0;
          if (arr[result[middle]] < arrI) {
            start = middle + 1;
          } else {
            end = middle;
          }
        }
        if (arr[result[start]] > arrI) {
          result[start] = i2;
          p[i2] = result[start - 1];
        }
      }
    }
    let i = result.length;
    let last = result[i - 1];
    while (i-- > 0) {
      result[i] = last;
      last = p[last];
    }
    return result;
  }

  // packages/runtime-core/src/vnode.ts
  var Text = Symbol("Text");
  var Fragment = Symbol("Fragment");
  function isVnode(value) {
    return !!(value && value.__v_isVnode);
  }
  function isSameVnode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  function createVNode(type, props = {}, children = null, patchFlag = 0) {
    let shapeFlag = isString(type) ? 1 /* ELEMENT */ : isObject(type) ? 4 /* STATEFUL_COMPONENT */ : 0;
    const vnode = {
      type,
      props,
      children,
      key: props == null ? void 0 : props["key"],
      el: null,
      __v_isVnode: true,
      shapeFlag,
      patchFlag
    };
    if (children) {
      let type2 = 0;
      if (isArray(children)) {
        type2 = 16 /* ARRAY_CHILDREN */;
      } else if (isObject(children)) {
        type2 = 32 /* SLOTS_CHILDREN */;
      } else {
        children = String(children);
        type2 = 8 /* TEXT_CHILDREN */;
      }
      vnode.shapeFlag |= type2;
    }
    if (currentBlock && patchFlag > 0) {
      currentBlock.push(vnode);
    }
    return vnode;
  }
  var currentBlock = null;
  function openBlock() {
    currentBlock = [];
  }
  function createElementBlock(type, props, children, patchFlag) {
    return setupBlock(createVNode(type, props, children, patchFlag));
  }
  function setupBlock(vnode) {
    vnode.dynamicChildren = currentBlock;
    currentBlock = null;
    return vnode;
  }
  function createTextVNode(text) {
    return createVNode(Text, {}, text);
  }
  function toDisplayString(val) {
    return isString(val) ? val : val == null ? "" : isObject(val) ? JSON.stringify(val) : String(val);
  }

  // packages/runtime-core/src/renderer.ts
  function createRenderder(renderOptions2) {
    let {
      insert: hostInsert,
      remove: hostRemove,
      setElementText: hostSetElementText,
      setText: hostSetText,
      querySelector: hostQuerySelector,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      createElement: hostCreateElement,
      createText: hostCreateText,
      patchProp: hostPatchProp
    } = renderOptions2;
    const normalize = (children, i) => {
      if (isString(children[i]) || isNumber(children[i])) {
        let vnode = createVNode(Text, null, children[i]);
        children[i] = vnode;
      }
      return children[i];
    };
    const mountChildren = (children, container) => {
      for (let i = 0; i < children.length; i++) {
        let child = normalize(children, i);
        patch(null, child, container);
      }
    };
    const mountElement = (vnode, container, anchor) => {
      let { type, props, children, shapeFlag } = vnode;
      let el = vnode.el = hostCreateElement(type);
      if (props) {
        for (let key in props) {
          hostPatchProp(el, key, null, props[key]);
        }
      }
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
      }
      hostInsert(el, container, anchor);
    };
    const processText = (n1, n2, container) => {
      if (n1 == null) {
        hostInsert(n2.el = hostCreateText(n2.children), container);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          hostSetText(el, n2.children);
        }
      }
    };
    const patchProps = (oldProps, newProps, el) => {
      for (let key in newProps) {
        hostPatchProp(el, key, oldProps[key], newProps[key]);
      }
      for (let key in oldProps) {
        if (newProps[key] == null) {
          hostPatchProp(el, key, oldProps[key], void 0);
        }
      }
    };
    const unmountChildren = (children) => {
      for (let i = 0; i < children.length; i++) {
        unmount(children[i]);
      }
    };
    const patchKeyedChildren = (c1, c2, el) => {
      let i = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
      while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i];
        if (isSameVnode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        i++;
      }
      while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2];
        if (isSameVnode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        e1--;
        e2--;
      }
      if (i > e1) {
        if (i <= e2) {
          while (i <= e2) {
            const nextPos = e2 + 1;
            const anchor = nextPos < c2.length ? c2[nextPos].el : null;
            patch(null, c2[i], el, anchor);
            i++;
          }
        }
      } else if (i > e2) {
        if (i <= e2) {
          while (i <= e1) {
            unmount(c1[i]);
            i++;
          }
        }
      }
      console.log(i, e1, e2);
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (let i2 = s2; i2 <= e2; i2++) {
        keyToNewIndexMap.set(c2[i2].key, i2);
      }
      const toBePatched = e2 - s2 + 1;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      for (let i2 = s1; i2 <= e1; i2++) {
        const oldChild = c1[i2];
        let newIndex = keyToNewIndexMap.get(oldChild.key);
        if (newIndex == void 0) {
          unmount(oldChild);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i2 + 1;
          patch(oldChild, c2[newIndex], el);
        }
      }
      let increment = getSequence(newIndexToOldIndexMap);
      console.log(increment);
      let j = increment.length - 1;
      for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
        let index = i2 + s2;
        let current = c2[index];
        let anchor = index + 1 < c2.length ? c2[index + 1].el : null;
        if (newIndexToOldIndexMap[i2] === 0) {
          patch(null, current, el, anchor);
        } else {
          if (i2 != increment[j]) {
            hostInsert(current.el, el, anchor);
          } else {
            j--;
            console.log("\u63D2\u5165");
          }
        }
      }
    };
    const patchChildren = (n1, n2, el) => {
      const c1 = n1.children;
      const c2 = n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const shapeFlag = n2.shapeFlag;
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            patchKeyedChildren(c1, c2, el);
          } else {
            unmountChildren(c1);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, "");
          }
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(c2, el);
          }
        }
      }
    };
    const patchBlockChildren = (n1, n2) => {
      for (let i = 0; i < n2.dynamicChildren.length; i++) {
        patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i]);
      }
    };
    const patchElement = (n1, n2) => {
      let el = n2.el = n1.el;
      let oldProps = n1.props || {};
      let newProps = n2.props || {};
      let { patchFlag } = n2;
      if (patchFlag & 2 /* CLASS */) {
        if (oldProps.class !== newProps.class) {
          hostPatchProp(el, "class", null, newProps.class);
        }
      } else {
        patchProps(oldProps, newProps, el);
      }
      if (n2.dynamicChildren) {
        patchBlockChildren(n1, n2);
      } else {
        patchChildren(n1, n2, el);
      }
    };
    const processElement = (n1, n2, container, anchor) => {
      if (n1 === null) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2);
      }
    };
    const processFragment = (n1, n2, container) => {
      if (n1 == null) {
        mountChildren(n2.children, container);
      } else {
        patchChildren(n1, n2, container);
      }
    };
    const mountComponent = (vnode, container, anchor) => {
      let instance = vnode.component = createComponentInstance(vnode);
      setupComponent(instance);
      setupRenderEffect(instance, container, anchor);
    };
    const updateComponentPreRender = (instance, next) => {
      instance.next = null;
      instance.vnode = next;
      updateProps(instance.props, next.props);
    };
    const setupRenderEffect = (instance, container, anchor) => {
      let { render: render2 } = instance;
      const componentUpdateFn = () => {
        if (!instance.isMounted) {
          let { bm, m } = instance;
          if (bm) {
            invokeArrayFns(bm);
          }
          const subTree = render2.call(instance.proxy, instance.proxy);
          patch(null, subTree, container, anchor);
          if (m) {
            invokeArrayFns(m);
          }
          instance.subTree = subTree;
          instance.isMounted = true;
        } else {
          let { next, bu, u } = instance;
          if (next) {
            updateComponentPreRender(instance, next);
          }
          if (bu) {
            invokeArrayFns(bu);
          }
          const subTree = render2.call(instance.proxy, instance.proxy);
          patch(instance.subTree, subTree, container, anchor);
          instance.subTree = subTree;
          if (u) {
            invokeArrayFns(u);
          }
        }
      };
      const effect2 = new ReactiveEffect(componentUpdateFn, () => queueJob(instance.update));
      let update = instance.update = effect2.run.bind(effect2);
      update();
    };
    const shouldUpdateComponent = (n1, n2) => {
      const { props: prevProps, children: prevChildren } = n1;
      const { props: nextProps, children: nextChildren } = n2;
      if (prevProps === nextProps)
        return false;
      if (prevChildren || nextChildren) {
        return true;
      }
      return hasPropsChange(prevProps, nextProps);
    };
    const updateComponent = (n1, n2) => {
      const instance = n2.component = n1.component;
      if (shouldUpdateComponent(n1, n2)) {
        instance.next = n2;
        instance.update();
      }
    };
    const processComponent = (n1, n2, container, anchor = null) => {
      if (n1 == null) {
        mountComponent(n2, container, anchor);
      } else {
        updateComponent(n1, n2);
      }
    };
    const patch = (n1, n2, container, anchor = null) => {
      if (n1 == n2)
        return;
      if (n1 && !isSameVnode(n1, n2)) {
        unmount(n1);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */) {
            processElement(n1, n2, container, anchor);
          } else if (shapeFlag & 6 /* COMPONENT */) {
            processComponent(n1, n2, container, anchor);
          }
      }
    };
    const unmount = (vnode) => {
      hostRemove(vnode.el);
    };
    const render = (vnode, container) => {
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode);
        }
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render
    };
  }

  // packages/runtime-core/src/h.ts
  function h(type, propsChildren, children) {
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsChildren) && !isArray(propsChildren)) {
        if (isVnode(propsChildren)) {
          return createVNode(type, null, [propsChildren]);
        }
        return createVNode(type, propsChildren);
      } else {
        return createVNode(type, null, propsChildren);
      }
    } else {
      if (l > 3) {
        children = Array.from(arguments).slice(2);
      } else if (l === 3 && isVnode(children)) {
        children = [children];
      }
      return createVNode(type, propsChildren, children);
    }
  }

  // packages/runtime-core/src/apiLifecycle.ts
  var LifecycleHooks = /* @__PURE__ */ ((LifecycleHooks2) => {
    LifecycleHooks2["BEFORE_MOUNT"] = "bm";
    LifecycleHooks2["MOUNTED"] = "m";
    LifecycleHooks2["BEFORE_UPDATE"] = "bu";
    LifecycleHooks2["UPDATED"] = "u";
    return LifecycleHooks2;
  })(LifecycleHooks || {});
  function createHook(type) {
    return (hook, target = currentInstance) => {
      if (target) {
        const hooks = target[type] || (target[type] = []);
        const wrapperHook = () => {
          setCurrentInstance(target);
          hook();
          setCurrentInstance(null);
        };
        hooks.push(wrapperHook);
      }
    };
  }
  var onBeforeMount = createHook("bm" /* BEFORE_MOUNT */);
  var onMounted = createHook("m" /* MOUNTED */);
  var onBeforeUpdate = createHook("bu" /* BEFORE_UPDATE */);
  var onUpdated = createHook("u" /* UPDATED */);

  // packages/runtime-dom/src/nodeOps.ts
  var nodeOps = {
    insert(child, parent, anchor = null) {
      parent.insertBefore(child, anchor);
    },
    remove(child) {
      const parentNode = child.parentNode;
      if (parentNode) {
        parentNode.removeChild(child);
      }
    },
    setElementText(el, text) {
      el.textContent = text;
    },
    setText(node, text) {
      node.nodeValue = text;
    },
    querySelector(selector) {
      return document.querySelector(selector);
    },
    parentNode(node) {
      return node.parentNode;
    },
    nextSibling(node) {
      return node.nextSibling;
    },
    createElement(tagName) {
      return document.createElement(tagName);
    },
    createText(text) {
      return document.createTextNode(text);
    }
  };

  // packages/runtime-dom/src/modules/attr.ts
  function patchAttr(el, key, nextValue) {
    if (nextValue) {
      el.setAttribute(key, nextValue);
    } else {
      el.removeAttribute(key);
    }
  }

  // packages/runtime-dom/src/modules/class.ts
  function patchClass(el, nextValue) {
    if (nextValue === null) {
      el.removeAttribute("class");
    } else {
      el.className = nextValue;
    }
  }

  // packages/runtime-dom/src/modules/event.ts
  function createInvoker(callback) {
    const invoker = (e) => invoker.value(e);
    invoker.value = callback;
    return invoker;
  }
  function patchEvent(el, eventName, nextValue) {
    let invokers = el._vei || (el._vei = {});
    let exits = invokers[eventName];
    if (exits && nextValue) {
      exits.value = nextValue;
    } else {
      let event = eventName.slice(2).toLowerCase();
      if (nextValue) {
        const invoker = invokers[eventName] = createInvoker(nextValue);
        el.addEventListener(event, invoker);
      } else if (exits) {
        el.removeEventListener(event, exits);
        invokers[eventName] = void 0;
      }
    }
  }

  // packages/runtime-dom/src/modules/style.ts
  function patchStyle(el, prevValue, nextValue = {}) {
    for (let key in nextValue) {
      el.style[key] = nextValue[key];
    }
    if (prevValue) {
      for (let key in prevValue) {
        if (nextValue[key] == null) {
          el.style[key] = null;
        }
      }
    }
  }

  // packages/runtime-dom/src/patchProp.ts
  function patchProp(el, key, prevValue, nextValue) {
    if (key === "class") {
      patchClass(el, nextValue);
    } else if (key === "style") {
      patchStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) {
      patchEvent(el, key, nextValue);
    } else {
      patchAttr(el, key, nextValue);
    }
  }

  // packages/runtime-dom/src/index.ts
  var renderOptions = Object.assign(nodeOps, { patchProp });
  var renderder;
  function ensureRenderer() {
    return renderder || createRenderder(renderOptions);
  }
  var createApp = (vnode, container) => {
    return ensureRenderer().render(vnode, container);
  };

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

  // packages/vue/src/index.ts
  function compileToFunction(template, options = {}) {
    const { code } = compiler(template);
    const render = new Function("Vue", code)(src_exports);
    return render;
  }
  registerRuntimeCompiler(compileToFunction);
  return __toCommonJS(src_exports2);
})();
//# sourceMappingURL=vue.global.js.map
