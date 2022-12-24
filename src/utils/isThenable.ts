/**
 * Checks whether the provided value is an instance of Thenable.
 *
 * Thenables are regular objects that contain `then` method. When such object is
 * passed to {@link Promise.resolve}, its `then` method is automatically called
 * with `resolve` and `reject` functions.
 *
 * In TypeScript Thenables are represented via type {@link PromiseLike}.
 *
 * @param value Value to check.
 * @returns `true` if value is a Thenable, otherwise `false`.
 */
export function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<PropertyKey, any>).then === 'function'
  )
}

