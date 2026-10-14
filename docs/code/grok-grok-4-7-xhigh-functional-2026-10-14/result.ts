export type Ok<T> = {
  readonly ok: true;
  readonly value: T;
};

export type Err<E> = {
  readonly ok: false;
  readonly error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const map = <T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U,
): Result<U, E> => {
  if (result.ok) {
    return ok(transform(result.value));
  }
  return result;
};

export const flatMap = <T, U, E, F>(
  result: Result<T, E>,
  transform: (value: T) => Result<U, F>,
): Result<U, E | F> => {
  if (result.ok) {
    return transform(result.value);
  }
  return result;
};

export const match = <T, E, R>(
  result: Result<T, E>,
  onOk: (value: T) => R,
  onErr: (error: E) => R,
): R => (result.ok ? onOk(result.value) : onErr(result.error));

export const flatMapAll = <T, E>(
  start: T,
  operations: readonly ((value: T) => Result<T, E>)[],
): Result<T, E> =>
  operations.reduce<Result<T, E>>(
    (current, operation) => flatMap(current, operation),
    ok(start),
  );
