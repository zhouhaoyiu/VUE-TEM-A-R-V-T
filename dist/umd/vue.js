(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  const originArrMethods = Array.prototype,
        newArrMethods = Object.create(originArrMethods);
  const ARR_METHODS = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  ARR_METHODS.map(method => {
    newArrMethods[method] = function (...args) {
      const result = originArrMethods[methods].apply(this, args),
            ob = this.__ob__;
      let newArr;

      switch (method) {
        case 'push':
        case 'unshift':
          newArr = args;
          break;

        case 'splice':
          newArr = args.slice(2);
          break;
      }

      if (newArr) ob.observeArr(newArr);
      return result;
    };
  });

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get() {
        return vm[target][key];
      },

      set(newValue) {
        if (vm[target][key] === newValue) return;
        vm[target][key] = newValue;
      }

    });
  }

  function isObject(value) {
    return typeof value === 'object' && value !== null;
  }

  function isArray(value) {
    return Array.isArray(value);
  }

  function setConstantProperty(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: false,
      value
    });
  }

  class Observer {
    constructor(data) {
      setConstantProperty(data, '__ob__', this);

      if (isArray(data)) {
        data.__proto__ = newArrMethods;
        this.observeArr(data);
      } else {
        this.walk(data);
      }
    }

    walk(data) {
      const keys = Object.keys(data);
      keys.map(key => {
        defineReactive(data, key, data[key]);
      });
    }

    observeArr(data) {
      data.map(item => {
        observe(item);
      });
    }

  }

  function defineReactive(data, key, value) {
    observe(value);
    Object.defineProperty(data, key, {
      get() {
        // console.log('??????????????????' + value);
        return value;
      },

      set(newValue) {
        if (value === newValue) return; // console.log('??????????????????' + key + ' = ' + newValue);

        observe(newValue);
        value = newValue;
      }

    });
  }

  function observe(data) {
    if (!isObject(data) || data.__ob__) {
      return data;
    }

    new Observer(data);
  }

  function initState(vm) {
    const options = vm.$options;

    if (options.props) ;

    if (options.methods) ;

    if (options.data) {
      initData(vm);
    }

    if (options.computed) ;

    if (options.watch) ;
  }

  function initData(vm) {
    let data = vm.$options.data;
    vm._data = data = typeof data === 'function' ? data.call(vm) : data;

    for (let key in data) {
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  /**
   * attribute: ???????????? id="app" id='app' id=qpp
   * ncname: ?????????
   * qnameCapture??? ?????????????????????????????????
   * startTagOpen startTagClose?????????????????????????????????
   * endTag???????????????
   */
  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
  const startTagOpen = new RegExp(`^<${qnameCapture}`);
  const startTagClose = /^\s*(\/?)>/;
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // <div id = "app" style = "color:red;font-size: 20px;" >
  //   ??????, {{ name }}
  //    <span class="text" style="color: green;">{{ age }}</span>
  // </div >

  function parseHtmlToAst(html) {
    //??????
    let text; // ???????????????

    let root; // ????????????????????????

    let currentParent; //????????????

    let stack = [];

    while (html) {
      let textEnd = html.indexOf('<');

      if (textEnd === 0) {
        const startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } //???????????? ???</span></div>


        const endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      } //????????????????????????????????????


      if (textEnd > 0) {
        //???????????????????????????????????????     
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }

    function parseStartTag() {
      //????????????
      const start = html.match(startTagOpen);
      let end; //????????????

      let attr; //????????????

      if (start) {
        const match = {
          //div
          tagName: start[1],
          attrs: []
        }; //????????????<div 

        advance(start[0].length); //????????????????????????????????????????????????????????????attr,???????????????????????????

        while (!(end = html.match(startTagClose)) && ((attr = html.match(attribute)) || (attr = html.match(dynamicArgAttribute)))) {
          // attr: 0:id="app" 1:id 2:= 3:app
          match.attrs.push({
            name: attr[1],
            // ???????????????????????????????????? id = "app" 'app' app
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length); // match??? tagName:'div' attrs: name=id value=app
          // return match
        } //end: >??????  ???????????????????????????


        if (end) {
          //???????????? <div id = "app" style = "color:red;font-size: 20px;" >????????????
          advance(end[0].length);
          return match;
        }
      }
    } //??????????????????html??????????????????????????????


    function advance(number) {
      html = html.substring(number);
    }

    function start(tagName, attrs) {
      // ????????????
      const element = createASTElement(tagName, attrs); //??????????????????????????????????????????

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    }

    function end(tagName) {
      //????????????
      const element = stack.pop(); //??????????????????????????????

      currentParent = stack[stack.length - 1]; //???????????????????????????

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      text = text.trim();

      if (text.length > 0) {
        currentParent.children.push({
          // nodeType = 3 ????????????
          type: 3,
          text
        });
      }
    }

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        type: 1,
        children: [],
        attrs,
        parent
      };
    }

    return root;
  }

  /**
   * _c()=>createElement()
   * _v()=>createTextNode()
   * _s()=>{{data}}=>_s(data)
   */
  //??????{{}}
  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function formatProps(attrs) {
    let attrStr = '';

    for (var i = 0; i < attrs.length; i++) {
      //attr: id:app style{color   fontsize:}
      let attr = attrs[i];

      if (attr.name === 'style') {
        let styleAttrs = {};
        attr.value.split(';').map(styleAttr => {
          let [key, value] = styleAttr.split(':');
          styleAttrs[key] = value;
        });
        attr.value = styleAttrs;
      } //style?????? ????????????object


      attrStr += `${attr.name}:${JSON.stringify(attr.value)},`;
    } //`{${attrStr.slice(0, -1)}}` : {id:"app",style:{"color":"red","font-size":" 20px"}}


    return `{${attrStr.slice(0, -1)}}`;
  }

  function generateChild(node) {
    //????????????
    if (node.type === 1) {
      return generate(node);
    } //????????????
    else if (node.type === 3) {
        let text = node.text; //??????????????????????????????

        if (!defaultTagRE.test(text)) {
          return `_v(${JSON.stringify(text)})`;
        }

        let match;
        let index;
        let lastIndex = defaultTagRE.lastIndex = 0;
        let textArr = [];

        while (match = defaultTagRE.exec(text)) {
          index = match.index;

          if (index > lastIndex) {
            //?????????{?????????????????????????????????????????? {}}???????????????
            textArr.push(JSON.stringify(text.slice(lastIndex, index)));
          } // match[1] {{}}????????????


          textArr.push(`_s(${match[1].trim()})`); // match[0] {{}}??????
          // ???????????????????????????{{}}????????????

          lastIndex = index + match[0].length;
        } // ??????????????????????????????{{}}?????????????????????????????????????????????{{}}???????????????


        if (lastIndex < text.length) {
          textArr.push(JSON.stringify(text.slice(lastIndex)));
        } // console.log(`_v(${textArr.join('+')})`)


        return `_v(${textArr.join('+')})`;
      }
  }

  function getChildren(el) {
    const children = el.children;

    if (children) {
      return children.map(c => generateChild(c)).join(',');
    }
  }

  function generate(el) {
    let children = getChildren(el);
    let code = `_c('${el.tag}',${el.attrs.length > 0 ? `${formatProps(el.attrs)}` : 'undefined'}${children ? `,${children}` : ''})`;
    return code;
  }

  function compileToRenderFunction(html) {
    //template->ast
    const ast = parseHtmlToAst(html); //ast ->render

    const code = generate(ast); //render??????this????????????init.js????????????options??????render

    const render = new Function(`
        with(this){return ${code}}
        `);
    return render;
  }

  function patch(oldNode, vNode) {
    let el = createElement(vNode);
    let parentElement = oldNode.parentNode; //??????????????????????????????????????????????????????????????????

    parentElement.insertBefore(el, oldNode.nextSibling);
    parentElement.removeChild(oldNode);
  }

  function createElement(vnode) {
    const {
      tag,
      props,
      children,
      text
    } = vnode; //???????????????????????????????????????

    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      updateProps(vnode);
      children.map(child => {
        vnode.el.appendChild(createElement(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProps(vnode) {
    const el = vnode.el;
    const newProps = vnode.props || {};

    for (let key in newProps) {
      if (key === 'style') {
        for (let styleKey in newProps.style) {
          el.style[styleKey] = newProps.style[styleKey];
        }
      } else if (key === 'class') {
        el.className = el.class;
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function mountComponent(vm) {
    //vnode????????????????????????????????????dom???
    //_render():render??????vm????????????this?????????vnode
    vm._update(vm._render());
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      const vm = this;
      patch(vm.$el, vnode);
    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      const vm = this;
      vm.$options = options;
      initState(vm);

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      const vm = this;
      const options = vm.$options;
      el = document.querySelector(el);
      vm.$el = el;

      if (!options.render) {
        let template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        }

        const render = compileToRenderFunction(template);
        options.render = render;
      } //???????????????dom


      mountComponent(vm);
    };
  }

  // tag???attrs??????????????????children
  function createElement$1(tag, attrs = {}, ...children) {
    return vnode(tag, attrs, children);
  }

  function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, text);
  }

  function vnode(tag, props, children, text) {
    return {
      tag,
      props,
      children,
      text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      return createElement$1(...arguments);
    };

    Vue.prototype._s = function (value) {
      if (value === null) return;
      return typeof value === 'object' ? JSON.stringify(value) : value;
    };

    Vue.prototype._v = function (text) {
      return createTextVnode(...arguments);
    };

    Vue.prototype._render = function () {
      const vm = this;
      const render = vm.$options.render; //render ???this??????vm

      const vnode = render.call(vm);
      console.log(vnode);
      return vnode;
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue); //??????????????????

  lifecycleMixin(Vue);
  renderMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
