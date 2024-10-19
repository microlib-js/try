const toStr = Function.bind.call(
  Function.call as typeof Function.prototype.toString,
  Object.prototype.toString
);

export function isError(err: unknown): err is Error {
  return !!err && toStr(err) === "[object Error]";
}

export function isPromise(value: unknown): value is Promise<unknown> {
  return !!value && toStr(value) === "[object Promise]";
}
