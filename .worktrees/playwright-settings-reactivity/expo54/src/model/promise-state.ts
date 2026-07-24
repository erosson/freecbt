// based on https://package.elm-lang.org/packages/krisajenkins/remotedata/latest/RemoteData
export type Pending = { status: "pending" };
export type Success<V> = { status: "success"; value: V };
export type Failure<E = Error> = { status: "failure"; error: E };
export type T<V, E = Error> = Pending | Success<V> | Failure<E>;
type PromiseState<V, E = Error> = T<V, E>;

export function pending(): Pending {
  return { status: "pending" };
}
export function success<V>(value: V): Success<V> {
  return { status: "success", value };
}
export function failure<E = Error>(error: E): Failure<E> {
  return { status: "failure", error };
}

export function isPending(p: PromiseState<unknown, unknown>): p is Pending {
  return p.status === "pending";
}
export function isFailure(
  p: PromiseState<unknown, unknown>
): p is Failure<unknown> {
  return p.status === "failure";
}
export function isSuccess(
  p: PromiseState<unknown, unknown>
): p is Success<unknown> {
  return p.status === "success";
}

export function map<A, B, E>(
  a: PromiseState<A, E>,
  fn: (a: A) => B
): PromiseState<B, E> {
  return isSuccess(a) ? success(fn(a.value)) : a;
}
export function map2<A, B, C, E>(
  a: PromiseState<A, E>,
  b: PromiseState<B, E>,
  fn: (a: A, b: B) => C
): PromiseState<C, E> {
  return isSuccess(a) ? (isSuccess(b) ? success(fn(a.value, b.value)) : b) : a;
}

export interface Match<O, V, E> {
  pending: () => O;
  failure: (e: E) => O;
  success: (v: V) => O;
}
export function match<O, V, E>(d: PromiseState<V, E>, m: Match<O, V, E>): O {
  switch (d.status) {
    case "pending":
      return m.pending();
    case "failure":
      return m.failure(d.error);
    case "success":
      return m.success(d.value);
  }
}
