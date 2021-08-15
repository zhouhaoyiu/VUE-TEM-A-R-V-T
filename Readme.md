# TEMPLATE->AST->RENDER->VDOM-TRUE DOM

- 1、获取到template
- 2、template -> AST树

- AST Abstract syntax tree  抽象语法树
- 源代码的抽象语法结构的树状描述

- 3、AST -> render函数 ->  _c_v _s
- 4、render函数 -> 虚拟节点
- 5、设置PATCH -> 打补丁到真实DOM

匹配{{}}中任意内容 跳过换行符
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

## 过程解析
