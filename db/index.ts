import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const isEdge = process.env.NEXT_RUNTIME === 'edge';

// Edge Runtime cannot access the local filesystem ('file:' scheme).
// We use a dummy URL for Edge validation to avoid crashes, 
// since Middleware won't actually call the database with JWT sessions.
export const client = createClient({ 
  url: isEdge ? "http://localhost:3000" : "file:sqlite.db" 
});

export const db = drizzle(client, { schema });
