interface ITry<A> {
  ok: boolean;

  then<B = A>(onsuccess: ((value: A) => B | Try<B>) | undefined | null): Try<B>;
  catch<B = never>(
    onfailure: ((reason: unknown) => B | Try<B>) | undefined | null
  ): Try<A | B>;
  finally(onfinally?: (() => void) | undefined | null): Try<A>;

  readonly [Symbol.toStringTag]: string;
}

export class Success<A> implements ITry<A> {
  readonly ok = true;

  constructor(readonly value: A) {
    return this;
  }

  get [Symbol.toStringTag]() {
    return "Try";
  }

  then<B = A>(
    onsuccess: ((value: A) => B | Try<B>) | undefined | null
  ): Try<B> {
    if (onsuccess === undefined || onsuccess === null) {
      return this as unknown as Try<B>;
    }

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

  catch<B = never>(
    onfailure: ((reason: unknown) => B | Try<B>) | undefined | null
  ): Try<A | B> {
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
}

export class Failure<A> implements ITry<A> {
  readonly ok = false;

  constructor(readonly error: unknown) {
    return this;
  }

  get [Symbol.toStringTag]() {
    return "Try";
  }

  then<B = A>(
    onsuccess: ((value: A) => B | Try<B>) | undefined | null
  ): Try<B> {
    return this as unknown as Try<B>;
  }

  catch<B = never>(
    onfailure: ((reason: unknown) => B | Try<B>) | undefined | null
  ): Try<A | B> {
    if (onfailure === undefined || onfailure === null) {
      return this as unknown as Try<A | B>;
    }

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
}

export type Try<A> = Success<A> | Failure<A>;
export type Unwrapped<A> = A extends Try<infer B> ? Unwrapped<B> : A;

export interface TryConstructor {
  <A>(value: () => Promise<A>): Promise<A>;
  <A>(value: () => A): Try<A>;

  new <A>(value: () => Promise<A>): Promise<A>;
  new <A>(value: () => A): Try<A>;

  apply<A>(value: () => A): Try<A>;
  success<A>(value: A | Try<A>): Try<Unwrapped<A>>;
  failure<A = never>(reason: unknown): Try<A>;
  unwrap<A>(value: Try<A>): A;
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
        () => TryImplementation.unwrap(value) as Unwrapped<A>
      );
    }
    return new Success(value) as unknown as Try<Unwrapped<A>>;
  },
  failure<A = never>(reason: unknown): Try<A> {
    if (TryImplementation.isTry(reason)) {
      return TryImplementation.apply(
        () => TryImplementation.unwrap(reason) as A
      );
    }

    return new Failure(reason);
  },
  unwrap<A>(value: Try<A>): A {
    if (TryImplementation.isOk(value)) {
      return value.value;
    } else {
      throw value.error;
    }
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

      if (isPromise(v)) {
        return v;
      } else {
        return Promise.resolve(v);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },

  [Symbol.toStringTag]: "Try",
};

export const Try = Object.assign(function <A>(
  value: () => A | Promise<A>
): Try<A> | Promise<A> {
  const v = TryImplementation.apply(value);

  if (v.ok && isPromise(v.value)) {
    return v.value;
  } else {
    return v as Try<A>;
  }
},
TryImplementation) as TryConstructor;

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

/* Helper */
function isPromise(value: unknown): value is Promise<unknown> {
  return Object.prototype.toString.call(value) === "[object Promise]";
}
