import type * as TS from "typescript";

export const TRACE_FN = "__t";
export const ENTER_FN = "__enter";
export const EXIT_FN = "__exit";

export function instrument(ts: typeof TS, code: string, lang: "javascript" | "typescript"): string {
  const kind = lang === "typescript" ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const sf = ts.createSourceFile(
    lang === "typescript" ? "input.ts" : "input.js",
    code,
    ts.ScriptTarget.Latest,
    true,
    kind
  );
  const f = ts.factory;
  const scopes: string[][] = [];

  function bindingNames(name: TS.BindingName, out: string[]) {
    if (ts.isIdentifier(name)) out.push(name.text);
    else
      for (const el of name.elements) {
        if (!ts.isOmittedExpression(el)) bindingNames(el.name, out);
      }
  }

  function declaredIn(statements: readonly TS.Statement[]): string[] {
    const out: string[] = [];
    for (const s of statements) {
      if (ts.isVariableStatement(s)) for (const d of s.declarationList.declarations) bindingNames(d.name, out);
      else if ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) && s.name) out.push(s.name.text);
    }
    return out;
  }

  function lineOf(node: TS.Node): number {
    return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  }

  function traceCall(line: number): TS.Statement {
    const names = [...new Set(scopes.flat())];
    const getters = names.map((n) =>
      f.createPropertyAssignment(
        f.createStringLiteral(n),
        f.createArrowFunction(undefined, undefined, [], undefined, undefined, f.createIdentifier(n))
      )
    );
    return f.createExpressionStatement(
      f.createCallExpression(f.createIdentifier(TRACE_FN), undefined, [
        f.createNumericLiteral(line),
        f.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          undefined,
          f.createParenthesizedExpression(f.createObjectLiteralExpression(getters))
        ),
      ])
    );
  }

  const UNTRACED = new Set([
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.TypeAliasDeclaration,
    ts.SyntaxKind.ImportDeclaration,
    ts.SyntaxKind.ExportDeclaration,
    ts.SyntaxKind.EmptyStatement,
    ts.SyntaxKind.EnumDeclaration,
    ts.SyntaxKind.ModuleDeclaration,
  ]);

  function functionName(node: TS.FunctionLikeDeclaration): string {
    if (node.name && ts.isIdentifier(node.name)) return node.name.text;
    const parent = node.parent;
    if (parent && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) return parent.name.text;
    if (parent && ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) return parent.name.text;
    return "(anonymous)";
  }

  return transformAndPrint();

  function transformAndPrint(): string {
    const transformer: TS.TransformerFactory<TS.SourceFile> = (context) => {
      function statements(list: readonly TS.Statement[], extra: string[] = []): TS.Statement[] {
        scopes.push([...extra, ...declaredIn(list)]);
        const out: TS.Statement[] = [];
        for (const s of list) {
          if (!UNTRACED.has(s.kind)) out.push(traceCall(lineOf(s)));
          out.push(ts.visitNode(s, visit) as TS.Statement);
        }
        scopes.pop();
        return out;
      }

      function asBlock(node: TS.Statement, extra: string[] = []): TS.Block {
        if (ts.isBlock(node)) return f.updateBlock(node, statements(node.statements, extra));
        return f.createBlock(statements([node], extra), true);
      }

      function wrapBody(name: string, body: TS.Statement[]): TS.Statement[] {
        const call = (fn: string, args: TS.Expression[]) =>
          f.createExpressionStatement(f.createCallExpression(f.createIdentifier(fn), undefined, args));
        return [
          call(ENTER_FN, [f.createStringLiteral(name)]),
          f.createTryStatement(f.createBlock(body, true), undefined, f.createBlock([call(EXIT_FN, [])], true)),
        ];
      }

      function params(node: TS.SignatureDeclarationBase): string[] {
        const out: string[] = [];
        for (const p of node.parameters) bindingNames(p.name, out);
        return out;
      }

      function visit(node: TS.Node): TS.Node {
        if (ts.isBlock(node)) return f.updateBlock(node, statements(node.statements));
        if (ts.isCaseClause(node))
          return f.updateCaseClause(
            node,
            ts.visitNode(node.expression, visit) as TS.Expression,
            statements(node.statements)
          );
        if (ts.isDefaultClause(node)) return f.updateDefaultClause(node, statements(node.statements));
        if (ts.isIfStatement(node))
          return f.updateIfStatement(
            node,
            ts.visitNode(node.expression, visit) as TS.Expression,
            asBlock(node.thenStatement),
            node.elseStatement
              ? ts.isIfStatement(node.elseStatement)
                ? (visit(node.elseStatement) as TS.Statement)
                : asBlock(node.elseStatement)
              : undefined
          );
        if (ts.isWhileStatement(node))
          return f.updateWhileStatement(
            node,
            ts.visitNode(node.expression, visit) as TS.Expression,
            asBlock(node.statement)
          );
        if (ts.isDoStatement(node))
          return f.updateDoStatement(
            node,
            asBlock(node.statement),
            ts.visitNode(node.expression, visit) as TS.Expression
          );
        if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node)) {
          const loopVars: string[] = [];
          const init = node.initializer;
          if (init && ts.isVariableDeclarationList(init))
            for (const d of init.declarations) bindingNames(d.name, loopVars);
          scopes.push(loopVars);
          const v = <T extends TS.Node | undefined>(n: T) => (n ? (ts.visitNode(n, visit) as T) : n);
          const initializer = v(node.initializer);
          const body = asBlock(node.statement, loopVars);
          if (ts.isForStatement(node)) {
            const result = f.updateForStatement(node, initializer, v(node.condition), v(node.incrementor), body);
            scopes.pop();
            return result;
          }
          const expression = v(node.expression);
          scopes.pop();
          if (ts.isForOfStatement(node))
            return f.updateForOfStatement(node, node.awaitModifier, initializer as TS.ForInitializer, expression, body);
          return f.updateForInStatement(node, initializer as TS.ForInitializer, expression, body);
        }
        if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node)) {
          if (!node.body) return node;
          const name = functionName(node);
          const inner = statements(node.body.statements, params(node));
          const body = f.createBlock(wrapBody(name, inner), true);
          if (ts.isFunctionDeclaration(node))
            return f.updateFunctionDeclaration(
              node,
              node.modifiers,
              node.asteriskToken,
              node.name,
              node.typeParameters,
              node.parameters,
              node.type,
              body
            );
          if (ts.isFunctionExpression(node))
            return f.updateFunctionExpression(
              node,
              node.modifiers,
              node.asteriskToken,
              node.name,
              node.typeParameters,
              node.parameters,
              node.type,
              body
            );
          return f.updateMethodDeclaration(
            node,
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.questionToken,
            node.typeParameters,
            node.parameters,
            node.type,
            body
          );
        }
        if (ts.isArrowFunction(node)) {
          const name = functionName(node);
          const list = ts.isBlock(node.body)
            ? node.body.statements
            : [f.createReturnStatement(node.body as TS.Expression)];
          scopes.push(params(node));
          const inner: TS.Statement[] = [];
          scopes.push(declaredIn(list));
          for (const s of list) {
            const line = lineOf(ts.isBlock(node.body) ? s : node.body);
            inner.push(traceCall(line));
            inner.push(ts.visitNode(s, visit) as TS.Statement);
          }
          scopes.pop();
          scopes.pop();
          return f.updateArrowFunction(
            node,
            node.modifiers,
            node.typeParameters,
            node.parameters,
            node.type,
            node.equalsGreaterThanToken,
            f.createBlock(wrapBody(name, inner), true)
          );
        }
        return ts.visitEachChild(node, visit, context);
      }

      return (source) => f.updateSourceFile(source, statements(source.statements));
    };

    const result = ts.transform(sf, [transformer]);
    const printed = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0]);
    result.dispose();
    return printed;
  }
}
