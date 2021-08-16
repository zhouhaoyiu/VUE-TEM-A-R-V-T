/**
 * _c()=>createElement()
 * _v()=>createTextNode()
 * _s()=>{{data}}=>_s(data)
 */

//匹配{{}}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function formatProps(attrs) {
  let attrStr = ''

  for (var i = 0; i < attrs.length; i++) {

    //attr: id:app style{color   fontsize:}
    let attr = attrs[i]

    if (attr.name === 'style') {
      let styleAttrs = {}

      attr.value.split(';').map((styleAttr) => {
        let [key, value] = styleAttr.split(':')
        styleAttrs[key] = value
      })
      attr.value = styleAttrs
    }

    //style内容 字符串转object
    attrStr += `${attr.name}:${JSON.stringify(attr.value)},`

  }
  //`{${attrStr.slice(0, -1)}}` : {id:"app",style:{"color":"red","font-size":" 20px"}}
  return `{${attrStr.slice(0, -1)}}`
}

function generateChild(node) {
  //普通节点
  if (node.type === 1) {
    return generate(node)
  }
  //文本节点
  else if (node.type === 3) {
    let text = node.text

    //没有双大括号直接返回
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }

    let match
    let index
    let lastIndex = defaultTagRE.lastIndex = 0
    let textArr = []

    while (match = defaultTagRE.exec(text)) {
      index = match.index
      if (index > lastIndex) {
        //匹配到{上一次匹配结束和此次匹配到的 {}}之间的文本
        textArr.push(JSON.stringify(text.slice(lastIndex, index)))
      }

      // match[1] {{}}内部的值
      textArr.push(`_s(${match[1].trim()})`)
      // match[0] {{}}整体
      // 将下标移动到第一个{{}}语法之后
      lastIndex = index + match[0].length
    }

    // 如果匹配完成最后一个{{}}语法后还有内容，就放入最后一个{{}}之后的文本
    if (lastIndex < text.length) {
      textArr.push(JSON.stringify(text.slice(lastIndex)))
    }
    // console.log(`_v(${textArr.join('+')})`)
    return `_v(${textArr.join('+')})`
  }
}

function getChildren(el) {
  const children = el.children
  if (children) {
    return children.map(c => generateChild(c)).join(',')
  }

}

function generate(el) {
  let children = getChildren(el)
  let code = `_c('${el.tag}',${el.attrs.length > 0 ? `${formatProps(el.attrs)}` : 'undefined'}${children ? `,${children}` : ''})`
  return code
}


export {
  generate
}