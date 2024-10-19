import { isPromise, isError } from "./utils";

export type ResultOk<T> = {
  ok: true;
  value: T;
};

export type ResultError<E extends Error = Error> = {
  ok: false;
  error: E;
};

export type Result<T, E extends Error = Error> = ResultOk<T> | ResultError<E>;

export function resultOk<T>(value: T): ResultOk<T> {
  return {
    ok: true,
    value,
  };
}

export function resultError<E extends Error = Error>(error: E): ResultError<E> {
  return {
    ok: false,
    error,
  };
}

export function isResultOk<T>(result: Result<T>): result is ResultOk<T> {
  return result.ok;
}

export function isResultError<E extends Error = Error>(
  result: Result<unknown, E>
): result is ResultError<E> {
  return !result.ok;
}

export function resultOf<T>(fn: () => Promise<T>): Promise<Result<T>>;
export function resultOf<T>(fn: () => T): Result<T>;
export function resultOf<T>(
  fn: () => Promise<T> | T
): Result<T> | Promise<Result<T>> {
  try {
    const value = fn();
    if (isPromise(value)) {
      return value
        .then((v) => resultOk(v))
        .catch((e) => resultError(isError(e) ? e : new Error(String(e))));
    }

    return resultOk(value);
  } catch (e) {
    const error = isError(e) ? e : new Error(String(e));
    return resultError(error);
  }
}
