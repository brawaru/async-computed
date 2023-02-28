# @braw/async-computed

> Compute values asynchronously with the Vue Composition API.

## **Example usage**

```html
<script setup>
  import { asyncComputed } from 'async-computed'
  import { ref } from 'vue'

  const counter = ref(2)

  const multiplication = asyncComputed(async () => {
    const count = counter.value

    await new Promise((resolve) =>
      setTimeout(() => resolve(), Math.random() * 2000),
    )

    if (Math.random() > 0.8) {
      throw new Error('Random is not on your side right now.')
    }

    return count * 2
  })

  console.log(multiplication)
</script>

<template>
  <input type="number" v-model="counter" />
  <div v-if="multiplication.pending">Calculating...</div>
  <div v-if="multiplication.fulfilled">
    {{ counter }} multiplied by 2 is {{ multiplication.value }}
  </div>
  <div v-if="multiplication.rejected" style="color: red">
    Failed to calculate value of {{ counter }} multiplied by 2
    <pre><code>{{ multiplication.error }}</code></pre>
  </div>
</template>
```

[💠 Open in Vue SFC](https://sfc.vuejs.org/#eNqNVE2P0zAQ/SujXJqirV0KCFRlq6IV3JAQ4piLm0xaL/6S7bRUVf474yRbmkUsXCJ55s28+XiTS/bROXZsMVtnRai8dBECxtZtSgMgtbM+wgVEOJvqwWrXRqyhg8ZbDbPeuqhG82wS4bG54ig9OZO7siZE+rYmoof7hMpX81ufblWUTslKRGkNQSbUef+CfA73G7ikqElOgo+52VGoFofEAOIkZASDJ/hKBcmAee4xWHXElGjAQOr7u9Ro25gPBCMmn9/BFxEPzAtTW02+V7BaLpfzuyFyrJ+abyCfAjewZB/mT5UCxIO3p76QT95bn8++9UiQAYyNQA2fbeshyBrBy/2BirYnNiOGFN09EXnakDdjz1RMsnY3Y7QKmbL7fDpMAhR82DH1TI+I2ikRsZ9AIQ2NGOLZ4X2ZmVbv0JcZHBfa1qjINE6WbHwIqOWR3LIh35SIOTS1NPsy2zwIVbXEQS/GWMEp5l/BTasaqRTWFD60e7lcJdN1V4WQEHdnWKXZEeBZkn79hO65/ofV4yNWpDBqL8SzSjOorLJ+TcP+XclnIakwiBaqsTGEgco2L5c5xBfO46aoaKKbP2vGJAkKLXgPKHgC3zZQ8OvGsrtsOLWFFo49BmvogHuZlaMjlNn6SXhlRieY3mV2iNGFNeetcT/2jG6Xb8nHPdVN2l+QGLdv2Iq9fU+cId7aGQa92JF+A53XI6Uf5d8n52Q8ol942jz6pJIXyJ5hJ4TPfH8nnf58pnx7QVinmbTcOL3e7rw48WnA9h1bstcDpySun0yn9P0llabLul/llr4o)

## **API**

**Note**: all methods are thoroughly documented using JSDoc available in TypeScript declaration. This is a short representation of that documentation.

### **`asyncComputed`**

`asyncComputed` is the only method exported by this package. It is a function that accepts either a function (getter function) or an object of [Options](#asynccomputedoptions), which has both watch and getter functions, the latter accepts watched values as an argument.

Every getter function (but not watcher) is executed with `this` bound to an object of [`AsyncGetterThis`](#asyncgetterthis), which contains function to register a callback for the cancellation of the call and checking whether the call has been cancelled.

It returns a reactive [`AsyncComputedRef`](#asynccomputedref) object.

### **`AsyncComputedOptions`**

**Properties**:

- `watch`: a method that is called to retrieve values of reactive references in synchronous context. It can return a value that will be later passed to the getter as an argument.
- `get`: a method that is called to asynchronously compute the value for the reactive values. If `watch` has returned a value, it will be provided as the first argument. This function can be both synchronous (return value directly) or synchronous (return a promise). It is called with `this` set to [`AsyncGetterThis`](#asyncgetterthis) object.

### **`AsyncGetterThis`**

**Properties**:

- `canceled`: a getter that returns a boolean which will be true if reactive values have changed and any further computation in that call is redundant as any return value will be discarded.
- `onCancel`: a method that takes a function to be called when the computation gets cancelled. Can be used multiple times with different callbacks, each of which will be subscribed to an event of possible cancellation. This can be used to create `AbortController`.

### **`AsyncComputedRef`**

**Properties**:

- `value`: a getter that returns fulfilled value (or undefined if value is not available because the computation is still pending or has been rejected).
- `status`: a getter that returns a string representation of the current status (pending, fulfilled, rejected).
- `error`: a getter that returns the error that the computation has been rejected with, or undefined if it never rejected.
- `pending`: a getter that returns a boolean value which indicates whether the current computation is still pending.
- `fulfilled`: a getter that returns a boolean value which indicates whether the current computation has been fulfilled.
- `rejected`: a getter that returns a boolean value which indicates whether the current computation has been rejected.

**Note**:

Because it is a custom object, `AsyncComputedRef` does not work like the other references in Vue: it cannot be de-referenced, it is not picked up by the compiler in setup function (requiring mandatory usage of `.value`).

## Compatibility with Vue 2

This package should be compatible with Vue 2, but this is not guaranteed. Vue 3 is recommended.
