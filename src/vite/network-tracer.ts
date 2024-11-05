import type { types as Babel } from "@babel/core"
import type { ParseResult } from "@babel/parser"
import type { NodePath } from "@babel/traverse"

import generate from "@babel/generator"
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
const trav =
	typeof (traverse as any).default !== "undefined"
		? ((traverse as any).default as typeof import("@babel/traverse").default)
		: traverse

const gen =
	typeof (generate as any).default !== "undefined"
		? ((generate as any).default as typeof import("@babel/generator").default)
		: generate
import * as t from "@babel/types"
const SERVER_COMPONENT_EXPORTS = ["loader", "action"]
const CLIENT_COMPONENT_EXPORTS = ["clientLoader", "clientAction"]
const ALL_EXPORTS = [...SERVER_COMPONENT_EXPORTS, ...CLIENT_COMPONENT_EXPORTS]

export const transform = (ast: ParseResult<Babel.File>, routeId: string) => {
	const serverHocs: Array<[string, Babel.Identifier]> = []
	const clientHocs: Array<[string, Babel.Identifier]> = []
	function getServerHocId(path: NodePath, hocName: string) {
		const uid = path.scope.generateUidIdentifier(hocName)
		serverHocs.push([hocName, uid])
		return uid
	}
	function getClientHocId(path: NodePath, hocName: string) {
		const uid = path.scope.generateUidIdentifier(hocName)
		clientHocs.push([hocName, uid])
		return uid
	}
	function uppercaseFirstLetter(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}
	trav(ast, {
		ExportDeclaration(path) {
			if (path.isExportNamedDeclaration()) {
				const decl = path.get("declaration")

				if (decl.isVariableDeclaration()) {
					for (const varDeclarator of decl.get("declarations")) {
						const id = varDeclarator.get("id")
						const init = varDeclarator.get("init")
						const expr = init.node
						if (!expr) return
						if (!id.isIdentifier()) return
						const { name } = id.node

						if (!ALL_EXPORTS.includes(name)) return

						const uid = CLIENT_COMPONENT_EXPORTS.includes(name)
							? getClientHocId(path, `with${uppercaseFirstLetter(name)}Wrapper`)
							: getServerHocId(path, `with${uppercaseFirstLetter(name)}Wrapper`)
						init.replaceWith(t.callExpression(uid, [expr, t.stringLiteral(routeId)]))
					}

					return
				}

				if (decl.isFunctionDeclaration()) {
					const { id } = decl.node
					if (!id) return
					const { name } = id
					if (!ALL_EXPORTS.includes(name)) return

					const uid = CLIENT_COMPONENT_EXPORTS.includes(name)
						? getClientHocId(path, `with${uppercaseFirstLetter(name)}Wrapper`)
						: getServerHocId(path, `with${uppercaseFirstLetter(name)}Wrapper`)
					decl.replaceWith(
						t.variableDeclaration("const", [
							t.variableDeclarator(
								t.identifier(name),
								t.callExpression(uid, [toFunctionExpression(decl.node), t.stringLiteral(routeId)])
							),
						])
					)
				}
			}
		},
	})

	if (serverHocs.length > 0) {
		ast.program.body.unshift(
			t.importDeclaration(
				serverHocs.map(([name, identifier]) => t.importSpecifier(identifier, t.identifier(name))),
				t.stringLiteral("react-router-devtools/server")
			)
		)
	}
	if (clientHocs.length > 0) {
		ast.program.body.unshift(
			t.importDeclaration(
				clientHocs.map(([name, identifier]) => t.importSpecifier(identifier, t.identifier(name))),
				t.stringLiteral("react-router-devtools/client")
			)
		)
	}
	const didTransform = clientHocs.length > 0 || serverHocs.length > 0
	return didTransform
}

function toFunctionExpression(decl: Babel.FunctionDeclaration) {
	console.log(decl.params)
	return t.functionExpression(decl.id, decl.params, decl.body, decl.generator, decl.async)
}

export function transformCode(code: string, routeId: string) {
	const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] })
	const didTransform = transform(ast, routeId)
	if (!didTransform) {
		return code
	}
	return gen(ast).code
}
