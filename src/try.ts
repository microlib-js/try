interface ITry<A> {
  ok: boolean;

  then<B = A>(onsuccess: (value: A) => B | Try<B>): Try<B>;
  catch<B = never>(onfailure: (reason: unknown) => B | Try<B>): Try<A | B>;
  finally(onfinally?: (() => void) | undefined | null): Try<A>;

  unwrap(): A;
  result(): Result<A>;

  readonly [Symbol.toStringTag]: string;
}

new Promise(() => {}).finally;

export class Success<A> implements ITry<A> {
  readonly ok = true;

  constructor(readonly value: A) {
    return this;
  }

  get [Symbol.toStringTag]() {
    return "Try";
  }

  then<B = A>(onsuccess: (value: A) => B | Try<B>): Try<B> {
    try {
      const next = onsuccess(this.value);
      if (Try.isTry(next)) {
        return next;
      } else {
        return new Success(next);
      }
    } catch (error) {
      return new Failure(error);
    }
  }

  catch<B = never>(onfailure: (reason: unknown) => B | Try<B>): Try<A | B> {
    return this as unknown as Try<A | B>;
  }

  finally(onfinally?: (() => void) | undefined | null): Try<A> {
    if (!onfinally) return this;

    try {
      onfinally();
      return this;
    } catch (error) {
      return new Failure(error);
    }
  }

  unwrap(): A {
    return this.value;
  }

  result(): Result<A> {
    return { ok: true, value: this.value };
  }
}

export class Failure<A> implements ITry<A> {
  readonly ok = false;

  constructor(readonly error: unknown) {
    return this;
  }

  get [Symbol.toStringTag]() {
    return "Try";
  }

  then<B = A>(onsuccess: (value: A) => B | Try<B>): Try<B> {
    return this as unknown as Try<B>;
  }

  catch<B = never>(onfailure: (reason: unknown) => B | Try<B>): Try<A | B> {
    try {
      const next = onfailure(this.error);
      if (Try.isTry(next)) {
        return next;
      } else {
        return new Success(next);
      }
    } catch (error) {
      return new Failure(error);
    }
  }

  finally(onfinally?: (() => void) | undefined | null): Try<A> {
    if (!onfinally) return this;

    try {
      onfinally();
      return this;
    } catch (error) {
      return new Failure(error);
    }
  }

  unwrap(): A {
    throw this.error;
  }

  result(): Result<A> {
    return { ok: false, error: this.error };
  }
}

export type Try<A> = Success<A> | Failure<A>;
export type Unwrapped<A> = A extends Try<infer B> ? Unwrapped<B> : A;

export interface TryConstructor {
  <A>(value: () => A): Try<A>;
  new <A>(value: () => A): Try<A>;

  apply<A>(value: () => A): Try<A>;
  success<A>(value: A | Try<A>): Try<Unwrapped<A>>;
  failure<A = never>(reason: unknown): Try<A>;
  isOk(value: unknown): value is Success<unknown>;
  isError(value: unknown): value is Failure<unknown>;
  isTry(value: unknown): value is Try<unknown>;

  promise<A>(value: () => Promise<A>): Promise<A>;
  promise<A>(value: () => A): Promise<A>;

  readonly [Symbol.toStringTag]: string;
}

const TryImplementation: Omit<TryConstructor, never> = {
  apply<A>(value: () => A): Try<A> {
    try {
      return new Success<A>(value());
    } catch (error) {
      return new Failure<A>(error as A);
    }
  },
  success<A>(value: A | Try<A>): Try<Unwrapped<A>> {
    if (TryImplementation.isTry(value)) {
      return TryImplementation.apply(
        value.unwrap.bind(value)
      ) as unknown as Try<Unwrapped<A>>;
    }
    return new Success(value) as unknown as Try<Unwrapped<A>>;
  },
  failure<A = never>(reason: unknown): Try<A> {
    if (TryImplementation.isTry(reason)) {
      return TryImplementation.apply(reason.unwrap.bind(reason) as () => A);
    }

    return new Failure(reason);
  },
  isOk(value: unknown): value is Success<unknown> {
    return value instanceof Success;
  },
  isError(value: unknown): value is Failure<unknown> {
    return value instanceof Failure;
  },
  isTry(value: unknown): value is Try<unknown> {
    return value instanceof Success || value instanceof Failure;
  },
  promise<A>(value: () => A | Promise<A>): Promise<A> {
    try {
      const v = value();

      if (Object.prototype.toString.call(v) === "[object Promise]") {
        return v as Promise<A>;
      } else {
        return Promise.resolve(v);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },

  [Symbol.toStringTag]: "Try",
};

export const Try = Object.assign(function <A>(value: () => A): Try<A> {
  return TryImplementation.apply(value);
}, TryImplementation) as TryConstructor;

/* Result Types */
type ResultOk<T> = {
  ok: true;
  value: T;
};

type ResultError<E = unknown> = {
  ok: false;
  error: E;
};

export type Result<T, E = unknown> = ResultOk<T> | ResultError<E>;
