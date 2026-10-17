import { parse } from "acorn";
import type * as acorn from "acorn";
import { createGlobals, getMember, setMember, type Host } from "./builtins";
import { RETURN_SLOT, takeSnapshot } from "./snapshot";
import type { Snapshot, StepEvent } from "./types";
import {
  Env,
  LimitReached,
  RunError,
  UserThrow,
  formatValue,
  isCallable,
  isObjectValue,
  sourceOf,
  toPrimitive,
  toText,
  type ArrayValue,
  type EnvKind,
  type FunctionNode,
  type FunctionValue,
  type ObjectValue,
  type Value,
} from "./values";

export const MAX_STEPS = 1500;
const MAX_DEPTH = 120;

export type TraceResult = { snapshots: Snapshot[]; error: { message: string; line: number | null } | null };

type Completion = { type: "return"; value: Value; line: number } | { type: "break" } | { type: "continue" } | undefined;
type Primitive = string | number | boolean | null | undefined;
type StatementLike = acorn.Statement | acorn.ModuleDeclaration;

const lineOf = (node: acorn.Node): number => node.loc?.start.line ?? 0;

function collectVars(node: acorn.Statement | acorn.Expression | acorn.Pattern | null | undefined, out: string[]) {
  if (!node) return;
  switch (node.type) {
    case "VariableDeclaration":
      if (node.kind === "var") {
        for (const declarator of node.declarations)
          if (declarator.id.type === "Identifier") out.push(declarator.id.name);
      }
      break;
    case "BlockStatement":
      node.body.forEach((child) => collectVars(child, out));
      break;
    case "IfStatement":
      collectVars(node.consequent, out);
      collectVars(node.alternate, out);
      break;
    case "ForStatement":
      collectVars(node.init, out);
      collectVars(node.body, out);
      break;
    case "ForOfStatement":
    case "ForInStatement":
      collectVars(node.left, out);
      collectVars(node.body, out);
      break;
    case "WhileStatement":
    case "DoWhileStatement":
      collectVars(node.body, out);
      break;
    case "TryStatement":
      collectVars(node.block, out);
      collectVars(node.handler?.body, out);
      collectVars(node.finalizer, out);
      break;
  }
}

function needsOwnScope(statements: acorn.Statement[]): boolean {
  return statements.some(
    (statement) =>
      (statement.type === "VariableDeclaration" && statement.kind !== "var") || statement.type === "FunctionDeclaration"
  );
}

class Machine {
  readonly snapshots: Snapshot[] = [];
  private readonly global = new Env(0, "global", "Global", null);
  private readonly active: Env[] = [];
  private readonly builtins: Map<string, Value>;
  private nextHeapId = 1;
  private nextEnvId = 1;
  private output = "";
  private line = 1;
  private depth = 0;

  constructor(private readonly code: string) {
    const host: Host = {
      code,
      call: (fn, args) => this.call(fn, args, undefined),
      array: (items) => this.makeArray(items),
      print: (text) => {
        this.output += text;
      },
      fail: (message) => this.fail(message),
    };
    this.builtins = createGlobals(host);
    this.host = host;
  }

  private readonly host: Host;

  run(program: acorn.Program): TraceResult {
    const statements = program.body as acorn.Statement[];
    try {
      this.hoist(statements, this.global, true);
      for (const statement of statements) if (this.exec(statement, this.global)) break;
      const last = statements.at(-1);
      this.record("return", last?.loc?.end.line ?? 1);
      return { snapshots: this.snapshots, error: null };
    } catch (error) {
      if (error instanceof LimitReached) {
        const message = `Stopped after ${MAX_STEPS} steps. There may be an infinite loop.`;
        this.record("limit", this.line, message, true);
        return { snapshots: this.snapshots, error: { message, line: this.line } };
      }
      if (error instanceof RunError || error instanceof UserThrow) {
        const message = error instanceof UserThrow ? `Uncaught ${formatValue(error.value, true)}` : error.message;
        this.record("failed", error.line || this.line, message, true);
        return { snapshots: this.snapshots, error: { message, line: error.line || this.line } };
      }
      throw error;
    }
  }

  private fail(message: string, line = this.line): never {
    throw new RunError(message, line);
  }

  private unsupported(node: acorn.Node): never {
    return this.fail(`"${node.type}" is not supported by this player yet`, lineOf(node));
  }

  private record(event: StepEvent, line: number, failure: string | null = null, force = false) {
    if (!force && this.snapshots.length >= MAX_STEPS) throw new LimitReached();
    this.snapshots.push(
      takeSnapshot({ global: this.global, active: this.active, event, line, output: this.output, failure })
    );
  }

  private newEnv(kind: EnvKind, label: string, parent: Env, ownsThis = false, thisValue: Value = undefined): Env {
    return new Env(this.nextEnvId++, kind, label, parent, ownsThis, thisValue);
  }

  private makeFunction(node: FunctionNode, env: Env, name: string): FunctionValue {
    return { kind: "function", id: this.nextHeapId++, node, env, name };
  }

  private makeArray(items: Value[]): ArrayValue {
    return { kind: "array", id: this.nextHeapId++, items };
  }

  private makeObject(): ObjectValue {
    return { kind: "object", id: this.nextHeapId++, props: new Map() };
  }

  private findEnv(name: string, from: Env): Env | null {
    for (let env: Env | null = from; env; env = env.parent) if (env.vars.has(name)) return env;
    return null;
  }

  private varEnv(from: Env): Env {
    let env = from;
    while (env.kind === "block" && env.parent) env = env.parent;
    return env;
  }

  private hoist(statements: acorn.Statement[], env: Env, withVars: boolean) {
    if (withVars) {
      const names: string[] = [];
      statements.forEach((statement) => collectVars(statement, names));
      names.forEach((name) => {
        if (!env.vars.has(name)) env.vars.set(name, undefined);
      });
    }
    for (const statement of statements) {
      if (statement.type === "FunctionDeclaration") {
        env.vars.set(statement.id.name, this.makeFunction(statement, env, statement.id.name));
      }
    }
  }

  private call(fn: Value, args: Value[], thisValue: Value): Value {
    if (!isCallable(fn)) return this.fail(`TypeError: ${formatValue(fn, true)} is not a function`);
    if (fn.kind === "native") return fn.call(args);
    if (this.depth >= MAX_DEPTH) return this.fail("RangeError: Maximum call stack size exceeded");
    const node = fn.node;
    const arrow = node.type === "ArrowFunctionExpression";
    const env = this.newEnv("function", fn.name || "anonymous", fn.env, !arrow, arrow ? undefined : thisValue);
    node.params.forEach((param, at) => {
      if (param.type === "Identifier") env.vars.set(param.name, args[at]);
      else if (param.type === "AssignmentPattern" && param.left.type === "Identifier") {
        env.vars.set(param.left.name, args[at] === undefined ? this.evaluate(param.right, env) : args[at]);
      } else if (param.type === "RestElement" && param.argument.type === "Identifier") {
        env.vars.set(param.argument.name, this.makeArray(args.slice(at)));
      } else this.unsupported(param);
    });
    this.depth++;
    this.active.push(env);
    this.record("call", lineOf(node));
    let result: Value;
    let returnLine = node.loc?.end.line ?? this.line;
    if (node.body.type !== "BlockStatement") {
      this.line = lineOf(node.body);
      this.record("step", this.line);
      result = this.evaluate(node.body, env);
      returnLine = lineOf(node.body);
    } else {
      this.hoist(node.body.body, env, true);
      const completion = this.execList(node.body.body, env);
      if (completion?.type === "return") {
        result = completion.value;
        returnLine = completion.line;
      }
    }
    env.vars.set(RETURN_SLOT, result);
    this.record("return", returnLine);
    env.vars.delete(RETURN_SLOT);
    this.active.pop();
    this.depth--;
    return result;
  }

  private memberKey(node: acorn.MemberExpression, env: Env): Primitive {
    if (node.computed) return toPrimitive(this.code, this.evaluate(node.property as acorn.Expression, env));
    if (node.property.type === "Identifier") return node.property.name;
    return this.unsupported(node.property);
  }

  private evaluateArguments(args: (acorn.Expression | acorn.SpreadElement)[], env: Env): Value[] {
    const values: Value[] = [];
    for (const arg of args) {
      if (arg.type !== "SpreadElement") {
        values.push(this.evaluate(arg, env));
        continue;
      }
      const spread = this.evaluate(arg.argument, env);
      if (!isObjectValue(spread) || spread.kind !== "array")
        this.fail("Spread only works on arrays in this player", lineOf(arg));
      else values.push(...spread.items);
    }
    return values;
  }

  private binary(operator: string, left: Value, right: Value, line: number): Value {
    if (/^[!=]==?$/.test(operator) && (isObjectValue(left) || isObjectValue(right))) {
      return operator.startsWith("!") ? left !== right : left === right;
    }
    const a = toPrimitive(this.code, left) as number;
    const b = toPrimitive(this.code, right) as number;
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return a / b;
      case "%":
        return a % b;
      case "**":
        return a ** b;
      case "==":
        return a == b;
      case "!=":
        return a != b;
      case "===":
        return a === b;
      case "!==":
        return a !== b;
      case "<":
        return a < b;
      case "<=":
        return a <= b;
      case ">":
        return a > b;
      case ">=":
        return a >= b;
      case "&":
        return a & b;
      case "|":
        return a | b;
      case "^":
        return a ^ b;
      case "<<":
        return a << b;
      case ">>":
        return a >> b;
      case ">>>":
        return a >>> b;
    }
    return this.fail(`The operator ${operator} is not supported by this player yet`, line);
  }

  private assign(target: acorn.Pattern, value: Value, env: Env, node: acorn.Node) {
    if (target.type === "Identifier") {
      const owner = this.findEnv(target.name, env);
      if (!owner) {
        this.global.vars.set(target.name, value);
        return;
      }
      if (owner.constants.has(target.name)) this.fail("TypeError: Assignment to constant variable.", lineOf(node));
      owner.vars.set(target.name, value);
      return;
    }
    if (target.type === "MemberExpression") {
      const object = this.evaluate(target.object as acorn.Expression, env);
      setMember(this.host, object, this.memberKey(target, env), value, lineOf(node));
      return;
    }
    this.unsupported(target);
  }

  private evaluate(node: acorn.Expression, env: Env, nameHint = ""): Value {
    this.line = lineOf(node);
    switch (node.type) {
      case "Literal":
        if (node.regex || typeof node.value === "bigint") return this.unsupported(node);
        return node.value as Primitive;
      case "Identifier": {
        if (node.name === "undefined") return undefined;
        const owner = this.findEnv(node.name, env);
        if (owner) return owner.vars.get(node.name);
        if (this.builtins.has(node.name)) return this.builtins.get(node.name);
        return this.fail(`ReferenceError: ${node.name} is not defined`, lineOf(node));
      }
      case "TemplateLiteral": {
        let text = "";
        node.quasis.forEach((part, at) => {
          text += part.value.cooked ?? "";
          if (at < node.expressions.length) text += toText(this.code, this.evaluate(node.expressions[at], env));
        });
        return text;
      }
      case "ThisExpression": {
        for (let scope: Env | null = env; scope; scope = scope.parent) if (scope.ownsThis) return scope.thisValue;
        return undefined;
      }
      case "ArrayExpression": {
        const items: Value[] = [];
        for (const element of node.elements) {
          if (!element) items.push(undefined);
          else if (element.type === "SpreadElement") items.push(...this.evaluateArguments([element], env));
          else items.push(this.evaluate(element, env));
        }
        return this.makeArray(items);
      }
      case "ObjectExpression": {
        const object = this.makeObject();
        for (const property of node.properties) {
          if (property.type === "SpreadElement") {
            const spread = this.evaluate(property.argument, env);
            if (isObjectValue(spread) && spread.kind === "object")
              spread.props.forEach((item, key) => object.props.set(key, item));
            continue;
          }
          if (property.kind !== "init") return this.unsupported(property);
          const key = property.computed
            ? String(toPrimitive(this.code, this.evaluate(property.key, env)))
            : property.key.type === "Identifier"
              ? property.key.name
              : String((property.key as acorn.Literal).value);
          object.props.set(key, this.evaluate(property.value, env, key));
        }
        return object;
      }
      case "FunctionExpression":
      case "ArrowFunctionExpression":
        return this.makeFunction(node, env, node.id?.name ?? nameHint);
      case "CallExpression": {
        const callee = node.callee;
        if (callee.type === "Super") return this.unsupported(callee);
        let thisValue: Value;
        let fn: Value;
        if (callee.type === "MemberExpression") {
          const object = this.evaluate(callee.object as acorn.Expression, env);
          if (callee.optional && (object === null || object === undefined)) return undefined;
          thisValue = object;
          fn = getMember(this.host, object, this.memberKey(callee, env), lineOf(node));
        } else fn = this.evaluate(callee, env);
        if (node.optional && (fn === null || fn === undefined)) return undefined;
        const args = this.evaluateArguments(node.arguments, env);
        if (!isCallable(fn))
          return this.fail(`TypeError: ${sourceOf(this.code, callee)} is not a function`, lineOf(node));
        this.line = lineOf(node);
        return this.call(fn, args, thisValue);
      }
      case "MemberExpression": {
        const object = this.evaluate(node.object as acorn.Expression, env);
        if (node.optional && (object === null || object === undefined)) return undefined;
        return getMember(this.host, object, this.memberKey(node, env), lineOf(node));
      }
      case "ChainExpression":
        return this.evaluate(node.expression as acorn.Expression, env);
      case "UnaryExpression": {
        if (node.operator === "typeof") {
          if (
            node.argument.type === "Identifier" &&
            !this.findEnv(node.argument.name, env) &&
            !this.builtins.has(node.argument.name)
          ) {
            return "undefined";
          }
          const value = this.evaluate(node.argument, env);
          if (value === null) return "object";
          if (isCallable(value)) return "function";
          return typeof value === "object" ? "object" : typeof value;
        }
        const operand = this.evaluate(node.argument, env);
        if (node.operator === "!") return !operand;
        if (node.operator === "-") return -(toPrimitive(this.code, operand) as number);
        if (node.operator === "+") return +(toPrimitive(this.code, operand) as number);
        if (node.operator === "void") return undefined;
        return this.unsupported(node);
      }
      case "BinaryExpression":
        return this.binary(
          node.operator,
          this.evaluate(node.left as acorn.Expression, env),
          this.evaluate(node.right, env),
          lineOf(node)
        );
      case "LogicalExpression": {
        const left = this.evaluate(node.left, env);
        if (node.operator === "&&") return left ? this.evaluate(node.right, env) : left;
        if (node.operator === "||") return left ? left : this.evaluate(node.right, env);
        return left !== null && left !== undefined ? left : this.evaluate(node.right, env);
      }
      case "ConditionalExpression":
        return this.evaluate(node.test, env) ? this.evaluate(node.consequent, env) : this.evaluate(node.alternate, env);
      case "SequenceExpression": {
        let last: Value;
        for (const expression of node.expressions) last = this.evaluate(expression, env);
        return last;
      }
      case "AssignmentExpression": {
        const operator = node.operator;
        let value: Value;
        if (operator === "=") {
          value = this.evaluate(node.right, env, node.left.type === "Identifier" ? node.left.name : "");
        } else {
          const current = this.evaluate(node.left as acorn.Expression, env);
          const binaryOperator = operator.slice(0, -1);
          if (binaryOperator === "&&") value = current ? this.evaluate(node.right, env) : current;
          else if (binaryOperator === "||") value = current ? current : this.evaluate(node.right, env);
          else if (binaryOperator === "??")
            value = current !== null && current !== undefined ? current : this.evaluate(node.right, env);
          else value = this.binary(binaryOperator, current, this.evaluate(node.right, env), lineOf(node));
        }
        this.assign(node.left, value, env, node);
        return value;
      }
      case "UpdateExpression": {
        const old = toPrimitive(this.code, this.evaluate(node.argument, env)) as number;
        const next = node.operator === "++" ? old + 1 : old - 1;
        this.assign(node.argument as acorn.Pattern, next, env, node);
        return node.prefix ? next : old;
      }
    }
    return this.unsupported(node);
  }

  private declare(declarator: acorn.VariableDeclarator, kind: string, env: Env) {
    if (declarator.id.type !== "Identifier") return this.unsupported(declarator.id);
    const name = declarator.id.name;
    const value = declarator.init ? this.evaluate(declarator.init, env, name) : undefined;
    if (kind === "var") {
      if (!declarator.init) return;
      const target = this.varEnv(env);
      (this.findEnv(name, target) ?? target).vars.set(name, value);
      return;
    }
    env.vars.set(name, value);
    if (kind === "const") env.constants.add(name);
  }

  private execList(statements: acorn.Statement[], env: Env): Completion {
    for (const statement of statements) {
      const completion = this.exec(statement, env);
      if (completion) return completion;
    }
    return undefined;
  }

  private execBlock(statements: acorn.Statement[], env: Env): Completion {
    if (!needsOwnScope(statements)) return this.execList(statements, env);
    const inner = this.newEnv("block", "block", env);
    this.active.push(inner);
    this.hoist(statements, inner, false);
    const completion = this.execList(statements, inner);
    this.active.pop();
    return completion;
  }

  private exec(statement: StatementLike, env: Env): Completion {
    const line = lineOf(statement);
    this.line = line;
    switch (statement.type) {
      case "ExpressionStatement":
        this.record("step", line);
        this.evaluate(statement.expression as acorn.Expression, env);
        return undefined;
      case "VariableDeclaration":
        this.record("step", line);
        statement.declarations.forEach((declarator) => this.declare(declarator, statement.kind, env));
        return undefined;
      case "FunctionDeclaration":
      case "EmptyStatement":
        return undefined;
      case "ReturnStatement": {
        this.record("step", line);
        const value = statement.argument ? this.evaluate(statement.argument, env) : undefined;
        return { type: "return", value, line };
      }
      case "IfStatement": {
        this.record("step", line);
        if (this.evaluate(statement.test, env)) return this.exec(statement.consequent, env);
        return statement.alternate ? this.exec(statement.alternate, env) : undefined;
      }
      case "BlockStatement":
        return this.execBlock(statement.body, env);
      case "WhileStatement": {
        for (;;) {
          this.record("step", line);
          if (!this.evaluate(statement.test, env)) return undefined;
          const completion = this.exec(statement.body, env);
          if (completion?.type === "break") return undefined;
          if (completion?.type === "return") return completion;
        }
      }
      case "DoWhileStatement": {
        do {
          const completion = this.exec(statement.body, env);
          if (completion?.type === "break") return undefined;
          if (completion?.type === "return") return completion;
          this.record("step", lineOf(statement.test));
        } while (this.evaluate(statement.test, env));
        return undefined;
      }
      case "ForStatement":
        return this.execFor(statement, env);
      case "ForOfStatement":
        return this.execForOf(statement, env);
      case "BreakStatement":
        this.record("step", line);
        return { type: "break" };
      case "ContinueStatement":
        this.record("step", line);
        return { type: "continue" };
      case "ThrowStatement":
        this.record("step", line);
        throw new UserThrow(this.evaluate(statement.argument, env), line);
      case "TryStatement":
        return this.execTry(statement, env);
    }
    return this.unsupported(statement);
  }

  private execFor(statement: acorn.ForStatement, env: Env): Completion {
    const line = lineOf(statement);
    const init = statement.init;
    const perIteration = init?.type === "VariableDeclaration" && init.kind !== "var";
    const depth = this.active.length;
    let loopEnv = env;
    if (perIteration) {
      loopEnv = this.newEnv("block", "for loop", env);
      this.active.push(loopEnv);
    }
    if (init) {
      this.record("step", line);
      if (init.type === "VariableDeclaration")
        init.declarations.forEach((declarator) => this.declare(declarator, init.kind, loopEnv));
      else this.evaluate(init, loopEnv);
    }
    for (;;) {
      this.record("step", line);
      if (statement.test && !this.evaluate(statement.test, loopEnv)) break;
      const completion = this.exec(statement.body, loopEnv);
      if (completion?.type === "break") break;
      if (completion?.type === "return") {
        this.active.length = depth;
        return completion;
      }
      if (perIteration) {
        const next = this.newEnv("block", "for loop", env);
        loopEnv.vars.forEach((value, name) => next.vars.set(name, value));
        loopEnv.constants.forEach((name) => next.constants.add(name));
        this.active[this.active.length - 1] = next;
        loopEnv = next;
      }
      if (statement.update) this.evaluate(statement.update, loopEnv);
    }
    this.active.length = depth;
    return undefined;
  }

  private execForOf(statement: acorn.ForOfStatement, env: Env): Completion {
    const line = lineOf(statement);
    this.record("step", line);
    const iterable = this.evaluate(statement.right, env);
    const items =
      isObjectValue(iterable) && iterable.kind === "array"
        ? iterable.items.slice()
        : typeof iterable === "string"
          ? iterable.split("")
          : this.fail("TypeError: the value is not iterable", line);
    const declaration = statement.left.type === "VariableDeclaration" ? statement.left : null;
    const target = declaration ? declaration.declarations[0].id : statement.left;
    if (target.type !== "Identifier") return this.unsupported(target);
    const depth = this.active.length;
    for (let at = 0; at < items.length; at++) {
      let iterationEnv = env;
      if (declaration && declaration.kind !== "var") {
        iterationEnv = this.newEnv("block", "for…of", env);
        this.active.push(iterationEnv);
        iterationEnv.vars.set(target.name, items[at]);
        if (declaration.kind === "const") iterationEnv.constants.add(target.name);
      } else this.assign(target, items[at], env, statement);
      if (at > 0) this.record("step", line);
      const completion = this.exec(statement.body, iterationEnv);
      this.active.length = depth;
      if (completion?.type === "break") break;
      if (completion?.type === "return") return completion;
    }
    return undefined;
  }

  private execTry(statement: acorn.TryStatement, env: Env): Completion {
    const depth = this.active.length;
    const callDepth = this.depth;
    let completion: Completion;
    try {
      completion = this.exec(statement.block, env);
    } catch (error) {
      if (!statement.handler || error instanceof LimitReached) throw error;
      if (!(error instanceof UserThrow) && !(error instanceof RunError)) throw error;
      this.active.length = depth;
      this.depth = callDepth;
      const caught = this.newEnv("block", "catch", env);
      this.active.push(caught);
      const param = statement.handler.param;
      if (param?.type === "Identifier")
        caught.vars.set(param.name, error instanceof UserThrow ? error.value : error.message);
      this.record("step", lineOf(statement.handler));
      completion = this.execList(statement.handler.body.body, caught);
      this.active.pop();
    }
    if (statement.finalizer) {
      const finalCompletion = this.exec(statement.finalizer, env);
      if (finalCompletion) return finalCompletion;
    }
    return completion;
  }
}

export function trace(code: string): TraceResult {
  let program: acorn.Program;
  try {
    program = parse(code, { ecmaVersion: 2022, locations: true });
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    const located = error as SyntaxError & { loc?: { line: number } };
    return {
      snapshots: [],
      error: { message: located.message.replace(/\s*\(\d+:\d+\)$/, ""), line: located.loc?.line ?? null },
    };
  }
  return new Machine(code).run(program);
}
