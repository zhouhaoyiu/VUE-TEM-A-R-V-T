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
        console.log('响应式获取：' + value);
        return value;
      },

      set(newValue) {
        if (value === newValue) return;
        console.log('响应式设置：' + key + ' = ' + newValue);
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
   * attribute: 匹配属性 id="app" id='app' id=qpp
   * ncname: 标签名
   * qnameCapture： 特殊标签名如中间有符号
   * startTagOpen startTagClose：开始标签的开始和结束
   * endTag：结束标签
   */
  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
  const startTagOpen = new RegExp(`^<${qnameCapture}`);
  const startTagClose = /^\s*(\/?)>/;
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // <div id = "app" style = "color:red;font-size: 20px;" >
  //   你好, {{ name }}
  //    <span class="text" style="color: green;">{{ age }}</span>
  // </div >

  function parseHtmlToAst(html) {
    //文本
    let text; // 确定根节点

    let root; // 确定节点的父节点

    let currentParent; //保存节点

    let stack = [];

    while (html) {
      let textEnd = html.indexOf('<');

      if (textEnd === 0) {
        const startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } //结束标签 如</span></div>


        const endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      } //看是否还有下一个开始标签


      if (textEnd > 0) {
        //拿到两个标签之间的文本节点     
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }

    function parseStartTag() {
      //拿到标签
      const start = html.match(startTagOpen);
      let end; //结束标记

      let attr; //属性标记

      if (start) {
        const match = {
          //div
          tagName: start[1],
          attrs: []
        }; //截取掉了<div 

        advance(start[0].length); //如果没有匹配到结束标签，就匹配属性赋值给attr,直到匹配到结束标签

        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // attr: 0:id="app" 1:id 2:= 3:app
          match.attrs.push({
            name: attr[1],
            // 双引号，单引号，没有引号 id = "app" 'app' app
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length); // match为 tagName:'div' attrs: name=id value=app
          // return match
        } //end: >符号  开始标签的结束符号


        if (end) {
          //到此时， <div id = "app" style = "color:red;font-size: 20px;" >解析完成
          advance(end[0].length);
          return match;
        }
      }
    } //截取函数，从html中截取一定长度的字符


    function advance(number) {
      html = html.substring(number);
    }

    function start(tagName, attrs) {
      // 节点内容
      const element = createASTElement(tagName, attrs); //没有根节点的话当前就是根节点

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    }

    function end(tagName) {
      //当前节点
      const element = stack.pop(); //找到当前节点的父节点

      currentParent = stack[stack.length - 1]; //当前节点的父亲赋值

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      text = text.trim();

      if (text.length > 0) {
        currentParent.children.push({
          // nodeType = 3 文本节点
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

  function compileToRenderFunction(html) {
    const ast = parseHtmlToAst(html);
    console.log(ast);
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
      }
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
