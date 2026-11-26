import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const CHAVE_PUBLICA = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export function suportaPush(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

function chaveParaBytes(base64Url: string) {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const bruto = atob(base64)
  const buffer = new ArrayBuffer(bruto.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bruto.length; i++) bytes[i] = bruto.charCodeAt(i)
  return bytes
}

async function idDoAparelho(endpoint: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint))
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// No `npm run dev` o service worker não existe; sem este limite a tela ficaria esperando para sempre.
async function registro(): Promise<ServiceWorkerRegistration> {
  const limite = new Promise<never>((_, rejeitar) =>
    setTimeout(() => rejeitar(new Error('Os lembretes só funcionam no site publicado (não no modo de desenvolvimento).')), 6000),
  )
  return Promise.race([navigator.serviceWorker.ready, limite])
}

// Este aparelho já está inscrito para receber lembretes?
export async function aparelhoInscrito(): Promise<boolean> {
  if (!suportaPush() || Notification.permission !== 'granted') return false
  try {
    const reg = await registro()
    return (await reg.pushManager.getSubscription()) !== null
  } catch {
    return false
  }
}

export async function ativarLembretes(uid: string): Promise<void> {
  if (!suportaPush()) throw new Error('Este navegador não aceita notificações.')
  if (!CHAVE_PUBLICA) throw new Error('A chave de notificações não está configurada neste site.')

  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') {
    throw new Error('As notificações não foram permitidas. Libere nas configurações do navegador e tente de novo.')
  }

  const reg = await registro()
  let inscricao = await reg.pushManager.getSubscription()
  if (!inscricao) {
    inscricao = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: chaveParaBytes(CHAVE_PUBLICA),
    })
  }

  const json = inscricao.toJSON()
  const id = await idDoAparelho(inscricao.endpoint)
  await setDoc(doc(db, 'users', uid, 'aparelhos', id), {
    endpoint: inscricao.endpoint,
    keys: json.keys ?? {},
    criadoEm: serverTimestamp(),
  })
}

// Desliga em todos os aparelhos da conta
export async function desativarLembretes(uid: string): Promise<void> {
  const lista = await getDocs(collection(db, 'users', uid, 'aparelhos'))
  await Promise.all(lista.docs.map(d => deleteDoc(d.ref)))
  if (suportaPush()) {
    try {
      const reg = await registro()
      const inscricao = await reg.pushManager.getSubscription()
      if (inscricao) await inscricao.unsubscribe()
    } catch {
      /* sem service worker: nada a desinscrever */
    }
  }
}

// Pede ao servidor para enviar uma notificação de teste agora
export async function enviarTeste(): Promise<void> {
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error('Entre na sua conta de novo e tente outra vez.')

  let resposta: Response
  try {
    resposta = await fetch('/.netlify/functions/testar-lembrete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new Error('Sem conexão com o servidor. Confira a internet e tente de novo.')
  }

  if (resposta.status === 404) {
    throw new Error('O teste só funciona no site publicado na Netlify.')
  }

  let dados: { ok?: boolean; erro?: string; aparelhos?: number; enviados?: number } = {}
  try {
    dados = await resposta.json()
  } catch {
    /* resposta sem corpo */
  }

  if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível enviar o teste.')
  if (!dados.enviados) {
    throw new Error('Nenhum aparelho inscrito foi encontrado. Toque em "Ativar lembretes" neste aparelho primeiro.')
  }
}