/**
 * Checks whether the provided value is a function.
 *
 * Essentially an alias for `typeof value === "function"`, but with type
 * declarations that help TypeScript to properly resolve the types.
 *
 * And a few bytes saved in the final bundle thanks to avoided repetition :P
 *
 * @returns `true` if `typeof` of provided function equals to `"function"`,
 *   `false` otherwise.
 */
export function isFunction<T = unknown>(
  value: T,
): value is T extends (...args: any) => any ? T : never {
  return typeof value === 'function'
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('isFunction', () => {
    it('true for functions', () => {
      expect(isFunction(() => {})).toBe(true)
    })

    it('false for non-functions', () => {
      expect(isFunction(null)).toBe(false)
    })
  })
}
