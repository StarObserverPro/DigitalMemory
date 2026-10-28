/** One owner for GPU allocations. Borrowed resources outlive a chunk. */
export function createResourceScope({ shared = new Set() } = {}) {
  const resources = new Set();
  let disposed = false;

  function own(resource) {
    if (!resource || shared.has(resource) || typeof resource.dispose !== 'function') return resource;
    if (disposed) throw new Error('Cannot add a resource to a disposed scope');
    resources.add(resource);
    return resource;
  }

  function material(value) {
    if (!value || shared.has(value)) return;
    own(value);
    for (const slot of Object.values(value)) if (slot?.isTexture) own(slot);
    for (const uniform of Object.values(value.uniforms || {})) {
      const slot = uniform?.value;
      if (slot?.isTexture) own(slot);
      else if (Array.isArray(slot)) for (const texture of slot) if (texture?.isTexture) own(texture);
    }
  }

  function trackObject(root) {
    root.traverse(object => {
      own(object.geometry);
      // InstancedMesh owns extra buffers independently of its geometry.
      if (object.isInstancedMesh) own(object);
      for (const value of Array.isArray(object.material) ? object.material : [object.material]) material(value);
    });
    return root;
  }

  function bytes() {
    const buffers = new Set();
    let total = 0;
    const array = value => {
      const data = value?.array || value?.data?.array;
      if (data?.buffer && !buffers.has(data.buffer)) { buffers.add(data.buffer); total += data.buffer.byteLength; }
    };
    for (const resource of resources) {
      for (const attribute of Object.values(resource.attributes || {})) array(attribute);
      for (const attributes of Object.values(resource.morphAttributes || {})) for (const attribute of attributes) array(attribute);
      array(resource.index); array(resource.instanceMatrix); array(resource.instanceColor);
      if (resource.isTexture) {
        const image = resource.image;
        if (image?.data?.byteLength) total += image.data.byteLength;
        else if (image?.width && image?.height) total += image.width * image.height * 4 * (resource.generateMipmaps ? 4 / 3 : 1);
      }
    }
    return Math.ceil(total);
  }

  return {
    own, trackObject,
    get bytes() { return bytes(); },
    get size() { return resources.size; },
    get disposed() { return disposed; },
    dispose() {
      if (disposed) return;
      disposed = true;
      let error;
      for (const resource of resources) {
        try { resource.dispose(); } catch (cause) { error ||= cause; }
      }
      resources.clear();
      if (error) throw error;
    },
  };
}
