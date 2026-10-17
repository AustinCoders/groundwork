import {
  formatValue,
  isObjectValue,
  toPrimitive,
  toText,
  type ArrayValue,
  type NamespaceValue,
  type NativeValue,
  type Value,
} from "./values";

export type Host = {
  code: string;
  call: (fn: Value, args: Value[]) => Value;
  array: (items: Value[]) => ArrayValue;
  print: (text: string) => void;
  fail: (message: string) => never;
};

const STRING_METHODS = [
  "toUpperCase",
  "toLowerCase",
  "trim",
  "slice",
  "includes",
  "indexOf",
  "charAt",
  "split",
  "repeat",
  "startsWith",
  "endsWith",
  "padStart",
  "padEnd",
  "replace",
] as const;

const NUMBER_METHODS = ["toFixed", "toString"] as const;

const MATH_METHODS = ["floor", "ceil", "round", "abs", "sqrt", "max", "min", "pow", "trunc", "sign"] as const;

function native(name: string, call: NativeValue["call"]): NativeValue {
  return { kind: "native", name, call };
}

function namespace(props: Record<string, Value>): NamespaceValue {
  return { kind: "namespace", props };
}

function primitives(host: Host, args: Value[]) {
  return args.map((arg) => toPrimitive(host.code, arg));
}

function arrayMethod(host: Host, array: ArrayValue, name: string): NativeValue | undefined {
  const items = array.items;
  const callback = (args: Value[]) => args[0];
  switch (name) {
    case "push":
      return native(name, (args) => items.push(...args));
    case "pop":
      return native(name, () => items.pop());
    case "shift":
      return native(name, () => items.shift());
    case "unshift":
      return native(name, (args) => items.unshift(...args));
    case "slice":
      return native(name, (args) =>
        host.array(items.slice(args[0] as number | undefined, args[1] as number | undefined))
      );
    case "concat":
      return native(name, (args) =>
        host.array(items.concat(...args.map((arg) => (isObjectValue(arg) && arg.kind === "array" ? arg.items : [arg]))))
      );
    case "indexOf":
      return native(name, (args) => items.indexOf(args[0]));
    case "includes":
      return native(name, (args) => items.includes(args[0]));
    case "join":
      return native(name, (args) =>
        items.map((item) => toText(host.code, item)).join(args[0] === undefined ? "," : toText(host.code, args[0]))
      );
    case "reverse":
      return native(name, () => {
        items.reverse();
        return array;
      });
    case "forEach":
      return native(name, (args) => {
        items.slice().forEach((item, at) => host.call(callback(args), [item, at, array]));
        return undefined;
      });
    case "map":
      return native(name, (args) =>
        host.array(items.slice().map((item, at) => host.call(callback(args), [item, at, array])))
      );
    case "filter":
      return native(name, (args) =>
        host.array(items.slice().filter((item, at) => Boolean(host.call(callback(args), [item, at, array]))))
      );
    case "reduce":
      return native(name, (args) => {
        const snapshot = items.slice();
        let accumulator = args.length > 1 ? args[1] : snapshot[0];
        for (let at = args.length > 1 ? 0 : 1; at < snapshot.length; at++) {
          accumulator = host.call(args[0], [accumulator, snapshot[at], at, array]);
        }
        return accumulator;
      });
    default:
      return undefined;
  }
}

export function getMember(
  host: Host,
  target: Value,
  key: string | number | boolean | null | undefined,
  line: number
): Value {
  if (target === undefined || target === null) {
    return host.fail(`TypeError: Cannot read properties of ${target} (reading '${String(key)}') on line ${line}`);
  }
  if (typeof target === "string") {
    if (key === "length") return target.length;
    if (typeof key === "number") return target[key];
    const method = STRING_METHODS.find((name) => name === key);
    if (!method) return undefined;
    return native(method, (args) => {
      const call = String.prototype[method] as (this: string, ...rest: unknown[]) => Value;
      return call.apply(target, primitives(host, args));
    });
  }
  if (typeof target === "number") {
    const method = NUMBER_METHODS.find((name) => name === key);
    if (!method) return undefined;
    return native(method, (args) => {
      const call = Number.prototype[method] as (this: number, ...rest: unknown[]) => Value;
      return call.apply(target, primitives(host, args));
    });
  }
  if (typeof target === "boolean") return undefined;
  if (target.kind === "array") {
    if (key === "length") return target.items.length;
    if (typeof key === "number" || (typeof key === "string" && /^\d+$/.test(key))) return target.items[Number(key)];
    return typeof key === "string" ? arrayMethod(host, target, key) : undefined;
  }
  if (target.kind === "object") return target.props.get(String(key));
  if (target.kind === "function") {
    if (key === "name") return target.name;
    if (key === "length") return target.node.params.length;
    return undefined;
  }
  if (target.kind === "namespace" && typeof key === "string")
    return Object.hasOwn(target.props, key) ? target.props[key] : undefined;
  return undefined;
}

export function setMember(
  host: Host,
  target: Value,
  key: string | number | boolean | null | undefined,
  value: Value,
  line: number
) {
  if (target === undefined || target === null) {
    host.fail(`TypeError: Cannot set properties of ${target} (setting '${String(key)}') on line ${line}`);
    return;
  }
  if (!isObjectValue(target)) return host.fail(`TypeError: Cannot assign to a property of a ${typeof target}`);
  if (target.kind === "object") {
    target.props.set(String(key), value);
    return;
  }
  if (target.kind !== "array") return host.fail("This prototype only assigns properties on objects and arrays");
  if (key === "length") {
    target.items.length = Number(value);
    return;
  }
  const at = Number(key);
  if (!Number.isInteger(at) || at < 0) return host.fail("Only whole-number array indexes are supported");
  while (target.items.length < at) target.items.push(undefined);
  target.items[at] = value;
}

export function createGlobals(host: Host): Map<string, Value> {
  const math: Record<string, Value> = { PI: Math.PI };
  for (const name of MATH_METHODS) {
    const call = Math[name] as (...rest: number[]) => number;
    math[name] = native(`Math.${name}`, (args) => call(...(primitives(host, args) as number[])));
  }
  const log = native("console.log", (args) => {
    host.print(`${args.map((arg) => formatValue(arg)).join(" ")}\n`);
    return undefined;
  });
  const objectNamespace = namespace({
    keys: native("Object.keys", (args) => {
      const target = args[0];
      return host.array(isObjectValue(target) && target.kind === "object" ? [...target.props.keys()] : []);
    }),
    values: native("Object.values", (args) => {
      const target = args[0];
      return host.array(isObjectValue(target) && target.kind === "object" ? [...target.props.values()] : []);
    }),
  });
  const arrayNamespace = namespace({
    isArray: native("Array.isArray", (args) => isObjectValue(args[0]) && args[0].kind === "array"),
  });
  return new Map<string, Value>([
    ["console", namespace({ log, info: log, warn: log, error: log })],
    ["Math", namespace(math)],
    ["Object", objectNamespace],
    ["Array", arrayNamespace],
    ["Number", native("Number", (args) => Number(toPrimitive(host.code, args[0])))],
    ["String", native("String", (args) => toText(host.code, args[0]))],
    ["Boolean", native("Boolean", (args) => Boolean(args[0]))],
    [
      "parseInt",
      native("parseInt", (args) => parseInt(String(toPrimitive(host.code, args[0])), args[1] as number | undefined)),
    ],
    ["parseFloat", native("parseFloat", (args) => parseFloat(String(toPrimitive(host.code, args[0]))))],
    ["isNaN", native("isNaN", (args) => Number.isNaN(Number(toPrimitive(host.code, args[0]))))],
    ["NaN", NaN],
    ["Infinity", Infinity],
  ]);
}
