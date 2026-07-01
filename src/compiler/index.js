import { parseHtmlToAst } from './astParser.js'
import { generate } from './generate.js'

function compileToRenderFunction(html) {
  //template->ast
  const ast = parseHtmlToAst(html)
  //ast ->render
  const code = generate(ast)
  //render改变this后返回到init.js，赋值给options上的render
  const render = new Function(`
        with(this){return ${code}}
        `)
  return render
}

export {
  compileToRenderFunction
}
