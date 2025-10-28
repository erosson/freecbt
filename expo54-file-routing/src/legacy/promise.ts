// Cancellable promises.
// https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
export interface Cancellable<T> {
  promise: Promise<T>
  cancel: () => void
}

export function makeCancellable<T>(promise: Promise<T>): Cancellable<T> {
  let hasCancelled_ = false

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise.then(
      (val) => (hasCancelled_ ? reject({ isCancelled: true }) : resolve(val)),
      (error) => (hasCancelled_ ? reject({ isCancelled: true }) : reject(error))
    )
  })

  return {
    promise: wrappedPromise,
    cancel() {
      hasCancelled_ = true
    },
  }
}
