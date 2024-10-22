interface ITry<A> {
  ok: boolean;
  then<B = A>(onsuccess: (value: A) => B | Try<B>): Try<B>;
  catch<B = never>(onfailure: (reason: unknown) => B | Try<B>): Try<A | B>;
  unwrap(): A;
  result(): Result<A>;
}

class Success<A> implements ITry<A> {
  readonly ok = true;

  constructor(readonly value: A) {
    return this;
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

  unwrap(): A {
    return this.value;
  }

  result(): Result<A> {
    return { ok: true, value: this.value };
  }
}

class Failure<A> implements ITry<A> {
  readonly ok = false;

  constructor(readonly error: unknown) {
    return this;
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

  unwrap(): A {
    throw this.error;
  }

  result(): Result<A> {
    return { ok: false, error: this.error };
  }
}

export type Try<A> = Success<A> | Failure<A>;
export type Unwrapped<A> = A extends Try<infer B> ? Unwrapped<B> : A;

export function Try<A>(value: () => A): Try<A> {
  return Try.apply(value);
}

export namespace Try {
  export function apply<A>(value: () => A): Try<A> {
    try {
      return new Success<A>(value());
    } catch (error) {
      return new Failure<A>(error as A);
    }
  }

  export function success<A>(value: A | Try<A>): Try<Unwrapped<A>> {
    if (Try.isTry(value)) {
      return apply(value.unwrap.bind(value)) as unknown as Try<Unwrapped<A>>;
    }
    return new Success(value) as unknown as Try<Unwrapped<A>>;
  }

  export function failure<A = never>(reason: unknown): Try<A> {
    if (Try.isTry(reason)) {
      return apply(reason.unwrap.bind(reason) as () => A);
    }

    return new Failure(reason);
  }

  export function isOk(value: unknown): value is Success<unknown> {
    return value instanceof Success;
  }

  export function isError(value: unknown): value is Failure<unknown> {
    return value instanceof Failure;
  }

  export function isTry(value: unknown): value is Try<unknown> {
    return value instanceof Success || value instanceof Failure;
  }
}

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
