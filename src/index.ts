import {
  isResultError,
  isResultOk,
  resultError,
  resultOf,
  resultOk,
  type Result,
} from "./result";
import { isError, isPromise } from "./utils";

export function trySync<T>(fn: () => T): Result<T> {
  try {
    const value = fn();
    return resultOk(value);
  } catch (e) {
    const error = isError(e) ? e : new Error(String(e));
    return resultError(error);
  }
}

type MaybePromise<T> = T | Promise<T>;
export function tryAsync<T>(fn: () => MaybePromise<T>): Promise<Result<T>> {
  try {
    const value = fn();
    if (isPromise(value)) {
      return value
        .then((v) => resultOk(v))
        .catch((e) => resultError(isError(e) ? e : new Error(String(e))));
    }

    return Promise.resolve(resultOk(value));
  } catch (e) {
    const error = isError(e) ? e : new Error(String(e));
    return Promise.reject(resultError(error));
  }
}

export const Try = Object.assign(resultOf, {
  sync: trySync,
  async: tryAsync,
  isOk: isResultOk,
  isError: isResultError,
});
