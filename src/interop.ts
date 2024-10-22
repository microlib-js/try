import { Try } from "./try";

export function toPromise<T>(value: Try<T>): Promise<T> {
  return value
    .then((x) => Promise.resolve(x))
    .catch((x) => Promise.reject(x))
    .unwrap();
}
