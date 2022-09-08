/**当前激活的 ReactiveEffect */
export let activeEffect:ReactiveEffect = undefined;

/**
 * 从 effect 的 deps 中移除自身
 * @param effect 
 */
function cleanupEffect(effect){
  let {deps} = effect;
  //deps 中保存的是每个属性对应的全部 effect，[Set,Set]
  //其中的 Set 是对 targetMap 中的数据的引用
  for(let i = 0; i < deps.length; i++){
    deps[i].delete(effect);
  }
  //之后还需要将 deps 清空掉，不然之后重新收集会重复
  deps.length = 0;
}

export class ReactiveEffect{
  public parent = null;//嵌套effect的父实例
  public active = true;//这个effect默认是激活状态（是否进行依赖收集）
  public deps = [];//依赖的属性
  //public fn 是 this.fn = fn 简写
  constructor(public fn,public scheduler){}
  /**运行effect的回调 */
  run(){
    //如果没有激活就只运行函数，不进行依赖收集
    if(!this.active) return this.fn();
    try{
      this.parent = activeEffect;
      //这里就要依赖收集了，核心就是将当前的 effect 和 稍后渲染的属性关联在一起
      // 暂存当前实例
      activeEffect = this; 
      
      //在运行之前应该要从之前收集的 属性中的关联的effect中 把当前自己移除掉
      //之后再重新搜集，这样就可以实现分支切换
      cleanupEffect(this);

      //当稍后调用取值操作的时候就可以获取到这个全局的 activeEffect，就可以将属性和effect进行关联
      return this.fn();
    }finally{
      //执行完成之后清空
      activeEffect = this.parent;
      this.parent = null;
    }
  }
  /**停止依赖收集 */
  stop(){
    if(this.active){
      this.active = false;
      cleanupEffect(this);
    }
  }
}

export function effect(fn,options:any = {}){
  // 这里的 fn 可以根据状态变化 重新执行，effect可以嵌套着写
  
  const _effect = new ReactiveEffect(fn,options.scheduler);//创建响应式的 effect

  _effect.run();

  //提供控件
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

/**依赖 */
const targetMap = new WeakMap();
/**
 * 收集依赖
 * 某个属性可能会对应多个 effect
 * 采用 WeakMap 存储 => {target:Map{key:Set}}
 * @param target 代理的数据
 * @param type 类型
 * @param key 访问的键
 */
export function track(target,type,key){
  //activeEffect如果为空，代表并不再 effect 函数中，在外面访问的属性不需要收集关联到 effect
  if(!activeEffect) return;
  let depsMap = targetMap.get(target);
  if(!depsMap){
    targetMap.set(target,(depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if(!dep){
    depsMap.set(key,(dep = new Set()));
  }
  trackEffects(dep);
}

/**
 * 收集effect
 * @param dep 
 */
export function trackEffects(dep){
  if(activeEffect){
    let shouldTrack = !dep.has(activeEffect);
    if(shouldTrack){
      dep.add(activeEffect);
      //如果有 effect(()=>{ flag ? state.name : state.age })
      //当flag由true切换到false的时候，那么 name 对应的那个 effect在name更新的时候就不需要再执行了
      //在这个情况下我们需要将name所依赖的当前 effect 清除
      //所以还要让 effect 也记录一下当前的属性所依赖的 effect
      //之后就可以从 deps 中把 effect 自己移除掉
      activeEffect.deps.push(dep);
    }
  }
}

/**
 * 触发更新
 * @param target 代理的数据
 * @param type 类型
 * @param key 设置的键
 * @param value 新值
 * @param oldValue 旧值
 */
export function trigger(target,type,key,value,oldValue){
  let depMap = targetMap.get(target);
  if(!depMap) return;
  let effects = depMap.get(key);
  if(effects){
    triggerEffects(effects);
  }
}

/**触发effect */
export function triggerEffects(effects){
  //这里要先改变一下引用
  //因为在 run 的时候会执行 cleanupEffect 从Set中删除数据
  //然乎执行 fn 的时候又会对同一个 Set 添加数据，这样 effects 就会一直增减出现死循环
  effects = new Set(effects);
  effects.forEach(effect => {
    //在执行的时候又执行自己，会造成无限调用，所以要屏蔽掉
    // effect(()=>{state.age++});state.age++;
    if(effect !== activeEffect){
      if(effect.scheduler){
        effect.scheduler();//用户自己的调度函数
      }else{
        effect.run();
      }
    }
  })
}


// effect可以嵌套着写时不能单独使用 activeEffect 解决指向问题
// 如果只使用一个 activeEffect
// effect(()=>{ // activeEffect = e1
//   state.age; // age => e1
//   effect(()=>{ // activeEffect = e2
//     state.name; // name => e2
//   }) // activeEffect = undefined
//   state.address; //找不到了
// })

// 在 vue2 和 vue3 早期的时候使用栈来解决这个问题
// effect(()=>{ // activeEffect = e1  stack = [e1]
//   state.age; // age => e1
//   effect(()=>{ // activeEffect = e2 stack = [e1,e2]
//     state.name; // name => e2
//   }) // 执行完成 e2 出栈 activeEffect = e1 stack = [e1]
//   state.address; //address => e1
// })// 执行完成 e1 出栈 activeEffect = undefined stack = []

// 之后Vue3又修改了使用树节点的方式进行存储
// effect(()=>{ // e1.parent = null  activeEffect = e1
//   state.age; // age => e1
//   effect(()=>{ // e2.parent = e1 activeEffect = e2
//     state.name; // name => e2
//   }) // 执行完成  activeEffect = e2.parent e2.parent = null
//   state.address; //address => e1
// })// 执行完成 activeEffect = e1.parent e1.parent = null