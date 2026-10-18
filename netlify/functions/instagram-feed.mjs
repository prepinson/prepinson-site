import { privateStore, publicStore, syncInstagram } from '../lib/instagram.mjs';

const INITIALIZING_MS = 5 * 60 * 1000;
const RETRY_MS = 60 * 60 * 1000;

// A deploy can be published without its deploy event running. A missing feed
// gets one background initialization attempt per site, without delaying visitors.
export async function initializeMissingFeed(store, tokenStore, sync = syncInstagram, now = Date.now()) {
  const current = await store.getWithMetadata('bootstrap', { type: 'json' });
  if (Number(current?.data?.nextAttemptAt) > now) return;
  const lock = await store.set('bootstrap', JSON.stringify({ nextAttemptAt: now + INITIALIZING_MS }),
    current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true });
  if (!lock.modified) return;
  try {
    await sync({ store, tokenStore });
    console.log('Instagram feed initialized after first request');
  } catch (error) {
    console.error('Instagram feed initialization failed:', error.message);
    await store.set('bootstrap', JSON.stringify({ nextAttemptAt: Date.now() + RETRY_MS }),
      { onlyIfMatch: lock.etag });
  }
}

export async function serveFeed(request, store = publicStore(), context) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
  try {
    const feed = await store.get('feed', { type: 'json' });
    if (!feed) {
      if (request.method === 'GET' && context?.deploy?.context === 'production' && context.waitUntil) {
        context.waitUntil(initializeMissingFeed(store, privateStore()).catch((error) => {
          console.error('Instagram feed bootstrap failed:', error.message);
        }));
      }
      return Response.json({ posts: [] }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(feed), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
        'Netlify-CDN-Cache-Control': 'public, durable, max-age=300',
      },
    });
  } catch (error) {
    console.error('Instagram feed unavailable:', error.message);
    return Response.json({ posts: [] }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

export default (request, context) => serveFeed(request, publicStore(context?.deploy?.context), context);
