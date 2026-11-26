import { getAuth } from 'firebase-admin/auth'
import { enviarParaUsuario, iniciar } from '../lib/push'

function json(corpo: object, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ erro: 'Método não permitido.' }, 405)

  const cabecalho = req.headers.get('authorization') ?? ''
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : ''
  if (!token) return json({ erro: 'Não autorizado.' }, 401)

  let db
  try {
    db = iniciar()
  } catch (e) {
    return json({ erro: e instanceof Error ? e.message : 'Configuração incompleta.' }, 500)
  }

  let uid: string
  try {
    uid = (await getAuth().verifyIdToken(token)).uid
  } catch {
    return json({ erro: 'Sessão inválida. Saia e entre de novo.' }, 401)
  }

  try {
    const r = await enviarParaUsuario(db, uid, {
      titulo: '365 Dias com Deus',
      corpo: 'Teste de lembrete: está tudo certo por aqui. 🤍',
      url: '/hoje',
      tag: 'teste',
    })
    return json({ ok: true, ...r })
  } catch (e) {
    console.error(e)
    return json({ erro: 'Não foi possível enviar agora.' }, 500)
  }
}