import { patch } from "./vdom/patch"

function mountComponent(vm) {

  //vnode转化为真实节点，打到真实dom上
  //_render():render调用vm实例上的this，产生vnode
  vm._update(vm._render())
}

function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this
    patch(vm.$el, vnode)
  }
}

export {
  lifecycleMixin,
  mountComponent
}