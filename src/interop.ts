import { Try } from "./try";

export function toPromise<T>(value: Try<T>): Promise<T> {
  return new Promise((resolve, reject) => value.then(resolve).catch(reject));
}
