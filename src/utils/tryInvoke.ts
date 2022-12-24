/**
 * Represents the result of {@link tryInvoke} call.
 *
 * @template T Value as an argument to {@link tryInvoke} function returns.
 */
export type InvokeResult<T> =
  | {
      /** Whether the invocation has completed without errors. */
      ok: true
      /** Returned by the function value. */
      value: T
    }
  | {
      /** Whether the invocation has completed without errors. */
      ok: false
      /** Thrown by the function error. */
      value: unknown
    }

/**
 * Tries to invoke the provided function without any arguments.
 *
 * @returns An object containing the result of invocation.
 */
export function tryInvoke<T>(func: () => T): InvokeResult<T> {
  try {
    return {
      ok: true,
      value: func(),
    }
  } catch (error) {
    return {
      ok: false,
      value: error,
    }
  }
}

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest

  describe('tryInvoke', () => {
    it('handles returns', () => {
      const fc = () => {
        return true
      }

      expect(tryInvoke(fc)).toMatchObject({
        ok: true,
        value: true,
      })
    })

    it('handles throw', () => {
      const fc = vi.fn(() => {
        throw new Error()
      })

      expect(tryInvoke(fc)).toMatchObject({
        ok: false,
        value: fc.mock.results.at(-1)?.value,
      })
    })
  })
}
