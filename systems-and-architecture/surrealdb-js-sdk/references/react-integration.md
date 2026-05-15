# React + SurrealDB JavaScript SDK Integration

Full pattern for integrating the SurrealDB JS SDK in a React application using `@tanstack/react-query` for connection state management.

---

## SurrealProvider

```tsx
// SurrealProvider.tsx
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Surreal } from 'surrealdb';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

// Singleton instance
export const db = new Surreal();

interface SurrealProviderProps {
  children: ReactNode;
  url?: string;
  namespace?: string;
  database?: string;
  auth?: {
    username?: string;
    password?: string;
  };
}

interface ConnectionState {
  status: string;
  error?: Error;
}

const SurrealContext = createContext<Surreal | null>(null);
const StatusContext = createContext<ConnectionState>({ status: 'disconnected' });

export function SurrealProvider({
  children,
  url = 'ws://127.0.0.1:8000/rpc',
  namespace = 'myapp',
  database = 'main',
  auth,
}: SurrealProviderProps) {
  const [state, setState] = useState<ConnectionState>({ status: 'connecting' });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setState({ status: 'connecting' });

    db.connect(url, {
      namespace,
      database,
      ...(auth ? { authentication: auth } : {}),
    })
      .then(() => {
        if (mountedRef.current) setState({ status: 'connected' });
      })
      .catch((err) => {
        if (mountedRef.current) setState({ status: 'error', error: err as Error });
      });

    // Track connection status changes
    const unsubConnected = db.subscribe('connected', () => {
      if (mountedRef.current) setState({ status: 'connected' });
    });
    const unsubDisconnected = db.subscribe('disconnected', () => {
      if (mountedRef.current) setState({ status: 'disconnected' });
    });
    const unsubError = db.subscribe('error', (err) => {
      if (mountedRef.current) setState({ status: 'error', error: err as Error });
    });

    return () => {
      mountedRef.current = false;
      unsubConnected();
      unsubDisconnected();
      unsubError();
      db.close();
    };
  }, [url, namespace, database]);

  return (
    <QueryClientProvider client={queryClient}>
      <SurrealContext.Provider value={db}>
        <StatusContext.Provider value={state}>
          {children}
        </StatusContext.Provider>
      </SurrealContext.Provider>
    </QueryClientProvider>
  );
}

export function useSurreal() {
  const db = useContext(SurrealContext);
  if (!db) throw new Error('useSurreal must be used inside SurrealProvider');
  return db;
}

export function useSurrealStatus() {
  return useContext(StatusContext);
}
```

---

## Auth Hook (Record User)

```tsx
// useAuth.ts
import { useCallback } from 'react';
import { db } from './SurrealProvider';

interface SignupVars {
  email: string;
  pass: string;
}

export function useAuth() {
  const signin = useCallback(async (vars: SignupVars) => {
    return db.signin({
      namespace: 'myapp',
      database: 'main',
      access: 'user_access',
      variables: vars,
    });
  }, []);

  const signup = useCallback(async (vars: SignupVars) => {
    return db.signup({
      namespace: 'myapp',
      database: 'main',
      access: 'user_access',
      variables: vars,
    });
  }, []);

  const signout = useCallback(async () => {
    await db.invalidate();
  }, []);

  return { signin, signup, signout };
}
```

---

## Data Fetching Hook

```tsx
// useQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Surreal } from 'surrealdb';
import { useSurreal } from './SurrealProvider';

async function runQuery<T>(
  db: Surreal,
  query: string,
  vars?: Record<string, unknown>
): Promise<T[]> {
  const raw = await db.query(query, vars);
  return (raw[0] ?? []) as T[];
}

export function useSurrealQuery<T>(
  query: string,
  vars?: Record<string, unknown>,
  enabled = true
) {
  const db = useSurreal();
  return useQuery<T[]>({
    queryKey: [query, vars],
    queryFn: () => runQuery<T>(db, query, vars),
    enabled,
  });
}

export function useSurrealMutation<T>(query: string) {
  const db = useSurreal();
  const qc = useQueryClient();
  return useMutation<T>({
    mutationFn: (vars?: Record<string, unknown>) => db.query(query, vars),
    onSuccess: () => {
      // Invalidate any live-query keys or list queries
      qc.invalidateQueries();
    },
  });
}
```

---

## Example: Person List Component

```tsx
// PersonList.tsx
import { useSurrealQuery, useSurrealMutation } from './useQuery';
import { RecordId } from 'surrealdb';

interface Person {
  id: string;
  name: string;
  email: string;
}

export function PersonList() {
  const { data: people, isLoading, error } = useSurrealQuery<Person>(
    'SELECT * FROM person ORDER BY name ASC'
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {String(error)}</div>;

  return (
    <ul>
      {people?.map((p) => (
        <li key={p.id}>
          {p.name} — {p.email}
        </li>
      ))}
    </ul>
  );
}

export function CreatePersonForm() {
  const create = useSurrealMutation('CREATE person SET name = $name, email = $email');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await create.mutateAsync({
      name: fd.get('name') as string,
      email: fd.get('email') as string,
    });
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

---

## Live Query Component

```tsx
// LivePersonList.tsx
import { useEffect, useState } from 'react';
import { useSurreal } from './SurrealProvider';
import type { Surreal } from 'surrealdb';

export function LivePersonList() {
  const db = useSurreal();
  const [people, setPeople] = useState<Record<string, unknown>[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let liveHandle: Awaited<ReturnType<Surreal['live']>> | null = null;

    db.live('person').then((live) => {
      liveHandle = live;
      setConnected(true);

      live.subscribe((action, record) => {
        setPeople((prev) => {
          switch (action) {
            case 'CREATE':
              return [...prev, record as Record<string, unknown>];
            case 'UPDATE':
              return prev.map((p) =>
                (p as { id: string }).id === (record as { id: string }).id ? record as Record<string, unknown> : p
              );
            case 'DELETE':
              return prev.filter((p) => (p as { id: string }).id !== (record as { id: string }).id);
            default:
              return prev;
          }
        });
      });
    });

    return () => {
      liveHandle?.kill();
    };
  }, [db]);

  if (!connected) return <div>Connecting live query...</div>;

  return (
    <ul>
      {people.map((p) => (
        <li key={(p as { id: string }).id}>
          {(p as { name: string }).name}
        </li>
      ))}
    </ul>
  );
}
```

---

## TanStack Query Devtools

```tsx
// main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function App() {
  return (
    <SurrealProvider url="ws://127.0.0.1:8000/rpc" namespace="myapp" database="main">
      {/* ... */}
      <ReactQueryDevtools initialIsOpen={false} />
    </SurrealProvider>
  );
}
```

---

## Environment-Based Connection

```tsx
const url = import.meta.env.VITE_SURREAL_URL ?? 'ws://127.0.0.1:8000/rpc';
const ns = import.meta.env.VITE_SURREAL_NS ?? 'myapp';
const db_name = import.meta.env.VITE_SURREAL_DB ?? 'main';
```

Use `.env` files to configure per-environment (local, staging, production).
