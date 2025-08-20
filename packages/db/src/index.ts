// Placeholder Dexie-based database module.
// In the full application this would define tables and provide
// import/export helpers. Left minimal for brevity.
export interface DatabaseInfo {
  name: string;
}

export function createDatabase(name: string): DatabaseInfo {
  return { name };
}
