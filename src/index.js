import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './vdom';

function Vue(options) {
  this._init(options);
}

initMixin(Vue)
//生命周期混入
lifecycleMixin(Vue)

renderMixin(Vue)
export default Vue;

