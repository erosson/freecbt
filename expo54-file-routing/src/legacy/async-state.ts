import React from "react"

export type AsyncState<V> = () => Promise<V>
export type AsyncStateOpts<V> = {
  effect: AsyncState<V>
  cleanup?: () => void
  deps?: React.DependencyList
}

export type AsyncResultState<V, E> = AsyncState<Result<V, E>>
export type AsyncResultStateOpts<V, E> = AsyncStateOpts<Result<V, E>>

export type Init = { status: "init" }
export type Pending = {
  status: "pending"
  promise: Promise<void>
}
/**
 * Represent program errors as a plain old value, as functional-style programs do.
 *
 * As opposed to the more common JS/object-oriented throwable exceptions.
 *
 * Use alongside `Success`, and either `Result` or `RemoteData`, to represent a
 * possibly-failed thing.
 *
 * In most JS/TS code, exceptions are the more common approach to error handling.
 * Stick to that, when you can. Exceptions have some real limitations though. Here
 * are a few examples of times where I'd rather treat errors as plain old values,
 * instead of exceptions:
 *
 * - When parsing a list of values (like JSON thought data), I'd like to know not
 *   only which values parsed successfully, but which values parsed unsuccessfully.
 *   I'd also like to hang on to both the thrown exception and the JSON that
 *   caused it.
 * - Exceptions are really awkward with asynchronous code. `async` functions turn
 *   exceptions into promises, which sort of turns errors into values with
 *   `.catch()`, but promises have all sorts of weird state. `Failure` values are
 *   stateless.
 */
export type Failure<E = any> = {
  status: "failure"
  error: E
}
export type Success<V> = {
  status: "success"
  value: V
  // when transitioning success -> pending, we almost always want to skip any loading indicator.
  // Instead, keep the success state, and indicate pending with this property.
  pending?: Promise<void>
}

/**
 * Asynchronously loaded data. Based on the Elm version:
 * https://package.elm-lang.org/packages/krisajenkins/remotedata/latest/RemoteData
 *
 * Traditionally Eithers are typed `<E, V>` not `<V, E>`, but in Javascript an `any`-typed error is so common,
 * due to exceptions, that I'd really like it to have a default of `any`.
 */
export type RemoteData<V, E = any> = Init | Pending | Result<V, E>

/**
 * The result of a computation that may fail. Either a value or an exception.
 */
export type Result<V, E = any> = Failure<E> | Success<V>

export function isInit<V, E>(d: RemoteData<V, E>): d is Init {
  return d.status === "init"
}
export function isPending<V, E>(d: RemoteData<V, E>): d is Pending {
  return d.status === "pending"
}
export function isFailure<V, E>(
  d: RemoteData<V, E> | Result<V, E>
): d is Failure<E> {
  return d.status === "failure"
}
export function isSuccess<V, E>(
  d: RemoteData<V, E> | Result<V, E>
): d is Success<V> {
  return d.status === "success"
}
export function isResult<V, E>(d: RemoteData<V, E>): boolean {
  return isFailure(d) || isSuccess(d)
}
export function withDefault<V, E>(
  d: RemoteData<V, E> | Result<V, E>,
  default_: V
): V {
  return isSuccess(d) ? d.value : default_
}

export function map<V2, V, E>(d: Result<V, E>, fn: (v: V) => V2): Result<V2, E>
export function map<V2, V, E>(
  d: RemoteData<V, E>,
  fn: (v: V) => V2
): RemoteData<V2, E>
export function map<V2, V, E>(
  d: RemoteData<V, E> | Result<V, E>,
  fn: (v: V) => V2
): RemoteData<V2, E> | Result<V2, E> {
  return isSuccess(d) ? { status: "success", value: fn(d.value) } : d
}

export function mapError<E2, V, E>(
  d: Result<V, E>,
  fn: (e: E) => E2
): Result<V, E2>
export function mapError<E2, V, E>(
  d: RemoteData<V, E>,
  fn: (e: E) => E2
): RemoteData<V, E2>
export function mapError<E2, V, E>(
  d: RemoteData<V, E> | Result<V, E>,
  fn: (e: E) => E2
): RemoteData<V, E2> | Result<V, E2> {
  return isFailure(d) ? { status: "failure", error: fn(d.error) } : d
}

export function mapBoth<V2, E2, V, E>(
  d: Result<V, E>,
  mapVal: (v: V) => V2,
  mapErr: (e: E) => E2
): Result<V2, E2>
export function mapBoth<V2, E2, V, E>(
  d: RemoteData<V, E>,
  mapVal: (v: V) => V2,
  mapErr: (e: E) => E2
): RemoteData<V2, E2>
export function mapBoth<V2, E2, V, E>(
  d: RemoteData<V, E> | Result<V, E>,
  mapVal: (v: V) => V2,
  mapErr: (e: E) => E2
): RemoteData<V2, E2> | Result<V2, E2> {
  switch (d.status) {
    case "success":
      return { status: "success", value: mapVal(d.value) }
    case "failure":
      return { status: "failure", error: mapErr(d.error) }
    default:
      return d
  }
}

export function fold<T, V, E>(
  d: Result<V, E>,
  failureFn: (e: E) => T,
  successFn: (v: V) => T
): T
export function fold<T, V, E>(
  d: RemoteData<V, E>,
  initFn: () => T,
  pendingFn: (p: Promise<void>) => T,
  failureFn: (e: E) => T,
  successFn: (v: V) => T
): T
export function fold<T, V>(
  d: any,
  arg1: any,
  arg2: any,
  arg3?: any,
  arg4?: any
): T {
  if (arg3) {
    // remotedata
    switch (d.status) {
      case "init":
        return arg1()
      case "pending":
        return arg2(d.promise)
      case "failure":
        return arg3(d.error)
      case "success":
        return arg4(d.value)
      default:
        throw new Error(`bad RemoteData: ${d}`)
    }
  } else {
    // result
    switch (d.status) {
      case "failure":
        return arg1(d.error)
      case "success":
        return arg2(d.value)
      default:
        throw new Error(`bad Result: ${d}`)
    }
  }
}

/**
 * Load some data asynchronously.
 *
 * `useEffect` loads the data, and `useState` stores it as `RemoteData`.
 */
export function useAsyncState<V>(
  effect: AsyncState<V>,
  deps?: React.DependencyList
): RemoteData<V, any>
export function useAsyncState<V>(opts: AsyncStateOpts<V>): RemoteData<V, any>
export function useAsyncState<V>(
  arg1: AsyncStateOpts<V> | AsyncState<V>,
  arg2?: React.DependencyList
): RemoteData<V, any> {
  const opts: AsyncStateOpts<V> =
    typeof arg1 === "function" ? { effect: arg1, deps: arg2 } : arg1

  const [state, setState] = React.useState<RemoteData<V, any>>({
    status: "init",
  })
  React.useEffect(() => {
    // There are two different promises here!
    // * opts.effect() returns a `Promise<V>`, which might `reject()`.
    // * The promise below, exposed by useAsyncState, returns a `Promise<void>`
    // that returns at the same time as the original, but will never reject.
    // It returns no data. Useful for unit tests, but React components
    // shouldn't rely on it.
    const promise = new Promise<void>((resolve) => {
      opts
        .effect()
        .then((value) => {
          setState({ status: "success", value })
          resolve()
        })
        .catch((error) => {
          setState({ status: "failure", error })
          resolve()
        })
    })
    setState(
      isSuccess(state)
        ? { ...state, pending: promise }
        : { status: "pending", promise }
    )
    return opts.cleanup
  }, opts.deps ?? [])
  return state
}

export type AsyncEffect = AsyncState<void>
export type AsyncEffectOpts = AsyncStateOpts<void>
export type AsyncEffectResult = RemoteData<void, any>

/**
 * `useEffect` for asynchronous computations.
 */
export function useAsyncEffect(
  effect: AsyncEffect,
  deps?: React.DependencyList
): AsyncEffectResult
export function useAsyncEffect(opts: AsyncEffectOpts): AsyncEffectResult
export function useAsyncEffect(
  arg1: AsyncEffectOpts | AsyncEffect,
  arg2?: React.DependencyList
): AsyncEffectResult {
  return typeof arg1 === "function"
    ? useAsyncState(arg1, arg2)
    : useAsyncState(arg1)
}

/**
 * `useAsyncState` for effects that return a Result with a specific error, instead of throwing errors of an unspecified type.
 */
export function useAsyncResultState<V, E>(
  effect: AsyncResultState<V, E>,
  deps?: React.DependencyList
): RemoteData<V, E>
export function useAsyncResultState<V, E>(
  opts: AsyncResultStateOpts<V, E>
): RemoteData<V, E>
export function useAsyncResultState<V, E>(
  arg1: AsyncResultStateOpts<V, E> | AsyncResultState<V, E>,
  arg2?: React.DependencyList
): RemoteData<V, E> {
  // treat the Result as the value, then fold so the Result becomes the RemoteData
  const rd: RemoteData<Result<V, E>, any> = typeof arg1 === "function"
    ? useAsyncState(arg1, arg2)
    : useAsyncState(arg1)

  return fold(
    rd,
    () => rd as RemoteData<V, E>,
    () => rd as RemoteData<V, E>,
    (cause) => {
      // errors caught by RemoteData before folding are always the caller's fault
      throw new Error(
        `You're using \`useAsyncResultState\` wrong.
        \`effect()\` threw an error, but \`Result\` effects must return all errors as \`Failure<E>\` values, and never throw errors.
        Catch your errors and transform them into \`Failure<E>\`s, or try \`useAsyncState()\` instead.`,
        { cause }
      )
    },
    (value: Result<V, E>) => value
  )
}

export function tryResult<V>(fn: () => V): Result<V, any> {
  try {
    return { status: "success", value: fn() }
  } catch (error) {
    return { status: "failure", error }
  }
}
