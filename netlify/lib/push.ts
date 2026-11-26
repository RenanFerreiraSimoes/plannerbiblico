import webpush from 'web-push'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

const OBRIGATORIAS = [
  'FB_PROJECT_ID',
  'FB_CLIENT_EMAIL',
  'FB_PRIVATE_KEY',
  'VAPID_PRIVATE_KEY',
  'VAPID_EMAIL',
  'VITE_VAPID_PUBLIC_KEY',
]

// Liga o Firebase e o serviço de notificações usando as variáveis da Netlify
export function iniciar(): Firestore {
  const faltando = OBRIGATORIAS.filter(nome => !process.env[nome])
  if (faltando.length) {
    throw new Error(`Configuração incompleta. Variáveis ausentes na Netlify: ${faltando.join(', ')}`)
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FB_PROJECT_ID,
        clientEmail: process.env.FB_CLIENT_EMAIL,
        privateKey: (process.env.FB_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
      }),
    })
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL as string,
    process.env.VITE_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  )
  return getFirestore()
}

// Data e hora de hoje no horário de Brasília
export function agoraBrasilia(): { data: string; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const pegar = (tipo: string) => partes.find(p => p.type === tipo)?.value ?? '00'
  return {
    data: `${pegar('year')}-${pegar('month')}-${pegar('day')}`,
    minutos: Number(pegar('hour')) * 60 + Number(pegar('minute')),
  }
}

// Quantos dias de uma data 'AAAA-MM-DD' até outra
export function diasEntre(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number)
  const [yb, mb, db] = b.split('-').map(Number)
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000)
}

// Envia a notificação para todos os aparelhos da pessoa
export async function enviarParaUsuario(
  db: Firestore,
  uid: string,
  mensagem: { titulo: string; corpo: string; url: string; tag?: string },
): Promise<{ aparelhos: number; enviados: number }> {
  const lista = await db.collection('users').doc(uid).collection('aparelhos').get()
  let enviados = 0

  await Promise.all(
    lista.docs.map(async d => {
      const a = d.data()
      try {
        await webpush.sendNotification(
          { endpoint: a.endpoint, keys: a.keys },
          JSON.stringify(mensagem),
          { TTL: 60 * 60 * 6, urgency: 'normal' },
        )
        enviados++
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await d.ref.delete() // aparelho que não existe mais
        } else {
          console.error('Falha ao enviar notificação', e?.statusCode, e?.body ?? e?.message)
        }
      }
    }),
  )

  return { aparelhos: lista.size, enviados }
}