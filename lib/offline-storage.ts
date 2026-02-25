import { openDB, DBSchema, IDBPDatabase } from "idb";

interface gorillaGymDB extends DBSchema {
  routines: {
    key: string;
    value: any;
  };
  exercises: {
    key: string;
    value: any;
  };
  membership: {
    key: string;
    value: any;
  };
  metadata: {
    key: string;
    value: {
      lastSync: string;
      version: number;
    };
  };
}

let db: IDBPDatabase<gorillaGymDB> | null = null;

async function getDB() {
  if (db) return db;

  db = await openDB<gorillaGymDB>("gorilla-gym", 1, {
    upgrade(database) {
      // Crear stores si no existen
      if (!database.objectStoreNames.contains("routines")) {
        database.createObjectStore("routines");
      }
      if (!database.objectStoreNames.contains("exercises")) {
        database.createObjectStore("exercises");
      }
      if (!database.objectStoreNames.contains("membership")) {
        database.createObjectStore("membership");
      }
      if (!database.objectStoreNames.contains("metadata")) {
        database.createObjectStore("metadata");
      }
    },
  });

  return db;
}

// Guardar rutinas
export async function saveRoutinesOffline(routines: any[]) {
  const database = await getDB();
  const tx = database.transaction("routines", "readwrite");

  for (const routine of routines) {
    await tx.store.put(routine, routine.id);
  }

  await tx.done;
  await updateLastSync();
}

// Obtener rutinas
export async function getRoutinesOffline(): Promise<any[]> {
  const database = await getDB();
  const keys = await database.getAllKeys("routines");
  const routines = [];

  for (const key of keys) {
    const routine = await database.get("routines", key);
    if (routine) routines.push(routine);
  }

  return routines;
}

// Guardar ejercicios
export async function saveExercisesOffline(exercises: any[]) {
  const database = await getDB();
  const tx = database.transaction("exercises", "readwrite");

  for (const exercise of exercises) {
    await tx.store.put(exercise, exercise.id);
  }

  await tx.done;
}

// Obtener ejercicios
export async function getExercisesOffline(): Promise<any[]> {
  const database = await getDB();
  const keys = await database.getAllKeys("exercises");
  const exercises = [];

  for (const key of keys) {
    const exercise = await database.get("exercises", key);
    if (exercise) exercises.push(exercise);
  }

  return exercises;
}

// Guardar membresía
export async function saveMembershipOffline(membership: any) {
  const database = await getDB();
  await database.put("membership", membership, "current");
}

// Obtener membresía
export async function getMembershipOffline() {
  const database = await getDB();
  return await database.get("membership", "current");
}

// Actualizar timestamp de última sincronización
async function updateLastSync() {
  const database = await getDB();
  await database.put(
    "metadata",
    {
      lastSync: new Date().toISOString(),
      version: 1,
    },
    "sync",
  );
}

// Obtener última sincronización
export async function getLastSync(): Promise<string | null> {
  const database = await getDB();
  const metadata = await database.get("metadata", "sync");
  return metadata?.lastSync || null;
}

// Limpiar todo
export async function clearOfflineData() {
  const database = await getDB();
  await database.clear("routines");
  await database.clear("exercises");
  await database.clear("membership");
  await database.clear("metadata");
}
