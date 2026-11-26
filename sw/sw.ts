import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

const sw = self as any

// Atualiza sozinho, como antes
sw.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()

// Arquivos do app guardados para funcionar offline (a lista é preenchida na hora do build)
precacheAndRoute((self as any).__WB_MANIFEST)

// Qualquer endereço do app abre o index.html (exceto as funções da Netlify)
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/\.netlify\//] }),
)

// Bíblia guardada no aparelho depois da primeira leitura
registerRoute(
  ({ url }: { url: URL }) => /\/biblia\/.*\.json$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'biblia',
    plugins: [new ExpirationPlugin({ maxEntries: 5 })],
  }),
)

// ---------- Notificações ----------
sw.addEventListener('push', (event: any) => {
  let dados: any = {}
  try {
    dados = event.data ? event.data.json() : {}
  } catch {
    dados = {}
  }
  const titulo = dados.titulo || '365 Dias com Deus'
  event.waitUntil(
    sw.registration.showNotification(titulo, {
      body: dados.corpo || 'Seu devocional de hoje está esperando por você.',
      icon: '/icon-192.png',
      tag: dados.tag || 'lembrete',
      data: { url: dados.url || '/hoje' },
    }),
  )
})

sw.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  const destino = new URL(event.notification.data?.url || '/hoje', sw.location.origin).href
  event.waitUntil(
    (async () => {
      const janelas = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const janela of janelas) {
        if ('focus' in janela) {
          await janela.focus()
          try {
            await janela.navigate(destino)
          } catch {
            /* se não der para navegar, só traz o app para a frente */
          }
          return
        }
      }
      await sw.openWindow?.(destino)
      await sw.clients.openWindow(destino)
    })(),
  )
})