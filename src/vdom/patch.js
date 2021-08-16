function patch(oldNode, vNode) {
  let el = createElement(vNode)
  let parentElement = oldNode.parentNode

  //找到原来的节点，放在原来的后面，再去掉原来的
  parentElement.insertBefore(el, oldNode.nextSibling)
  parentElement.removeChild(oldNode)
}

function createElement(vnode) {
  const { tag, props, children, text } = vnode

  //有标签名说明是节点不是文本
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag)
    updateProps(vnode)
    children.map((child) => {
      vnode.el.appendChild(createElement(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function updateProps(vnode) {
  const el = vnode.el
  const newProps = vnode.props || {}

  for (let key in newProps) {
    if (key === 'style') {
      for (let styleKey in newProps.style) {
        el.style[styleKey] = newProps.style[styleKey]
      }
    } else if (key === 'class') {
      el.className = el.class
    } else {
      el.setAttribute(key, newProps[key])
    }
  }
}

export {
  patch
}