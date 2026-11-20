/** Public world remains authoritative. Private content is an optional, detachable overlay. */
export function createContentMount({ publicRepository, privateRepository, onClear = () => {} }) {
  let generation = 0, mounted = false;
  const detach = () => { generation++; mounted = false; onClear(); };
  const unsubscribe = privateRepository.subscribeLock(detach);
  const clear = () => privateRepository.lock();
  return {
    publicRepository,
    async mount(options) {
      const pending = privateRepository.unlock(options), token = generation;
      const manifest = await pending;
      if (token !== generation) return null;
      mounted = true; return manifest;
    },
    async attachments(query) {
      if (!mounted) return { records: [], nextOffset: null };
      const token = generation;
      try {
        const page = await privateRepository.attachments(query);
        return token === generation ? page : { records: [], nextOffset: null };
      } catch (error) { if (!privateRepository.inspect().unlocked && token === generation) clear(); throw error; }
    },
    async memory(id, options) {
      if (!mounted) throw Error('Private content is not mounted');
      const token = generation;
      try {
        const value = await privateRepository.memory(id, options);
        return token === generation ? value : null;
      } catch (error) { if (!privateRepository.inspect().unlocked && token === generation) clear(); throw error; }
    },
    unmount: clear,
    inspect: () => ({ mounted: mounted && privateRepository.inspect().unlocked }),
    dispose() { clear(); unsubscribe(); privateRepository.dispose(); }
  };
}
