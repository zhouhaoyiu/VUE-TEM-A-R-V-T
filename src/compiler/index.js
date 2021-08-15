import { parseHtmlToAst } from './astParser'

function compileToRenderFunction(html) {
  const ast = parseHtmlToAst(html)
  console.log(ast)
}

export {
  compileToRenderFunction
}