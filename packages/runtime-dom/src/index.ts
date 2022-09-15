import { createRenderder } from '@vue/runtime-core';
import { nodeOps } from './nodeOps';
import { patchProp } from './patchProp';

const renderOptions = Object.assign(nodeOps,{patchProp});//domAPI 属性 api

export function render(vnode,container){
  //在创建渲染器的时候传入渲染选项
  createRenderder(renderOptions).render(vnode,container);
}

export * from "@vue/runtime-core";