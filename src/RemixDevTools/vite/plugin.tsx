import { Plugin } from "vite";
import { parse as parseBabel, traverse } from "@babel/core";
import { parse } from "es-module-lexer";
import generateDefault from "@babel/generator";
import { RdtPlugin } from "../../client.js";

const generate = generateDefault.default;

export const remixDevTools: (args?: { plugins?: RdtPlugin[] }) => Plugin[] = (args) => [
  {
    name: "remix-development-tools",
    transform(code, id) {
      const plugins = args?.plugins ?? [];
      // Wraps loaders/actions
      if (id.includes("virtual:server-entry")) {
        const updatedCode = [
          `import { augmentLoadersAndActions } from "remix-development-tools/server";`,
          code.replace("export const routes =", "const routeModules ="),
          `export const routes = augmentLoadersAndActions(routeModules);`,
        ].join("\n");

        return updatedCode;
      }
      if (id.includes("root.tsx")) {
        const [, exports] = parse(code);
        const exportNames = exports.map((e) => {
          return e.n;
        });
        const ast = parseBabel(code, {
          sourceType: "module",
        });
        if (!ast) {
          return code;
        }
        let hasInjected = false;
        let hasInjectedLinks = false;

        traverse(ast, {
          ExportNamedDeclaration(path) {
            if (hasInjectedLinks) return;
            const rdtStylesheetImport = parseBabel(
              'import rdtStylesheet from "remix-development-tools/index.css?url"; \nconst rdtStyles = { rel: "stylesheet", href: rdtStylesheet }',

              {
                sourceType: "module",
              }
            );
            const el = (
              parseBabel(" rdtStyles ", {
                sourceType: "module",
              }) as any
            ).program.body[0].expression;
            const declaration = path.get("declaration");
            if (declaration.isFunctionDeclaration() && declaration.node.id?.name === "links") {
              const returnStatement = declaration.get("body").get("body");
              if (returnStatement) {
                const linksArray = (returnStatement[0].node as any).argument;
                path.insertBefore(rdtStylesheetImport!);
                if (linksArray && linksArray.type === "ArrayExpression") {
                  linksArray.elements.push(el);
                  hasInjectedLinks = true;
                }
              }
            } else if (declaration.isVariableDeclaration()) {
              const linksExport = declaration
                .get("declarations")
                .find((decl) => (decl.node.id as any)?.name === "links");

              if (linksExport) {
                const linksNode = linksExport.node.init as any;

                // If links export is a function, modify the array
                if (linksNode?.type === "ArrowFunctionExpression" || linksNode?.type === "FunctionDeclaration") {
                  path.insertBefore(rdtStylesheetImport!);

                  // Check if the function has a body
                  if (linksNode.body && linksNode.body.type === "BlockStatement") {
                    const returnStatement = linksNode.body.body.find((stmt: any) => stmt.type === "ReturnStatement");

                    if (returnStatement) {
                      const linksArray = returnStatement.argument;

                      if (linksArray && linksArray.type === "ArrayExpression") {
                        linksArray.elements.push(el);
                        hasInjectedLinks = true;
                      }
                    }
                  } else if (linksNode.body.type === "ArrayExpression") {
                    linksNode.body.elements.push(el);
                    hasInjectedLinks = true;
                  } else {
                    const linksArray = linksNode?.body?.body?.find((stmt: any) => stmt.type === "ReturnStatement")
                      .argument;

                    if (linksArray) {
                      linksArray.elements.push(el);

                      hasInjectedLinks = true;
                    }
                  }
                }
              }
            }
          },
          ExportDefaultDeclaration(path) {
            if (hasInjected) return;
            const declaration = path.get("declaration");

            if (
              declaration.isFunctionDeclaration() ||
              declaration.isArrowFunctionExpression() ||
              declaration.isIdentifier()
            ) {
              // Wrap the existing export with withDevTools inside a function
              const withDevToolsImport = parseBabel('import { withViteDevTools } from "remix-development-tools";', {
                sourceType: "module",
              });

              path.insertBefore(withDevToolsImport!);

              const wrapperFunction = parseBabel(
                `
              export default withViteDevTools(${generate(declaration.node).code}, { plugins: [${plugins.map(
                (plugin) => plugin
              )}] })();
               
            `,
                { sourceType: "module" }
              )?.program.body;

              path.replaceWithMultiple(wrapperFunction!);

              hasInjected = true;
            } else if (declaration.isCallExpression()) {
              // Check if it's export default something(App);
              const arg = declaration.get("arguments")[0];
              const withDevToolsImport = parseBabel('import { withViteDevTools } from "remix-development-tools";', {
                sourceType: "module",
              });

              path.insertBefore(withDevToolsImport!);

              const wrapperFunctionCode = `
              export default withViteDevTools(${generate(declaration.node.callee).code}(${
                generate(arg.node).code
              }), { plugins: [${plugins.map((plugin) => plugin)}] })();
            `;

              const wrapperFunction = parseBabel(wrapperFunctionCode, { sourceType: "module" })?.program.body;

              path.replaceWithMultiple(wrapperFunction!);

              hasInjected = true;
            }
          },
        });

        if (hasInjected) {
          let updatedCode = generate(ast).code.replaceAll("jsx(", "jsxDEV(").replaceAll("jsxs(", "jsxDEV(");
          if (!exportNames.includes("links")) {
            updatedCode = [
              `import rdtStylesheet from "remix-development-tools/index.css?url";`,
              `export const links = () => [{ rel: "stylesheet", href: rdtStylesheet }];`,
              updatedCode,
            ].join("\n");
          }
          updatedCode = `\nimport "remix-development-tools/index.css?inline";\n` + updatedCode;

          return updatedCode;
        } else {
          let updatedCode = `\nimport "remix-development-tools/index.css?inline";\n` + code;
          if (!exportNames.includes("links")) {
            updatedCode = [
              `import rdtStylesheet from "remix-development-tools/index.css?url";`,
              `export const links = () => [{ rel: "stylesheet", href: rdtStylesheet }];`,
              updatedCode,
            ].join("\n");
          }

          return updatedCode;
        }
      }
    },
  },
];
