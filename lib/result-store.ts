type MemoryResult = {
  id: string;
  email: string;
  userName: string;
  gameId: string;
  gameTitle: string;
  score: number;
  total: number;
  label: string;
  createdAt: Date;
};

type GlobalMemoryStore = {
  results: MemoryResult[];
};

const globalForStore = globalThis as unknown as {
  memoryResultStore?: GlobalMemoryStore;
};

const store: GlobalMemoryStore = globalForStore.memoryResultStore ?? { results: [] };

if (!globalForStore.memoryResultStore) {
  globalForStore.memoryResultStore = store;
}

export function addMemoryResult(input: Omit<MemoryResult, 'id' | 'createdAt'>): MemoryResult {
  const result: MemoryResult = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };

  store.results.unshift(result);

  // Keep bounded memory size for demo stability.
  if (store.results.length > 500) {
    store.results.length = 500;
  }

  return result;
}

export function listMemoryResultsByEmail(email: string, take?: number): MemoryResult[] {
  const filtered = store.results.filter((item) => item.email === email);

  if (typeof take === 'number') {
    return filtered.slice(0, take);
  }

  return filtered;
}
