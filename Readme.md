# TEMPLATE->AST->RENDER->VDOM-TRUE DOM

  **没有进行静态节点的标记，并且没有对dom更新的比对，diff算法，生成注释节点等功能进行分析与实现**

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

      - 如果没有匹配到开始标签的结束符号，就匹配属性赋值给attr，直到匹配到结束，并切割
  
      - 把自身放到栈里，当前根节点赋值为自身

      - 匹配到结束标签后找到当前的父节点，然后赋值给这个元素的parent属性，父节点children属性加一个自身

      - 匹配下个开始标签，并且把中间的字符当作文本节点放到当前父节点的children中（type:3)

      - 循环遍历完html后生成了ast

      - ![RUNOOB 图标](../VUE-TEM-A-R-V-T/image/QQ截图20210821203245.png)

- ast->render函数

  - ```c('${el.tag}', ${el.attrs.length > 0 ?`${formatProps(el.attrs)}` : 'undefined'}${children ? `,${children}`: ''})```把当前元素的tag放入，如果有props执行格式化否则赋值为undefined 若有children将getchildren过后的值赋值给自身的第三个位置
  - _c()=>createElement() 创造普通节点
  - _v()=>createTextNode() 创造文本节点
  - _s()=>{{data}}=>_s(data) 将{{}}转化为对应变量的值

  - "_c('span',{class:"text",style:{"color":" green"}},_v(_s(age)))"
  - "_c('div',{id:"app",style:{"color":"red","font-size":" 20px"}},_v("你好0,"+_s(name)+",你好1,"+_s(name)+",你好2"),_c('span',{class:"text",style:{"color":" green"}},_v(_s(age))))"

- render函数转vnode
  - 获取到render函数,将this指向vm实例，调用vue.prototype上的_c,_v等方法,生成vnode
  
  - ```javascript
    {"tag":"div",
      "props":{"id":"app","style":{"color":"red","font-size":" 20px"}}, 
      "children":[{"text":"你好0,周浩宇,你好1,周浩宇,你好2"},
                  {"tag":"span","props": {"class":"text","style":{"color":" green"}},"children":[{"text":21}]}]}
    ```

- vnode转真实dom patch到html

# *待更新*
