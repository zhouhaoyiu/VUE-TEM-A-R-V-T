import { createElement, createTextVnode } from "./vnode";

function renderMixin(Vue) {

  Vue.prototype._c = function () {
    return createElement(...arguments)
  }

  Vue.prototype._s = function (value) {
    if (value === null) return;

    return typeof value === 'object' ? JSON.stringify(value) : value
  }

  Vue.prototype._v = function (text) {
    return createTextVnode(...arguments)
  }

  Vue.prototype._render = function () {
    const vm = this
    const render = vm.$options.render

    //render 的this指向vm
    const vnode = render.call(vm)
    console.log(JSON.stringify(vnode))
    return vnode
  }
}

export {
  renderMixin
}