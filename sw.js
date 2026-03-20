const CACHE_NAME = 'puzzle-arcade-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/games/i18n.js',
  '/games/share.js',
  '/games/user-system.js',
  '/games/arrow-puzzle.html',
  '/games/water-sort.html',
  '/games/parking-jam.html',
  '/games/lights-out.html',
  '/games/color-match.html',
  '/games/merge.html',
  '/games/one-line.html',
  '/games/memory-card.html',
  '/games/spot-diff.html',
  '/games/number-chain.html',
  '/games/tile-match.html',
  '/games/emoji-puzzle.html',
  '/games/maze.html',
  '/games/rps-battle.html',
  '/games/color-fill.html',
  '/games/bubble-pop.html',
  '/games/connect4.html',
  '/games/sliding-puzzle.html',
  '/games/number-find.html',
  '/games/minesweeper.html',
  '/games/pattern-lock.html',
  '/games/trivia.html',
  '/games/iq-test.html',
  '/games/reaction-test.html',
  '/games/typing-speed.html',
  '/games/math-quiz.html',
  '/games/color-brain.html',
  '/games/word-guess.html',
  '/games/flag-quiz.html',
  '/games/snake.html',
  '/games/word-bomb.html',
  '/games/aim-trainer.html',
  '/games/2048.html',
  '/games/sequence-memory.html',
  '/games/block-stack.html',
  '/games/whack-mole.html',
  '/games/flappy.html',
  '/favicon.svg'
];

// Install: precache all game files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for index.html, cache-first for everything else
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Network-first for index.html (always fresh)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for game files and static assets (fast loading)
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
  );
});
