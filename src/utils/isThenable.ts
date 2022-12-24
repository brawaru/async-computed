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

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('isThenable', () => {
    it('works for Promise', () => {
      expect(isThenable(new Promise(() => {}))).toBe(true)
    })

    it('works for custom object with then method', () => {
      expect(isThenable({ then() {} })).toBe(true)
    })

    it('works for objects without prototype', () => {
      expect(isThenable(Object.assign(Object.create(null), { then() {} })))
    })

    it("doesn't work for null", () => {
      expect(isThenable(null)).toBe(false)
    })

    it("doesn't work for objects without then", () => {
      expect(isThenable({})).toBe(false)
    })

    it("doesn't work for object with then non-method", () => {
      expect(isThenable({ then: undefined })).toBe(false)
    })
  })
}
