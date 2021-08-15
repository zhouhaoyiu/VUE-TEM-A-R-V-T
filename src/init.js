import { initState } from "./state";
import { compileToRenderFunction } from './compiler'

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;

    vm.$options = options;

    initState(vm);

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options

    el = document.querySelector(el)
    vm.$el = el

    if (!options.render) {
      let template = options.template

      if (!template && el) {
        template = el.outerHTML
      }

      const render = compileToRenderFunction(template)

      options.render = render
    }
  }
}

export {
  initMixin
}