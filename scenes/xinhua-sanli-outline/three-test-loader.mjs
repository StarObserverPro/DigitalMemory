// Node tests use the same vendored revision as the browser import map.
export function resolve(specifier, context, nextResolve) {
  if (specifier === 'three') return { url: new URL('../xinhua-junction-outline/vendor/three/build/three.module.js', import.meta.url).href, shortCircuit: true };
  return nextResolve(specifier, context);
}
