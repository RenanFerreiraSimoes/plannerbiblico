import { agoraBrasilia, diasEntre, enviarParaUsuario, iniciar } from '../lib/push'

// Roda a cada 15 minutos
export const config = { schedule: '*/15 * * * *' }

// Se a função atrasar, ainda envia até 2 horas depois do horário escolhido
const JANELA_MINUTOS = 120

export default async () => {
  const db = iniciar()
  const { data: hoje, minutos } = agoraBrasilia()

  const usuarios = await db.collection('users').where('lembreteAtivo', '==', true).get()
  let enviados = 0

  for (const doc of usuarios.docs) {
    try {
      const u = doc.data()
      if (u.ultimoEnvio === hoje) continue

      const hora = /^(\d{2}):(\d{2})$/.exec(String(u.lembrete ?? ''))
      if (!hora) continue
      const atraso = minutos - (Number(hora[1]) * 60 + Number(hora[2]))
      if (atraso < 0 || atraso > JANELA_MINUTOS) continue

      if (typeof u.inicio !== 'string') continue
      const dia = diasEntre(u.inicio, hoje) + 1
      if (dia < 1 || dia > 365) continue

      // Se o dia já foi concluído, não incomoda
      const feito = await doc.ref.collection('progresso').doc(String(dia)).get()
      if (feito.exists) {
        await doc.ref.update({ ultimoEnvio: hoje })
        continue
      }

      const nome = typeof u.nome === 'string' && u.nome ? u.nome : 'querida'
      const r = await enviarParaUsuario(db, doc.id, {
        titulo: '365 Dias com Deus',
        corpo: `${nome}, o dia ${dia} do seu plano está esperando por você. 🤍`,
        url: `/dia/${dia}`,
        tag: 'lembrete-diario',
      })

      if (r.aparelhos === 0) {
        // ligado na conta, mas sem nenhum aparelho: desliga para não ficar tentando
        await doc.ref.update({ lembreteAtivo: false })
      } else if (r.enviados > 0) {
        await doc.ref.update({ ultimoEnvio: hoje })
        enviados++
      }
    } catch (e) {
      console.error('Erro ao processar lembrete de', doc.id, e)
    }
  }

  console.log(`Lembretes: ${enviados} enviado(s) em ${hoje}`)
  return new Response('ok')
}