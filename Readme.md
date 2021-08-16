# TEMPLATE->AST->RENDER->VDOM-TRUE DOM

- 1、获取到template
- 2、template -> AST树

- AST Abstract syntax tree  抽象语法树
- 源代码的抽象语法结构的树状描述

- 3、AST -> render函数 ->  _c_v _s
- 4、render函数 -> 调用prototype上的_c,_v等方法,创建虚拟节点
- 5、设置PATCH -> 打补丁到真实DOM

匹配{{}}中任意内容 跳过换行符
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

## 过程解析

- 进入vue构造函数，拿到options

- 调用initMixin混入的_init方法，绑定options到实例的$options上。并且拿到实例的this，对其中的部分option进行init(state.js)

  - ```javascript
     function initState (vm) {
     const options = vm.$options;
   
     if (options.props) {
       initProps(vm);
     }
   
     if (options.methods) {
       initMethods(vm);
     }
   
    //数据的响应式处理
     if (options.data) {
       initData(vm);
     }
   
     if (options.computed) {
       initComputed(vm);
     }
   
     if (options.watch) {
      initWatch(vm);
      }
    }
    ```

- 获得配置项中的el(如果有)

  1. 执行挂载函数```$mount(Vue.prototype.$mount```
  2. 挂载函数拿到el 获得对应dom，赋值给vm上的$el(都放在vm上方便其它地方使用)
  3. 判断是否有render()->template->el
  4. 拿到el，获得outerHTML **(innerHTML拿不到本身)** 赋值给template

  5. 调用 `compileToRenderFunction`将template转化为render并加在options上

      - 调用parseHtmlToAst将template(html)转化为AST

      - 如果<在第一个位置的话，执行开始标签的匹配`parstStartTag()`

      - 拿到标签名，去掉标签长度的字符后继续解析下一步

#  *待更新*
