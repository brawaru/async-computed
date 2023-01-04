import { describe, expect, it, Mock, vi } from 'vitest'
import { ref } from 'vue'
import {
  asyncComputed,
  AsyncComputedOptions,
  AsyncComputedRef,
  FulfilledState,
  RejectedState,
  Status,
} from '..'

interface CustomMatchers {
  toBeOfState(status: Status): void
}

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}

describe('asyncComputed', () => {
  expect.extend({
    toBeOfState(received: AsyncComputedRef<any>, expects: Status) {
      const assertions: readonly {
        match(): boolean
        message(): string
      }[] = [
        {
          match: () => received.status === expects,
          message: () =>
            `'state' must be '${expects}' (is '${received.status}')`,
        },
        {
          match: () => received.pending === (expects === 'pending'),
          message: () => `'isPending' must be ${String(expects === 'pending')}`,
        },
        {
          match: () => received.rejected === (expects === 'rejected'),
          message: () =>
            `'isRejected' must be ${String(expects === 'rejected')}`,
        },
        {
          match: () => received.fulfilled === (expects === 'fulfilled'),
          message: () =>
            `'isFulfilled' must be ${String(expects === 'fulfilled')}`,
        },
        {
          match: () =>
            ((received as FulfilledState<any>).value === undefined) ===
            (expects !== 'fulfilled'),
          message: () =>
            `'value' must be ${expects === 'fulfilled' ? 'set' : 'undefined'}`,
        },
        {
          match: () =>
            ((received as RejectedState<any>).error === undefined) ===
            (expects !== 'rejected'),
          message: () =>
            `'error' must be ${expects === 'rejected' ? 'set' : 'undefined'}`,
        },
      ]

      let failedAssertions =
        'following assertions have failed for the reference:'
      let failed = false
      for (const assertion of assertions) {
        if (!this.isNot && !assertion.match()) {
          failed = true
          failedAssertions += `\n  * ${assertion.message()}`
        }
      }

      return {
        pass: !failed,
        message() {
          return failedAssertions
        },
      }
    },
  })

  it('works at all', () => {
    const $count = ref(2)

    const $multiplication = asyncComputed(async () => {
      const count = $count.value
      await Promise.resolve()
      return count * 2
    })

    expect($multiplication.promise).toBeDefined()
    expect($multiplication).toBeOfState('pending')
  })

  it('handles resolution', async () => {
    const $count = ref(2)

    const $multiplication = asyncComputed(async () => {
      const count = $count.value
      await Promise.resolve()
      return count * 2
    })

    const multipliedValue = await $multiplication.promise

    expect($multiplication).toBeOfState('fulfilled')
    expect(multipliedValue).toBe(4)
    expect(($multiplication as FulfilledState<number>).value).toBe(4)
  })

  it('handles reject', async () => {
    const $count = ref(0)

    const $multiplication = asyncComputed(async () => {
      const count = $count.value
      await Promise.resolve()
      throw new Error(
        `${count * 2} is the answer but I decided to throw an error`,
      )
    })

    let error: unknown
    try {
      await $multiplication.promise
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect($multiplication).toBeOfState('rejected')
    expect(($multiplication as RejectedState<number>).error).toBe(error)
  })

  it('reacts to change', async () => {
    const $count = ref(2)

    const $multiplication = asyncComputed(async () => {
      const count = $count.value
      await Promise.resolve()
      return count * 2
    })

    await $multiplication.promise
    expect($multiplication).toBeOfState('fulfilled')

    $count.value = 4

    expect($multiplication).toBeOfState('pending')

    await $multiplication.promise
    expect($multiplication).toBeOfState('fulfilled')
    expect(($multiplication as FulfilledState<number>).value).toBe(8)
  })

  it('reacts to change immediately', async () => {
    const $count = ref(2)

    const $multiplication = asyncComputed(() => $count.value * 2)

    expect($multiplication).toBeOfState('fulfilled')
    expect(($multiplication as FulfilledState<number>).value).toBe(4)
  })

  it('correctly uses watch method', () => {
    const $count = ref(2)

    const $multiplication = asyncComputed({
      watch() {
        return { count: $count.value }
      },
      get({ count }) {
        return count * 2
      },
    })

    expect($multiplication).toBeOfState('fulfilled')
    expect(($multiplication as FulfilledState<number>).value).toBe(4)
  })

  it('reacts to watched references updates', async () => {
    const $count = ref(2)
    const $multiplier = ref(2)

    const $multiplication = asyncComputed({
      watch() {
        return { count: $count.value, multipliedBy: $multiplier.value }
      },
      async get({ count, multipliedBy }) {
        await Promise.resolve()
        return count * multipliedBy
      },
    })

    expect($multiplication).toBeOfState('pending')

    await $multiplication.promise

    expect($multiplication).toBeOfState('fulfilled')
    expect(($multiplication as FulfilledState<number>).value).toBe(4)

    $count.value = 8 // => 8 * 2

    expect($multiplication).toBeOfState('pending')

    await $multiplication.promise

    expect($multiplication).toBeOfState('fulfilled')
    expect(($multiplication as FulfilledState<number>).value).toBe(16)

    $multiplier.value = 8 // => 8 * 8

    expect($multiplication).toBeOfState('pending')

    await $multiplication.promise

    expect($multiplication).toBeOfState('fulfilled')
    expect(($multiplication as FulfilledState<number>).value).toBe(64)
  })

  it('previous invocations cancelled', async () => {
    const $tick = ref(0)

    const contexts: {
      callback: Mock<[], void>
      get canceled(): boolean
    }[] = []

    const options: AsyncComputedOptions<void, { tick: number }> = {
      watch() {
        return { tick: $tick.value }
      },
      async get() {
        const callback = vi.fn(() => {})

        this.onCancel(callback)

        const that = this

        contexts.push({
          callback,
          get canceled() {
            return that.canceled
          },
        })

        await Promise.resolve()
      },
    }

    const $isCancelled = asyncComputed(options)

    expect($isCancelled).toBeOfState('pending')

    for (let i = 1, l = 10; i < l; i++) {
      $tick.value++
    }

    await $isCancelled.promise

    expect(contexts).toHaveLength(10)

    for (let i = 0, l = contexts.length - 1; i <= l; i++) {
      const context = contexts[i]

      if (i === l) {
        expect(context.canceled).toBe(false)
        expect(context.callback).not.toBeCalled()
      } else {
        expect(context.canceled).toBe(true)
        expect(context.callback).toHaveBeenCalledOnce()
      }
    }
  })
})
