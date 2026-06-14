/** Minimal IndexedDB key-value store for offline favorites. */
export const idb = {
  _open: () =>
    new Promise((res, rej) => {
      const req = indexedDB.open('fleuvibe_v1', 1);
      req.onupgradeneeded = (e) => {
        try { e.target.result.createObjectStore('kv'); } catch {}
      };
      req.onsuccess = (e) => res(e.target.result);
      req.onerror   = () => rej();
    }),

  async get(key) {
    try {
      const db = await this._open();
      return new Promise((res) => {
        const r = db.transaction('kv', 'readonly').objectStore('kv').get(key);
        r.onsuccess = () => res(r.result ?? null);
        r.onerror   = () => res(null);
      });
    } catch { return null; }
  },

  async set(key, val) {
    try {
      const db = await this._open();
      return new Promise((res) => {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(val, key);
        tx.oncomplete = res;
        tx.onerror    = res;
      });
    } catch {}
  },
};
