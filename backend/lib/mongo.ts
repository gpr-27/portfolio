// Shared MongoDB connection helper for the Express server + dev middleware.
// Caches the client across requests.

type Env = Record<string, string | undefined>

let cached: unknown = null

export async function getDb(env: Env) {
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is not set')
  const { MongoClient } = await import('mongodb')
  if (!cached) {
    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    cached = client
  }
  return (cached as InstanceType<typeof MongoClient>).db(env.MONGODB_DB || 'portfolio')
}
