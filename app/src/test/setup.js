import '@testing-library/jest-dom';
import { expect } from 'vitest';
import { toHaveNoViolations } from 'vitest-axe/matchers';

expect.extend({ toHaveNoViolations });

// Provide a working localStorage for jsdom tests
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};

// jsdom does not implement HTMLCanvasElement.getContext(); silence repeated warnings
// from components that probe for canvas support during tests.
if (typeof globalThis.HTMLCanvasElement !== 'undefined') {
  const originalGetContext = globalThis.HTMLCanvasElement.prototype.getContext;
  globalThis.HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (type === '2d' || type === 'webgl' || type === 'webgl2') {
      return null;
    }
    if (typeof originalGetContext === 'function') {
      return originalGetContext.call(this, type, ...args);
    }
    return null;
  };
}

// jsdom does not implement Window.scrollTo(); silence repeated warnings.
if (typeof globalThis.scrollTo === 'undefined') {
  globalThis.scrollTo = () => {};
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'undefined') {
    window.scrollTo = () => {};
  }
}

// jsdom does not implement Window.prototype.scrollTo(); silence repeated warnings.
if (typeof window !== 'undefined' && typeof window.scrollTo === 'function' && window.scrollTo.toString().includes('Not implemented')) {
  window.scrollTo = () => {};
}
