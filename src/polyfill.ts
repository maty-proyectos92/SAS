// Polyfill window.fetch setter for environments where window.fetch has only a getter
try {
  if (typeof window !== 'undefined' && window.fetch) {
    let currentFetch = window.fetch.bind(window);

    const applyPolyfill = (target: any) => {
      try {
        Object.defineProperty(target, 'fetch', {
          configurable: true,
          enumerable: true,
          get() {
            return currentFetch;
          },
          set(val) {
            currentFetch = val;
          }
        });
      } catch (e) {
        // ignore individual define error
      }
    };

    applyPolyfill(window);
    if (typeof Window !== 'undefined' && Window.prototype) {
      applyPolyfill(Window.prototype);
    }
  }
} catch (e) {
  // ignore
}
